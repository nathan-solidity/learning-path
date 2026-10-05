---
level: "ai-inter-app"
order: 18
title: "Observability và reliability"
est: "5-6 giờ"
checklist:
  - "Log được từng request/response LLM kèm token, model, latency và request id để truy vết"
  - "Giải thích được tracing giúp gì cho một chuỗi LLM/agent nhiều bước so với log rời rạc"
  - "Đặt được timeout cho mọi lời gọi model và giải thích vì sao bắt buộc phải có"
  - "Xử lý được lỗi rate limit của provider bằng retry với exponential backoff + jitter"
  - "Dựng được fallback: model dự phòng hoặc câu trả lời an toàn khi lời gọi chính thất bại"
related:
  - "glossary:llm"
  - "glossary:token"
---

## Vì sao quan trọng

Demo hỏng thì bạn nhìn thấy stack trace ngay trên màn hình. Production hỏng lúc 2 giờ sáng,
với người dùng thật, và nếu bạn **không log gì** thì chỉ biết "hệ thống chậm" mà không biết
vì sao. LLM còn khó hơn service thường: nó **không tất định**, phụ thuộc một **provider bên
ngoài có thể rate-limit hoặc gián đoạn**, và một agent có thể gọi model 10 lần trong một
request. Cấp này dạy hai thứ phân biệt kỹ sư với người làm demo: **observability** (nhìn được
bên trong hệ thống) và **reliability** (chịu được lỗi thay vì sập).

> Demo hỏi "nó chạy không?". Production hỏi "khi nó hỏng, tôi có **biết** không, và hệ thống
> có **tự gượng dậy** không?". LLM phụ thuộc một dịch vụ ngoài — lỗi tạm thời là chuyện
> thường ngày, không phải ngoại lệ hiếm.

## Logging: ghi lại mọi lời gọi model

Log LLM cần nhiều hơn log service thường. Với mỗi lời gọi, ghi tối thiểu: **request id**
(nối các log của cùng một request), **model**, **token in/out**, **latency**, **kết quả**
(hoặc lỗi). Dùng **structured logging** (JSON) để về sau query/tổng hợp được, đừng in chuỗi
tự do.

```python
# Python 3.12+ — structured logging cho một lời gọi LLM
import os, time, uuid, logging, json
from anthropic import Anthropic

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("llm")
client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

def ask_logged(question: str, request_id: str | None = None) -> str:
    rid = request_id or str(uuid.uuid4())   # id để truy vết xuyên suốt request
    t0 = time.perf_counter()
    try:
        resp = client.messages.create(
            model="claude-sonnet-5", max_tokens=512,
            messages=[{"role": "user", "content": question}],
        )
        latency_ms = round((time.perf_counter() - t0) * 1000)
        log.info(json.dumps({
            "request_id": rid, "model": "claude-sonnet-5", "status": "ok",
            "tokens_in": resp.usage.input_tokens,
            "tokens_out": resp.usage.output_tokens,
            "latency_ms": latency_ms,
        }))
        return resp.content[0].text
    except Exception as e:
        latency_ms = round((time.perf_counter() - t0) * 1000)
        log.error(json.dumps({
            "request_id": rid, "status": "error",
            "error_type": type(e).__name__, "latency_ms": latency_ms,
        }))
        raise
```

> Đừng log nguyên văn prompt/response nếu chứa dữ liệu nhạy cảm (PII, thông tin khách hàng).
> Log token và metadata thì luôn an toàn; nội dung thì cân nhắc mask hoặc chỉ log khi debug.

## Tracing: nhìn xuyên một chuỗi nhiều bước

Log rời rạc đủ cho một lời gọi. Nhưng một request RAG gọi embedding → vector search →
rerank → LLM, và một **agent** có thể lặp gọi tool nhiều vòng. Khi kết quả sai hoặc chậm, log
rời không cho biết **bước nào** gây ra. **Tracing** ghép mọi bước của cùng một request thành
một cây (trace) với các **span** con — nhìn được toàn bộ luồng: bước nào chậm, bước nào lỗi,
prompt/output thực tế ở mỗi bước.

Công cụ: **LangSmith**, **Langfuse** (chuyên cho app LLM, xem được prompt/response/token mỗi
span), hoặc **OpenTelemetry** (chuẩn tracing chung, nối được với Jaeger/Grafana). Ý tưởng
xuyên suốt: gắn **trace id** vào request, mỗi bước con tạo một span thuộc trace đó.

| | Logging | Tracing |
|--|---------|---------|
| Đơn vị | Một sự kiện rời | Toàn bộ luồng của một request (nhiều span) |
| Trả lời câu hỏi | "Có lỗi gì, khi nào?" | "Trong chuỗi 6 bước, **bước nào** chậm/sai?" |
| Hợp nhất với | Mọi hệ thống | RAG nhiều bước, agent gọi tool nhiều vòng |

## Timeout: mọi lời gọi model đều phải có

Provider ngoài có thể chậm bất thường hoặc treo. Một lời gọi không timeout có thể giữ chết
một worker vô thời hạn, kéo theo cả hàng đợi. **Mọi lời gọi mạng đều phải có timeout** —
không có ngoại lệ. Đặt timeout hợp lý (streaming dài hơn tác vụ ngắn), và khi vượt timeout
thì coi như lỗi để nhánh retry/fallback xử lý.

