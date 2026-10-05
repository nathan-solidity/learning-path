---
level: "ai-adv-llm"
order: 25
title: "Transformer và cơ chế Attention"
est: "6-7 giờ"
checklist:
  - "Giải thích được vì sao Transformer thay thế RNN: xử lý song song và nắm quan hệ xa"
  - "Mô tả được trực giác Q/K/V của self-attention: mỗi token 'hỏi' và 'trả lời' các token khác"
  - "Giải thích được multi-head attention học nhiều loại quan hệ song song để làm gì"
  - "Hiểu positional encoding giải quyết việc attention không có khái niệm thứ tự"
  - "Vẽ được luồng decoder-only: token → embedding → các lớp attention → next-token prediction"
  - "Nối được kiến trúc này với các giới hạn LLM đã học ở bài 2-3 (cutoff, hallucinate, context)"
related:
  - "glossary:transformer"
  - "glossary:token"
  - "glossary:embedding"
---

## Vì sao quan trọng

Bài 22-24 bạn đã hiểu ML/DL ở mức nền: mạng neural học từ dữ liệu, backpropagation, gradient
descent. Giờ ta **mổ xẻ chính kiến trúc chạy bên trong LLM**: **Transformer**. Ở cấp Cơ bản
bạn dùng LLM như hộp đen "dự đoán token tiếp theo" (bài 2). Bài này mở hộp đen đó ra — không
phải để bạn tự train, mà để hiểu *vì sao* LLM có đúng những điểm mạnh/yếu đã gặp: context
window, chi phí theo độ dài, khả năng nắm quan hệ xa trong văn bản.

Đây là bài lý thuyết. Ít toán, nặng trực giác. Hiểu nó, bạn đọc paper và tài liệu model
không còn thấy "phép màu".

## Trước Transformer: vì sao RNN đuối

Trước 2017, xử lý chuỗi (câu, đoạn văn) dùng **RNN/LSTM**: đọc token **lần lượt từ trái sang
phải**, mang theo một "trạng thái ẩn" tóm tắt những gì đã đọc.

Hai vấn đề chí mạng:

- **Không song song hóa được**: token thứ 100 phải chờ xử lý xong 99 token trước. Trên GPU
  (vốn mạnh nhờ tính song song) đây là lãng phí khổng lồ → train chậm, khó scale.
- **Quên quan hệ xa**: thông tin từ đầu câu bị "pha loãng" dần khi đi qua từng bước. Câu dài
  thì đầu câu và cuối câu gần như mất liên hệ.

> "Con **mèo** mà tôi thấy hôm qua ở nhà bà ngoại **nó** rất hiền." — để hiểu "nó" chỉ "mèo",
> model phải nối hai từ cách nhau cả chục token. RNN làm việc này rất chật vật.

**Transformer** (paper *"Attention Is All You Need"*, 2017) bỏ hẳn việc đọc tuần tự. Nó nhìn
**toàn bộ chuỗi cùng lúc** và để mỗi token **trực tiếp** kết nối tới mọi token khác qua cơ
chế **attention**. Song song hóa tốt + nắm quan hệ xa dễ dàng — đó là bước nhảy làm nên LLM.

## Self-attention: trực giác Q/K/V

Đây là trái tim của Transformer. Ý tưởng: với mỗi token, model tự hỏi *"trong câu này, những
token nào liên quan tới tôi, và liên quan mạnh cỡ nào?"* rồi trộn thông tin từ chúng lại.

Cơ chế dùng ba vector, sinh ra từ mỗi token qua các ma trận học được:

| Vai trò | Ẩn dụ | Ý nghĩa |
|---------|-------|---------|
| **Query (Q)** | Câu hỏi | "Tôi đang tìm thông tin kiểu gì?" |
| **Key (K)** | Nhãn/từ khóa | "Tôi chứa thông tin kiểu gì?" |
| **Value (V)** | Nội dung | Thông tin thực sự sẽ được lấy nếu khớp |

Cách hoạt động cho một token: lấy **Q** của nó **so khớp** (dot product) với **K** của *mọi*
token trong câu → ra điểm tương đồng. Điểm cao = "token kia liên quan với tôi". Chuẩn hóa các
điểm này thành trọng số (softmax, cộng lại bằng 1), rồi lấy **trung bình có trọng số** các
**V** → ra biểu diễn mới cho token, đã "hút" thông tin từ các token liên quan.

```
# Pseudocode trực giác cho MỘT token (không phải code chạy được)
# Với token "nó" ở ví dụ trên:
diem = {}
for tok in cac_token_trong_cau:
    diem[tok] = dot(Q_cua("nó"), K_cua(tok))   # "nó" hỏi, mỗi token trả lời độ khớp
trong_so = softmax(diem.values())               # "mèo" được điểm cao → trọng số lớn
bieu_dien_moi = sum(trong_so[tok] * V_cua(tok)  # trộn Value theo trọng số
                    for tok in cac_token)
# Kết quả: biểu diễn của "nó" giờ mang nhiều thông tin của "mèo"
```

> Chữ **"self"** trong self-attention: Q, K, V đều sinh từ *cùng một chuỗi* — các token trong
> câu tự chú ý lẫn nhau. Không cần đọc tuần tự: mọi so khớp diễn ra song song trên GPU.

## Multi-head attention: nhiều loại quan hệ cùng lúc

