---
level: "ai-inter-agent"
order: 15
title: "Memory & Multi-Agent Orchestration"
est: "5-6 giờ"
checklist:
  - "Phân biệt được short-term memory (lịch sử hội thoại trong context) vs long-term memory (lưu ngoài, truy xuất lại)"
  - "Giải thích được vì sao cần long-term memory và cách vector store phục vụ việc nhớ chọn lọc"
  - "Mô tả được state management của agent: cái gì giữ trong context, cái gì đẩy ra ngoài"
  - "So sánh được các mẫu orchestration: single agent, supervisor, handoff — và chọn đúng cho bài toán"
  - "Nói được KHI NÀO không cần multi-agent để tránh over-engineer, và rủi ro an toàn khi nhiều agent chia sẻ tool"
related:
  - "glossary:agent"
  - "glossary:vector-database"
---

## Vì sao quan trọng

Agent ở bài 13-14 mới sống trong *một phiên*: hết phiên là quên sạch, và mọi việc dồn vào một
"bộ não" duy nhất. Bài này thêm hai mảnh cuối của cấp Agent: **memory** — để agent *nhớ* qua
thời gian và không bị tràn context; và **orchestration** — cách tổ chức nhiều agent phối hợp
khi một agent gánh không nổi. Kèm một bài học quan trọng không kém: **khi nào KHÔNG cần
multi-agent** — vì nhiều agent thường là cái bẫy over-engineer đắt đỏ và khó debug.

## Short-term vs long-term memory

Agent có hai loại trí nhớ, phục vụ mục đích khác nhau:

| | Short-term memory | Long-term memory |
|--|-------------------|------------------|
| Là gì | Lịch sử hội thoại nằm **trong context window** | Kiến thức lưu **ngoài context**, truy xuất khi cần |
| Sống bao lâu | Trong phiên hiện tại | Qua nhiều phiên, lâu dài |
| Cơ chế | Gửi lại `messages` mỗi lần gọi API | Lưu vào DB/vector store, tìm lại khi liên quan |
| Giới hạn | Bị chặn bởi context window (bài 3); dài quá thì tốn token/tràn | Không giới hạn kích thước, nhưng phải *retrieve đúng* |

Short-term chính là mảng `messages` bạn đã dùng: model "nhớ" các lượt trước vì bạn **gửi lại
cả lịch sử**. Nhưng lịch sử dài mãi sẽ **tràn context window** và **đội token mỗi lượt**. Đó
là lúc cần long-term memory.

## Long-term memory: nhớ chọn lọc bằng vector store

Long-term memory giải bài toán "nhớ nhiều thứ hơn context chứa nổi, qua nhiều phiên". Cơ chế
quen thuộc — chính là **RAG** (bài 9) áp vào trí nhớ agent:

1. **Ghi nhớ**: thông tin đáng nhớ (sự việc, sở thích người dùng, kết quả bước trước) được
   **embed** thành vector và **lưu vào vector store** (bài 7).
2. **Nhớ lại**: khi cần, embed ngữ cảnh hiện tại → **truy xuất** vài mẩu ký ức liên quan nhất
   → **nhồi vào prompt** như context.

```python
# Ý tưởng: long-term memory = RAG cho ký ức agent (dựng trên bài 7 & 9)
def remember(text, meta):                 # ghi nhớ
    vec_store.add(text, metadata=meta)    # embed + lưu vào vector store

def recall(context, k=3):                 # nhớ lại
    return vec_store.query(context, n=k)  # tìm k mẩu ký ức liên quan nhất

# Trước khi trả lời, kéo ký ức liên quan vào prompt:
memories = recall(user_message)
prompt = f"Ký ức liên quan:\n{memories}\n\nCâu hỏi: {user_message}"
```

> Không phải mọi thứ đều đáng nhớ. Ghi bừa mọi lượt vào long-term memory thì lúc recall toàn
> nhiễu. Chọn lọc *cái gì đáng nhớ* (quyết định, sự kiện, sở thích bền) quan trọng hơn là nhớ
> tất. Đây cũng là chỗ đụng bảo mật: đừng nhớ dữ liệu nhạy cảm/PII vào store dùng chung.

## State management: giữ gì trong context, đẩy gì ra ngoài

Với agent chạy dài, quản lý **state** (trạng thái) là kỹ năng cốt lõi: context window có hạn
nên không thể nhét tất cả vào. Nguyên tắc phân loại:

- **Giữ trong context**: mục tiêu hiện tại, vài lượt gần nhất, kết quả tool vừa dùng — thứ
  model cần *ngay* để quyết bước tiếp.
- **Đẩy ra ngoài (long-term / DB)**: lịch sử cũ, dữ liệu lớn, ký ức qua phiên — truy xuất lại
  khi liên quan thay vì mang kè kè.
- **Tóm tắt (summarization)**: khi hội thoại dài, thay vì gửi lại nguyên si, **nén** các lượt
  cũ thành bản tóm tắt ngắn để tiết kiệm token mà vẫn giữ mạch.

> Coi context window như bàn làm việc: chỉ để thứ đang dùng; hồ sơ cũ cất vào tủ (store), cần
> thì lấy ra. Bàn bừa (context nhồi nhét) làm model lú và hóa đơn token phình to.

