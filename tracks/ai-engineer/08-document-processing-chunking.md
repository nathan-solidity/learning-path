---
level: "ai-basic-rag"
order: 8
title: "Document Processing & Chunking"
est: "5-6 giờ"
checklist:
  - "Giải thích được vì sao phải chunk tài liệu thay vì embedding cả file"
  - "Trích được text sạch từ nhiều định dạng nguồn (txt, markdown, PDF...) trước khi chunk"
  - "Chunk được văn bản theo kích thước hợp lý, có overlap giữa các chunk"
  - "Giải thích được overlap để làm gì và đánh đổi chunk to/nhỏ"
  - "Đính kèm được metadata cho chunk (nguồn, tiêu đề, trang) để lọc và trích dẫn"
  - "Nhận ra chunking kém là nguyên nhân số một khiến RAG trả lời sai/cụt"
related:
  - "glossary:chunking"
  - "glossary:rag"
  - "glossary:embedding"
---

## Vì sao quan trọng

Có một sự thật ít người nói với người mới: **RAG trả lời tệ thường không phải lỗi của LLM,
mà lỗi ở khâu chuẩn bị dữ liệu** — đặc biệt là **chunking**. Nếu bạn cắt tài liệu thành đoạn
dở, model dù giỏi mấy cũng nhận được context vụn vặt hoặc thiếu, và trả lời sai. Bài này là
khâu "vô hình" nhưng quyết định chất lượng RAG nhiều nhất.

## Vì sao phải chunk

Bạn **không** embedding cả một file 50 trang thành một vector. Hai lý do:

1. **Mất chi tiết**: một vector không thể "gói" hết nghĩa của 50 trang; nó bị trung bình hóa
   thành mờ nhạt, tìm gì cũng ra "hơi liên quan".
2. **Nhồi cả tài liệu vào prompt là bất khả thi/tốn kém**: vượt context window, đốt token.

Nên ta **chunk**: cắt tài liệu thành đoạn nhỏ (vài trăm token), embedding *từng đoạn*. Lúc
truy vấn chỉ lấy vài đoạn liên quan — đủ ngữ cảnh, ít token.

## Bước 0: trích text sạch trước khi chunk

Trước khi cắt, phải lấy được **text sạch** từ nguồn. Mỗi định dạng một cách:

| Nguồn | Cách lấy text | Lưu ý |
|-------|---------------|-------|
| `.txt`, `.md` | Đọc thẳng | Markdown giữ cấu trúc heading — tận dụng để chunk |
| `.pdf` | `pypdf`, `pdfplumber` | PDF scan (ảnh) cần OCR; bảng/nhiều cột dễ vỡ layout |
| `.docx` | `python-docx` | |
| HTML | `beautifulsoup4` | Bỏ nav/script, giữ nội dung chính |

```python
# Ví dụ: PDF → text
from pypdf import PdfReader
reader = PdfReader("policy.pdf")
text = "\n".join(page.extract_text() or "" for page in reader.pages)
```

> "Garbage in, garbage out": nếu bước này lấy ra text lộn xộn (header/footer lặp, bảng vỡ),
> chunk và retrieval sau đó đều hỏng. Kiểm tra text trích ra *trước khi* chunk.

## Chunking cơ bản: kích thước + overlap

Chunk có hai tham số chính: **kích thước** (chunk size, tính theo token/ký tự) và **overlap**
(phần trùng giữa hai chunk liền nhau).

```python
def chunk_text(text: str, size: int = 500, overlap: int = 50) -> list[str]:
    chunks, start = [], 0
    while start < len(text):
        end = start + size
        chunks.append(text[start:end])
        start = end - overlap          # lùi lại 'overlap' ký tự → chunk sau trùng 1 phần chunk trước
    return chunks
```

*(Đây là chunk theo ký tự cho dễ hiểu. Thực tế nên chunk theo token, và tốt hơn là theo
ranh giới ngữ nghĩa — xem dưới.)*

## Overlap để làm gì

**Overlap** giữ một phần cuối chunk trước lặp lại ở đầu chunk sau. Lý do: một câu trả lời có
thể **nằm vắt qua ranh giới hai chunk**. Không overlap → cắt ngang ý, cả hai chunk đều thiếu.

