---
level: "ai-adv-serving"
order: 28
title: "Serving cơ bản: đưa model lên production"
est: "6-7 giờ"
checklist:
  - "Giải thích được vì sao không gọi trực tiếp model.generate() trong web request handler"
  - "Kể được vai trò của inference server (vLLM/TGI/Ollama) đứng giữa app và model"
  - "Nêu được 2 khác biệt cốt lõi khiến serving LLM khó hơn serving model thường (autoregressive, KV cache)"
  - "Chạy được một inference server local (Ollama hoặc vLLM) và gọi qua HTTP"
  - "Trỏ được code app từ API OpenAI/Anthropic sang server tự host chỉ bằng đổi base_url"
  - "Chọn được framework serving phù hợp với tình huống (local dev vs production GPU)"
related:
  - "glossary:llm"
  - "skill:nta-docker-gen"
  - "skill:nta-infra-gen"
---

## Vì sao quan trọng

Suốt các cấp trước bạn **gọi API của người khác** (Anthropic, OpenAI): trả tiền theo token,
họ lo hạ tầng. Cấp này lật ngược: **bạn tự vận hành model** — chạy trên máy/GPU của mình,
tự chịu trách nhiệm latency, throughput và chi phí. Lý do tự host: dữ liệu nhạy cảm không
được rời hạ tầng, cần model open-weight (Llama, Qwen, Mistral), hoặc khối lượng lớn tới mức
tự host rẻ hơn gọi API (bài 30 tính cụ thể).

Bài này là nền: **serving là gì, vì sao cần một inference server riêng, và vì sao serving
LLM khác hẳn serving model ML thông thường.**

## Vì sao KHÔNG chạy model.generate() trong web request

Cám dỗ đầu tiên: load model vào process web rồi gọi thẳng.

```python
# ANTI-PATTERN — đừng làm thế này trong production
@app.post("/chat")
def chat(req):
    model = load_model("llama-3-8b")        # load lại mỗi request? 20-40s + hết VRAM
    return model.generate(req.prompt)       # block toàn bộ worker, không batch
```

Vấn đề chồng chất:

- **Load model rất nặng**: model 8B chiếm ~16GB VRAM, load mất hàng chục giây. Không thể
  load mỗi request; mà giữ trong process web thì mỗi worker nhân bản một model → cháy VRAM.
- **generate() block lâu**: sinh 500 token có thể mất vài giây. Trong thời gian đó worker
  đứng hình, không phục vụ ai khác.
- **Không tận dụng GPU**: GPU mạnh nhất khi xử lý **nhiều request cùng lúc** (batching).
  Chạy tuần tự từng request lãng phí phần lớn sức mạnh phần cứng.
- **Không quản lý được tài nguyên**: 10 request đến cùng lúc → 10 lần generate tranh VRAM →
  out-of-memory, sập.

> Nguyên tắc: **web app và model phải tách nhau.** Web app lo HTTP/auth/business logic;
> một **inference server** riêng lo việc chạy model và tối ưu GPU.

## Inference server: lớp đứng giữa

Inference server là process chuyên trách: load model **một lần** vào VRAM, mở một HTTP
endpoint, nhận nhiều request và **gộp (batch)** chúng để chạy trên GPU hiệu quả. App của bạn
chỉ gọi HTTP tới nó — y hệt cách trước đây gọi API của Anthropic.

```
[Web app] --HTTP--> [Inference server: vLLM/TGI] --> [Model trong VRAM của GPU]
   nhiều request         gộp batch, quản KV cache        chạy 1 lần cho cả batch
```

Việc khó (batching, KV cache, quản VRAM, streaming) do inference server lo. Bạn không tự
viết lại — dùng framework có sẵn.

| Framework | Hợp cho | Điểm mạnh | Lưu ý |
|-----------|---------|-----------|-------|
| **Ollama** | Local dev, thử nhanh, máy cá nhân | Cài 1 lệnh, chạy cả CPU/GPU, quản model tiện | Throughput thấp, không cho production tải cao |
| **vLLM** | Production GPU | Throughput cao nhờ continuous batching + PagedAttention | Cần GPU NVIDIA, cấu hình nhiều hơn |
| **TGI** (HF) | Production, hệ sinh thái HuggingFace | Ổn định, tích hợp HF Hub, có sẵn Docker image | Tương tự vLLM về yêu cầu GPU |
| **llama.cpp** | Máy yếu, CPU/Mac, model quantize | Chạy được không cần GPU, tiết kiệm RAM | Chậm hơn khi tải cao |

> Ở mức học và dev local, **Ollama** là điểm khởi đầu nhẹ nhất. Khi lên production có GPU
> thật, **vLLM** hoặc **TGI** là lựa chọn phổ biến.

## OpenAI-compatible API: chuẩn chung để đỡ khoá cứng

Điểm cực tiện: hầu hết inference server (vLLM, TGI, Ollama, LM Studio...) đều expose endpoint
**tương thích OpenAI API** (`/v1/chat/completions`). Nghĩa là code app của bạn gần như không
đổi — chỉ **trỏ `base_url`** sang server tự host.

