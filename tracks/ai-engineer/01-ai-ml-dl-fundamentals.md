---
level: "ai-basic-foundation"
order: 1
title: "AI / ML / DL Fundamentals"
est: "4-5 giờ"
checklist:
  - "Phân biệt được AI, Machine Learning, Deep Learning và quan hệ bao hàm giữa chúng"
  - "Giải thích được khác nhau giữa lập trình truyền thống (viết rule) và ML (học từ dữ liệu)"
  - "Phân biệt được supervised / unsupervised / reinforcement learning qua ví dụ"
  - "Hiểu training vs inference: model được huấn luyện một lần, dùng (suy luận) nhiều lần"
  - "Định vị được LLM nằm ở đâu trong bức tranh AI (là deep learning, generative, foundation model)"
  - "Nhận ra khi nào một bài toán KHÔNG cần ML (rule đơn giản là đủ)"
related:
  - "glossary:machine-learning"
  - "glossary:deep-learning"
  - "glossary:llm"
---

## Vì sao quan trọng

Trước khi gọi dòng API đầu tiên, bạn cần một bản đồ khái niệm: **AI Engineer đang đứng ở
đâu**. Rất nhiều lỗi thiết kế đến từ hiểu sai bản chất — ví dụ mong LLM "tính toán chính
xác" (nó không phải máy tính), hay dùng ML cho bài toán mà một câu `if` giải xong.

Bài này vẽ bản đồ đó ở **mức khái niệm, không cần toán**. Mục tiêu: sau khi đọc, bạn nói
được LLM là loại mô hình gì, nó *học* nghĩa là sao, và khi nào nên/không nên dùng AI.

## AI ⊃ ML ⊃ DL: quan hệ bao hàm

Ba thuật ngữ hay bị dùng lẫn. Chúng là các vòng tròn lồng nhau:

| Tầng | Là gì | Ví dụ |
|------|-------|-------|
| **AI** (trí tuệ nhân tạo) | Mọi kỹ thuật khiến máy "hành xử thông minh" | Cả ML, cả hệ chuyên gia rule-based cũ |
| **ML** (machine learning) | Máy **học pattern từ dữ liệu** thay vì được lập trình tay | Lọc spam, gợi ý sản phẩm, dự đoán giá |
| **DL** (deep learning) | ML dùng **mạng nơ-ron nhiều tầng** | Nhận diện ảnh, dịch máy, **LLM** |

Nói cách khác: **mọi DL đều là ML, mọi ML đều là AI**, nhưng không ngược lại. Một chatbot
rule-based (`if "chào" in text: reply("Xin chào")`) là AI nhưng **không** phải ML — nó không
học gì, chỉ chạy rule người viết.

## Lập trình truyền thống vs Machine Learning

Đây là khác biệt cốt lõi, nắm nó thì hiểu mọi thứ còn lại:

| | Lập trình truyền thống | Machine Learning |
|---|------------------------|------------------|
| Bạn cung cấp | **Rule** + dữ liệu | **Dữ liệu** + đáp án mong muốn |
| Máy tạo ra | Đáp án | **Rule** (model) |
| Ví dụ | "Nếu email chứa 'trúng thưởng' → spam" | Đưa 10.000 email đã gán nhãn spam/không → máy tự rút ra pattern |

Lập trình truyền thống: *bạn* nghĩ ra logic. ML: *máy* rút logic ra từ ví dụ. Khi pattern
quá phức tạp để viết rule tay (nhận diện khuôn mặt, hiểu ngôn ngữ), ML thắng — vì không ai
viết nổi hàng triệu câu `if` để nhận ra một con mèo trong ảnh.

> Hệ quả quan trọng cho AI Engineer: model ML/LLM **không có logic tường minh bạn đọc
> được**. Nó là hàng tỉ con số (tham số) rút ra từ dữ liệu. Vì thế nó **không tất định
> tuyệt đối** và **có thể sai** — khác hẳn code bạn tự viết.

## Ba kiểu học của ML

| Kiểu | Máy học từ | Ví dụ |
|------|-----------|-------|
| **Supervised** (có giám sát) | Dữ liệu **đã gán nhãn** (input → đáp án đúng) | Ảnh + nhãn "mèo/chó"; email + nhãn "spam" |
| **Unsupervised** (không giám sát) | Dữ liệu **không nhãn**, tự tìm cấu trúc | Gom nhóm khách hàng theo hành vi (clustering) |
| **Reinforcement** (tăng cường) | **Thử–sai + phần thưởng** | Agent chơi game, robot học đi, RLHF tinh chỉnh LLM |

