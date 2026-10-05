---
level: "ai-basic-foundation"
order: 2
title: "LLM Fundamentals"
est: "5-6 giờ"
checklist:
  - "Giải thích được LLM là mô hình dự đoán token tiếp theo, không phải tra cứu sự thật"
  - "Hiểu pretraining và fine-tuning (bao gồm RLHF) tạo ra một model trợ lý thế nào"
  - "Giải thích được knowledge cutoff và vì sao LLM không biết chuyện mới sau ngày đó"
  - "Hiểu vì sao LLM hallucinate (bịa) và khi nào rủi ro cao nhất"
  - "Phân biệt được các họ model theo khả năng/chi phí/độ trễ và biết chọn model theo bài toán"
  - "Hiểu LLM là stateless: không có trí nhớ giữa các request nếu bạn không gửi lại lịch sử"
related:
  - "glossary:llm"
  - "glossary:hallucination"
  - "glossary:token"
---

## Vì sao quan trọng

Bài trước định vị LLM trong bản đồ AI. Bài này mở nắp ra: **LLM thật sự làm gì bên trong**
ở mức khái niệm. Hiểu điều này quyết định bạn thiết kế hệ thống đúng hay sai — vì mọi điểm
mạnh (viết trôi chảy, tổng hợp) và điểm yếu (bịa, không biết chuyện mới, không tính toán
chuẩn) đều bắt nguồn từ **một cơ chế duy nhất: dự đoán token tiếp theo**.

## Cơ chế lõi: dự đoán token tiếp theo

LLM làm đúng một việc, lặp lại: **cho một chuỗi token, đoán token có xác suất cao nhất đi
tiếp theo**. Rồi thêm token đó vào chuỗi, đoán token kế, cứ thế.

```
"Thủ đô của Việt Nam là" ──▶ model đoán ──▶ "Hà" ──▶ "Nội" ──▶ "." (dừng)
```

Nó không "tra cứu" đáp án trong một cơ sở dữ liệu. Nó *tính xác suất* token tiếp theo dựa
trên hàng tỉ tham số học được từ văn bản. Vì "Hà Nội" xuất hiện cùng "thủ đô Việt Nam" vô số
lần trong dữ liệu huấn luyện, model gán xác suất cao cho nó — nên trả lời đúng. Nhưng cơ chế
là **thống kê ngôn ngữ**, không phải tra sự thật.

> Đây là chìa khóa hiểu mọi thứ: LLM giỏi khi câu trả lời *khớp với pattern ngôn ngữ phổ
> biến* trong dữ liệu. Nó chông chênh khi câu trả lời cần *sự thật hiếm, cụ thể, hoặc mới* —
> vì pattern thống kê yếu, nó vẫn "đoán trôi chảy" và ra thứ nghe hợp lý nhưng sai (bịa).

## LLM ra đời thế nào: pretraining → fine-tuning

Một model trợ lý như Claude/GPT qua (tối thiểu) hai giai đoạn:

| Giai đoạn | Học từ | Kết quả |
|-----------|--------|---------|
| **Pretraining** | Khối văn bản khổng lồ (web, sách, code) | Model "biết ngôn ngữ & thế giới" nhưng chưa biết *nghe lời* — chỉ giỏi đoán từ tiếp |
| **Fine-tuning** | Ví dụ hội thoại chất lượng + phản hồi người dùng | Model biết trả lời hữu ích, an toàn, đúng định dạng trợ lý |

Trong fine-tuning có **RLHF** (Reinforcement Learning from Human Feedback): người đánh giá
chấm điểm câu trả lời, model học để tạo ra thứ được chấm cao. Đây là lý do model "biết điều",
từ chối yêu cầu độc hại, và trả lời theo kiểu trợ lý thay vì buột ra văn bản ngẫu nhiên.

> AI Engineer không làm hai bước này (chúng ở cấp Nâng cao). Nhưng hiểu nó giúp bạn biết:
> model *đã được định hình sẵn* — bạn điều khiển phần còn lại bằng **prompt**, không phải
> train lại.

## Knowledge cutoff: LLM không biết chuyện mới

Model chỉ biết những gì có trong dữ liệu huấn luyện, kết thúc tại một mốc thời gian —
**knowledge cutoff**. Hỏi về sự kiện sau mốc đó → nó không biết, và tệ hơn, có thể **bịa**
thay vì nói "tôi không biết".

- Hỏi giá cổ phiếu hôm nay, tin tức tuần trước → sai/bịa.
- Đây chính là một lý do sinh ra **RAG** (cấp RAG) và **tool/web search** (cấp Agent): bơm
  thông tin mới vào lúc chạy, thay vì trông chờ model tự biết.

