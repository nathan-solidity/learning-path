---
level: "ai-adv-mlops"
order: 33
title: "Monitoring & LLMOps pipeline"
est: "6-7 giờ"
checklist:
  - "Kể được bốn nhóm metric production cần track: latency, cost, error, token"
  - "Phân biệt được drift với quality degradation và biết dấu hiệu phát hiện mỗi loại"
  - "Thu thập được feedback người dùng (thumbs up/down) và nối nó về đúng request đã log"
  - "Chỉ ra được khi nào cần human-in-the-loop review thay vì để model tự chạy"
  - "Mô tả được vòng lặp cải thiện liên tục: log → phát hiện → sửa → eval → deploy"
  - "Dựng được guardrails ở runtime chặn input/output xấu ngay tại thời điểm phục vụ"
related:
  - "glossary:llm"
  - "glossary:hallucination"
---

## Vì sao quan trọng

Bài 32 chặn regression *trước khi* deploy. Nhưng offline eval không bao giờ phủ hết thực tế:
user hỏi kiểu bạn chưa từng nghĩ tới, phân bố câu hỏi trôi theo thời gian, model nhà cung cấp
âm thầm đổi. **Cái gì không đo được ở production thì bạn không biết nó đang hỏng.**

Đây là bài khép vòng của cả cấp MLOps/LLMOps: model đã lên prod, giờ ta **quan sát nó sống**,
**bắt lỗi khi nó xuống cấp**, **học từ người dùng**, và **quay lại cải thiện** — biến deployment
một chiều thành một **vòng lặp cải thiện liên tục**. Đây là thứ phân biệt "đã deploy một lần"
với "vận hành một sản phẩm AI".

## Bốn nhóm metric phải track ở production

App LLM có những metric mà app thường không có (token, cost per call). Tối thiểu track bốn nhóm:

| Nhóm | Đo gì | Vì sao quan trọng |
|------|-------|-------------------|
| **Latency** | Thời gian mỗi request; theo dõi **p50/p95/p99**, cả **time-to-first-token** nếu stream | p99 tệ = một phần user chịu trải nghiệm xấu; trung bình che mất điều này |
| **Cost** | Token in/out × giá, **theo request và theo ngày** | LLM tính tiền theo token; một bug prompt có thể đốt tiền âm thầm |
| **Error** | Tỉ lệ lỗi: rate limit, timeout, model trả rỗng/hỏng format, guardrail chặn | Phân loại lỗi để biết sửa ở đâu (retry? đổi prompt? chặn?) |
| **Token** | Số token in/out mỗi call, phân bố | Token tăng bất thường = prompt phình, context injection lỗi, hoặc bị abuse |

```python
# Python 3.12+ — log mỗi request đủ 4 nhóm metric + đủ thông tin để nối feedback về sau.
import time, json, uuid
from pathlib import Path

LOG = Path("logs/requests.jsonl")
LOG.parent.mkdir(exist_ok=True)
PRICE = {"in": 3e-6, "out": 15e-6}   # $/token, tuỳ model — đọc từ config, đừng hard-code rải rác

def observe(call_fn, prompt_version: str, model: str, user_input: str) -> dict:
    """Bọc quanh lời gọi LLM để tự log. call_fn trả (text, tokens_in, tokens_out)."""
    req_id = str(uuid.uuid4())
    t0 = time.perf_counter()
    error = None
    try:
        text, tin, tout = call_fn(user_input)
    except Exception as e:
        text, tin, tout, error = "", 0, 0, type(e).__name__
        raise
    finally:
        latency_ms = (time.perf_counter() - t0) * 1000
        cost = tin * PRICE["in"] + tout * PRICE["out"]
        LOG.open("a").write(json.dumps({
            "req_id": req_id,                  # khoá để feedback nối về (xem phần dưới)
            "ts": time.time(),
            "model": model, "prompt_version": prompt_version,
            "latency_ms": round(latency_ms, 1),
            "tokens_in": tin, "tokens_out": tout, "cost_usd": round(cost, 6),
            "error": error,
        }) + "\n")
    return {"req_id": req_id, "answer": text}
```

> Ghi kèm **`prompt_version` và `model`** vào mỗi log là bắt buộc trong LLMOps: khi metric xấu
> đi, bạn cần biết *version nào* gây ra — nối thẳng về versioning ở bài 31.

