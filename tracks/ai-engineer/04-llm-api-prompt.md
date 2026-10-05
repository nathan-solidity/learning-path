---
level: "ai-basic-application"
order: 4
title: "LLM API & Prompt"
est: "5-6 giờ"
checklist:
  - "Gọi được một model qua SDK và đọc đúng nội dung trả về"
  - "Phân biệt và dùng đúng vai trò system / user / assistant trong messages"
  - "Đọc API key từ biến môi trường, không bao giờ hard-code vào source"
  - "Viết được prompt có cấu trúc: vai trò rõ, output mong muốn rõ, tách dữ liệu khỏi lệnh"
  - "Điều chỉnh temperature/max_tokens phù hợp tác vụ (tất định vs sáng tạo)"
  - "Xử lý lỗi, rate limit và retry có backoff khi gọi API"
related:
  - "glossary:llm"
  - "glossary:prompt"
---

## Vì sao quan trọng

Đây là bước từ "hiểu LLM" sang "dùng LLM". Sau bài này bạn có ứng dụng AI đầu tiên: gửi
prompt, nhận kết quả, xử lý được lỗi. Nghe đơn giản, nhưng khác biệt giữa demo và production
nằm ở chi tiết: quản key, viết prompt rõ, chọn tham số đúng, và **không sập khi API lỗi**.

## Gọi model qua SDK

Model là một dependency **trả phí, chậm, không tất định**. Bạn không train nó — bạn gửi
**messages** và nhận lại token.

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
> khác nhau nhưng khái niệm — message, role, token, temperature — giống nhau. Khi làm với
> Claude/Anthropic, dùng model mới nhất (vd `claude-sonnet-5`, `claude-opus-4-8`).

## Vai trò message: system / user / assistant

| Role | Ai nói | Dùng để |
|------|--------|---------|
| `system` | Bạn (dev) | Đặt luật chung: vai trò, giọng văn, ràng buộc format, quy tắc an toàn |
| `user` | Người dùng | Câu hỏi / yêu cầu thực tế |
| `assistant` | Model | Câu trả lời trước đó — gửi lại để giữ ngữ cảnh hội thoại |

Vì LLM **stateless** (bài 2), muốn hội thoại nhiều lượt bạn **nối lịch sử** vào `messages`:

```python
messages = [
    {"role": "user", "content": "Python có GIL không?"},
    {"role": "assistant", "content": "Có, CPython dùng GIL."},
    {"role": "user", "content": "Vậy nó ảnh hưởng gì tới đa luồng?"},  # model thấy cả 3
]
```

`system` là nơi đặt "hiến pháp" cho model — vai trò, format, giới hạn. Đặt luật ở `system`
mạnh hơn nhét vào `user`, và tách bạch được *lệnh của dev* với *dữ liệu của người dùng*.

## Prompt engineering cơ bản

Prompt là hợp đồng bạn ký với model. Vài nguyên tắc ăn tiền ngay:

- **Nói rõ vai trò và output mong muốn**: "trả về JSON", "chỉ tiếng Việt", "tối đa 3 câu".
  Model không đọc được ý bạn — mơ hồ vào thì mơ hồ ra.
- **Cho ví dụ (few-shot)** khi format quan trọng — 1-2 ví dụ mẫu tốt hơn mô tả dài dòng.
- **Tách dữ liệu khỏi lệnh**: bọc input người dùng trong dấu phân cách rõ ràng. Đây vừa là
  chất lượng vừa là **bảo mật** — giảm rủi ro prompt injection (input "ra lệnh" cho model).

```python
prompt = f"""Phân loại cảm xúc của đoạn review sau. Chỉ trả về 1 từ: positive/negative/neutral.

<review>
{user_review}
</review>"""  # input bọc trong thẻ, tách khỏi phần lệnh
```

> Prompt engineering là vòng lặp thử–đo–sửa: viết → chạy trên vài ca thực tế → xem sai ở
> đâu → chỉnh. Đừng kỳ vọng prompt hoàn hảo ngay lần đầu.

## Temperature & max_tokens: điều khiển output

- **`temperature`**: độ "ngẫu nhiên". Thấp (0–0.3) → ổn định, lặp lại được; cao (0.7–1.0) →
  đa dạng, sáng tạo hơn. Việc cần tất định (phân loại, trích xuất) → **để 0**.
- **`max_tokens`**: trần token output. Đặt vừa đủ — quá thấp thì câu trả lời bị cắt cụt,
  quá cao thì lãng phí và cho phép model lan man.

```python
resp = client.messages.create(
    model="claude-sonnet-5",
    max_tokens=256,
    temperature=0,          # trích xuất/phân loại: cần tất định → để 0
    messages=[{"role": "user", "content": prompt}],
)
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
> nạp bằng `python-dotenv` ở dev, dùng secret manager của cloud khi lên production.

## Xử lý lỗi, rate limit & retry

API sẽ lỗi: mạng chập chờn, quá tải (`429`), server lỗi (`5xx`). Retry với **exponential
backoff** cho lỗi tạm thời; **đừng** retry lỗi do bạn (request sai, hết quota — retry vô ích).

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
            time.sleep(2 ** attempt)        # 1s, 2s, 4s... backoff tăng dần
        except APIStatusError as e:
            if e.status_code >= 500:        # lỗi server tạm thời → retry
                time.sleep(2 ** attempt)
            else:
                raise                        # lỗi 4xx do request sai → không retry
    raise RuntimeError("Gọi LLM thất bại sau khi retry")
```

> Ở production, thường dùng thêm **timeout** cho mỗi request và giới hạn tổng thời gian retry
> để không treo request người dùng vô hạn. SDK thường có sẵn tham số `timeout`/`max_retries`.

## Cạm bẫy hay gặp

- **Hard-code API key** trong source → lộ key khi commit; luôn đọc từ `os.environ`.
- **Không xử lý rate limit/lỗi tạm thời** → app chết khi API trả `429`; cần retry + backoff.
- **Prompt mơ hồ** → output mơ hồ; nói rõ vai trò, format, giới hạn độ dài.
- **Trộn lệnh và dữ liệu người dùng** → mở đường cho prompt injection; tách bằng dấu phân cách.
- **temperature cao cho việc cần tất định** → phân loại/trích xuất lúc đúng lúc sai; để 0.

## Ghi nhớ

Gọi LLM là gửi **messages** (system/user/assistant) qua **SDK** và nhận token; muốn giữ hội
thoại thì nối lại lịch sử vì model **stateless**. Đặt luật ở **system**, viết **prompt rõ
ràng** (vai trò + format + tách dữ liệu khỏi lệnh), chọn **temperature 0** cho việc cần tất
định. Luôn **đọc key từ biến môi trường** — không hard-code. Bọc lời gọi bằng **retry có
backoff** cho rate limit/lỗi server, không retry lỗi 4xx.
