---
level: "ai-inter-rag"
order: 10
title: "Hybrid search + reranking"
est: "5-6 giờ"
checklist:
  - "Giải thích được vì sao vector search đơn thuần yếu ở khớp chính xác (mã sản phẩm, tên riêng, số hiệu)"
  - "Mô tả được cách BM25 (keyword) và vector search bù trừ cho nhau"
  - "Kết hợp được kết quả hai nguồn bằng RRF (Reciprocal Rank Fusion)"
  - "Giải thích được reranking bằng cross-encoder khác gì với retrieval bi-encoder"
  - "Chèn được bước rerank top-k vào pipeline RAG và biết khi nào cần, khi nào thừa"
related:
  - "glossary:rag"
  - "glossary:embedding"
---

## Vì sao quan trọng

RAG cơ bản (bài 9) đã dựng được chatbot hỏi đáp tài liệu, nhưng ở cuối bài đó ta đã
liệt kê giới hạn: **vector search đơn thuần yếu khi câu hỏi cần khớp chính xác** — mã sản
phẩm `SKU-7841`, tên riêng `Nguyễn Văn A`, số hiệu văn bản `43/2024/NĐ-CP`. Đây là bài đầu
cấp **Production RAG**: nâng chất lượng *retrieval* — khâu quyết định RAG trả đúng hay sai.
Retrieve sai thì LLM giỏi mấy cũng không cứu được, vì nó chỉ đọc được đúng những chunk bạn
đưa vào.

## Vì sao vector search đơn thuần yếu

Embedding (bài 7) biến text thành vector theo **ý nghĩa ngữ nghĩa**. Điểm mạnh là khớp *ý*:
"cách xin nghỉ" khớp được với "quy trình đăng ký ngày phép" dù không trùng chữ. Nhưng đúng
cái đó lại là điểm yếu khi cần khớp *chữ*:

| Loại truy vấn | Vector search | Keyword (BM25) |
|---------------|---------------|----------------|
| "chính sách nghỉ phép" (ngữ nghĩa) | Mạnh | Yếu nếu không trùng từ |
| Mã `SKU-7841`, `43/2024/NĐ-CP` | **Yếu** — mã lạ, embedding mờ | **Mạnh** — khớp token chính xác |
| Tên riêng, viết tắt hiếm | Thường yếu | Mạnh |
| Câu hỏi diễn giải dài | Mạnh | Yếu |

> Mã `SKU-7841` với embedding gần như vô nghĩa: model chưa từng "hiểu" chuỗi này, nên vector
> của nó rơi vào vùng nhiễu. BM25 thì ngược lại — nó khớp token thô, `SKU-7841` xuất hiện ở
> chunk nào là bắt trúng ngay.

**BM25** (Best Match 25) là thuật toán ranking dựa trên tần suất từ khoá (kế thừa TF-IDF):
chunk chứa đúng token của câu hỏi, đặc biệt token hiếm, được điểm cao. Nó là "keyword search"
kinh điển, không cần model, chạy nhanh.

## Hybrid search: kết hợp hai nguồn

Ý tưởng: chạy **cả hai** — vector search và BM25 — rồi **hợp nhất** kết quả. Vector lo phần
ngữ nghĩa, BM25 lo phần khớp chính xác. Vấn đề: điểm số hai bên **không cùng thang** (cosine
similarity 0-1 vs điểm BM25 không chặn trên), cộng thẳng là sai.

Cách hợp nhất phổ biến và ổn định nhất là **RRF (Reciprocal Rank Fusion)** — chỉ dùng *thứ
hạng*, bỏ qua điểm gốc:

```
score(chunk) = Σ  1 / (k + rank_i)
```

với `rank_i` là thứ hạng của chunk trong danh sách thứ *i* (vector, BM25), `k` là hằng số
làm mượt (thường 60). Chunk xếp hạng cao ở *bất kỳ* nguồn nào đều được cộng điểm; chunk lọt
top ở *cả hai* nguồn được điểm cao nhất.