```
Không overlap:  [...nộp đơn trước] [3 ngày làm việc...]   ← "trước 3 ngày" bị chẻ đôi
Có overlap:     [...nộp đơn trước 3 ngày] [trước 3 ngày làm việc, quản lý duyệt...]
```

Overlap ~10–20% chunk size là điểm khởi đầu thường dùng. Nhiều quá → lặp dữ liệu, tốn chỗ
và token; ít quá → mất ngữ cảnh ở ranh giới.

## Đánh đổi chunk to vs nhỏ

| Chunk **to** (800-1000+ token) | Chunk **nhỏ** (100-300 token) |
|-------------------------------|-------------------------------|
| Nhiều ngữ cảnh mỗi đoạn | Ít ngữ cảnh, dễ cụt ý |
| Retrieval kém "trúng đích" (đoạn lẫn nhiều chủ đề) | Retrieval trúng đích hơn |
| Tốn token khi nhồi vào prompt | Tiết kiệm token, nhưng phải lấy nhiều đoạn hơn |

Không có con số vàng — tùy loại tài liệu. Văn bản pháp lý/kỹ thuật dày đặc thường chunk nhỏ
hơn; văn tường thuật có thể to hơn. **Chunk theo ranh giới tự nhiên** (đoạn văn, mục,
heading markdown) gần như luôn tốt hơn cắt cứng theo số ký tự — vì giữ được ý trọn vẹn.

## Metadata: chìa khóa cho lọc & trích dẫn

Mỗi chunk nên đi kèm **metadata**: nguồn, tiêu đề mục, số trang, ngày, phòng ban... Metadata
cho phép:

- **Lọc trước khi search** (cấp Production RAG): "chỉ tìm trong tài liệu phòng HR", "chỉ bản
  mới nhất" → giảm nhiễu, tăng chính xác.
- **Trích dẫn nguồn** trong câu trả lời: "theo *Chính sách nghỉ phép 2024, trang 3*" — giúp
  người dùng kiểm chứng và giảm cảm giác model bịa.

```python
collection.add(
    documents=[chunk_text],
    ids=["policy-p3-c2"],
    metadatas=[{"source": "policy-2024.pdf", "page": 3, "dept": "HR"}],
)
```

## Chunking kém = nguyên nhân số 1 khiến RAG sai

Khi RAG trả lời cụt, sai, hoặc "không tìm thấy" dù tài liệu có thông tin — **nghi chunking
trước tiên**:

- Chunk cắt ngang câu/ý → đoạn liên quan bị chẻ, retrieval không gom đủ.
- Chunk quá to trộn nhiều chủ đề → similarity loãng, lấy về đoạn "chung chung".
- Không overlap → mất thông tin ở ranh giới.
- Text trích bẩn (bảng vỡ, header lặp) → chunk vô nghĩa.

> Trước khi đổ lỗi cho LLM hay đổi model, **in ra các chunk mà retrieval trả về** cho một
> câu hỏi sai. Chín trên mười lần bạn sẽ thấy vấn đề nằm ở chunk, không phải model.

## Cạm bẫy hay gặp

- **Embedding cả file thành 1 vector** → mất chi tiết; phải chunk.
- **Không overlap** → câu trả lời vắt qua ranh giới bị mất; thêm overlap 10–20%.
- **Cắt cứng theo ký tự giữa câu/ý** → chunk vô nghĩa; ưu tiên cắt theo đoạn/heading.
- **Bỏ qua chất lượng text trích** → PDF bảng vỡ/header lặp làm hỏng mọi thứ phía sau.
- **Không gắn metadata** → mất khả năng lọc và trích dẫn nguồn; gắn từ đầu.

## Ghi nhớ

**Chunking là khâu quyết định chất lượng RAG nhất** — RAG sai thường do chunk dở, không phải
LLM. Trước khi chunk phải **trích text sạch** từ nguồn (PDF/docx/HTML). Chunk theo **kích
thước hợp lý + overlap 10–20%** để không mất ý ở ranh giới; ưu tiên cắt theo **ranh giới tự
nhiên** (đoạn, heading) hơn cắt cứng theo ký tự. Gắn **metadata** (nguồn, trang, phòng ban)
cho mỗi chunk để lọc và trích dẫn nguồn. Khi RAG trả lời sai, **in các chunk retrieve ra
xem trước** — thường lỗi ở đây.
