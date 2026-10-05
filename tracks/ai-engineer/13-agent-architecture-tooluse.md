---
level: "ai-inter-agent"
order: 13
title: "Agent Architecture & Vòng lặp Tool Use"
est: "5-6 giờ"
checklist:
  - "Giải thích được agent = LLM + tools + VÒNG LẶP, khác chatbot một lượt ở chỗ tự lặp cho đến khi xong việc"
  - "Mô tả được ReAct: reason (nghĩ) → act (gọi tool) → observe (đọc kết quả) → lặp lại"
  - "Viết được vòng lặp agent bằng function calling: chạy đến khi model dừng gọi tool"
  - "Đặt được điều kiện dừng an toàn: khi model không gọi tool nữa VÀ giới hạn số vòng tối đa"
  - "Chỉ ra được rủi ro để agent tự lặp gọi tool có tác dụng phụ và cách chặn (confirm, giới hạn quyền)"
related:
  - "glossary:agent"
  - "glossary:tool-use"
---

## Vì sao quan trọng

Ở bài 6 (Function Calling) bạn đã dựng vòng lặp tool **một lượt**: model đề nghị → code thực
thi → trả kết quả → model tổng hợp. **AI Agent** là bước nâng cấp tự nhiên: thay vì một lượt,
để model **lặp đi lặp lại** — gọi tool, đọc kết quả, quyết định gọi tool tiếp hay đã đủ để trả
lời. Đây là kiến trúc biến LLM từ "trợ lý trả lời câu hỏi" thành thứ **tự thực hiện tác vụ
nhiều bước**: tra dữ liệu, tính toán, gọi API rồi tổng hợp — mà không cần bạn cầm tay từng bước.

## Agent là gì: LLM + tools + vòng lặp

Định nghĩa gọn: **agent = một LLM được trao tools và chạy trong một vòng lặp**. Ba thành phần:

| Thành phần | Vai trò |
|------------|---------|
| **LLM** | "Bộ não" — suy luận, quyết định bước tiếp theo, tổng hợp câu trả lời |
| **Tools** | "Tay chân" — hàm thật code bạn cung cấp (tra DB, gọi API, tính toán) |
| **Vòng lặp** | Cơ chế để model gọi tool → đọc kết quả → gọi tiếp, cho đến khi xong |

Khác biệt cốt lõi với bài 6: chatbot + tool một lượt trả lời sau **đúng một** lần gọi tool.
Agent **tự lặp**: nếu sau khi đọc kết quả tool mà chưa đủ, nó gọi thêm tool khác, đọc tiếp,
rồi mới trả lời. Bạn không biết trước nó sẽ gọi mấy bước — **model tự quyết đường đi**.

> Điểm mấu chốt vẫn giống bài 6: model **không tự chạy hàm**, nó chỉ *đề nghị*. Code bạn giữ
> khâu thực thi. Agent chỉ là *lặp lại* khâu đề-nghị-thực-thi đó nhiều lần.

## ReAct: reason → act → observe

**ReAct** (Reasoning + Acting) là pattern phổ biến nhất để tổ chức vòng lặp agent. Mỗi vòng:

1. **Reason** — model suy nghĩ: "để trả lời câu này tôi cần biết X, nên gọi tool `get_x`".
2. **Act** — model đề nghị gọi tool; code bạn thực thi.
3. **Observe** — kết quả tool được đưa lại cho model làm dữ kiện.
4. Lặp lại từ bước 1 với dữ kiện mới, **cho đến khi** model thấy đủ để trả lời thẳng.

```
Câu hỏi: "Đơn hàng #123 giao chưa, và khách đó còn nợ tiền không?"

Vòng 1  reason: cần tra trạng thái đơn → act: get_order(123)
        observe: "đang giao, dự kiến mai"
Vòng 2  reason: cần tra công nợ khách → act: get_debt(customer_of_123)
        observe: "còn nợ 2.000.000đ"
Vòng 3  reason: đã đủ dữ kiện → KHÔNG gọi tool nữa, trả lời thẳng
        → "Đơn #123 đang giao, dự kiến mai. Khách còn nợ 2.000.000đ."
```

Sức mạnh của ReAct: model **tự chia nhỏ** tác vụ và **dùng kết quả bước trước** để quyết định
bước sau — thứ mà một lần gọi tool không làm được.

## Vòng lặp agent bằng code

Dựng thẳng trên function calling của bài 6, chỉ bọc thêm vòng `while`:

