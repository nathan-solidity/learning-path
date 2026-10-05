---
level: "ai-basic-application"
order: 6
title: "Function Calling & Tools"
est: "5-6 giờ"
checklist:
  - "Giải thích được function/tool calling: model không chạy hàm, mà ĐỀ NGHỊ gọi hàm nào với tham số gì"
  - "Khai báo được một tool đúng chuẩn: name, description, input schema"
  - "Viết được vòng lặp tool: gửi tool → model đề nghị gọi → code thực thi → trả kết quả → model tổng hợp"
  - "Hiểu vì sao description và schema của tool quyết định model dùng đúng hay sai"
  - "Xử lý được khi model gọi tool sai/tham số không hợp lệ (validate trước khi thực thi)"
  - "Nhận ra rủi ro để model gọi tool có tác dụng phụ (ghi DB, gửi mail) mà không kiểm soát"
related:
  - "glossary:function-calling"
  - "glossary:tool-use"
  - "glossary:agent"
---

## Vì sao quan trọng

Đến giờ LLM chỉ *nói*. **Function calling (tool use)** cho nó *làm*: tra DB, gọi API, tính
toán chính xác, đọc dữ liệu mới sau knowledge cutoff. Đây là kỹ thuật biến LLM từ "cỗ máy
sinh văn bản" thành thứ **hành động trong hệ thống của bạn** — và là nền tảng trực tiếp của
**AI Agent** (cấp Trung cấp). Nắm chắc vòng lặp tool ở đây thì cả phần agent sau nhẹ nhàng.

## Hiểu đúng: model KHÔNG tự chạy hàm

Đây là điểm hầu hết người mới hiểu sai. Model **không** thực thi code của bạn. Nó chỉ **đề
nghị**: "tôi muốn gọi hàm `get_weather` với `city="Hà Nội"`". **Code của bạn** quyết định
có chạy hay không, chạy thế nào, rồi **trả kết quả lại** cho model.

```
1. Bạn gửi: câu hỏi người dùng + DANH SÁCH TOOL model được phép đề nghị
2. Model trả: "tôi muốn gọi get_weather(city='Hà Nội')"   ← chỉ là đề nghị, chưa chạy gì
3. CODE BẠN: chạy hàm thật get_weather("Hà Nội") → "28°C, nắng"
4. Bạn gửi tiếp: kết quả "28°C, nắng" cho model
5. Model trả: "Hà Nội hôm nay 28°C, trời nắng."           ← câu trả lời cuối
```

> Ranh giới này là chốt an toàn: vì *bạn* cầm khâu thực thi, bạn kiểm soát được model được
> phép làm gì (đọc thôi hay ghi được, giới hạn tham số...). Đừng bao giờ để model "tự chạy".

## Khai báo tool: name, description, schema

Model biết tool nào tồn tại và dùng thế nào **chỉ qua phần khai báo**. Ba phần đều quan trọng:

```python
tools = [{
    "name": "get_weather",
    "description": "Lấy thời tiết hiện tại của một thành phố. Dùng khi người dùng hỏi về thời tiết.",
    "input_schema": {
        "type": "object",
        "properties": {
            "city": {"type": "string", "description": "Tên thành phố, ví dụ 'Hà Nội'"},
        },
        "required": ["city"],
    },
}]
```

- **`name`**: định danh hàm.
- **`description`**: *quan trọng nhất* — model đọc mô tả này để quyết định **khi nào** dùng
  tool. Mô tả mơ hồ → model gọi nhầm lúc hoặc bỏ quên. Viết như hướng dẫn cho đồng nghiệp.
- **`input_schema`** (JSON Schema): định nghĩa tham số. Model buộc trả đúng cấu trúc này —
  đây cũng chính là cách lấy **structured output** ổn định (bài 5).

## Vòng lặp tool bằng code

