---
level: "ai-basic-rag"
order: 9
title: "RAG cơ bản"
est: "6-7 giờ"
checklist:
  - "Giải thích được RAG giải quyết vấn đề gì (knowledge cutoff, dữ liệu riêng, hallucination)"
  - "Kể được đầy đủ pipeline RAG: index (chunk→embed→store) và query (embed→retrieve→augment→generate)"
  - "Xây được một RAG tối giản chạy end-to-end trên tài liệu của mình"
  - "Viết được prompt RAG buộc model chỉ trả lời dựa trên context, nói 'không biết' khi thiếu"
  - "Trích dẫn được nguồn (metadata) trong câu trả lời để người dùng kiểm chứng"
  - "Nhận ra giới hạn của RAG cơ bản và biết cấp Production RAG sẽ cải thiện gì"
related:
  - "glossary:rag"
  - "glossary:embedding"
  - "glossary:vector-database"
---

## Vì sao quan trọng

Đây là bài **ghép tất cả** của cấp Cơ bản: LLM (bài 4-6) + embedding/vector search (bài 7)
+ chunking (bài 8) hợp lại thành **RAG** — kiến trúc phổ biến nhất của ứng dụng AI thực tế.
Sau bài này bạn xây được thứ có giá trị thật: **chatbot trả lời câu hỏi trên tài liệu riêng
của bạn**, dựa trên dữ kiện thật thay vì để model bịa.

## RAG giải quyết vấn đề gì

Từ bài 2, LLM có ba giới hạn cốt lõi: **không biết dữ liệu riêng** của bạn (tài liệu nội bộ,
DB), **không biết chuyện mới** sau knowledge cutoff, và **hay bịa** khi thiếu dữ kiện.

> Hỏi LLM "quy trình nghỉ phép của công ty X" → nó bịa, vì chưa từng thấy tài liệu đó.

**RAG** (Retrieval-Augmented Generation) giải cả ba: trước khi trả lời, hệ thống **truy
xuất** đoạn tài liệu liên quan và **đưa vào prompt**. Model trả lời dựa trên dữ kiện thật
được cung cấp, thay vì trí nhớ mờ. Nhồi cả kho tài liệu vào prompt thì tốn token và vượt
context — RAG chỉ đưa *đúng vài đoạn liên quan*.

## Pipeline RAG đầy đủ

Hai giai đoạn: **index** (làm sẵn một lần) và **query** (mỗi câu hỏi).

| Bước | Giai đoạn | Làm gì | Bài |
|------|-----------|--------|-----|
| Trích text + Chunk | Index | Lấy text sạch, cắt thành đoạn nhỏ có overlap | 8 |
| Embedding | Index | Biến mỗi chunk thành vector | 3, 7 |
| Lưu vector DB | Index | Cất vector (+ metadata) vào Chroma/FAISS | 7 |
| Embed câu hỏi + Retrieve | Query | Embedding câu hỏi → tìm k chunk gần nhất | 7 |
| Augment (nhồi context) | Query | Đưa chunk liên quan + câu hỏi vào prompt | 4 |
| Generate | Query | LLM đọc context → trả lời + trích nguồn | 4, 5 |

![Pipeline RAG: tài liệu được chunk thành đoạn rồi tạo embedding lưu vào vector DB; câu hỏi cũng được embedding, tìm các chunk liên quan nhất, rồi đưa vào prompt để LLM trả lời](/images/python-rag-pipeline.png)

Chữ "**Augmented**" ở giữa RAG chính là bước nhồi context — đó là toàn bộ ý tưởng: *tăng
cường* prompt bằng dữ kiện truy xuất được, trước khi *generate*.

## RAG tối giản end-to-end

Dùng `chromadb` để đỡ tự quản vector (nó lo cả lưu trữ + tìm similarity + embedding mặc định).

```python
# Python 3.12+ — cài: pip install chromadb anthropic
import os
import chromadb
from anthropic import Anthropic

client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
db = chromadb.Client()
collection = db.create_collection("docs")

# --- INDEX: chunk + metadata + lưu (làm một lần) ---
chunks = [
    "Nhân viên được nghỉ phép năm 12 ngày, cộng dồn tối đa 6 ngày sang năm sau.",
    "Đơn nghỉ phép nộp trước 3 ngày làm việc, quản lý trực tiếp duyệt.",
    "Công ty đóng cửa nghỉ Tết theo lịch nhà nước, không tính vào phép năm.",
]
collection.add(
    documents=chunks,
    ids=[f"c{i}" for i in range(len(chunks))],
    metadatas=[{"source": "policy-2024.pdf", "section": s} for s in
               ["phép năm", "quy trình duyệt", "nghỉ lễ"]],
)

# --- QUERY: retrieve → augment → generate ---
def ask(question: str) -> dict:
    hits = collection.query(query_texts=[question], n_results=2)   # retrieve
    docs = hits["documents"][0]
    metas = hits["metadatas"][0]
    context = "\n".join(f"[{m['source']} · {m['section']}] {d}" for d, m in zip(docs, metas))

    prompt = f"""Chỉ dựa vào NGỮ CẢNH dưới đây để trả lời. Nếu ngữ cảnh không đủ thông tin,
trả lời đúng câu "Tôi không tìm thấy thông tin này trong tài liệu." — KHÔNG bịa.
Nêu rõ nguồn ([source · section]) cho thông tin bạn dùng.

<context>
{context}
</context>

Câu hỏi: {question}"""

    resp = client.messages.create(
        model="claude-sonnet-5",
        max_tokens=256,
        temperature=0,                       # RAG cần bám dữ kiện → tất định
        messages=[{"role": "user", "content": prompt}],
    )
    return {"answer": resp.content[0].text, "sources": metas}

print(ask("Nộp đơn nghỉ phép trước mấy ngày?"))
```

