---
level: "ai-inter-app"
order: 16
title: "API, queue và streaming cho app AI"
est: "5-6 giờ"
checklist:
  - "Đóng gói được một LLM call thành HTTP API bằng FastAPI, đọc key từ biến môi trường"
  - "Trả lời dạng streaming (SSE) để người dùng thấy chữ chạy ra thay vì chờ trắng màn hình"
  - "Nhận ra tác vụ nào phải đẩy vào background queue thay vì xử lý ngay trong request"
  - "Đưa được một job LLM dài vào Celery/Redis và cho client poll trạng thái qua job id"
  - "Giải thích được backpressure và cách chặn hàng đợi phình vô hạn khi tải tăng"
related:
  - "glossary:llm"
  - "glossary:token"
---

## Vì sao quan trọng

Ở cấp Cơ bản và RAG, bạn gọi LLM trong một script chạy tay: bấm run, chờ, in kết quả. Đó
là **demo**. Ứng dụng thật có nhiều người dùng gọi đồng thời qua HTTP, có tác vụ chạy vài
chục giây, và không ai chịu ngồi nhìn màn hình trắng chờ 20 giây. Cấp này biến "script gọi
model" thành **service AI production**: một API nhận request, trả stream cho tác vụ ngắn,
và đẩy tác vụ dài xuống **queue** để không làm sập request.

> Ranh giới demo/production nằm ở đây: demo chạy một mình, tuần tự; production chịu tải
> đồng thời, có timeout, và phải trả lời "đang xử lý" thay vì treo.

## Đóng gói LLM call thành API

Bước đầu là bọc lời gọi model sau một endpoint HTTP. FastAPI là lựa chọn phổ biến vì async
sẵn (chịu I/O tốt) và validate input bằng Pydantic.

```python
# Python 3.12+ — cài: pip install fastapi uvicorn anthropic
import os
from fastapi import FastAPI
from pydantic import BaseModel
from anthropic import Anthropic

app = FastAPI()
client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])  # KHÔNG hard-code key

class AskRequest(BaseModel):
    question: str
    max_tokens: int = 512   # chặn trần token → chặn trần chi phí mỗi request

@app.post("/ask")
def ask(req: AskRequest) -> dict:
    resp = client.messages.create(
        model="claude-sonnet-5",
        max_tokens=req.max_tokens,
        messages=[{"role": "user", "content": req.question}],
    )
    return {"answer": resp.content[0].text}
```

Chạy: `uvicorn main:app --reload`. Giờ mọi client (web, mobile, service khác) gọi được model
qua một hợp đồng HTTP rõ ràng — không cần biết bạn dùng SDK nào bên trong.

> Validate input bằng Pydantic không chỉ để đẹp: nó chặn request rác trước khi tiêu tốn một
> lời gọi LLM (mỗi lời gọi = tiền). Luôn đặt trần `max_tokens` phía server, đừng để client tự khai.

## Streaming: đừng bắt người dùng chờ trắng màn hình

LLM sinh chữ **từng token một**. Nếu chờ sinh xong cả câu trả lời dài rồi mới trả về, người
dùng thấy màn hình đứng im vài giây — cảm giác "treo". **Streaming** đẩy từng mẩu chữ ra
ngay khi model sinh, đúng trải nghiệm gõ chữ của ChatGPT/Claude.

Cách chuẩn trên web là **SSE** (Server-Sent Events): một HTTP response mở dài, server đẩy
liên tục các dòng `data: ...`. FastAPI trả SSE bằng `StreamingResponse` với một generator.

```python
# Streaming SSE — SDK Anthropic cho stream token qua context manager .stream()
from fastapi.responses import StreamingResponse

@app.post("/ask-stream")
def ask_stream(req: AskRequest):
    def event_generator():
        # .stream() mở stream; text_stream lặp ra từng mẩu text khi model sinh
        with client.messages.stream(
            model="claude-sonnet-5",
            max_tokens=req.max_tokens,
            messages=[{"role": "user", "content": req.question}],
        ) as stream:
            for text in stream.text_stream:
                yield f"data: {text}\n\n"   # mỗi event SSE kết bằng dòng trống
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
```

Streaming cải thiện **cảm nhận độ trễ** (time-to-first-token thấp) chứ không làm model chạy
nhanh hơn. Nhưng khác biệt trải nghiệm là rất lớn: chữ chạy ra sau ~1 giây thay vì chờ 15 giây.

| | Không stream | Streaming (SSE) |
|--|--------------|-----------------|
| Người dùng thấy gì | Màn hình trắng đến khi xong | Chữ chạy ra ngay |
| Hợp với | Tác vụ ngắn, cần cả kết quả một lần (JSON) | Chat, sinh văn bản dài |
| Độ phức tạp client | Đơn giản | Phải đọc stream, ghép mẩu |

## Tác vụ dài phải vào queue

