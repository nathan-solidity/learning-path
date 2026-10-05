---
level: "ai-basic-application"
order: 5
title: "Structured Output & Streaming"
est: "4-5 giờ"
checklist:
  - "Bắt được model trả JSON đúng schema và validate bằng Pydantic trước khi dùng"
  - "Giải thích được vì sao output LLM là 'input chưa tin cậy' và phải validate"
  - "Dùng được cơ chế structured output/tool của SDK để ép schema thay vì chỉ dặn trong prompt"
  - "Xử lý được trường hợp model trả sai format (retry, fallback, không crash)"
  - "Stream được câu trả lời dài, in dần token cho người dùng"
  - "Biết khi nào cần streaming và khi nào không"
related:
  - "glossary:structured-output"
  - "glossary:json"
---

## Vì sao quan trọng

App AI thật hiếm khi chỉ in văn bản ra màn hình. Nó cần **dữ liệu có cấu trúc** để đưa vào
DB, gọi API khác, hay hiển thị lên UI. Và nó cần **phản hồi nhanh** để người dùng không nhìn
màn hình trắng. Hai kỹ thuật của bài này — **structured output** và **streaming** — biến một
lời gọi LLM thô thành thứ dùng được trong sản phẩm.

## Structured output: bắt model trả JSON

Đừng parse văn bản tự do bằng regex — mong manh và dễ vỡ. Yêu cầu model trả **JSON**, rồi
validate bằng **Pydantic**: sai schema thì biết ngay, thay vì crash mơ hồ ở đâu đó phía sau.

```python
import json
from anthropic import Anthropic
from pydantic import BaseModel, ValidationError

client = Anthropic()

class Sentiment(BaseModel):
    label: str      # positive | negative | neutral
    score: float    # 0.0 - 1.0

resp = client.messages.create(
    model="claude-sonnet-5",
    max_tokens=128,
    temperature=0,
    system='Chỉ trả về JSON đúng schema: {"label": str, "score": float}. Không giải thích.',
    messages=[{"role": "user", "content": "Sản phẩm giao nhanh, đóng gói cẩn thận."}],
)

try:
    data = Sentiment.model_validate_json(resp.content[0].text)  # parse + validate 1 bước
except (ValidationError, json.JSONDecodeError) as e:
    raise ValueError(f"LLM trả output không hợp lệ: {e}") from e
```

## Ép schema chắc hơn: dùng cơ chế của SDK