```python
# Python 3.12+ — cài: pip install rank-bm25 chromadb
# RRF tự viết: không phụ thuộc điểm gốc, chỉ dùng thứ hạng
import chromadb
from rank_bm25 import BM25Okapi

chunks = [
    "Đơn nghỉ phép mã SKU-7841 cần quản lý trực tiếp duyệt trước 3 ngày.",
    "Nhân viên được nghỉ phép năm 12 ngày, cộng dồn tối đa 6 ngày.",
    "Quy trình đăng ký làm thêm giờ nộp qua hệ thống nội bộ.",
]

# --- Nguồn 1: vector search (ngữ nghĩa) ---
db = chromadb.Client()
col = db.create_collection("docs")
col.add(documents=chunks, ids=[f"c{i}" for i in range(len(chunks))])

# --- Nguồn 2: BM25 (keyword) ---
tokenized = [c.lower().split() for c in chunks]      # tokenize thô cho demo
bm25 = BM25Okapi(tokenized)

def rrf(rank_lists: list[list[str]], k: int = 60) -> list[str]:
    """Hợp nhất nhiều danh sách đã xếp hạng bằng Reciprocal Rank Fusion."""
    scores: dict[str, float] = {}
    for ranked in rank_lists:
        for rank, doc_id in enumerate(ranked):        # rank bắt đầu từ 0
            scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank + 1)
    return sorted(scores, key=scores.get, reverse=True)

def hybrid_search(query: str, top_k: int = 3) -> list[str]:
    # Danh sách xếp hạng từ vector search
    v_hits = col.query(query_texts=[query], n_results=len(chunks))
    v_ranked = v_hits["ids"][0]

    # Danh sách xếp hạng từ BM25
    bm_scores = bm25.get_scores(query.lower().split())
    bm_ranked = [f"c{i}" for i in sorted(range(len(chunks)),
                                         key=lambda i: bm_scores[i], reverse=True)]

    fused = rrf([v_ranked, bm_ranked])
    idx = {f"c{i}": chunks[i] for i in range(len(chunks))}
    return [idx[cid] for cid in fused[:top_k]]

print(hybrid_search("mã SKU-7841 duyệt nghỉ phép"))
```

> Nhiều vector DB (Weaviate, Qdrant, Elasticsearch) đã có hybrid search + RRF **tích hợp
> sẵn** — thực tế nên dùng của họ thay vì tự viết. Đoạn trên để bạn *hiểu* cơ chế, không phải
> để bê nguyên vào production.

## Reranking: lọc lại top-k cho tinh

Retrieval (dù hybrid) chỉ là bước **thô**: nó lấy nhanh ~20-50 chunk *có vẻ* liên quan bằng
cách so vector đã tính sẵn. Nhưng nó so câu hỏi và chunk **riêng rẽ** (bi-encoder: mã hoá hai
bên độc lập rồi đo khoảng cách) — nhanh nhưng không tinh.

**Reranker** dùng **cross-encoder**: đưa *cặp* (câu hỏi, chunk) **cùng lúc** vào model, để nó
đọc tương tác giữa hai bên rồi chấm điểm liên quan. Chính xác hơn nhiều, nhưng chậm hơn nhiều
— nên **không** dùng để quét cả kho, mà chỉ để **xếp lại top-k** đã lấy được từ retrieval.

| | Retrieval (bi-encoder) | Reranking (cross-encoder) |
|---|---|---|
| Cách chấm | Mã hoá riêng, đo khoảng cách | Đọc cặp (Q, chunk) cùng lúc |
| Tốc độ | Rất nhanh (vector tính sẵn) | Chậm (chạy model mỗi cặp) |
| Độ tinh | Thô | Tinh |
| Vai trò | Lọc từ triệu → ~30 | Xếp lại ~30 → top 3-5 |

Pipeline chuẩn: **hybrid retrieve top-30 → rerank → giữ top-5 → nhồi vào prompt**.