```python
# Python 3.12+ — cài: pip install anthropic
import os
from anthropic import Anthropic

client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])   # KHÔNG hard-code key

# --- Tools thật của bạn (đọc-only cho an toàn) ---
def get_order(order_id: int) -> str:
    return f"Đơn #{order_id}: đang giao, dự kiến mai"          # thực tế: query DB

def get_debt(order_id: int) -> str:
    return f"Khách của đơn #{order_id}: còn nợ 2.000.000đ"

TOOL_IMPL = {"get_order": get_order, "get_debt": get_debt}

tools = [
    {"name": "get_order", "description": "Tra trạng thái giao hàng của một đơn theo id.",
     "input_schema": {"type": "object",
         "properties": {"order_id": {"type": "integer"}}, "required": ["order_id"]}},
    {"name": "get_debt", "description": "Tra công nợ của khách gắn với một đơn theo id.",
     "input_schema": {"type": "object",
         "properties": {"order_id": {"type": "integer"}}, "required": ["order_id"]}},
]

messages = [{"role": "user",
             "content": "Đơn #123 giao chưa, và khách đó còn nợ tiền không?"}]

MAX_STEPS = 8                                    # chốt chặn: đừng để lặp vô hạn
for _ in range(MAX_STEPS):
    resp = client.messages.create(
        model="claude-sonnet-5", max_tokens=1024, tools=tools, messages=messages,
    )
    messages.append({"role": "assistant", "content": resp.content})

    if resp.stop_reason != "tool_use":           # ĐIỀU KIỆN DỪNG: model hết gọi tool
        print(resp.content[0].text)              # → câu trả lời cuối
        break

    # Model đề nghị ≥1 tool → thực thi rồi trả kết quả cho vòng sau
    results = []
    for block in resp.content:
        if block.type == "tool_use":
            fn = TOOL_IMPL[block.name]
            args = block.input                   # VALIDATE args ở đây trước khi chạy
            out = fn(**args)                     # chạy hàm thật
            results.append({"type": "tool_result",
                            "tool_use_id": block.id, "content": out})
    messages.append({"role": "user", "content": results})
else:
    print("Đạt giới hạn số bước — dừng để tránh lặp vô hạn.")
```

> Cú pháp (`stop_reason`, `tool_use`, `tool_result`) tùy SDK, nhưng **khung thì bất biến**:
> vòng lặp gọi model → nếu đề nghị tool thì thực thi & trả kết quả → lặp; **dừng khi model
> không gọi tool nữa**. Nắm khung này, tra tài liệu SDK cho chi tiết.

## Điều kiện dừng: đừng để agent chạy mãi

Đây là khác biệt lớn nhất so với bài 6 và là chỗ dễ hỏng nhất. Cần **hai** lớp dừng:

- **Dừng tự nhiên**: `stop_reason` khác `"tool_use"` — model tự thấy đã đủ, trả lời thẳng.
  Đây là kết thúc bình thường bạn *muốn*.
- **Dừng cưỡng bức (chốt chặn)**: giới hạn `MAX_STEPS`. Model có thể **kẹt vòng lặp**: gọi
  tool lỗi → gọi lại → lỗi tiếp, hoặc lưỡng lự không chốt. Không có trần số bước, agent có thể
  chạy mãi và **đốt token/tiền vô tội vạ**.

> Luôn đặt trần số vòng. Coi mỗi vòng là một lần gọi API tốn tiền — agent kẹt 50 vòng là hóa
> đơn thật. Có thể kèm trần token/thời gian tùy hệ thống.

## An toàn: agent tự lặp gọi tool nguy hiểm hơn một lượt

Ở bài 6 model gọi tool *một lần* và bạn nhìn được. Agent gọi **nhiều lần, tự quyết** — bề mặt
rủi ro rộng hơn hẳn:

- **Tool có tác dụng phụ trong vòng lặp**: nếu agent có tool ghi DB/gửi mail/xóa, một quyết
  định sai có thể lặp lại tác động thật nhiều lần. Ưu tiên cho agent **tool đọc-only**; tool
  ghi/xóa phải có kiểm soát riêng.
- **Prompt injection dẫn dắt cả chuỗi**: dữ liệu tool trả về (email, tài liệu, kết quả web)
  có thể chứa lệnh độc lái agent gọi tool phá hoại ở vòng sau. Đừng để nội dung quan sát được
  điều khiển hành vi agent (sâu ở phần **AI Security**).
- **Hành động không hoàn tác**: xóa, thanh toán, gửi ra ngoài → chèn **bước con người xác
  nhận** trước khi thực thi, đừng để agent tự quyết trong vòng lặp.

Nguyên tắc như bài 6, nhưng siết chặt hơn vì tính tự lặp: **validate mọi tham số**, **giới
hạn quyền của tool**, **confirm cho hành động rủi ro cao**.

## Cạm bẫy hay gặp

- **Không đặt trần số bước** → agent kẹt vòng lặp, đốt token/tiền không kiểm soát.
- **Quên điều kiện dừng tự nhiên** → không nhận ra model đã trả lời xong, xử lý sai output.
- **Trao tool ghi/xóa cho agent tự lặp** → một quyết định sai nhân lên thành hậu quả thật.
- **Tin mù kết quả tool** → injection qua dữ liệu quan sát lái cả chuỗi hành động.
- **Không append `assistant` message chứa tool_use vào lịch sử** → vòng sau mất mạch, model lú.

## Ghi nhớ

**Agent = LLM + tools + vòng lặp**: khác chatbot một lượt ở chỗ model **tự lặp** gọi tool cho
đến khi đủ dữ kiện để trả lời. **ReAct** tổ chức mỗi vòng thành **reason → act → observe**,
dùng kết quả bước trước quyết định bước sau. Code chỉ là function calling của bài 6 bọc trong
`while`: gọi model → nếu đề nghị tool thì thực thi & trả kết quả → lặp; **dừng khi model hết
gọi tool** VÀ luôn có **trần số bước** chống lặp vô hạn/đốt tiền. Vì agent tự lặp và tự quyết,
rủi ro cao hơn: ưu tiên **tool đọc-only**, **validate tham số**, **confirm hành động không hoàn
tác**, canh **prompt injection qua dữ liệu quan sát**.