Chỉ *dặn trong prompt* "trả JSON" không đảm bảo 100% — model có thể kèm lời dẫn ("Đây là
kết quả:") làm hỏng JSON. Các SDK/model hiện đại có cơ chế **ép định dạng** chắc hơn:

- **Tool / function calling** (bài 6): khai báo schema như một "tool", model buộc trả tham
  số đúng schema đó. Đây là cách ổn định nhất để lấy structured output.
- **JSON mode / structured output** của một số nhà cung cấp: yêu cầu model chỉ sinh JSON hợp lệ.
- **Prefill** (Anthropic): mồi sẵn ký tự `{` ở đầu lượt `assistant` để model buộc bắt đầu bằng JSON.

> Nguyên tắc: **prompt để hướng dẫn, cơ chế SDK để ép, Pydantic để verify**. Dù dùng cơ chế
> ép nào, *vẫn validate* — model vẫn có thể trả số ngoài khoảng, enum sai, field thiếu nghĩa.

## Output LLM = input chưa tin cậy

Đây là tư duy an toàn xuyên suốt lộ trình. Output của model **không đáng tin hơn input từ
người lạ**: nó có thể sai schema, sai giá trị, hoặc (nếu bị prompt injection) chứa nội dung
độc. Trước khi **ghi DB, gọi API khác, render ra UI, hay thực thi** — luôn validate.

```python
# Không chỉ validate "đúng kiểu", mà cả "đúng miền giá trị"
class Sentiment(BaseModel):
    label: str
    score: float

data = Sentiment.model_validate_json(raw)
assert data.label in {"positive", "negative", "neutral"}   # enum hợp lệ
assert 0.0 <= data.score <= 1.0                             # trong khoảng
```

> Lỗi hay gặp: code tin thẳng output LLM rồi đưa vào
> SQL/HTML/lệnh hệ thống. Xử lý output LLM như xử lý input người dùng — sanitize + validate.

## Xử lý khi model trả sai format

Model *sẽ* thi thoảng trả sai. Chiến lược thực dụng, không để app sập:

1. **Validate** (Pydantic) — phát hiện sai ngay.
2. **Retry một lần** với hướng dẫn rõ hơn ("JSON trước không hợp lệ, chỉ trả JSON đúng
   schema, không thêm chữ nào").
3. **Fallback** — nếu vẫn sai: trả lỗi có kiểm soát, giá trị mặc định an toàn, hoặc chuyển
   cho người xử lý. **Đừng** đoán bừa hay bỏ qua âm thầm.

```python
def extract_sentiment(text: str, retries: int = 1) -> Sentiment:
    for attempt in range(retries + 1):
        raw = call_model(text)                     # hàm gọi LLM của bạn
        try:
            return Sentiment.model_validate_json(raw)
        except (ValidationError, json.JSONDecodeError):
            if attempt == retries:
                raise                              # hết lượt → ném lỗi rõ ràng để tầng trên xử lý
```

## Streaming: trả kết quả dần

Với câu trả lời dài, **stream** để chữ hiện dần thay vì bắt người dùng chờ trắng màn hình.
Trải nghiệm tốt hơn hẳn, và giảm cảm giác chậm dù tổng thời gian không đổi.

```python
with client.messages.stream(
    model="claude-sonnet-5",
    max_tokens=512,
    messages=[{"role": "user", "content": "Giải thích asyncio trong 5 câu."}],
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)  # in từng mẩu ngay khi nhận
```

**Khi nào dùng streaming:**

| Nên stream | Không cần stream |
|------------|------------------|
| Chatbot, câu trả lời dài cho người đọc | Trích xuất JSON để code xử lý (cần trọn vẹn mới parse được) |
| UI thời gian thực (web, CLI tương tác) | Batch job chạy nền |
| Muốn người dùng "thấy tiến triển" ngay | Khi cần validate toàn bộ output trước khi dùng |

> Lưu ý: structured output + streaming ít đi cùng nhau — bạn thường cần **JSON trọn vẹn**
> để validate, nên với tác vụ trích xuất thì chờ đủ rồi parse, đừng stream.

## Cạm bẫy hay gặp

- **Parse văn bản tự do bằng regex** → mong manh; ép JSON + validate Pydantic.
- **Tin thẳng output LLM** (ghi DB/render/thực thi) → lỗ hổng & bug; validate cả kiểu lẫn miền giá trị.
- **Chỉ dặn prompt "trả JSON" mà không dùng cơ chế ép** → thi thoảng kèm lời dẫn làm hỏng JSON.
- **Không có nhánh xử lý khi format sai** → app crash; cần retry + fallback có kiểm soát.
- **Stream tác vụ cần JSON trọn vẹn** → parse dở dang; tác vụ trích xuất thì chờ đủ.

## Ghi nhớ

App AI thật cần **dữ liệu có cấu trúc**: ép model trả **JSON** (bằng prompt + cơ chế SDK như
tool/JSON mode) rồi **validate bằng Pydantic** — cả kiểu lẫn miền giá trị. Luôn coi **output
LLM là input chưa tin cậy**: validate trước khi ghi DB/gọi API/render, nếu không sẽ thành
lỗ hổng. Có sẵn nhánh **retry + fallback** khi model trả sai format, đừng để crash.
**Streaming** in token dần cho trải nghiệm tốt ở chatbot/UI, nhưng tác vụ cần JSON trọn vẹn
thì chờ đủ rồi mới parse.
