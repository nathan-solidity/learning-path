---
level: "ai-llm"
order: 23
title: "Gọi LLM qua API"
est: "5-6 giờ"
checklist:
  - "Gọi được một model qua SDK (chat completion) và đọc nội dung trả về"
  - "Phân biệt vai trò message system/user/assistant và viết prompt cơ bản có cấu trúc"
  - "Đọc API key từ os.environ, không bao giờ hard-code key vào source"
  - "Ước lượng được token, chi phí và giới hạn context window cho một request"
  - "Bắt model trả JSON và validate bằng Pydantic trước khi dùng"
  - "Xử lý lỗi, rate limit và retry có backoff khi gọi API"
related:
  - "glossary:llm"
  - "glossary:prompt"
---

## Vì sao quan trọng

Đây là bước chuyển từ "viết logic tay" sang "gọi một mô hình để làm việc". Một **LLM** (Large
Language Model) là mô hình dự đoán token tiếp theo, được huấn luyện trên lượng văn bản khổng
lồ. Bạn không train nó — bạn **gọi nó qua API** và điều khiển bằng **prompt**.

Với Python, đây là kỹ năng nền cho mọi thứ phía sau: RAG, agent, tool AI nội bộ. Nhưng LLM
là một dependency **trả phí, chậm, và không tất định** (cùng input có thể ra output khác).
Gọi nó đúng cách — quản lý key, token, lỗi, và validate output — là khác biệt giữa demo và
production.

## LLM là gì (ở mức đủ dùng)

Bạn gửi một chuỗi **message**, model trả về một message mới. Không có "trí nhớ" giữa các
request: mỗi lần gọi bạn phải gửi lại toàn bộ ngữ cảnh cần thiết.

```python
# Python 3.12+ — cài: pip install anthropic
import os
from anthropic import Anthropic

# Đọc key từ biến môi trường, KHÔNG hard-code
client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

resp = client.messages.create(
    model="claude-sonnet-5",
    max_tokens=512,
    system="Bạn là trợ lý tóm tắt, trả lời ngắn gọn tiếng Việt.",  # định hướng chung
    messages=[
        {"role": "user", "content": "Tóm tắt REST là gì trong 2 câu."},
    ],
)
print(resp.content[0].text)  # nội dung trả về nằm trong content
```

> SDK `openai` có hình dạng tương tự (`client.chat.completions.create(...)`). Tên field
> khác nhau, nhưng khái niệm — message, role, token, temperature — giống nhau.

## Vai trò message: system / user / assistant

| Role | Ai nói | Dùng để |
|------|--------|---------|
| `system` | Bạn (dev) | Đặt luật chung: vai trò, giọng văn, ràng buộc format |
| `user` | Người dùng | Câu hỏi / yêu cầu thực tế |
| `assistant` | Model | Câu trả lời trước đó (gửi lại để giữ ngữ cảnh hội thoại) |

Muốn hội thoại nhiều lượt, bạn **nối lịch sử** vào `messages`:

```python
messages = [
    {"role": "user", "content": "Python có GIL không?"},
    {"role": "assistant", "content": "Có, CPython dùng GIL."},
    {"role": "user", "content": "Vậy nó ảnh hưởng gì tới đa luồng?"},  # model thấy cả 3
]
```

## Prompt engineering cơ bản

Prompt là hợp đồng bạn ký với model. Vài nguyên tắc ăn tiền ngay:

- **Nói rõ vai trò và output mong muốn** trong `system` ("trả về JSON", "chỉ tiếng Việt").
- **Cho ví dụ** (few-shot) khi format quan trọng — 1-2 ví dụ mẫu tốt hơn mô tả dài.
- **Tách dữ liệu khỏi lệnh**: đặt input người dùng trong dấu phân cách rõ ràng để giảm rủi
  ro **prompt injection** (input người dùng "ra lệnh" cho model).

```python
prompt = f"""Phân loại cảm xúc của đoạn review sau. Chỉ trả về 1 từ: positive/negative/neutral.

<review>
{user_review}
</review>"""  # input bọc trong thẻ, tách khỏi phần lệnh
```

## Token, chi phí & context window

Model không đếm ký tự — nó đếm **token** (một token ~ 3-4 ký tự tiếng Anh). Bạn trả tiền
theo token **input + output**, và mỗi model có **context window** giới hạn (tổng token một
request được phép chứa).

```python
# Ước lượng thô: 1 token ~ 4 ký tự. Đo chính xác thì dùng tokenizer của SDK.
def rough_tokens(text: str) -> int:
    return len(text) // 4  # chỉ để ước lượng chi phí, không dùng cho ràng buộc cứng
```

> Prompt càng dài, RAG nhồi càng nhiều context → càng tốn tiền và càng chậm. Đừng đổ cả
> tài liệu vào prompt "cho chắc" — chỉ đưa phần liên quan (bài 24 sẽ nói về RAG).

## Temperature: ngẫu nhiên hay tất định

