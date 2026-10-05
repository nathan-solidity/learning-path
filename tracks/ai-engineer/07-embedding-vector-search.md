---
level: "ai-basic-rag"
order: 7
title: "Embedding & Vector Search"
est: "5-6 giờ"
checklist:
  - "Tạo được embedding cho văn bản qua embedding model và biết nó trả về vector"
  - "Giải thích được semantic search khác keyword search (LIKE/full-text) ở điểm nào"
  - "Dùng được vector database (Chroma) để lưu và truy vấn theo similarity"
  - "Hiểu top-k retrieval: lấy k đoạn gần nhất, và chọn k thế nào cho hợp lý"
  - "Biết dùng cùng một embedding model cho cả lúc index lẫn lúc query"
  - "Hiểu vai trò của vector search trong toàn cảnh RAG (là bước retrieve)"
related:
  - "glossary:embedding"
  - "glossary:vector-database"
  - "glossary:semantic-search"
---

## Vì sao quan trọng

RAG (bài 9) đứng trên một khả năng: **tìm đoạn văn liên quan về *nghĩa* với câu hỏi**. Đó là
**vector search** dựa trên **embedding** (bài 3). Bài này biến khái niệm embedding thành kỹ
năng thực hành: tạo vector, lưu vào vector DB, truy vấn similarity — nền kỹ thuật cho mọi hệ
thống RAG.

## Nhắc lại: embedding biến nghĩa thành vector

Từ bài 3: **embedding** biến văn bản thành **vector** (dãy số nhiều chiều) sao cho *nghĩa
gần → vector gần*. Giờ ta tạo nó thật:

```python
# Ví dụ với embedding model (mỗi nhà cung cấp có endpoint riêng)
from openai import OpenAI
client = OpenAI()

resp = client.embeddings.create(
    model="text-embedding-3-small",
    input="Nhân viên được nghỉ phép 12 ngày mỗi năm.",
)
vector = resp.data[0].embedding      # ví dụ list 1536 số float
print(len(vector))                   # số chiều của vector
```

Nhớ: **embedding model ≠ chat model**. Đây là model riêng, input là văn bản, output là
**một vector số** — không phải câu trả lời.

## Semantic search vs keyword search

Đây là lý do embedding mạnh hơn tìm kiếm cũ:

| | Keyword search (`LIKE`, full-text) | Semantic search (vector) |
|---|-----------------------------------|--------------------------|
| Khớp theo | **Chữ** xuất hiện | **Nghĩa** |
| "nghỉ phép" tìm được "nghỉ việc"? | Có thể nhầm (cùng chữ "nghỉ") | Phân biệt được (khác nghĩa) |
| "xe hơi" tìm được "ô tô"? | **Không** (khác chữ) | **Có** (cùng nghĩa) |
| Sai chính tả, cách diễn đạt khác | Trượt | Vẫn tìm được nếu nghĩa gần |

Semantic search hiểu "ô tô" và "xe hơi" là một, "nghỉ phép" khác "nghỉ việc" — điều keyword
search không làm được. Đây là điều khiến chatbot RAG trả lời được dù người dùng hỏi bằng
cách diễn đạt hoàn toàn khác tài liệu gốc.

> Không có nghĩa keyword search vô dụng — nó vẫn mạnh cho mã sản phẩm, tên riêng, khớp
> chính xác. Cấp Trung cấp (Production RAG) sẽ **kết hợp cả hai** (hybrid search).

## Vector database: lưu & tìm vector nhanh

Bạn không tự lưu hàng triệu vector và tự tính similarity từng cái — chậm và cồng kềnh.
**Vector database** làm việc đó: lưu vector + tìm k vector gần nhất cực nhanh. Học tập dùng
**Chroma** (đơn giản, chạy local, tự lo embedding).