```python
# Pattern reranking bằng dịch vụ Cohere Rerank.
# Cài: pip install cohere — API key đọc từ os.environ, KHÔNG hard-code.
# Lưu ý: tham số/tên hàm chính xác xem docs cohere.com/docs — dưới đây là pattern.
import os
import cohere

co = cohere.ClientV2(api_key=os.environ["COHERE_API_KEY"])

def rerank(query: str, candidates: list[str], top_n: int = 5) -> list[str]:
    """Xếp lại danh sách candidate bằng cross-encoder của Cohere, giữ top_n."""
    resp = co.rerank(
        model="rerank-v3.5",          # xem docs để chọn model hiện hành
        query=query,
        documents=candidates,
        top_n=top_n,
    )
    # resp.results trả về các phần tử có .index (vị trí trong candidates) đã sắp theo độ liên quan
    return [candidates[r.index] for r in resp.results]

# Dùng chung với hybrid_search ở trên:
# thô = hybrid_search(query, top_k=30)   # lấy rộng
# tinh = rerank(query, thô, top_n=5)     # lọc lại
```

> Nếu không chắc signature chính xác của thư viện (Cohere, sentence-transformers
> `CrossEncoder`, v.v.), **tra docs chính thức** thay vì đoán. Ý tưởng chung không đổi: đưa
> `(query, list chunk)` vào, nhận về danh sách đã xếp lại theo độ liên quan.

Bản offline không tốn API: `sentence-transformers` có lớp `CrossEncoder` chạy local (ví dụ
model `cross-encoder/ms-marco-MiniLM-L-6-v2`) — chấm điểm từng cặp `(query, chunk)` rồi sort.

## Khi nào cần, khi nào thừa

- **Cần hybrid**: khi truy vấn có nhiều mã/tên riêng/số hiệu (tra cứu kỹ thuật, pháp lý,
  e-commerce, tài liệu nội bộ có ID).
- **Cần rerank**: khi top-k retrieval *có* chunk đúng nhưng **không nằm ở đầu**, khiến LLM bỏ
  lỡ. Rerank kéo chunk đúng lên top.
- **Có thể thừa**: kho nhỏ, câu hỏi thuần ngữ nghĩa, đã trả tốt với vector search — thêm
  rerank chỉ tăng độ trễ + chi phí mà không cải thiện. **Đo trước, thêm sau** (bài 12).

Reranking thêm một lượt gọi model cho mỗi câu hỏi → tăng latency và chi phí.

## Cạm bẫy hay gặp

- **Cộng thẳng điểm vector + BM25** → sai vì khác thang đo; dùng **RRF** (chỉ theo thứ hạng).
- **Rerank cả kho** → cross-encoder quá chậm; chỉ rerank top-k đã retrieve, không bao giờ quét toàn bộ.
- **Retrieve top-5 rồi mới rerank** → nếu chunk đúng đã rớt khỏi top-5, rerank không cứu được; **retrieve rộng (top-30) rồi rerank hẹp**.
- **Thêm hybrid/rerank khi chưa đo** → tăng chi phí/độ trễ mà không biết có cải thiện không; đo bằng eval (bài 12) trước.
- **Tokenize BM25 ẩu** với tiếng Việt (dấu, từ ghép) → keyword khớp kém; cân nhắc tách từ tiếng Việt đúng cách.

## Ghi nhớ

**Vector search giỏi ngữ nghĩa nhưng yếu ở khớp chính xác** (mã, tên riêng, số hiệu) — nơi
**BM25 keyword** lại mạnh. **Hybrid search** chạy cả hai và hợp nhất bằng **RRF** (Reciprocal
Rank Fusion — chỉ dùng thứ hạng, tránh lệch thang điểm). Retrieval là bước **thô** dùng
bi-encoder (nhanh); **reranking** dùng **cross-encoder** đọc cặp (câu hỏi, chunk) cùng lúc để
xếp lại cho **tinh** — nhưng chậm, nên chỉ rerank **top-k** đã retrieve, không quét cả kho.
Pipeline chuẩn: **hybrid retrieve rộng → rerank → giữ top-5 → nhồi prompt**. Không thêm hybrid/
rerank theo phản xạ — **đo trước (bài 12), thêm khi thật sự cải thiện**, và canh latency/chi phí.