## Hallucination: vì sao LLM bịa

**Hallucination** = model tạo ra nội dung nghe hợp lý nhưng **sai sự thật hoặc bịa hoàn
toàn** (trích dẫn không tồn tại, API không có, số liệu sai). Nguyên nhân từ chính cơ chế:
model *luôn* cố đoán token trôi chảy tiếp theo — nó không có cơ chế "im lặng khi không
chắc". Rủi ro cao nhất khi:

- Hỏi sự thật cụ thể, hiếm (tên người, ngày, số liệu, API ít gặp).
- Hỏi chuyện sau knowledge cutoff.
- Prompt mơ hồ khiến model "tự điền chỗ trống".

Cách giảm (dùng suốt lộ trình): đưa **nguồn thật vào context** (RAG), yêu cầu model **nói
"không biết" khi thiếu dữ kiện**, cho model **dùng tool** để tra thay vì tự nhớ, và **luôn
validate** output quan trọng.

## Các họ model: chọn theo bài toán

Mỗi nhà cung cấp có nhiều model, đánh đổi giữa **khả năng ↔ chi phí ↔ tốc độ**:

| Loại model | Đặc điểm | Dùng khi |
|-----------|----------|----------|
| Model **lớn / mạnh nhất** | Suy luận tốt, đắt, chậm hơn | Tác vụ khó: reasoning, code phức tạp, agent nhiều bước |
| Model **nhỏ / nhanh** | Rẻ, độ trễ thấp, kém suy luận sâu | Phân loại, trích xuất, tác vụ khối lượng lớn, đơn giản |

> Sai lầm phổ biến: dùng model mạnh nhất cho *mọi* việc. Phân loại một câu review thành
> positive/negative không cần model đắt nhất — chọn model nhỏ tiết kiệm rất nhiều tiền ở
> quy mô lớn. Quy tắc: **bắt đầu bằng model đủ dùng, chỉ nâng khi chất lượng chưa đạt.**

Với ứng dụng mới, mặc định chọn model **mới và mạnh nhất hiện có** để làm chuẩn chất lượng,
rồi hạ xuống model rẻ hơn nếu tác vụ cho phép — chứ đừng bắt đầu từ model yếu rồi khổ sở
vá chất lượng.

## LLM là stateless: không có trí nhớ

Mỗi lần gọi API là **độc lập**. Model **không nhớ** request trước. Cảm giác "chatbot nhớ
cuộc trò chuyện" là do *bạn* (hoặc thư viện) **gửi lại toàn bộ lịch sử** trong mỗi request.

```
Request 1: [user: "Tôi tên Nam"]                          → model chào Nam
Request 2: [user: "Tôi tên Nam", assistant: "...",         → model biết bạn tên Nam
            user: "Tôi tên gì?"]                              CHỈ vì bạn gửi lại lượt 1
```

> Hệ quả: hội thoại càng dài, mỗi request càng nhiều token (gửi lại cả lịch sử) → càng tốn
> tiền và dễ đụng trần **context window** (tổng token tối đa một request). Quản lý lịch sử
> hội thoại (cắt bớt, tóm tắt) là việc thật của AI Engineer — sẽ gặp lại ở cấp Agent.

## Cạm bẫy hay gặp

- **Tin LLM như nguồn sự thật** → nó đoán token, không tra cứu; sự thật quan trọng phải verify/RAG.
- **Quên knowledge cutoff** → hỏi chuyện mới, nhận câu bịa mà tưởng đúng.
- **Dùng model mạnh nhất cho mọi việc** → đốt tiền; chọn model theo độ khó tác vụ.
- **Tưởng model tự nhớ hội thoại** → không gửi lại lịch sử thì model "quên"; nó stateless.
- **Prompt mơ hồ với câu hỏi sự thật hiếm** → kích thích hallucinate; nói rõ "không biết thì báo".

## Ghi nhớ

LLM = máy **dự đoán token tiếp theo** bằng xác suất, không phải máy tra cứu sự thật — mọi
điểm mạnh/yếu đều từ đây. Nó thành hình qua **pretraining** (học ngôn ngữ) + **fine-tuning/
RLHF** (biết nghe lời). Nó có **knowledge cutoff** (không biết chuyện mới) và **hallucinate**
(bịa trôi chảy khi thiếu dữ kiện) — nên đưa nguồn thật vào (RAG/tool) và validate. Chọn
**model theo đánh đổi khả năng/chi phí/tốc độ**, đừng mặc định model đắt nhất. LLM
**stateless** — muốn nó "nhớ" thì bạn phải gửi lại lịch sử, và điều đó tốn token.