`temperature` điều khiển độ "sáng tạo": thấp (0-0.3) → ổn định, lặp lại; cao (0.7-1.0) → đa
dạng, ngẫu nhiên hơn.

```python
resp = client.messages.create(
    model="claude-sonnet-5",
    max_tokens=256,
    temperature=0,          # trích xuất/phân loại: cần tất định → để 0
    messages=[{"role": "user", "content": prompt}],
)
```

## Structured output: bắt model trả JSON và validate

Đừng parse văn bản tự do bằng regex. Yêu cầu model trả **JSON**, rồi validate bằng
**Pydantic** — nếu sai schema, bạn biết ngay thay vì crash ở đâu đó phía sau.

```python
import json
from pydantic import BaseModel, ValidationError

class Sentiment(BaseModel):
    label: str      # positive | negative | neutral
    score: float    # 0.0 - 1.0

resp = client.messages.create(
    model="claude-sonnet-5",
    max_tokens=128,
    system='Chỉ trả về JSON đúng schema: {"label": str, "score": float}. Không giải thích.',
    messages=[{"role": "user", "content": prompt}],
)

try:
    data = Sentiment.model_validate_json(resp.content[0].text)  # parse + validate 1 bước
except (ValidationError, json.JSONDecodeError) as e:
    # Model trả sai format — log lại và fallback, ĐỪNG tin mù
    raise ValueError(f"LLM trả output không hợp lệ: {e}") from e
```

> Output của LLM là **input chưa tin cậy**. Luôn validate trước khi ghi DB, gọi API khác,
> hay hiển thị cho người dùng.

## Streaming: trả kết quả dần

Với câu trả lời dài, stream để người dùng thấy chữ hiện dần thay vì chờ trắng màn hình:

```python
with client.messages.stream(
    model="claude-sonnet-5",
    max_tokens=512,
    messages=[{"role": "user", "content": "Giải thích asyncio trong 5 câu."}],
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)  # in từng mẩu ngay khi nhận
```

## Bảo mật API key: ❌ vs ✅

```python
# ❌ TUYỆT ĐỐI KHÔNG: key nằm trong source, sẽ bị commit lên git và lộ
client = Anthropic(api_key="sk-ant-abc123...")

# ✅ Đọc từ biến môi trường; key nạp qua .env (đã .gitignore) hoặc secret manager
import os
client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
```

> Key bị lộ = người khác tiêu tiền của bạn. Giữ key trong `.env` (thêm vào `.gitignore`),
> nạp bằng `python-dotenv` ở dev, và dùng secret manager của cloud khi lên production.

## Xử lý lỗi, rate limit & retry

API sẽ lỗi: mạng chập chờn, quá tải (`429`), server lỗi (`5xx`). Retry với **exponential
backoff** cho lỗi tạm thời; đừng retry lỗi do bạn (sai request, hết quota).

```python
import time
from anthropic import APIStatusError, RateLimitError

def call_with_retry(client: Anthropic, prompt: str, max_retries: int = 3) -> str:
    for attempt in range(max_retries):
        try:
            resp = client.messages.create(
                model="claude-sonnet-5",
                max_tokens=256,
                messages=[{"role": "user", "content": prompt}],
            )
            return resp.content[0].text
        except RateLimitError:
            wait = 2 ** attempt            # 1s, 2s, 4s... backoff tăng dần
            time.sleep(wait)
        except APIStatusError as e:
            if e.status_code >= 500:       # lỗi server tạm thời → retry
                time.sleep(2 ** attempt)
            else:
                raise                       # lỗi 4xx do request sai → không retry
    raise RuntimeError("Gọi LLM thất bại sau khi retry")
```

![Luồng gọi LLM: prompt gồm system và user gửi qua SDK tới API, API trả về response, ứng dụng parse và validate bằng Pydantic trước khi dùng](/images/python-llm-call.png)

## Cạm bẫy hay gặp

- **Hard-code API key** trong source → lộ key khi commit; luôn đọc từ `os.environ`.
- **Không xử lý rate limit/lỗi tạm thời** → app chết khi API trả `429`; cần retry + backoff.
- **Prompt injection**: input người dùng ghi đè lệnh trong prompt; tách dữ liệu bằng dấu phân cách rõ ràng.
- **Tin mù output LLM** không validate → ghi rác vào DB hoặc crash; luôn validate bằng Pydantic.
- **Nhồi quá nhiều token** vào prompt "cho chắc" → tốn tiền, chậm, dễ vượt context window.

## Ghi nhớ

Gọi LLM là gửi **message** (system/user/assistant) qua **SDK** và nhận lại token. Điều
khiển bằng **prompt** rõ ràng và **temperature** (0 cho việc cần tất định). Luôn **đọc key
từ biến môi trường**, đo **token/chi phí**, ép **structured output** rồi **validate bằng
Pydantic**. Output LLM là **input chưa tin cậy** — validate trước khi dùng. Bọc lời gọi
bằng **retry có backoff** cho rate limit và lỗi server.
