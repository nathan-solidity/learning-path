---
level: "ai-llm"
order: 24
title: "RAG, Agent & Deploy tool AI"
est: "6-7 giờ"
checklist:
  - "Giải thích được vì sao cần RAG và các bước trong pipeline RAG"
  - "Viết được RAG tối giản: chunk tài liệu, tạo embedding, lưu vector DB, truy vấn similarity"
  - "Phân biệt được LLM đơn thuần và agent (LLM + tool calling)"
  - "Bọc được tool AI thành API FastAPI hoặc CLI, quản lý secret qua biến môi trường"
  - "Viết được Dockerfile gọn để đóng gói tool AI"
  - "Nhận diện rủi ro chi phí và bảo mật khi đưa tool AI lên production"
related:
  - "glossary:rag"
  - "glossary:embedding"
  - "glossary:agent"
---

## Vì sao quan trọng

LLM ở bài 23 rất giỏi, nhưng nó **không biết dữ liệu riêng của bạn** (tài liệu nội bộ, DB
khách hàng) và **không biết chuyện mới** sau ngày cắt dữ liệu huấn luyện. Nhồi cả kho tài
liệu vào prompt thì tốn token và vượt context window.

**RAG** (Retrieval-Augmented Generation) giải bài toán này: tìm đúng vài đoạn liên quan rồi
đưa vào prompt. **Agent** đi xa hơn — cho LLM gọi **tool** để *hành động* (tra DB, gọi API).
Đây là hai kiến trúc nền của hầu hết tool AI thực tế. Bài cuối cùng này ghép chúng lại và
nói về việc **đóng gói, deploy** một tool AI ra production.

## Vì sao cần RAG

> LLM chỉ biết những gì có trong prompt + dữ liệu huấn luyện của nó. Hỏi về "quy trình
> nghỉ phép của công ty X" → nó bịa (hallucinate), vì nó chưa từng thấy tài liệu đó.

RAG biến LLM từ "trí nhớ mờ" thành "có tra cứu": trước khi trả lời, hệ thống **truy xuất**
(retrieve) đoạn tài liệu liên quan và đưa vào ngữ cảnh. Model trả lời dựa trên dữ kiện thật
thay vì đoán.

## Pipeline RAG

Có hai giai đoạn: **index** (làm sẵn, một lần) và **query** (mỗi câu hỏi).

| Bước | Giai đoạn | Làm gì |
|------|-----------|--------|
| Chunk | Index | Cắt tài liệu thành đoạn nhỏ (vài trăm token) |
| Embedding | Index | Biến mỗi chunk thành vector số bằng model embedding |
| Lưu vector DB | Index | Cất các vector vào FAISS/Chroma để tìm nhanh |
| Truy vấn | Query | Embedding câu hỏi → tìm chunk gần nhất (similarity) |
| Nhồi context | Query | Đưa chunk liên quan + câu hỏi vào prompt → LLM trả lời |

Một **embedding** là vector biểu diễn nghĩa của văn bản: hai đoạn nghĩa giống nhau → hai
vector gần nhau. "Tìm chunk liên quan" chính là tìm vector gần vector câu hỏi nhất.

![Pipeline RAG: tài liệu được chunk thành đoạn rồi tạo embedding lưu vào vector DB; câu hỏi cũng được embedding, tìm các chunk liên quan nhất, rồi đưa vào prompt để LLM trả lời](/images/python-rag-pipeline.png)

## RAG tối giản bằng code

Dùng `chromadb` để đỡ phải tự quản vector (nó lo lưu trữ + tìm similarity).

```python
# Python 3.12+ — cài: pip install chromadb anthropic
import os
import chromadb
from anthropic import Anthropic

client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
db = chromadb.Client()
collection = db.create_collection("docs")  # Chroma tự tạo embedding mặc định

# --- Index: chunk + lưu (làm một lần) ---
chunks = [
    "Nhân viên được nghỉ phép năm 12 ngày, cộng dồn tối đa 6 ngày sang năm sau.",
    "Đơn nghỉ phép nộp trước 3 ngày làm việc, quản lý trực tiếp duyệt.",
    "Công ty đóng cửa nghỉ Tết theo lịch nhà nước, không tính vào phép năm.",
]
collection.add(documents=chunks, ids=[f"c{i}" for i in range(len(chunks))])

# --- Query: tìm chunk liên quan + nhồi vào prompt ---
def ask(question: str) -> str:
    hits = collection.query(query_texts=[question], n_results=2)  # tìm 2 chunk gần nhất
    context = "\n".join(hits["documents"][0])
    prompt = f"""Chỉ dựa vào ngữ cảnh dưới đây để trả lời. Nếu không có thông tin, nói "không rõ".

<context>
{context}
</context>

Câu hỏi: {question}"""
    resp = client.messages.create(
        model="claude-sonnet-5",
        max_tokens=256,
        messages=[{"role": "user", "content": prompt}],
    )
    return resp.content[0].text

print(ask("Nộp đơn nghỉ phép trước mấy ngày?"))
```