```python
# cài: pip install chromadb
import chromadb

db = chromadb.Client()
collection = db.create_collection("docs")   # Chroma tự tạo embedding mặc định

# --- Index: đưa tài liệu vào (Chroma tự embedding) ---
collection.add(
    documents=[
        "Nhân viên được nghỉ phép năm 12 ngày.",
        "Đơn nghỉ phép nộp trước 3 ngày làm việc.",
        "Công ty nghỉ Tết theo lịch nhà nước.",
    ],
    ids=["c1", "c2", "c3"],
)

# --- Query: tìm đoạn gần nghĩa nhất ---
hits = collection.query(query_texts=["Xin nghỉ phép cần báo trước bao lâu?"], n_results=2)
print(hits["documents"][0])     # 2 đoạn liên quan nhất — c2 sẽ đứng đầu dù không trùng chữ
```

Lưu ý: câu hỏi "báo trước bao lâu" không trùng chữ với "nộp trước 3 ngày", nhưng vector
search vẫn tìm đúng vì **nghĩa gần nhau**.

## Top-k retrieval: lấy bao nhiêu đoạn?

`n_results` (hay `top_k`) = số đoạn gần nhất bạn lấy về. Chọn k là đánh đổi:

| k nhỏ (1-2) | k lớn (8-10+) |
|-------------|---------------|
| Ít token, rẻ, nhanh | Nhiều context, nhiều token, đắt hơn |
| Rủi ro **thiếu** thông tin nếu câu trả lời rải rác | Rủi ro **nhiễu** — đoạn không liên quan lọt vào |

> Không có k "đúng" tuyệt đối — tùy tài liệu và câu hỏi, thường **3–5** là điểm khởi đầu
> hợp lý. Cấp Production RAG dạy **reranking** để lọc lại các đoạn này cho tinh hơn.

## Quy tắc vàng: cùng embedding model cho index và query

Vector từ hai model khác nhau **không so sánh được** (khác không gian số). Nếu index tài
liệu bằng model A thì **query cũng phải embedding bằng model A**. Đổi embedding model =
phải **index lại toàn bộ** tài liệu.

> Lỗi kinh điển: index bằng một model, sau đổi sang model khác cho query → similarity ra
> loạn, retrieval trả rác mà không hiểu vì sao. Ghi rõ model embedding đang dùng, và version.

## Vector search nằm ở đâu trong RAG

Vector search là **bước "retrieve"** trong RAG (Retrieval-**Augmented** Generation):

```
[câu hỏi] ─embedding─▶ vector ─tìm trong vector DB─▶ k đoạn liên quan
                                                          │
                                            (bài 9) đưa vào prompt ─▶ LLM trả lời
```

Bài này lo phần **tìm đúng đoạn**. Bài 8 lo **cắt tài liệu thành đoạn tốt** (chunking). Bài
9 ghép tất cả: chunk → embed → store → retrieve → **augment prompt → generate**.

## Cạm bẫy hay gặp

- **Nhầm semantic với keyword search** → mong `LIKE` hiểu đồng nghĩa, hoặc mong vector khớp
  chính xác mã/tên riêng; mỗi loại mạnh việc khác nhau.
- **Đổi embedding model mà không index lại** → vector khác không gian, similarity ra loạn.
- **top-k quá nhỏ** → thiếu thông tin để trả lời; **quá lớn** → nhiễu + tốn token.
- **Tự cài đặt vector store bằng list Python** → chậm ở quy mô thật; dùng vector DB.
- **Embedding cả tài liệu khổng lồ thành 1 vector** → mất chi tiết; phải chunk trước (bài 8).

## Ghi nhớ

**Vector search** = tìm đoạn văn *gần nghĩa* với câu hỏi, dựa trên **embedding** (văn bản →
vector, nghĩa gần → vector gần). Nó hơn **keyword search** ở chỗ hiểu đồng nghĩa và cách
diễn đạt khác, nhưng keyword vẫn mạnh cho khớp chính xác (hybrid sau). **Vector database**
(Chroma khi học) lưu và tìm k vector gần nhất nhanh; **top-k** là đánh đổi giữa thiếu thông
tin và nhiễu (bắt đầu ~3–5). Quy tắc sống còn: **cùng một embedding model cho cả index lẫn
query**, đổi model thì index lại. Đây là bước **retrieve** — nền cho RAG ở bài 9.
