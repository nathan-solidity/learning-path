---
track: "ai-engineer"
role: "ai-engineer"
group: "ai-engineer"
group_title: "AI Engineer"
group_icon: "🤖"
group_summary: "Lộ trình xây ứng dụng AI thực tế: từ hiểu LLM, gọi API, RAG, agent đến production, security và ML/LLM engineering chuyên sâu."
variant: "AI Engineer"
variant_desc: "Từ nền tảng LLM đến kỹ sư AI thực chiến: gọi model, RAG, agent, đưa app AI lên production an toàn, rồi đi sâu ML/DL, fine-tuning, model serving và MLOps."
title: "AI Engineer"
icon: "🤖"
summary: "Lộ trình cho kỹ sư AI xây ứng dụng dựa trên LLM và ML. Cơ bản: hiểu AI/ML/DL và LLM ở mức khái niệm, gọi LLM qua API, structured output, function calling, rồi RAG cơ bản (embedding, vector search, chunking) — xây được chatbot hỏi đáp trên dữ liệu riêng. Trung cấp: production RAG (hybrid search, reranking, evaluation), AI agent, kiến trúc AI application, observability/cost, và AI security. Nâng cao: ML/DL (PyTorch), LLM engineering (Transformer, fine-tuning, quantization), model serving, và MLOps/LLMOps."
levels:
  - key: "ai-basic-foundation"
    title: "Cơ bản — Nền tảng AI & LLM"
    desc: "AI/ML/DL là gì, LLM hoạt động thế nào ở mức khái niệm, token/context/embedding — đủ nền để hiểu mình đang xây hệ thống gì trước khi viết dòng code đầu tiên."
  - key: "ai-basic-application"
    title: "Cơ bản — LLM Application"
    desc: "Gọi LLM qua API, prompt, structured output, streaming, function/tool calling — xây được ứng dụng AI đầu tiên gọi model làm việc thật."
  - key: "ai-basic-rag"
    title: "Cơ bản — RAG"
    desc: "Embedding, vector database, chunking, retrieval và context injection — xây chatbot hỏi đáp trên dữ liệu riêng của bạn."
  - key: "ai-inter-rag"
    title: "Trung cấp — Production RAG"
    desc: "Từ RAG demo lên hệ thống thực tế: hybrid search, reranking, metadata filtering, query transformation và đánh giá retrieval."
  - key: "ai-inter-agent"
    title: "Trung cấp — AI Agent"
    desc: "Agent architecture, tool use, planning, memory và orchestration — xây AI thực hiện tác vụ thay vì chỉ trả lời."
  - key: "ai-inter-app"
    title: "Trung cấp — AI Application Engineering"
    desc: "Thiết kế AI application production: API, queue, caching, database, observability, cost và reliability."
  - key: "ai-inter-security"
    title: "Trung cấp — AI Security"
    desc: "Bảo vệ AI application trước prompt injection, data leakage, tool abuse và các vấn đề authorization."
  - key: "ai-adv-ml"
    title: "Nâng cao — Machine Learning & Deep Learning"
    desc: "Đi sâu ML/DL để hiểu và xây model thay vì chỉ dùng model có sẵn: ML fundamentals, neural network, PyTorch."
  - key: "ai-adv-llm"
    title: "Nâng cao — LLM Engineering"
    desc: "Hiểu sâu kiến trúc Transformer và các kỹ thuật tối ưu/fine-tuning model: attention, LoRA, quantization."
  - key: "ai-adv-serving"
    title: "Nâng cao — Model Serving & Infrastructure"
    desc: "Deploy và vận hành model trong production, tối ưu latency, throughput và chi phí GPU."
  - key: "ai-adv-mlops"
    title: "Nâng cao — MLOps & LLMOps"
    desc: "Quản lý model, dataset, experiment, evaluation và deployment theo quy trình production."
---

## Về lộ trình này

Lộ trình dành cho người muốn trở thành **AI Engineer** — kỹ sư xây ứng dụng dựa trên LLM
và ML, chứ không phải nhà nghiên cứu train model từ đầu. Trọng tâm là **xây được sản phẩm
AI chạy thật, an toàn, kiểm soát được chi phí**, rồi mới đi sâu vào cơ chế bên dưới.

### Python là điều kiện tiên quyết