```python
import os, json
from anthropic import Anthropic

client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

def get_weather(city: str) -> str:          # hàm THẬT của bạn
    return f"{city}: 28°C, nắng"            # thực tế: gọi API thời tiết

messages = [{"role": "user", "content": "Hà Nội hôm nay thời tiết sao?"}]

resp = client.messages.create(
    model="claude-sonnet-5", max_tokens=512, tools=tools, messages=messages,
)

# Model đề nghị gọi tool?
if resp.stop_reason == "tool_use":
    messages.append({"role": "assistant", "content": resp.content})
    for block in resp.content:
        if block.type == "tool_use":
            # VALIDATE tham số trước khi thực thi (đừng tin mù)
            args = block.input
            result = get_weather(args["city"])          # chạy hàm thật
            messages.append({
                "role": "user",
                "content": [{
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": result,
                }],
            })
    # Gửi kết quả lại, model tổng hợp câu trả lời cuối
    final = client.messages.create(
        model="claude-sonnet-5", max_tokens=512, tools=tools, messages=messages,
    )
    print(final.content[0].text)
```

> Cú pháp cụ thể (`stop_reason`, `tool_use`, `tool_result`) khác nhau giữa các SDK, nhưng
> **vòng lặp thì giống hệt**: đề nghị → thực thi → trả kết quả → tổng hợp. Nắm khái niệm,
> tra tài liệu SDK cho chi tiết.

## Vì sao description & schema quyết định chất lượng

Model chọn tool dựa trên `description` và tên. Kinh nghiệm ăn tiền:

- **Mô tả rõ *khi nào dùng*, không chỉ *làm gì***: "Dùng khi người dùng hỏi giá sản phẩm"
  tốt hơn "Truy vấn giá".
- **Tên tham số + description tham số rõ ràng** → model điền đúng. `{"city": ...}` kèm ví dụ
  tốt hơn `{"x": ...}`.
- **Đừng cho quá nhiều tool cùng lúc** → model dễ chọn nhầm. Chỉ đưa tool liên quan tới ngữ cảnh.

## An toàn: tool có tác dụng phụ

Tool *đọc* (tra thời tiết, tìm kiếm) tương đối an toàn. Tool có **tác dụng phụ** — ghi DB,
gửi email, chuyển tiền, xóa dữ liệu — là vùng nguy hiểm: model có thể gọi nhầm, hoặc bị
**prompt injection** (bài AI Security) lừa gọi tool phá hoại.

Nguyên tắc kiểm soát:

- **Validate mọi tham số** model đưa trước khi thực thi (đúng kiểu, trong giới hạn, đúng
  quyền của user hiện tại) — như validate input người dùng.
- **Giới hạn phạm vi tool**: chỉ trao tool thật sự cần; tool ghi/xóa nên có kiểm tra quyền
  và giới hạn tác động (vd chỉ sửa dữ liệu của chính user đó).
- **Người xác nhận cho hành động rủi ro cao**: hành động không thể hoàn tác (xóa, thanh
  toán) nên cần một bước con người duyệt, đừng để model tự quyết.

> Đây là khác biệt giữa tool calling *học vui* và *đi làm được*: không phải làm model gọi
> tool, mà là **giới hạn được model gọi tool tới đâu**.

## Cạm bẫy hay gặp

- **Tưởng model tự chạy hàm** → thực ra nó chỉ đề nghị; code bạn mới thực thi và kiểm soát.
- **Description mơ hồ** → model gọi nhầm tool hoặc bỏ quên; mô tả rõ *khi nào* dùng.
- **Không validate tham số trước khi thực thi** → chạy hàm với input rác/độc; validate như input người dùng.
- **Trao tool ghi/xóa không giới hạn** → model (hoặc kẻ tấn công qua injection) gây hại thật.
- **Nhồi quá nhiều tool** → model chọn nhầm; chỉ đưa tool liên quan ngữ cảnh.

## Ghi nhớ

**Function/tool calling** cho LLM *hành động*, nhưng model **chỉ đề nghị gọi hàm nào với
tham số gì — code bạn mới thực thi**. Khai báo tool gồm **name + description + input_schema**;
`description` (nói rõ *khi nào dùng*) quyết định model chọn đúng hay sai, và schema cũng là
cách lấy structured output ổn định. Vòng lặp: **đề nghị → validate → thực thi → trả kết quả
→ tổng hợp**. Luôn **validate tham số trước khi thực thi** và **giới hạn phạm vi tool** —
đặc biệt tool có tác dụng phụ; hành động không hoàn tác được thì cần người duyệt. Đây là nền
trực tiếp của **AI Agent**.