> Thực tế thay `chunks` cứng bằng pipeline chunking ở bài 8 (đọc PDF → trích text → chunk →
> add). FAISS là lựa chọn khi cần tốc độ/quy mô lớn; ở mức học, Chroma đơn giản hơn.

## Prompt RAG: buộc bám context, cho phép "không biết"

Prompt là nơi RAG khác chatbot thường. Ba ràng buộc quan trọng:

1. **"Chỉ dựa vào ngữ cảnh"** — chặn model dùng trí nhớ tự do (nguồn của hallucination).
2. **Cho phép nói "không biết"** — nếu context không đủ, model phải nói thẳng thay vì bịa.
   Đây là ràng buộc *chống hallucinate* mạnh nhất trong RAG.
3. **Yêu cầu trích nguồn** — buộc model chỉ ra chunk nào chống lưng cho câu trả lời, giúp
   người dùng kiểm chứng.

Đặt **temperature 0** vì RAG cần bám dữ kiện, không cần sáng tạo.

## Trích dẫn nguồn

Nhờ **metadata** gắn từ bài 8, câu trả lời kèm được nguồn: *"Nộp trước 3 ngày làm việc
(policy-2024.pdf · quy trình duyệt)"*. Trích nguồn không chỉ đẹp — nó cho người dùng đường
kiểm chứng, và khi model không trích được nguồn nào tức là nó đang bịa → dấu hiệu để bạn
chặn/cảnh báo.

## Giới hạn của RAG cơ bản

RAG tối giản này chạy được nhưng còn thô. Nó sẽ đuối khi:

- Câu hỏi cần **khớp chính xác** (mã sản phẩm, tên riêng) — vector search đơn thuần yếu ở đây.
- Đoạn liên quan nhất **không lọt top-k** vì retrieval chưa đủ tinh.
- Câu hỏi mơ hồ, nhiều bước, hoặc cần lọc theo điều kiện (phòng ban, thời gian).
- Không có cách **đo** RAG trả lời đúng bao nhiêu %.

Cấp **Production RAG** (Trung cấp) giải quyết: **hybrid search** (vector + keyword),
**reranking** (lọc lại top-k cho tinh), **metadata filtering**, **query transformation**,
và **RAG evaluation** (đo chất lượng). Bài này cho bạn nền để hiểu *vì sao* cần những thứ đó.

## Bảo mật RAG (chạm nhẹ, sâu ở AI Security)

- **Prompt injection qua tài liệu**: chunk có thể chứa lệnh độc ("bỏ qua hướng dẫn trên...").
  Đừng để nội dung truy xuất điều khiển hành vi model — nhất là khi RAG đi kèm tool ghi dữ liệu.
- **Rò rỉ dữ liệu**: RAG lấy đúng chunk *user được phép xem* — lọc theo quyền qua metadata,
  đừng để user hỏi ra tài liệu của người/phòng khác.
- **Validate output** trước khi hiển thị (bài 5).

## Cạm bẫy hay gặp

- **Prompt không cho phép "không biết"** → model bịa khi context thiếu; luôn mở lối thoát này.
- **Quên temperature 0** → RAG "sáng tạo" lệch khỏi dữ kiện.
- **Chunk dở** (bài 8) → retrieve ra đoạn vô nghĩa; RAG hỏng từ gốc, không phải lỗi LLM.
- **Không lọc quyền** → user hỏi ra tài liệu không được phép xem (rò rỉ dữ liệu).
- **Không trích nguồn** → không kiểm chứng được, khó phát hiện khi model bịa.

## Ghi nhớ

**RAG** khắc phục việc LLM không biết dữ liệu riêng/mới và hay bịa: **truy xuất đoạn liên
quan → nhồi vào prompt → model trả lời trên dữ kiện thật**. Pipeline gồm **index** (chunk →
embed → store) và **query** (embed câu hỏi → retrieve → **augment** → generate). Prompt RAG
phải buộc model **chỉ bám context, cho phép nói "không biết", và trích nguồn** (metadata),
để **temperature 0**. RAG cơ bản đã dựng được chatbot hỏi đáp tài liệu riêng — nhưng còn thô;
**Production RAG** sẽ thêm hybrid search, reranking, filtering và evaluation. Luôn canh
**prompt injection qua tài liệu**, **lọc quyền truy xuất** và **validate output**.
