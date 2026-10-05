---
level: "ai-adv-mlops"
order: 32
title: "Evaluation & CI/CD cho model"
est: "6-7 giờ"
checklist:
  - "Phân biệt được offline eval (bộ test cố định) với online eval (A/B, canary trên user thật)"
  - "Xây được một eval set cố định và chạy được nó tự động, ra một điểm số so sánh được"
  - "Viết được regression test chặn thay đổi làm model/prompt tệ đi so với baseline"
  - "Gắn được eval vào CI như một gate: điểm tụt dưới ngưỡng thì fail, chặn deploy"
  - "Giải thích được khi nào cần canary/A-B thay vì deploy thẳng, và đo gì để quyết định"
  - "Chỉ ra được vì sao 'đổi model mới hơn' không đảm bảo tốt hơn cho use case của mình"
related:
  - "glossary:llm"
  - "glossary:rag"
---

## Vì sao quan trọng

Bài 31 lo *xuất xứ* của model. Bài này lo **chất lượng** — và quan trọng hơn: **giữ chất
lượng không tụt khi bạn thay đổi**. Model lên production rồi vẫn liên tục bị chỉnh: đổi prompt,
đổi retrieval, nhà cung cấp ra model mới. Mỗi lần chỉnh là một cơ hội **làm tệ đi mà không ai
biết**, vì "chạy thử vài câu thấy ổn" không phải là đo lường.

Ở bài 12 bạn đã học **RAG evaluation** — đo một retrieval pipeline tốt cỡ nào. Bài này nâng
nó lên **tầng pipeline**: biến eval thành thứ **chạy tự động trong CI**, thành **cổng gác
(gate) chặn deploy**, và nối với **A/B test, canary** trên production. Đây là chỗ ML gặp
software engineering: **không có test tự động thì không có "an toàn khi đổi".**

## Offline eval: một bộ test cố định, một điểm số

**Offline eval** là chạy model trên một **bộ test cố định** (eval set) đã có đáp án/kỳ vọng,
rồi tính ra một hoặc vài **con số so sánh được**. "Cố định" là từ khóa: eval set không đổi thì
điểm mới so sánh được giữa các version.

Một eval set là danh sách case, mỗi case có `input` và một cách *chấm*:

```python
# Python 3.12+ — eval set + runner tối giản, ra một điểm số so sánh được giữa các version.
from dataclasses import dataclass
from collections.abc import Callable

@dataclass
class Case:
    id: str
    input: str
    check: Callable[[str], bool]   # trả True nếu output đạt

def contains(*keywords: str) -> Callable[[str], bool]:
    # Chấm bằng luật đơn giản, tất định — hợp cho câu hỏi có đáp án rõ.
    return lambda out: all(k.lower() in out.lower() for k in keywords)

EVAL_SET = [
    Case("refund-window", "Chính sách hoàn tiền trong bao lâu?", contains("14 ngày")),
    Case("no-info",       "CEO công ty tên gì?",                 contains("không tìm thấy")),
    Case("shipping-fee",  "Phí ship nội thành?",                 contains("miễn phí")),
]

def run_eval(answer_fn: Callable[[str], str]) -> dict:
    """answer_fn: hàm gọi model/RAG của bạn. Trả về score + case fail để soi."""
    results = [(c.id, c.check(answer_fn(c.input))) for c in EVAL_SET]
    passed = sum(ok for _, ok in results)
    return {
        "score": passed / len(results),                 # 0..1, so sánh được
        "failed": [cid for cid, ok in results if not ok],
    }
```

Cách **chấm** tuỳ loại task:

- **Rule-based** (regex, chứa keyword, so khớp chính xác): nhanh, rẻ, tất định — dùng cho câu
  có đáp án rõ, như eval set trên.