> FAISS là lựa chọn thay thế khi cần tốc độ/quy mô lớn và tự quản embedding. Ở mức học,
> Chroma đơn giản hơn vì lo giúp bạn cả embedding lẫn similarity search.

## Từ LLM tới Agent: tool calling

RAG cho model *biết* thêm. **Agent** cho model *làm* thêm: bạn khai báo các **tool** (hàm),
model tự quyết định khi nào gọi tool nào và với tham số gì.

```python
# Khai báo tool cho model: tên, mô tả, schema tham số
tools = [{
    "name": "get_weather",
    "description": "Lấy thời tiết hiện tại của một thành phố",
    "input_schema": {
        "type": "object",
        "properties": {"city": {"type": "string"}},
        "required": ["city"],
    },
}]

resp = client.messages.create(
    model="claude-sonnet-5",
    max_tokens=512,
    tools=tools,
    messages=[{"role": "user", "content": "Hà Nội hôm nay thời tiết sao?"}],
)

# Nếu model quyết định gọi tool, resp chứa yêu cầu tool_use với tham số city="Hà Nội".
# Vòng lặp agent: bạn CHẠY hàm thật, trả kết quả lại cho model, model tổng hợp câu trả lời.
```

Đây là vòng lặp: model đề nghị gọi tool → code bạn thực thi → trả kết quả → model tiếp tục.
Agent thực tế lặp nhiều lượt cho tới khi có câu trả lời cuối.

## Đóng gói tool AI: bọc thành API FastAPI

Biến hàm `ask()` ở trên thành service để hệ thống khác gọi được:

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Query(BaseModel):
    question: str

@app.post("/ask")
def ask_endpoint(q: Query) -> dict[str, str]:
    return {"answer": ask(q.question)}   # tái dùng hàm RAG ở trên
```

Hoặc gói thành **CLI** khi chỉ cần chạy nội bộ:

```python
# cli.py — chạy: python cli.py "câu hỏi của bạn"
import sys

if __name__ == "__main__":
    print(ask(sys.argv[1]))
```

## Quản lý secret & Dockerfile

Secret (API key) **không bao giờ** nằm trong image. Truyền qua biến môi trường lúc chạy:

```dockerfile
# Dockerfile — image gọn cho tool AI Python
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
# KHÔNG COPY .env / không hard-code key. Truyền lúc chạy:
#   docker run -e ANTHROPIC_API_KEY=... image
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

> Nhớ thêm `.env` và secret vào `.gitignore` **và** `.dockerignore` để không lọt vào image.

## Lưu ý chi phí & bảo mật khi lên production

- **Chi phí token**: mỗi request tốn tiền theo token. Đặt trần token, cache câu hỏi lặp,
  giới hạn số chunk RAG nhồi vào để không "đốt tiền".
- **Rate limit của chính bạn**: đặt rate limit ở API để một user không gọi tràn (kéo theo
  hóa đơn LLM tăng vọt).
- **Prompt injection qua dữ liệu**: chunk tài liệu có thể chứa lệnh độc; đừng để nội dung
  truy xuất điều khiển được hành vi model (đặc biệt khi agent có quyền gọi tool ghi dữ liệu).
- **Output không tin cậy**: như bài 23, validate mọi thứ model trả trước khi hành động.

## Cạm bẫy hay gặp

- **Chunk quá to** → nhồi thừa token, tốn tiền; **chunk quá nhỏ** → mất ngữ cảnh, trả lời cụt.
- **Không kiểm soát chi phí token** → hóa đơn LLM tăng đột biến khi traffic lên.
- **Prompt injection qua tài liệu RAG** → nội dung truy xuất chứa lệnh độc điều khiển model.
- **Để secret trong image/repo** → key lộ khi push image; truyền qua env, thêm `.dockerignore`.
- **Agent có quyền hành động mà không giới hạn tool** → LLM gọi nhầm/tool nguy hiểm; giới hạn phạm vi tool.

## Ghi nhớ

**RAG** khắc phục việc LLM không biết dữ liệu riêng/mới: **chunk → embedding → vector DB →
truy vấn similarity → nhồi context vào prompt**. **Agent** = LLM + **tool calling**, cho
model *hành động* qua vòng lặp đề-nghị-gọi / thực-thi / trả-kết-quả. Đóng gói tool AI bằng
**FastAPI hoặc CLI**, quản secret qua **biến môi trường** (không nằm trong image), deploy
bằng **Docker gọn**. Lên production phải canh **chi phí token**, **rate limit**, **prompt
injection** và **validate output**.
