---
level: "ai-adv-serving"
order: 29
title: "Latency và throughput: tối ưu inference"
est: "6-7 giờ"
checklist:
  - "Phân biệt được prefill và decode, và biết vì sao chúng chi phối latency"
  - "Giải thích được KV cache tăng tốc decode ra sao và tại sao nó ăn VRAM"
  - "Nêu được continuous/dynamic batching khác static batching thế nào và vì sao nó tăng throughput"
  - "Đo được TTFT và tokens/sec của một endpoint bằng script curl/Python"
  - "Giải thích được đánh đổi latency vs throughput và chỉnh batch size theo mục tiêu"
  - "Bật được streaming để giảm TTFT cảm nhận và biết khi nào nên/không nên dùng"
related:
  - "glossary:llm"
  - "skill:nta-load-test-plan"
  - "skill:nta-perf-audit"
---

## Vì sao quan trọng

Bài 28 dựng được server chạy. Nhưng "chạy được" khác "chạy tốt": một server có thể trả lời
nhanh cho 1 người nhưng sập khi 50 người vào, hoặc phục vụ được nhiều người nhưng ai cũng
phải chờ lâu. Đây là bài **kỹ sư hoá** việc serving: hiểu hai số đo cốt lõi — **latency**
(nhanh với một người) và **throughput** (phục vụ được bao nhiêu người) — cách chúng đánh đổi
nhau, và những cơ chế (batching, KV cache, streaming) mà inference server dùng để tối ưu.

## Hai số đo bạn phải nắm

- **Latency** — độ trễ với **một request**. Với LLM tách làm hai:
  - **TTFT** (Time To First Token): từ lúc gửi tới lúc token **đầu tiên** về. Đây là "cảm
    giác nhanh" của người dùng.
  - **TPOT/ITL** (Time Per Output Token / inter-token latency): thời gian giữa mỗi token
    sau đó. Quyết định tốc độ chữ chạy ra khi stream.
- **Throughput** — tổng **tokens/sec** hệ thống xử lý được cho **tất cả** request đồng thời.
  Đây là số quyết định chi phí (bài 30): throughput cao = mỗi token rẻ hơn.

> Latency là góc nhìn của **một người dùng**; throughput là góc nhìn của **cả hệ thống**.
> Tối ưu cái này thường phải hy sinh cái kia — mấu chốt của cả bài.

## Prefill vs decode: hai pha rất khác nhau

Nhớ từ bài 28: LLM sinh **từng token một**. Nhưng quá trình chia làm hai pha có đặc tính
tính toán khác hẳn:

| Pha | Làm gì | Đặc tính | Ảnh hưởng |
|-----|--------|----------|-----------|
| **Prefill** | Xử lý **toàn bộ prompt** trong một lượt để tạo token đầu | Tính song song, nặng compute, chạy 1 lần | Quyết định **TTFT** |
| **Decode** | Sinh **từng token tiếp theo**, mỗi bước 1 token | Tuần tự, nặng băng thông bộ nhớ, lặp nhiều lần | Quyết định **TPOT** và tổng thời gian |

Hệ quả thực tế:

- Prompt **dài** → prefill lâu → **TTFT cao**. (RAG nhồi nhiều context sẽ chậm ở đây.)
- Câu trả lời **dài** → nhiều bước decode → tổng thời gian lâu, nhưng TTFT không đổi.
- Prefill "đói" compute; decode "đói" băng thông bộ nhớ — nên GPU khác nhau tối ưu khác nhau.

## KV cache: vì sao decode không tính lại từ đầu

Ở mỗi bước decode, model cần "nhìn lại" mọi token trước đó. Nếu mỗi bước tính lại toàn bộ từ
đầu thì độ phức tạp bùng nổ. **KV cache** giải: lưu lại các giá trị trung gian (Key/Value)
của những token đã xử lý, để bước sau **chỉ tính cho token mới** rồi tra cache cho phần cũ.

- Đây là lý do decode nhanh hơn nhiều so với "prefill lại mỗi bước".
- **Cái giá**: KV cache nằm trong VRAM, **lớn dần theo độ dài** context và **nhân với số
  request đồng thời**. Đây thường là thứ giới hạn *bao nhiêu request chạy song song được* —
  hết chỗ cho KV cache thì không nhận thêm request, dù GPU còn dư compute.

> vLLM nổi tiếng nhờ **PagedAttention** — quản KV cache như phân trang bộ nhớ hệ điều hành,
> giảm phí phạm và nhồi được nhiều request đồng thời hơn → throughput cao hơn.

## Batching: chìa khoá của throughput

GPU mạnh nhất khi làm **nhiều việc song song**. Chạy tuần tự từng request lãng phí phần lớn
sức. Batching = gộp nhiều request chạy chung một lượt.

**Static batching** (kiểu ML cổ điển): gom đủ N request rồi mới chạy, và **cả batch phải chờ
request dài nhất xong**. Với LLM (độ dài output rất lệch nhau) cách này tệ: request 10 token
xong sớm vẫn phải chờ request 500 token, GPU ngồi không.

**Continuous / dynamic batching** (vLLM, TGI dùng): quản batch ở mức **từng bước decode**.
Request nào **xong** thì rời batch ngay, giải phóng chỗ; request **mới** đến được **chèn vào**
batch đang chạy mà không phải đợi. GPU luôn bận, không có chỗ trống chờ đợi.