AI Engineer dùng Python làm ngôn ngữ chính. Lộ trình này **không dạy lại Python** — nếu bạn
chưa chắc Python (cú pháp, hàm, OOP, async, `venv`, đọc được code thư viện), hãy học track
**Python Developer** trước (ít nhất hết phần nền tảng chung). Ở đây giả định bạn đã viết được
Python và tập trung vào phần *AI*: gọi model, RAG, agent, ML, serving.

### Thiết kế theo hướng "hiểu đủ để xây, rồi mới đào sâu"

Nhiều người học AI theo thứ tự ngược: lao vào Transformer, backprop, đạo hàm trước khi từng
gọi một API. Kết quả là biết lý thuyết nhưng không xây được gì. Lộ trình này đi theo thứ tự
**thực dụng**:

1. **Cơ bản** — hiểu LLM ở mức khái niệm (không cần toán), gọi được API, xây được RAG. Sau
   ba cấp này bạn đã làm được chatbot hỏi đáp trên dữ liệu riêng.
2. **Trung cấp** — nâng RAG lên production, xây agent, thiết kế application thật (cost,
   observability, reliability), và bảo mật. Đây là phần **phân biệt người làm demo với kỹ
   sư AI đi làm được**.
3. **Nâng cao** — mới đào xuống ML/DL, kiến trúc Transformer, fine-tuning, model serving,
   MLOps. Phần này cho người muốn hiểu và can thiệp sâu vào model, không chỉ gọi API.

### Cách đi lộ trình

Ba cấp **Cơ bản** học tuần tự, ai cũng cần:

**Nền tảng AI & LLM → LLM Application → RAG**

Bốn cấp **Trung cấp** nên học sau khi vững cơ bản — thứ tự linh hoạt theo nhu cầu, nhưng
Production RAG và AI Agent nên đi trước vì hai kiến trúc này là xương sống của hầu hết app AI:

**Production RAG · AI Agent · AI Application Engineering · AI Security**

Bốn cấp **Nâng cao** dành cho người muốn đi sâu hơn phần "gọi API" — hiểu và tối ưu chính
model. Có thể học chọn lọc theo hướng công việc (nghiêng ML, nghiêng serving, hay nghiêng
MLOps).

| Cấp độ | Bạn làm được gì sau khi xong |
|--------|------------------------------|
| Nền tảng AI & LLM | Hiểu LLM/token/embedding, biết mình đang xây hệ thống loại gì |
| LLM Application | Gọi LLM qua API, structured output, function calling — app AI đầu tiên |
| RAG | Xây chatbot hỏi đáp trên tài liệu riêng bằng embedding + vector DB |
| Production RAG | Hybrid search, reranking, đánh giá retrieval — RAG dùng thật |
| AI Agent | Agent gọi tool, có memory, thực hiện tác vụ nhiều bước |
| AI Application Engineering | API + queue + cache + observability + cost cho app AI |
| AI Security | Chống prompt injection, data leakage, tool abuse |
| Machine Learning & DL | Hiểu & train model, neural network, PyTorch cơ bản |
| LLM Engineering | Hiểu Transformer/attention, fine-tune bằng LoRA, quantization |
| Model Serving & Infra | Deploy model, tối ưu latency/throughput/chi phí GPU |
| MLOps & LLMOps | Version model/dataset, experiment tracking, evaluation, pipeline |

### Môi trường & tài nguyên

- **Python 3.12+** trong môi trường ảo (`venv`/`uv`). SDK chính: `anthropic`, `openai`.
  Vector DB học tập: **Chroma** (đơn giản), lên quy mô dùng **FAISS**, **pgvector**, hoặc
  vector DB chuyên dụng (Pinecone, Qdrant, Weaviate).
- **API key**: cần key của một nhà cung cấp LLM (Anthropic, OpenAI...). Luôn đọc key từ
  biến môi trường, không hard-code. Chi phí tính theo token — canh chừng từ ngày đầu.
- Phần ML/DL nâng cao cần **PyTorch**; fine-tuning/serving nặng cần **GPU** (Colab, cloud).
- Tài liệu: [Claude docs](https://docs.claude.com), [OpenAI docs](https://platform.openai.com/docs),
  [Chroma](https://docs.trychroma.com), [PyTorch](https://pytorch.org),
  [Hugging Face](https://huggingface.co/docs).
- Mỗi bài có ví dụ code chạy được — gõ lại và chạy thử, đừng chỉ đọc.

Nội dung liên kết với `term-glossary` (tra thuật ngữ AI). Gặp thuật ngữ lạ thì mở glossary.
