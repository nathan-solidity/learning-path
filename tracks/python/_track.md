---
track: "python"
role: "dev-python"
group: "dev"
group_title: "Developer"
group_icon: "💻"
group_summary: "Lộ trình cho lập trình viên — chọn ngôn ngữ/framework bạn muốn học chuyên sâu."
variant: "Python"
variant_desc: "Từ Python core đến developer thực chiến trên NHIỀU hướng: web (FastAPI), tool/CLI, phân tích dữ liệu (pandas), machine learning (scikit-learn) và AI/LLM (RAG, agent) — chọn nhánh nâng cao theo mục tiêu."
title: "Python Developer"
icon: "🐍"
summary: "Lộ trình từ Python core đến developer đa hướng: nền tảng ngôn ngữ (cú pháp, kiểu dữ liệu, hàm, file), Python nâng cao (OOP, generator/decorator, async), công cụ & chất lượng (venv, pytest, type hint), rồi RẼ NHÁNH nâng cao theo mục tiêu — web backend (FastAPI, ORM, auth), phân tích dữ liệu (NumPy/pandas, visualization, ETL), machine learning (scikit-learn, ML workflow, deep learning), và AI/LLM (gọi model, RAG, agent)."
levels:
  - key: "python-core"
    title: "Python ngôn ngữ"
    desc: "Cài đặt & cú pháp, kiểu dữ liệu & collection, control flow & comprehension, hàm & scope, string & file I/O, module cơ bản — nền phải chắc trước mọi hướng."
  - key: "python-advanced"
    title: "Python nâng cao"
    desc: "OOP (class, dataclass), xử lý lỗi & logging, iterator/generator/decorator, lập trình bất đồng bộ (asyncio) — kỹ thuật Python sâu dùng chung cho mọi nhánh."
  - key: "tooling-quality"
    title: "Công cụ & Chất lượng"
    desc: "Môi trường ảo & quản lý package (venv, pip, pyproject), testing (pytest), type hint & lint/format (mypy, ruff, black) — làm việc chuyên nghiệp, code sạch có test."
  - key: "web-backend"
    title: "Nâng cao — Web Backend"
    desc: "FastAPI (routing, async endpoint, Pydantic), database & ORM (SQLAlchemy), xác thực & validation — dựng REST API production. (Nhánh cho hướng web.)"
  - key: "data-analysis"
    title: "Nâng cao — Phân tích dữ liệu"
    desc: "NumPy & pandas (DataFrame, xử lý dữ liệu), visualization (matplotlib/seaborn), data pipeline/ETL — làm sạch, phân tích, trực quan hóa dữ liệu. (Nhánh cho hướng data.)"
  - key: "machine-learning"
    title: "Nâng cao — Machine Learning"
    desc: "scikit-learn (model cơ bản), ML workflow (train/test, đánh giá, tránh overfit), giới thiệu deep learning (PyTorch) — huấn luyện & đánh giá model. (Nhánh cho hướng ML.)"
  - key: "ai-llm"
    title: "Nâng cao — AI & LLM"
    desc: "Gọi LLM qua API (prompt, structured output), RAG (embedding, vector DB) & agent, cùng đóng gói/deploy tool AI — xây ứng dụng AI thực tế. (Nhánh cho hướng AI.)"
---

## Về lộ trình này

Lộ trình dành cho người học **Python** từ nền tảng ngôn ngữ đến làm được sản phẩm thực tế.
Python đặc biệt ở chỗ **một ngôn ngữ, nhiều hướng đi rất khác nhau**: viết web backend,
làm tool/CLI tự động hóa, phân tích dữ liệu, huấn luyện machine learning, hay xây ứng dụng
AI/LLM. Vì thế phần nâng cao ở đây **chia thành nhiều nhánh** — học xong nền tảng, bạn chọn
nhánh (hoặc nhiều nhánh) theo mục tiêu công việc.

Thiết kế theo hướng **học đến đâu code được đến đó**: mỗi cấp độ đều có bài thực hành/dự án
nhỏ, không chỉ đọc lý thuyết. Mỗi bài có checklist tự đánh giá — tick khi bạn tự tin đã nắm
và **code được**, không chỉ hiểu lý thuyết. Tiến độ tính theo số item đã tick.