Streaming giúp tác vụ **vừa** (trả lời chat vài giây). Nhưng có loại tác vụ chạy lâu thật:
tóm tắt 200 trang PDF, index lại toàn bộ kho tài liệu cho RAG, chạy một chuỗi agent nhiều
bước. Giữ chúng trong HTTP request là sai:

- **Timeout**: reverse proxy (Nginx), load balancer, browser đều cắt kết nối sau ~30-60 giây.
- **Chặn worker**: một request chạy 3 phút giữ chết một worker, các user khác xếp hàng.
- **Không retry được**: request lỗi giữa chừng là mất trắng, không chạy lại được.

Giải pháp: **API nhận việc → đẩy vào queue → trả ngay `job_id`**. Một **worker** riêng nhặt
job ra chạy. Client dùng `job_id` để **poll** kết quả (hoặc nhận qua webhook/websocket).

```python
# Celery + Redis — cài: pip install celery redis
# tasks.py — worker chạy: celery -A tasks worker
import os
from celery import Celery
from anthropic import Anthropic

celery = Celery("tasks", broker="redis://localhost:6379/0",
                backend="redis://localhost:6379/1")

@celery.task
def summarize_long(text: str) -> str:
    client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    resp = client.messages.create(
        model="claude-sonnet-5",
        max_tokens=1024,
        messages=[{"role": "user", "content": f"Tóm tắt tài liệu sau:\n{text}"}],
    )
    return resp.content[0].text
```

```python
# API: nhận việc, trả job_id ngay — không chờ model chạy xong
from tasks import summarize_long

@app.post("/summarize")
def summarize(req: AskRequest) -> dict:
    job = summarize_long.delay(req.question)   # đẩy vào queue, trả về ngay
    return {"job_id": job.id, "status": "queued"}

@app.get("/summarize/{job_id}")
def summarize_result(job_id: str) -> dict:
    job = summarize_long.AsyncResult(job_id)
    if job.ready():
        return {"status": "done", "result": job.result}
    return {"status": job.status.lower()}   # PENDING / STARTED
```

Kiến trúc này tách **API (nhận việc, trả nhanh)** khỏi **worker (làm việc nặng)** — hai phần
scale độc lập. Đóng gói cả hai bằng Docker để chạy nhất quán dev/prod.

## Backpressure: đừng để hàng đợi phình vô hạn

Queue giải quyết timeout nhưng đẻ ra vấn đề mới: nếu request đến nhanh hơn worker xử lý,
hàng đợi **phình mãi**. Job xếp hàng 10 phút thì kết quả đã vô nghĩa, còn Redis thì ngốn RAM
đến sập. **Backpressure** là cơ chế báo hiệu "quá tải, chậm lại" thay vì nhận bừa:

- **Giới hạn độ dài queue**: quá ngưỡng thì từ chối request mới với `503` (thử lại sau) thay
  vì nhận vào rồi để đó thối.
- **Rate limit ở API** (chi tiết ở bài 17): chặn số request/giây mỗi client.
- **Timeout cho job**: job chạy quá lâu bị hủy, giải phóng worker.
- **Đặt trần số worker + queue riêng theo độ ưu tiên**: job nhanh không kẹt sau job chậm.

> Nguyên tắc: thà từ chối sớm và rõ ràng (`503 Retry-After`) còn hơn nhận vào rồi treo vô
> thời hạn. Hàng đợi không có trần là quả bom hẹn giờ khi traffic tăng đột biến.

## Cạm bẫy hay gặp

- **Chạy tác vụ dài ngay trong request** → dính timeout của proxy/browser, chết worker.
- **Không đặt trần `max_tokens` phía server** → một request có thể sinh cực dài, đốt tiền.
- **Quên `[DONE]` hoặc flush trong SSE** → client không biết stream đã kết thúc, treo chờ mãi.
- **Queue không giới hạn độ dài** → traffic tăng làm Redis phình đến hết RAM, sập cả hệ thống.
- **Khởi tạo `Anthropic()` mỗi request** → tốn tài nguyên; tạo client một lần, tái sử dụng.
- **Poll quá dày** (100ms/lần) → client tự DDoS API của mình; đặt khoảng poll hợp lý (1-2s).

## Ghi nhớ

**App AI production khác demo ở lớp phục vụ.** Bọc LLM call sau một **API** (FastAPI), validate
input và **đặt trần token phía server**. Với tác vụ ngắn, dùng **streaming SSE** để chữ chạy
ra ngay — giảm cảm nhận độ trễ, không bắt người dùng chờ trắng màn hình. Với tác vụ dài (tóm
tắt tài liệu lớn, index RAG, agent nhiều bước), **đẩy vào queue** (Celery/Redis), trả `job_id`
ngay và cho client **poll** — tách API khỏi worker để scale độc lập và tránh timeout. Cuối
cùng, đặt **backpressure**: giới hạn độ dài queue, rate limit, timeout job — thà từ chối sớm
bằng `503` còn hơn để hàng đợi phình vô hạn khi tải tăng.