```python
# Cài: pip install openai
from openai import OpenAI

# Trước: gọi OpenAI thật → chỉ cần đổi base_url + api_key sang server tự host
client = OpenAI(
    base_url="http://localhost:8000/v1",   # server vLLM/Ollama của mình
    api_key="not-needed-for-local",         # local thường không cần key thật
)

resp = client.chat.completions.create(
    model="meta-llama/Llama-3.1-8B-Instruct",   # tên model đã load trên server
    messages=[{"role": "user", "content": "Giải thích KV cache trong 1 câu."}],
)
print(resp.choices[0].message.content)
```

> Nhờ chuẩn OpenAI-compatible, bạn có thể phát triển với API thật rồi **chuyển sang self-host
> chỉ bằng đổi `base_url`** — không viết lại logic. Đây cũng là cách tránh vendor lock-in.

## Chạy thử: Ollama (local, nhẹ nhất)

```bash
# macOS/Linux: cài Ollama rồi kéo model về
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.1:8b          # kéo model (~4-5GB bản quantize)
ollama serve                     # chạy server ở http://localhost:11434

# Gọi thử qua HTTP (endpoint tương thích OpenAI ở /v1)
curl http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3.1:8b",
    "messages": [{"role": "user", "content": "Xin chào"}]
  }'
```

## Chạy thử: vLLM (production, cần GPU NVIDIA)

```bash
# Cách nhanh nhất: chạy bằng Docker (cần NVIDIA driver + nvidia-container-toolkit)
docker run --gpus all -p 8000:8000 \
  --ipc=host \
  vllm/vllm-openai:latest \
  --model meta-llama/Llama-3.1-8B-Instruct   # tự tải từ HuggingFace Hub

# Server mở endpoint OpenAI-compatible ở http://localhost:8000/v1
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "meta-llama/Llama-3.1-8B-Instruct",
       "messages": [{"role": "user", "content": "Ping"}]}'
```

> Đóng gói server bằng Docker giúp triển khai nhất quán giữa dev và production — chạy
> `/nta-docker-gen` để sinh Dockerfile/compose, và `/nta-infra-gen` để dựng hạ tầng GPU.

## Vì sao serving LLM khác serving model ML thường

Serving một model phân loại (nhận ảnh → ra nhãn) đơn giản: 1 input → 1 forward pass → 1
output, thời gian gần như cố định. LLM **không như vậy**, vì hai lý do:

**1. Autoregressive — sinh từng token một.** LLM không trả cả câu trong một lần tính. Nó
sinh **token đầu**, ghép lại vào input, sinh **token kế**, lặp lại tới khi xong. Trả lời 300
token = 300 vòng forward pass tuần tự. Nghĩa là:

- Thời gian phản hồi **không cố định** — phụ thuộc độ dài câu trả lời (không biết trước).
- Không thể trả kết quả "một phát"; thay vào đó thường **stream** từng token về (bài 29).

**2. KV cache — bộ nhớ trung gian phình theo độ dài.** Ở mỗi bước sinh token, model cần
"nhìn lại" toàn bộ token trước đó. Để khỏi tính lại từ đầu mỗi bước, nó lưu kết quả trung
gian gọi là **KV cache** trong VRAM. Cache này **lớn dần theo độ dài** hội thoại và **nhân
với số request đồng thời** — thường là thứ ăn VRAM nhiều nhất sau bản thân model.

> Hệ quả: quản lý serving LLM chủ yếu là **quản KV cache và batching động** — đúng thứ vLLM
> (PagedAttention) và TGI được sinh ra để giải. Bài 29 đi sâu vào cơ chế này.

Vì hai điểm trên, các mẹo serving model ML cổ điển (batch cố định, thời gian đều) không áp
dụng thẳng cho LLM. Đó là lý do cần framework chuyên dụng thay vì tự viết vòng lặp generate.

## Cạm bẫy hay gặp

- **Load model trong web handler** → mỗi worker nhân bản model, cháy VRAM; luôn tách
  inference server riêng.
- **Tưởng GPU nào cũng đủ** → model 8B cần ~16GB VRAM (bản FP16); chọn sai GPU là OOM ngay
  (bài 30 bàn kỹ).
- **Tự viết vòng lặp batching** → bỏ phí sức GPU và dễ OOM; dùng vLLM/TGI đã tối ưu sẵn.
- **Bỏ qua chuẩn OpenAI-compatible** → viết client riêng, khoá cứng vào một server; cứ dùng
  `base_url` để đổi backend không đau.
- **Dùng Ollama cho production tải cao** → throughput không đủ; Ollama hợp dev, không hợp
  phục vụ hàng nghìn request.

## Ghi nhớ

**Serving** là tách việc chạy model ra khỏi web app: web app lo HTTP/business, một
**inference server** riêng (vLLM/TGI cho production GPU, Ollama/llama.cpp cho local) load
model **một lần** và tối ưu GPU. Đừng bao giờ gọi `model.generate()` thẳng trong request
handler. Nhờ chuẩn **OpenAI-compatible API**, chuyển từ gọi API sang self-host chỉ là đổi
`base_url`. Serving LLM khó hơn serving model thường vì LLM **autoregressive** (sinh từng
token, thời gian không cố định, cần stream) và cần quản **KV cache** phình theo độ dài và số
request — đó là lý do phải dùng framework serving chuyên dụng, không tự viết. Bài 29 đào sâu
latency/throughput, bài 30 lo GPU và chi phí.