### Cách đi lộ trình

Ba cấp độ đầu là **nền tảng chung — học tuần tự, ai cũng cần**:

**Python ngôn ngữ → Python nâng cao → Công cụ & Chất lượng**

Sau đó **rẽ nhánh** theo mục tiêu (có thể học một hoặc nhiều nhánh, thứ tự tùy bạn):

| Nhánh nâng cao | Dành cho ai | Bạn làm được gì |
|----------------|-------------|-----------------|
| Web Backend | Muốn làm API/dịch vụ web | Dựng REST API với FastAPI, có DB & auth |
| Phân tích dữ liệu | Data analyst, báo cáo | Làm sạch, phân tích, trực quan hóa dữ liệu |
| Machine Learning | Muốn train model | Huấn luyện & đánh giá model, tránh overfit |
| AI & LLM | Xây app AI, chatbot, RAG | Gọi LLM, build RAG/agent, deploy tool AI |

Không cần học hết mọi nhánh. Nhưng **nền tảng chung (bài 1–13) thì bắt buộc** — thiếu nó,
mọi nhánh nâng cao đều lung lay.

### Vì sao học nền tảng trước

Python cú pháp dễ nên nhiều người **nhảy thẳng vào pandas hoặc ML mà chưa chắc ngôn ngữ**,
rồi copy code không hiểu vì sao chạy, gặp lỗi không tự sửa được. Nắm core trước (kiểu dữ
liệu, hàm, OOP, generator, async) giúp đọc được thư viện, hiểu framework làm gì ngầm và tự
debug. Riêng `venv`, `pytest`, `type hint` (bài 11–13) là thứ **phân biệt người viết script
tạm với developer chuyên nghiệp** — đừng bỏ qua dù bạn theo nhánh nào.

| Cấp độ | Bạn làm được gì sau khi xong |
|--------|------------------------------|
| Python ngôn ngữ | Viết script Python thành thạo, xử lý dữ liệu & file cơ bản |
| Python nâng cao | Dùng OOP, generator, decorator, async — đọc được code thư viện |
| Công cụ & Chất lượng | Quản lý môi trường, viết test, code có type & lint sạch |
| Web Backend | Dựng REST API FastAPI có DB, auth, validation chạy được |
| Phân tích dữ liệu | Làm sạch & phân tích dữ liệu thật, vẽ biểu đồ, dựng ETL |
| Machine Learning | Train/đánh giá model scikit-learn, hiểu overfit, thử deep learning |
| AI & LLM | Gọi LLM qua API, build RAG & agent, đóng gói tool AI |

### Môi trường & tài nguyên

- Python cài bản mới (**3.12+**) qua [python.org](https://www.python.org),
  **pyenv**, hoặc **uv** (nhanh, hiện đại). Luôn làm việc trong **môi trường ảo** (`venv`)
  hoặc dùng **uv**/`poetry` — không cài package thẳng vào Python hệ thống.
- Editor: **VS Code** (+ Python, Pylance) hoặc **PyCharm**. REPL/notebook:
  `python -i`, **IPython**, **Jupyter** (rất hợp cho data/ML).
- Package manager: **pip** (mặc định) hoặc **uv**/`poetry` (hiện đại, nhanh).
- Tài liệu chính thức: [Python docs](https://docs.python.org/3/),
  [FastAPI](https://fastapi.tiangolo.com), [pandas](https://pandas.pydata.org/docs/),
  [scikit-learn](https://scikit-learn.org), [W3Schools Python](https://www.w3schools.com/python/).
- Mỗi bài có ví dụ code chạy được — nên gõ lại và chạy thử, đừng chỉ đọc.

Nội dung liên kết với `term-glossary` (tra thuật ngữ) và các skill dev (`/nta-code-review`,
`/nta-test-gen`, `/nta-refactor`, `/nta-security-audit`...) — gặp thuật ngữ lạ thì mở
glossary, muốn tự động hóa review/test thì dùng skill tương ứng.