```
Static:      [req A ====][req B ==========][req C ===]   ← cả batch chờ B xong
Continuous:  [A xong→ chèn D][B chạy tiếp][C xong→ chèn E]  ← lấp đầy liên tục
```

> Continuous batching là lý do chính vLLM/TGI có throughput cao hơn nhiều so với tự viết
> vòng lặp generate. Bạn không cấu hình thủ công — chọn framework đúng là được.

## Đánh đổi latency vs throughput

Đây là căng thẳng trung tâm. Nhồi **batch lớn** → GPU xử lý nhiều token/giây → **throughput
cao**, nhưng mỗi request phải chia sẻ GPU với nhiều request khác → **latency từng request
tăng**. Ngược lại batch nhỏ → mỗi người nhanh nhưng phục vụ được ít người, mỗi token đắt.

| Mục tiêu | Chỉnh hướng | Đánh đổi |
|----------|-------------|----------|
| Chatbot realtime (ưu tiên latency) | batch nhỏ hơn, giới hạn concurrency | throughput thấp, chi phí/token cao |
| Xử lý hàng loạt (ưu tiên throughput) | batch lớn, để hàng đợi đầy | latency từng request cao, rẻ/token |

> Không có cấu hình "đúng" tuyệt đối — chọn theo **SLA sản phẩm**. Đo trước, đừng đoán:
> dựng load test bằng `/nta-load-test-plan` để tìm điểm cân bằng, `/nta-perf-audit` để soi
> bottleneck.

## Đo TTFT và tokens/sec

Không đo thì không tối ưu được. Bật streaming để bắt được **thời điểm token đầu tiên**.

```python
# Cài: pip install openai
import time
from openai import OpenAI

client = OpenAI(base_url="http://localhost:8000/v1", api_key="x")

start = time.time()
first_token_at = None
n_tokens = 0

stream = client.chat.completions.create(
    model="meta-llama/Llama-3.1-8B-Instruct",
    messages=[{"role": "user", "content": "Viết 200 từ về KV cache."}],
    stream=True,                       # bật streaming để đo TTFT
)
for chunk in stream:
    delta = chunk.choices[0].delta.content
    if delta:
        if first_token_at is None:
            first_token_at = time.time()   # token đầu tiên về
        n_tokens += 1

end = time.time()
ttft = first_token_at - start
tps = n_tokens / (end - first_token_at)    # tokens/sec ở pha decode
print(f"TTFT: {ttft*1000:.0f} ms | tokens/sec: {tps:.1f} | tổng: {n_tokens} token")
```

Đo TTFT/tokens/sec **khi có tải** (nhiều client đồng thời) mới ra con số thật cho production
— một client đơn lẻ luôn cho số đẹp giả tạo. Đó là việc của load test.

## Streaming: giảm TTFT cảm nhận

Vì LLM sinh token tuần tự, thay vì chờ **cả câu** rồi trả một cục, hãy **stream** từng token
về ngay khi có. Tổng thời gian không đổi, nhưng người dùng **thấy chữ chạy ngay** → cảm giác
nhanh hơn hẳn. Đây là cách rẻ nhất để cải thiện trải nghiệm.

- **Nên dùng** cho chatbot, UI hội thoại — nơi TTFT cảm nhận quan trọng.
- **Không hợp** khi bạn cần **cả output hoàn chỉnh** trước khi xử lý tiếp (parse JSON, validate,
  gọi tool dựa trên toàn bộ kết quả) — stream chẳng lợi gì mà còn phức tạp hơn.

## Cạm bẫy hay gặp

- **Đo latency với một client** → số đẹp giả; luôn đo dưới tải đồng thời thật.
- **Lẫn TTFT với tổng thời gian** → tối ưu nhầm; prompt dài giết TTFT, output dài giết tổng.
- **Dùng static batching cho LLM** → request ngắn chờ request dài, GPU nằm không; cần
  continuous batching (vLLM/TGI).
- **Nhồi context khổng lồ mà than TTFT cao** → prefill nặng theo độ dài prompt; cắt bớt
  context (RAG chọn lọc, bài 9-15) thay vì đổ tội cho GPU.
- **Bỏ streaming ở chatbot** → người dùng chờ màn hình trắng vài giây dù backend không chậm hơn.

## Ghi nhớ

Serving LLM cân giữa **latency** (nhanh cho một người: **TTFT** = token đầu, **TPOT** = mỗi
token sau) và **throughput** (tokens/sec cho cả hệ thống, quyết định chi phí). Sinh token
chia hai pha: **prefill** xử lý cả prompt → quyết định TTFT (prompt dài → TTFT cao);
**decode** sinh từng token → quyết định tổng thời gian, tăng tốc nhờ **KV cache** (đổi lại
ăn VRAM, phình theo độ dài × số request). **Continuous batching** (vLLM/TGI) cho GPU luôn
bận, tăng throughput vượt xa static batching. Batch lớn → throughput cao nhưng latency từng
request tăng — **đánh đổi**, chọn theo SLA. **Đo** TTFT/tokens/sec dưới tải thật trước khi
chỉnh, và bật **streaming** ở chatbot để giảm TTFT cảm nhận.