Một phép attention chỉ học được *một kiểu* quan hệ. Nhưng ngôn ngữ có nhiều kiểu quan hệ đồng
thời: ngữ pháp (chủ ngữ–động từ), tham chiếu (đại từ chỉ ai), ngữ nghĩa (từ đồng nghĩa)...

**Multi-head attention** chạy **nhiều phép attention song song** (mỗi cái gọi là một *head*),
mỗi head có bộ Q/K/V riêng, học một "góc nhìn" khác nhau. Rồi ghép kết quả các head lại.

> Ẩn dụ: thay vì một người đọc câu, có 8-16 chuyên gia cùng đọc — người soi ngữ pháp, người
> soi tham chiếu, người soi ngữ cảnh — rồi tổng hợp. Nhờ vậy model nắm được cấu trúc phong
> phú của ngôn ngữ, không bị bó vào một loại quan hệ.

## Positional encoding: gắn lại khái niệm thứ tự

Có một lỗ hổng: attention xử lý các token **song song, không thứ tự** — với nó, "chó cắn
người" và "người cắn chó" nhìn như tập token giống hệt. Nhưng thứ tự là *cốt lõi* của nghĩa.

**Positional encoding** vá lỗ hổng này: cộng vào embedding của mỗi token một tín hiệu mã hóa
**vị trí** của nó trong chuỗi. Nhờ đó model phân biệt được token thứ 1 với token thứ 10, và
"chó cắn người" khác "người cắn chó".

> Vì attention không có thứ tự bẩm sinh, vị trí phải được *tiêm* vào rõ ràng. Đây cũng là một
> lý do context window có giới hạn — cách mã hóa vị trí ảnh hưởng độ dài chuỗi model xử lý tốt.

## Kiến trúc decoder-only của LLM hiện đại

Paper gốc có cả **encoder** (đọc-hiểu) và **decoder** (sinh text). LLM sinh văn bản hiện đại
(GPT, Claude, Llama...) phần lớn dùng kiến trúc **decoder-only**: chồng nhiều lớp
(self-attention + mạng feed-forward), mỗi lớp tinh chỉnh dần biểu diễn của token.

Điểm mấu chốt: **causal (masked) attention** — mỗi token chỉ được chú ý tới các token **đứng
trước** nó, không nhìn tương lai. Đúng bản chất bài toán ở bài 2: **dự đoán token tiếp theo**
chỉ dựa vào những gì đã có.

Luồng từ token tới next-token prediction:

```
"Thủ đô của Việt Nam là"
   │  tách token (bài 3)
   ▼
[token] → embedding + positional encoding      # mỗi token thành vector, gắn vị trí
   │
   ▼  qua N lớp decoder (self-attention + feed-forward), mask nhân quả
[biểu diễn giàu ngữ cảnh cho token cuối]
   │
   ▼  lớp cuối → phân bố xác suất trên toàn bộ vocab
"Hà" (xác suất cao nhất) ──▶ nối vào chuỗi ──▶ lặp lại ──▶ "Nội" ──▶ ...
```

Đây chính là "máy dự đoán token tiếp theo" ở bài 2 — giờ bạn thấy *bên trong* nó là các lớp
attention chồng lên nhau. Mọi điểm mạnh (nắm ngữ cảnh dài, viết trôi chảy) và điểm yếu
(context window hữu hạn, chi phí tăng theo độ dài) đều bắt nguồn từ kiến trúc này.

## Vì sao chi phí tăng theo độ dài²

Self-attention so khớp **mọi token với mọi token** → với chuỗi n token là khoảng n×n phép so
khớp. Gấp đôi độ dài → gấp bốn tính toán. Đây là lý do gốc khiến context dài **đắt và chậm**,
và là động lực cho các tối ưu bạn sẽ học ở bài 27 (flash attention, KV cache).

## Cạm bẫy hay gặp

- **Nghĩ LLM "tra cứu" trong attention** → nó vẫn là dự đoán token thống kê (bài 2), attention
  chỉ là cách trộn ngữ cảnh, không phải database.
- **Nhầm attention có thứ tự** → không; thứ tự đến từ positional encoding cộng thêm.
- **Tưởng nhiều head = nhiều lần cùng một việc** → mỗi head học một loại quan hệ khác nhau.
- **Quên context window tốn kém theo bình phương** → nhồi context dài vô tội vạ → chậm, đắt,
  chạm trần; đây là lý do RAG (bài 9) chỉ đưa *vài đoạn liên quan* thay vì cả kho.
- **Lẫn encoder-only với decoder-only** → LLM sinh text là decoder-only, chú ý nhân quả (chỉ
  nhìn quá khứ).

## Ghi nhớ

**Transformer** thay RNN vì hai lý do: **xử lý song song** (không đọc tuần tự) và **nắm quan
hệ xa** trực tiếp qua **attention**. Trái tim là **self-attention** với **Q/K/V**: mỗi token
dùng **Query** so khớp **Key** của mọi token để tính trọng số, rồi trộn **Value** theo trọng
số đó — token nào liên quan thì đóng góp nhiều. **Multi-head** chạy nhiều phép attention song
song để học nhiều loại quan hệ; **positional encoding** tiêm lại thông tin thứ tự vốn attention
không có. LLM hiện đại là **decoder-only** với **attention nhân quả** (chỉ nhìn token trước),
chồng nhiều lớp để biến chuỗi token thành **phân bố xác suất cho token tiếp theo** — đúng cơ
chế bài 2. Chi phí attention tăng theo **bình phương độ dài**, là gốc rễ của giới hạn context
window và động lực cho các tối ưu ở bài 27.