LLM hiện đại được huấn luyện qua nhiều giai đoạn dùng cả ba: học ngôn ngữ từ khối văn bản
khổng lồ (kiểu self-supervised), rồi tinh chỉnh theo phản hồi người dùng (reinforcement —
đây là **RLHF**, thứ khiến model "biết nghe lời" và trả lời hữu ích).

## Training vs Inference — khác biệt sống còn

Hai giai đoạn hoàn toàn khác nhau, AI Engineer chủ yếu làm việc với giai đoạn thứ hai:

- **Training** (huấn luyện): cho model ăn dữ liệu để nó điều chỉnh tham số. **Đắt, chậm,
  cần GPU khủng** — với LLM lớn tốn hàng triệu đô và hàng tuần. Làm **một lần** (hoặc thi
  thoảng).
- **Inference** (suy luận): dùng model đã huấn luyện để tạo output cho input mới. **Rẻ hơn
  nhiều, nhanh**, làm **liên tục** mỗi request.

```
Training:   dữ liệu khổng lồ ──(nhiều tuần, GPU)──▶ model (bộ tham số)
Inference:  input mới ──(model)──▶ output          ← bạn làm ở đây mỗi ngày
```

> Khi bạn "gọi API GPT/Claude", bạn đang trả tiền cho **inference** trên model họ đã train
> sẵn. Bạn không train gì cả. Đây là lý do AI Engineer khác ML Researcher: phần lớn công
> việc là *dùng* model, không phải *tạo* model.

## LLM nằm ở đâu trong bức tranh

Định vị **LLM** (Large Language Model — như GPT, Claude, Gemini):

- Là **deep learning** (mạng nơ-ron nhiều tầng — cụ thể là kiến trúc **Transformer**, học
  ở cấp Nâng cao).
- Là **generative** (sinh ra nội dung mới: văn bản, code) chứ không chỉ phân loại.
- Là **foundation model**: huấn luyện trên dữ liệu cực rộng, rồi *thích ứng* cho nhiều
  việc (hỏi đáp, tóm tắt, viết code) mà không cần train lại từ đầu.
- Bản chất: **dự đoán token tiếp theo**. Nó không "hiểu" như người — nó cực giỏi đoán từ
  kế tiếp dựa trên xác suất. Điều này giải thích cả sức mạnh lẫn điểm yếu (bịa — hallucinate).

## Khi nào KHÔNG cần AI/ML

Kỹ năng quan trọng nhưng ít được dạy: biết khi nào **không** dùng AI. Đừng dùng ML/LLM khi:

- **Rule đơn giản là đủ**: kiểm tra email hợp lệ, tính thuế theo bậc — dùng `if`/regex, đừng
  gọi LLM (chậm, tốn tiền, không tất định).
- **Cần chính xác tuyệt đối, kiểm chứng được**: tính tiền, cộng số — LLM có thể sai; dùng
  code thường.
- **Không có dữ liệu**: ML cần dữ liệu để học. Không có dữ liệu chất lượng → không có model tốt.

> Nguyên tắc: **AI là công cụ cho bài toán không viết được rule tay hoặc pattern quá phức
> tạp**. Với LLM cụ thể: mạnh ở ngôn ngữ, mơ hồ, tổng hợp — yếu ở tính toán chính xác và
> sự kiện cần đúng 100%.

## Cạm bẫy hay gặp

- **Tưởng LLM "hiểu" và "biết đúng sai"** → tin mù output; thực chất nó đoán token, có thể bịa.
- **Dùng ML cho việc rule giải xong** → phức tạp hóa, tốn kém, khó debug.
- **Nhầm training với inference** → tưởng "gọi API là đang train model" hoặc ngược lại.
- **Kỳ vọng LLM tính toán chính xác** → nó không phải máy tính; cần số đúng thì đưa cho code/tool.
- **Bỏ qua chất lượng dữ liệu** → "garbage in, garbage out" đúng với mọi ML.

## Ghi nhớ

**AI ⊃ ML ⊃ DL**: ML là máy *học pattern từ dữ liệu* thay vì được lập trình rule tay; DL là
ML dùng mạng nơ-ron nhiều tầng; **LLM là deep learning, generative, foundation model** dự
đoán token tiếp theo. Có ba kiểu học: **supervised / unsupervised / reinforcement**. Phân
biệt **training** (đắt, một lần, tạo model) và **inference** (rẻ, liên tục — nơi AI Engineer
làm việc). Quan trọng nhất: **biết khi nào KHÔNG cần AI** — rule đơn giản, cần chính xác
tuyệt đối, hoặc không có dữ liệu thì đừng dùng ML/LLM.