## Drift vs quality degradation: hai kiểu "xuống cấp" khác nhau

Model không tự nhiên hỏng, nhưng chất lượng vẫn tụt theo thời gian vì hai nguyên nhân khác nhau
— cần phân biệt vì cách phát hiện và xử lý khác nhau:

- **Drift (trôi phân bố)**: *input thay đổi*, model đứng yên. User bắt đầu hỏi chủ đề mới, dùng
  từ mới, ngôn ngữ mới mà eval set cũ không phủ. Dấu hiệu: phân bố độ dài/chủ đề câu hỏi lệch
  dần, tỉ lệ "không tìm thấy thông tin" tăng (RAG), token trung bình đổi. → **Cập nhật eval set
  và có thể cả tài liệu/retrieval** cho khớp thực tế mới.

- **Quality degradation (chất lượng tụt)**: *chất lượng câu trả lời* xấu đi dù input không đổi
  mấy. Nguyên nhân: nhà cung cấp âm thầm đổi model sau version, prompt vừa sửa gây regression lọt
  qua gate, tài liệu RAG cũ/mâu thuẫn. Dấu hiệu: feedback tiêu cực tăng, tỉ lệ escalation tăng,
  điểm eval định kỳ tụt. → **Điều tra version nào đổi, chạy lại eval (bài 32), rollback nếu cần.**

> Cả hai đều **vô hình nếu chỉ nhìn latency/error** — request vẫn 200 OK, vẫn nhanh, nhưng
> *câu trả lời sai/lạc*. Muốn bắt được phải đo **chất lượng**, không chỉ đo hệ thống → cần
> feedback và eval định kỳ (dưới đây).

## Thu thập feedback: biến người dùng thành nguồn dữ liệu

Cách rẻ và mạnh nhất để đo chất lượng thật là hỏi chính user. **Thumbs up/down** cạnh mỗi câu
trả lời, gắn về `req_id` đã log ở trên:

```python
FEEDBACK = Path("logs/feedback.jsonl")

def record_feedback(req_id: str, vote: str, comment: str = "") -> None:
    # vote: "up" | "down". Nối về request qua req_id → sau này join với logs/requests.jsonl
    # để biết prompt_version/model nào bị chê, và trích ra làm case eval mới.
    assert vote in {"up", "down"}
    FEEDBACK.open("a").write(json.dumps(
        {"req_id": req_id, "vote": vote, "comment": comment, "ts": time.time()}) + "\n")
```

Giá trị thật không chỉ ở tỉ lệ hài lòng, mà ở chỗ: **mỗi câu bị thumbs-down là một case eval
tương lai**. Gom câu bị chê → thành eval set mới → sửa prompt/retrieval để chúng pass → chạy
regression gate (bài 32) → deploy. Đó là cách feedback *đóng vòng* vào cải thiện, không chỉ nằm
trong dashboard.

## Human-in-the-loop: khi nào không để model tự chạy

Không phải quyết định nào cũng nên giao trọn cho model. **Human-in-the-loop (HITL)** đặt người
vào vòng ở những chỗ rủi ro cao:

- **Trước hành động rủi ro**: model *đề xuất*, người *duyệt* trước khi thực thi (gửi email, hoàn
  tiền, xoá dữ liệu). Nối lại với bài Agent: tool có tác dụng phụ nặng phải cần xác nhận.
- **Review theo mẫu**: người chấm định kỳ một *mẫu* output production để bắt lỗi mà metric tự
  động không thấy — nguồn tín hiệu quality degradation đáng tin.
- **Xử lý case model từ chối/không chắc**: khi model nói "không biết" hoặc confidence thấp →
  chuyển cho người (escalation).

Đánh đổi: HITL an toàn hơn nhưng chậm và tốn người. Nguyên tắc — **rủi ro/chi phí sai càng cao
thì càng cần người**; câu hỏi FAQ vô hại thì để model tự chạy, thao tác động tiền/dữ liệu thì chặn.

## Guardrails ở runtime: chặn ngay tại thời điểm phục vụ

Eval (bài 32) bắt lỗi *trước* deploy. **Guardrails** bảo vệ *ngay lúc chạy*, trên từng request:

