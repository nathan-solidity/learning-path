---
level: "ai-basic-foundation"
order: 3
title: "Token, Context & Embedding"
est: "4-5 giờ"
checklist:
  - "Giải thích được token là gì và vì sao model đếm token chứ không đếm ký tự/từ"
  - "Ước lượng được token của một đoạn văn và tính thô chi phí một request"
  - "Hiểu context window là gì và điều gì xảy ra khi vượt quá"
  - "Giải thích được embedding: biến văn bản thành vector, nghĩa gần → vector gần"
  - "Phân biệt được embedding model và generative (chat) model — hai loại khác nhau"
  - "Hiểu cosine similarity đo độ gần hai vector và vì sao nó là nền của semantic search"
related:
  - "glossary:token"
  - "glossary:embedding"
  - "glossary:context-window"
---

## Vì sao quan trọng

Ba khái niệm **token, context, embedding** là đơn vị làm việc của mọi hệ thống LLM. Token
quyết định **chi phí và giới hạn**. Context window quyết định **model nhìn được bao nhiêu
một lúc**. Embedding là nền của **RAG và semantic search** — không hiểu nó thì cả cấp RAG
phía sau chỉ là copy code. Bài này nắm chắc ba thứ đó ở mức khái niệm + đo đạc được.

## Token: đơn vị model thực sự xử lý

Model không đọc ký tự hay từ — nó xử lý **token**, là các mẩu văn bản do một **tokenizer**
cắt ra. Một token thường là một từ ngắn, một phần của từ dài, hoặc dấu câu.

- Tiếng Anh: ~**1 token ≈ 4 ký tự** ≈ ¾ từ. `"tokenization"` có thể thành `token` + `ization`.
- Tiếng Việt, tiếng Nhật, emoji, code → thường **tốn nhiều token hơn** trên cùng độ dài
  hiển thị, vì tokenizer chủ yếu tối ưu cho tiếng Anh.

```python
# Ước lượng thô (chỉ để canh chi phí, KHÔNG dùng làm ràng buộc cứng)
def rough_tokens(text: str) -> int:
    return len(text) // 4

# Đo chính xác: dùng tokenizer của SDK (ví dụ tiktoken cho OpenAI,
# hoặc client.count_tokens / API count tokens của nhà cung cấp).
```

**Vì sao bạn phải quan tâm**: bạn **trả tiền theo token** (input + output), và mọi giới hạn
đều tính bằng token. Một prompt "dài cho chắc" = hóa đơn cao hơn + chậm hơn.

## Chi phí: tính theo token in + out

Giá thường niêm yết theo **1 triệu token**, tách riêng **input** (prompt bạn gửi) và
**output** (model sinh ra) — output thường đắt hơn input vài lần.

```
chi phí ≈ (token_input × giá_in + token_output × giá_out) / 1_000_000
```

> Ví dụ trực giác: một chatbot RAG nhồi 3.000 token tài liệu vào *mỗi* câu hỏi, chạy
> 10.000 lượt/ngày → 30 triệu token input/ngày *chỉ riêng phần context*. Ở quy mô này,
> mỗi quyết định "nhồi bao nhiêu context" là quyết định tiền bạc. Đây là lý do cấp RAG dạy
> cách chỉ lấy *đúng* đoạn liên quan thay vì đổ cả tài liệu.

## Context window: model nhìn được bao nhiêu một lúc

**Context window** là tổng token tối đa một request được chứa — gồm **cả input lẫn output**:
system prompt + lịch sử hội thoại + tài liệu RAG + câu trả lời model sắp sinh, tất cả cộng
lại phải ≤ context window.

```
[ system ] + [ lịch sử hội thoại ] + [ context RAG ] + [ câu hỏi ] + [ output ]  ≤  context window
```

Vượt quá → API báo lỗi (hoặc thư viện tự cắt bớt, mất thông tin). Model đời mới có context
rất lớn (hàng trăm nghìn token), nhưng **"vừa" không có nghĩa là "nên"**:

- Context dài = **tốn tiền + chậm** hơn.
- Chất lượng có thể giảm khi thông tin quan trọng lọt giữa một context khổng lồ (model dễ
  "lơ" phần giữa).