## Multi-agent orchestration: supervisor & handoff

Khi một agent gánh quá nhiều vai (tra cứu + tính toán + soạn thảo + gửi), nó dễ rối. **Multi-
agent** chia việc cho nhiều agent chuyên biệt. Hai mẫu phổ biến:

| Mẫu | Cách hoạt động | Hợp với |
|-----|----------------|---------|
| **Supervisor** | Một agent "điều phối" nhận việc, giao cho các sub-agent chuyên môn, tổng hợp kết quả | Tác vụ chia được thành mảng chuyên biệt rõ (nghiên cứu / viết / kiểm tra) |
| **Handoff** | Agent này *chuyển quyền* cho agent khác khi việc vượt phạm vi của nó | Luồng theo giai đoạn, mỗi giai đoạn một chuyên gia tiếp quản |

```
Supervisor:                          Handoff:
   [Supervisor]                        [Agent Tiếp nhận]
    ├─ giao → [Agent Nghiên cứu]         → chuyển → [Agent Kỹ thuật]
    ├─ giao → [Agent Soạn thảo]            → chuyển → [Agent Thanh toán]
    └─ tổng hợp kết quả cuối
```

Mỗi sub-agent là một agent bài 13-14 (LLM + tools + vòng lặp), chỉ khác **phạm vi hẹp** và
**tool riêng**.

## Khi nào KHÔNG cần multi-agent

Đây là phần dễ bị bỏ qua nhất và tốn kém nhất nếu làm sai. **Multi-agent không phải mặc định
xịn hơn** — nó thêm chi phí thật:

- **Nhiều lần gọi LLM hơn** → tốn token, chậm hơn, đắt hơn.
- **Khó debug**: lỗi nằm ở agent nào, ở khâu bàn giao nào? Chuỗi càng dài càng mù.
- **Mất mát khi bàn giao**: thông tin rơi rớt giữa các agent, "tam sao thất bản".

> Quy tắc thực dụng: **bắt đầu bằng một agent**. Chỉ tách multi-agent khi một agent thực sự
> đuối — quá nhiều tool khiến nó chọn nhầm, hoặc các phần việc *thật sự* độc lập và chuyên môn
> khác hẳn nhau. Đừng dựng 5 agent cho việc một agent + vài tool làm gọn.

Phần lớn ứng dụng thực tế **một agent tốt là đủ**. Multi-agent là công cụ cho độ phức tạp
*đã chứng minh*, không phải để trông "kiến trúc xịn".

## An toàn khi nhiều agent & bộ nhớ dùng chung

- **Tool có tác dụng phụ nhân lên**: nhiều agent cùng chạm tool ghi/xóa → khó truy ai làm gì.
  Giới hạn quyền theo *từng* agent; agent nào không cần ghi thì chỉ cho tool đọc.
- **Injection lan qua bàn giao**: nội dung độc một agent nuốt phải có thể truyền sang agent
  sau qua bước handoff. Đừng để dữ liệu quan sát điều khiển hành vi (sâu ở **AI Security**).
- **Rò rỉ qua long-term memory dùng chung**: ký ức lưu chung có thể để agent/user này đọc dữ
  liệu của người khác — **lọc quyền khi recall** như lọc quyền RAG (bài 9).

## Cạm bẫy hay gặp

- **Nhồi cả lịch sử dài vào context** → tràn context window, đội token; hãy tóm tắt & đẩy ra long-term.
- **Ghi bừa mọi thứ vào long-term memory** → recall toàn nhiễu; chọn lọc cái đáng nhớ.
- **Dựng multi-agent cho việc một agent làm được** → over-engineer: chậm, đắt, khó debug.
- **Bàn giao làm rơi thông tin** → agent sau thiếu ngữ cảnh; truyền đủ facts đã chốt khi handoff.
- **Long-term memory dùng chung không lọc quyền** → rò rỉ dữ liệu giữa user/phòng ban.
- **Nhiều agent cùng tool ghi/xóa không phân quyền** → tác dụng phụ nhân lên, khó truy trách nhiệm.

## Ghi nhớ

Agent có **short-term memory** (lịch sử trong context — sống trong phiên, bị chặn bởi context
window) và **long-term memory** (lưu ngoài, truy xuất lại — chính là RAG áp cho ký ức: embed →
store → recall). **State management** là biết **giữ gì trong context** (mục tiêu, lượt gần,
kết quả vừa dùng) và **đẩy gì ra ngoài** (lịch sử cũ, dữ liệu lớn), kèm **tóm tắt** để khỏi
tràn. **Multi-agent orchestration** (**supervisor** điều phối / **handoff** chuyển quyền) chia
việc cho agent chuyên biệt — nhưng **đừng mặc định dùng**: nó đắt, chậm, khó debug, hay rơi
thông tin khi bàn giao. **Bắt đầu bằng một agent**, chỉ tách khi thực sự đuối. Nhiều agent &
memory dùng chung mở rộng bề mặt rủi ro: **phân quyền tool theo agent**, **lọc quyền khi
recall**, canh **injection lan qua handoff**.