- **Input guardrails**: lọc prompt injection, off-topic, PII trước khi đưa vào model (nối bài AI
  Security). Chặn sớm rẻ hơn xử lý output xấu.
- **Output guardrails**: kiểm tra câu trả lời *trước khi trả cho user* — đúng format (bài 5)?
  có PII rò rỉ? có bịa nguồn không có thật (RAG, bài 9)? vi phạm policy?
- **Xử lý khi vi phạm**: chặn và trả câu an toàn, hoặc retry, hoặc escalate cho người (HITL) —
  và **log lại** như một loại error để theo dõi.

```python
def output_guardrail(answer: str, allowed_sources: set[str]) -> tuple[bool, str]:
    """Ví dụ: chặn RAG bịa nguồn không nằm trong tài liệu thật (chống hallucination lộ liễu)."""
    import re
    cited = set(re.findall(r"\[source:\s*([^\]]+)\]", answer))
    fake = cited - allowed_sources
    if fake:
        return False, f"BLOCKED: trích nguồn không tồn tại: {sorted(fake)}"
    return True, answer
```

## Vòng lặp cải thiện liên tục

Ghép tất cả lại, LLMOps là một **vòng lặp**, không phải đường thẳng "deploy xong là hết":

1. **Serve + log** — mỗi request log đủ 4 metric + prompt_version/model (guardrails chạy tại đây).
2. **Observe** — dashboard metric + feedback; alert khi latency/cost/error/tỉ lệ down vượt ngưỡng.
3. **Detect** — phân biệt drift (input đổi) vs degradation (chất lượng tụt) qua metric + eval định kỳ.
4. **Collect & diagnose** — gom câu thumbs-down + mẫu HITL review thành eval case mới.
5. **Improve** — sửa prompt/retrieval/tài liệu, hoặc rollback version xấu.
6. **Re-eval & gate** — chạy eval set (đã bổ sung case mới) qua regression gate (bài 32).
7. **Deploy** — canary → theo dõi metric ở bước 1 → mở rộng. Vòng lặp quay lại đầu.

> Chỗ nối quan trọng: **feedback và HITL review ở production trở thành eval case** cho lần sau,
> nên eval set *lớn dần theo thực tế* thay vì đứng yên — đó là cách hệ thống *học* từ vận hành.

## Cạm bẫy hay gặp

- **Chỉ đo latency/error, không đo chất lượng** → model trả sai vẫn "200 OK, nhanh"; hỏng mà không biết.
- **Không log prompt_version/model** → metric xấu đi mà không truy được version nào gây ra.
- **Nhìn latency trung bình** → che mất p99; một phần user chịu trải nghiệm tệ mà bạn không thấy.
- **Thu feedback nhưng không nối về request/không dùng lại** → dashboard đẹp, chẳng cải thiện gì.
- **Không có guardrail output** → prompt injection/PII/bịa nguồn lọt thẳng tới user.
- **Coi deploy là điểm kết** → không có vòng lặp; drift và degradation tích tụ đến khi user bỏ đi.

## Ghi nhớ

Offline eval không phủ hết thực tế — **cái gì không đo ở production thì bạn không biết nó hỏng**.
Track tối thiểu **bốn nhóm metric: latency (p95/p99), cost, error, token**, và **luôn log kèm
prompt_version + model** để truy version khi metric xấu. Phân biệt **drift** (input đổi → cập
nhật eval set/retrieval) với **quality degradation** (chất lượng tụt → điều tra version, rollback)
— cả hai **vô hình nếu chỉ nhìn hệ thống**, phải đo **chất lượng** qua **feedback (thumbs up/down
nối về req_id)** và eval định kỳ. Đặt **human-in-the-loop** ở chỗ rủi ro cao (duyệt hành động,
review mẫu, xử lý escalation). Dựng **guardrails runtime** lọc input/output ngay lúc phục vụ.
Ghép lại thành **vòng lặp cải thiện liên tục**: **log → observe → detect → collect → improve →
re-eval qua gate → canary deploy → lặp lại** — trong đó **feedback và HITL review trở thành eval
case mới**, để hệ thống *học từ vận hành* thay vì đứng yên sau lần deploy đầu.