> Nguyên tắc: đưa **vừa đủ ngữ cảnh liên quan**, không phải tối đa. Quản lý context là kỹ
> năng lõi — gặp lại ở Agent (cắt/tóm tắt lịch sử) và RAG (chọn đúng chunk).

## Embedding: biến nghĩa thành vector

**Embedding** là cách biến một đoạn văn bản thành một **vector** — một dãy số (vd 1536
chiều) — sao cho **văn bản nghĩa gần nhau → vector gần nhau** trong không gian số.

```
"con chó"      ─embedding─▶  [0.21, -0.05, 0.88, ...]
"chú cún"      ─embedding─▶  [0.19, -0.03, 0.85, ...]   ← rất gần vector "con chó"
"báo cáo tài chính" ─────▶  [-0.4, 0.7, 0.02, ...]      ← xa hẳn
```

Nhờ đó máy "hiểu nghĩa" ở mức so sánh được: tìm đoạn *liên quan về nghĩa* thay vì *khớp
từ khóa*. Đây là nền của **semantic search** và **RAG** — thay vì tìm chính xác chữ, ta tìm
vector gần nhất.

## Embedding model ≠ chat model

Điểm hay nhầm: đây là **hai loại model khác nhau**, dùng cho việc khác nhau.

| | Embedding model | Generative / chat model |
|---|-----------------|-------------------------|
| Input | Văn bản | Văn bản (messages) |
| Output | **Một vector số** | **Văn bản mới** (token) |
| Dùng để | So sánh nghĩa, search, RAG index | Trả lời, viết, suy luận |
| Ví dụ gọi | `embeddings.create(...)` | `messages.create(...)` |

Trong RAG bạn dùng **cả hai**: embedding model để biến tài liệu + câu hỏi thành vector (tìm
đoạn liên quan), rồi chat model để đọc đoạn đó và trả lời. Cấp RAG sẽ ghép chúng lại.

## Cosine similarity: đo hai vector gần nhau cỡ nào

Để biết hai vector (hai đoạn văn) "gần nghĩa" đến đâu, cách phổ biến là **cosine similarity**
— đo góc giữa hai vector, cho số từ **-1 đến 1** (1 = cùng hướng, rất giống; 0 = không liên
quan).

```python
import numpy as np

def cosine_similarity(a, b):
    a, b = np.array(a), np.array(b)
    return float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b)))

# similarity cao  → hai đoạn văn nghĩa gần nhau
# similarity thấp → không liên quan
```

Bạn hiếm khi tự viết hàm này trong thực tế — **vector database** (Chroma, FAISS...) làm sẵn
và rất nhanh trên hàng triệu vector. Nhưng hiểu *nó đo cái gì* giúp bạn debug khi retrieval
trả về đoạn không liên quan.

## Cạm bẫy hay gặp

- **Đếm từ/ký tự thay vì token** → ước sai chi phí và tưởng "vừa context" nhưng thực tế vượt.
- **Nhồi tối đa context "cho chắc"** → tốn tiền, chậm, chất lượng có khi giảm.
- **Nhầm embedding model với chat model** → gọi sai endpoint, hoặc mong chat model "trả vector".
- **So khớp từ khóa mà tưởng là semantic** → embedding tìm theo *nghĩa*, khác hẳn `LIKE '%...%'`.
- **Quên tiếng Việt/Nhật/code tốn token hơn** → ước lượng dựa trên tiếng Anh sẽ lệch.

## Ghi nhớ

Model xử lý theo **token** (~4 ký tự/token tiếng Anh), bạn **trả tiền theo token in + out**
nên prompt gọn = rẻ + nhanh. **Context window** là tổng token tối đa một request (input +
output cộng lại) — đưa *vừa đủ* ngữ cảnh, đừng nhồi tối đa. **Embedding** biến văn bản thành
**vector** để *nghĩa gần → vector gần*, là nền của semantic search/RAG; nó là **model riêng**
khác chat model. Độ gần hai vector đo bằng **cosine similarity** — cũng chính là cách vector
DB tìm đoạn liên quan trong RAG.