- **LLM-as-judge**: dùng một LLM chấm output theo tiêu chí ("có bám context không?", "có lịch
  sự không?"). Mạnh cho câu mở, nhưng bản thân judge cũng có sai số — cần cố định model + prompt
  chấm để điểm ổn định.
- **Metric có sẵn cho RAG** (bài 12): faithfulness, answer relevancy, context precision.

> Eval set phải phủ **cả case khó và case "phải nói không biết"**. Model bịa trôi chảy vẫn
> fail nếu eval set có case đáp án đúng là "không tìm thấy thông tin".

## Regression test: đổi không được làm tệ đi

Đây là ý tưởng trung tâm của cả bài. Trong phần mềm, **regression** = thay đổi làm hỏng thứ
đang chạy tốt. Với model cũng vậy: sửa prompt để câu A tốt hơn, vô tình làm câu B, C tệ đi.

**Regression test** = so điểm eval của version mới với một **baseline** đã chốt. Không cần
điểm tuyệt đối cao — cần **không tụt so với baseline**:

```python
import json
from pathlib import Path

BASELINE = Path("eval/baseline.json")   # điểm của version đang chạy tốt, đã commit

def check_regression(answer_fn, tolerance: float = 0.0) -> tuple[bool, str]:
    current = run_eval(answer_fn)
    if not BASELINE.exists():
        BASELINE.write_text(json.dumps(current, indent=2))
        return True, "Chưa có baseline — đã ghi baseline đầu tiên."

    base = json.loads(BASELINE.read_text())
    drop = base["score"] - current["score"]
    if drop > tolerance:                # tệ đi quá ngưỡng cho phép → chặn
        newly = set(current["failed"]) - set(base["failed"])
        return False, (f"REGRESSION: {base['score']:.2f} → {current['score']:.2f}. "
                       f"Case vừa hỏng: {sorted(newly)}")
    return True, f"OK: {base['score']:.2f} → {current['score']:.2f}"
```

Baseline được **commit vào repo** (như một snapshot chất lượng) và chỉ *cập nhật có chủ đích*
khi bạn xác nhận version mới thật sự tốt hơn — không phải tự động ghi đè mỗi lần chạy.

## Eval trong CI: biến điểm số thành cổng gác deploy

Chạy eval bằng tay thì sẽ quên. Sức mạnh thật là **gắn nó vào CI**: mỗi PR đổi prompt/model/
retrieval → CI tự chạy eval → **điểm tụt dưới ngưỡng thì fail check → chặn merge/deploy**.
Đây là "gate": deploy chỉ đi qua nếu chất lượng không thụt lùi.

```yaml
# .github/workflows/eval.yml — chạy eval như một CI gate cho mỗi PR
name: model-eval
on: [pull_request]

jobs:
  eval:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install -r requirements.txt
      - name: Run eval + regression gate
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        # Script gọi check_regression(); exit code != 0 khi tụt điểm → CI fail → chặn deploy
        run: python -m eval.gate
```

**Lưu ý eval LLM khác test phần mềm thường**: output không tất định và eval gọi API tốn tiền/
thời gian. Nên: chạy eval **đủ lớn để có ý nghĩa thống kê** nhưng cache/giới hạn để CI không
đắt; đặt `temperature=0` khi có thể để giảm nhiễu; chấp nhận một **ngưỡng dung sai** thay vì đòi
điểm khớp tuyệt đối.

## "Model mới hơn" không tự động tốt hơn

Cạm bẫy lớn của LLMOps: nhà cung cấp ra model mới (`sonnet-4` → `4.5`), bạn nâng version nghĩ
"chắc chắn xịn hơn". **Không đảm bảo cho use case của bạn** — model mới có thể giỏi hơn nói
chung nhưng đổi format output, đổi độ dài, tuân prompt cũ khác đi, làm hỏng parsing hoặc RAG
grounding của bạn. **Cách duy nhất để biết là chạy eval set của bạn qua model mới và so điểm.**
Đây chính là lý do eval set + regression test tồn tại: mọi thay đổi — kể cả "nâng cấp" — đều
phải qua gate.

## Online eval: canary & A/B trên user thật

Offline eval tốt nhưng eval set không bao giờ phủ hết thực tế. **Online eval** đo trên
production, thật thận trọng:

| Chiến lược | Ý tưởng | Dùng khi | Đo gì để quyết định |
|-----------|---------|----------|---------------------|
| **Canary** | Cho version mới phục vụ **% nhỏ** traffic (5%), theo dõi rồi mới mở rộng | Mọi deploy có rủi ro | Error rate, latency, cost, tín hiệu chất lượng — so với phần còn lại |
| **A/B test** | Chia traffic giữa 2 version, so **chỉ số nghiệp vụ** trên nhóm đủ lớn | Chọn giữa 2 phương án ngang ngửa | Metric business (tỉ lệ giải quyết, thumbs-up, conversion) |
| **Shadow** | Chạy version mới **song song, không trả cho user**, chỉ ghi log để so | Muốn so an toàn tuyệt đối trước khi cho chạm user | So output/latency với version hiện tại |

Trình tự an toàn điển hình: **offline eval pass gate → deploy canary % nhỏ → theo dõi metric
(bài 33) → tăng dần → 100%**. Nếu canary xấu → **rollback tự động**. Đừng bao giờ nhảy thẳng
từ "chạy thử vài câu" lên "100% traffic".

## Cạm bẫy hay gặp

- **Không có eval set cố định** → mọi "cải tiến" chỉ là cảm giác; không so sánh được version.
- **Eval set thiếu case "phải nói không biết"** → model bịa trôi chảy vẫn qua, đo sai chất lượng.
- **Nâng model mới không chạy lại eval** → tưởng tốt hơn, thực ra hỏng format/grounding.
- **Baseline tự động ghi đè mỗi lần chạy** → regression trôi dần, mất luôn mốc so sánh.
- **Deploy thẳng 100%, không canary** → lỗi chạm toàn bộ user cùng lúc, không kịp rollback.
- **Eval trong CI quá đắt/chậm** → team tắt nó đi; phải cân kích thước eval set với chi phí.

## Ghi nhớ

Model lên prod vẫn liên tục bị đổi — mỗi lần đổi là cơ hội **làm tệ đi mà không ai biết**.
**Offline eval** = chạy một **eval set cố định** rồi ra **điểm số so sánh được**, chấm bằng
rule/LLM-as-judge/metric RAG (bài 12), phủ cả case khó lẫn case "phải nói không biết".
**Regression test** so điểm mới với **baseline đã commit** — yêu cầu **không tụt**, không đòi
điểm tuyệt đối. Gắn eval vào **CI làm gate**: tụt dưới ngưỡng thì **fail, chặn deploy**.
**"Model mới hơn" không tự động tốt hơn** — phải chạy eval set của bạn qua nó rồi so. Trên
production dùng **canary** (% nhỏ trước), **A/B** (so metric nghiệp vụ), **shadow** (chạy song
song không trả user), luôn kèm **rollback**. Nguyên tắc: **mọi thay đổi, kể cả nâng cấp, đều
phải qua gate — không có test tự động thì không có an toàn khi đổi.**