```python
# SDK cho phép đặt timeout khi tạo client (hoặc theo từng request tùy phiên bản)
client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"], timeout=30.0)  # giây
```

## Retry với exponential backoff: chịu được lỗi tạm thời

Provider LLM **sẽ** trả `429 Too Many Requests` (vượt rate limit) hoặc lỗi `5xx` tạm thời —
đây là chuyện thường, không phải sự cố. Cách xử lý đúng: **retry**, nhưng **không dồn dập**.
Nếu bị 429 mà thử lại ngay lập tức, bạn càng làm nghẽn thêm. **Exponential backoff** tăng
thời gian chờ theo cấp số nhân (1s, 2s, 4s...), cộng **jitter** (nhiễu ngẫu nhiên) để nhiều
client không cùng thử lại một nhịp gây "thundering herd".

```python
# Retry với exponential backoff + jitter cho lỗi tạm thời (429/5xx)
import time, random
from anthropic import Anthropic, RateLimitError, APIStatusError

def ask_with_retry(question: str, max_retries: int = 4) -> str:
    for attempt in range(max_retries + 1):
        try:
            resp = client.messages.create(
                model="claude-sonnet-5", max_tokens=512,
                messages=[{"role": "user", "content": question}],
            )
            return resp.content[0].text
        except (RateLimitError, APIStatusError) as e:
            # Chỉ retry lỗi tạm thời; lỗi 4xx khác (400 sai input) thì đừng retry
            if attempt == max_retries:
                raise
            base = 2 ** attempt                    # 1s, 2s, 4s, 8s
            wait = base + random.uniform(0, base)  # + jitter chống thundering herd
            time.sleep(wait)
    raise RuntimeError("unreachable")
```

> Chỉ retry lỗi **tạm thời** (429, 5xx, timeout). Lỗi do input sai (`400`) hay auth (`401`)
> thì retry vô ích — nó sẽ hỏng y hệt lần sau, chỉ tổ đốt thêm tiền và thời gian. Nếu
> provider trả header `Retry-After`, tôn trọng giá trị đó thay vì tự tính backoff.

## Fallback: có phương án khi lời gọi chính thất bại

Retry hết lượt vẫn hỏng thì sao? Đừng ném lỗi 500 trần trụi cho người dùng. **Fallback** cho
hệ thống một lối thoát an toàn:

- **Model dự phòng**: model chính lỗi/quá tải → chuyển sang model khác (provider khác hoặc
  model nhỏ hơn) để vẫn trả được câu trả lời.
- **Câu trả lời an toàn**: không model nào chạy được → trả một thông báo lịch sự ("hệ thống
  đang bận, vui lòng thử lại") thay vì crash.
- **Kết quả từ cache** (bài 17): dùng lại câu trả lời gần nhất cho câu tương tự nếu có.

```python
# Fallback theo thứ tự ưu tiên: thử model chính → model dự phòng → câu an toàn
def ask_resilient(question: str) -> str:
    for model in ("claude-sonnet-5", "claude-haiku-4-5"):   # chính → dự phòng
        try:
            resp = client.messages.create(
                model=model, max_tokens=512,
                messages=[{"role": "user", "content": question}],
            )
            return resp.content[0].text
        except Exception:
            continue   # model này hỏng → thử model kế tiếp
    return "Hệ thống đang bận, vui lòng thử lại sau ít phút."   # lối thoát cuối
```

Khi mọi lớp trên vẫn không cứu được và sự cố lan rộng, xử lý theo quy trình incident có kỷ
luật.

## Cạm bẫy hay gặp

- **Không đặt timeout** → một lời gọi treo giữ chết worker vô thời hạn, kéo sập cả hàng đợi.
- **Retry không backoff** → bị 429 rồi thử lại dồn dập, càng làm nghẽn thêm.
- **Retry mọi loại lỗi** → retry lỗi `400`/`401` vô ích, đốt thêm tiền và thời gian.
- **Không có request id/trace id** → không nối được log của cùng một request, debug như mò kim.
- **Log nguyên văn prompt chứa PII** → rò rỉ dữ liệu nhạy cảm qua log.
- **Không fallback** → một sự cố tạm thời của provider làm sập trải nghiệm cả hệ thống.

## Ghi nhớ

**Production hỏi: khi hỏng, tôi có biết không và hệ thống có gượng dậy không?** Về
observability: **log có cấu trúc** mọi lời gọi (request id, model, token, latency, lỗi) và
**tracing** để nhìn xuyên chuỗi RAG/agent nhiều bước, thấy bước nào chậm/sai. Về reliability:
đặt **timeout** cho mọi lời gọi (bắt buộc); **retry** lỗi tạm thời (429/5xx) bằng **exponential
backoff + jitter**, nhưng đừng retry lỗi input; và dựng **fallback** (model dự phòng → cache
→ câu trả lời an toàn) để một sự cố provider không làm sập trải nghiệm. LLM phụ thuộc dịch vụ
ngoài — lỗi tạm thời là bình thường; hệ thống tốt là hệ thống **chịu được lỗi**, không phải
hệ thống không bao giờ gặp lỗi.
