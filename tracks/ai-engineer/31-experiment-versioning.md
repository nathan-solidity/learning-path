---
level: "ai-adv-mlops"
order: 31
title: "Experiment tracking & versioning"
est: "6-7 giờ"
checklist:
  - "Giải thích được vì sao 'chạy được trên máy tôi' là không đủ và cần reproducibility"
  - "Log được một experiment đầy đủ: params, metrics, artifact, code version, môi trường"
  - "So sánh được nhiều run để chọn cấu hình tốt nhất thay vì đoán bằng trí nhớ"
  - "Version được cả model VÀ dataset, không chỉ code — biết run nào ăn dataset nào"
  - "Dùng được model registry để tách 'model đang thử' khỏi 'model lên production'"
  - "Chỉ ra được đâu là 'model' trong LLMOps (prompt/dataset) và version chúng như code"
related:
  - "glossary:llm"
  - "glossary:fine-tuning"
  - "skill:nta-git-workflow"
---

## Vì sao quan trọng

Model lên production **không phải là hết việc** — đó mới là lúc vòng đời bắt đầu. Ba cấp
Nâng cao trước dạy bạn *train* và *serve* model; cấp này dạy **quản lý vòng đời** đó theo
quy trình để nó không sập, không trôi, và luôn tái lập được.

Bài đầu tiên trả lời câu hỏi gốc: **"Model này từ đâu ra?"** Ba tháng sau khi một model
chạy tốt, ai đó hỏi bạn train nó bằng data nào, hyperparameter gì, commit nào — nếu không
trả lời được thì bạn không *sở hữu* model đó, bạn chỉ *nhặt được* nó. Experiment tracking
và versioning biến một đống file `model_final_v2_real.pt` thành một hệ thống tra được.

## Reproducibility: "chạy được trên máy tôi" là không đủ

Một kết quả ML tái lập được (**reproducible**) khi người khác — hoặc chính bạn sáu tháng
sau — chạy lại ra **cùng model, cùng metric**. Muốn vậy phải ghim đủ **năm** thứ:

| Yếu tố | Nếu không ghim | Cách ghim |
|--------|----------------|-----------|
| Code | Không biết logic nào tạo ra model | Git commit hash |
| Data | Cùng code + data khác → model khác | Version/hash dataset |
| Hyperparameters | Đổi lr/epoch → kết quả khác | Log params mỗi run |
| Môi trường | Đổi version thư viện → số khác | Ghim `requirements`/lockfile |
| Randomness | Mỗi lần chạy ra số khác | Set seed cố định |

> Bỏ sót *một* trong năm là đủ để "không tái lập được". Phổ biến nhất là quên **data** và
> **seed** — hai thứ vô hình nhất.

```python
# Python 3.12+ — set seed để loại bỏ randomness (điều kiện cần của reproducibility)
import os, random, numpy as np, torch

def set_seed(seed: int = 42) -> None:
    os.environ["PYTHONHASHSEED"] = str(seed)
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    # Đánh đổi tốc độ lấy tính tất định trên GPU
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False

set_seed(42)   # gọi TRƯỚC khi khởi tạo model/dataloader
```

## Experiment tracking: đừng ghi kết quả vào trí nhớ

Khi thử nghiệm, bạn chạy hàng chục **run** với params khác nhau. Ghi tay vào file Excel là
thảm họa — sẽ sai, sẽ thiếu. **Experiment tracking** (pattern của MLflow, Weights & Biases)
là: mỗi run tự động log lại **params + metrics + artifact + code version**, rồi cho bạn một
dashboard so sánh.

Một run cần log tối thiểu:

- **Params**: mọi thứ bạn *chọn* — learning rate, batch size, model size, seed.
- **Metrics**: mọi thứ đo được — loss, accuracy, F1... log **theo từng step/epoch** để vẽ
  đường cong, không chỉ số cuối.
- **Artifacts**: file sinh ra — model weights, biểu đồ, sample output.
- **Metadata**: git commit, thời gian, tên người chạy, dataset version.

```python
# Pattern experiment tracking — API cụ thể tùy công cụ (MLflow/W&B), ý tưởng giống nhau:
# start_run() → log_params() → vòng train log_metric() → log_artifact() → end_run()
import subprocess, json, time
from pathlib import Path

def git_commit() -> str:
    # Ghim đúng version code tạo ra run này
    return subprocess.check_output(["git", "rev-parse", "HEAD"]).decode().strip()

class RunTracker:
    """Tracker tối giản, minh hoạ đủ 4 nhóm cần log. Production dùng MLflow/W&B thay chỗ này."""
    def __init__(self, run_dir: str):
        self.dir = Path(run_dir); self.dir.mkdir(parents=True, exist_ok=True)
        self.meta = {"commit": git_commit(), "started": time.time()}
        self.params: dict = {}
        self.metrics: list[dict] = []

    def log_params(self, **kw):            # thứ mình chọn
        self.params.update(kw)

    def log_metric(self, step: int, **kw): # thứ đo được, theo step
        self.metrics.append({"step": step, **kw})

    def log_artifact(self, src: Path):     # file sinh ra
        (self.dir / src.name).write_bytes(src.read_bytes())

    def finish(self):
        (self.dir / "run.json").write_text(json.dumps(
            {"meta": self.meta, "params": self.params, "metrics": self.metrics}, indent=2))

run = RunTracker("runs/exp-001")
run.log_params(lr=3e-4, batch_size=32, epochs=3, seed=42, dataset="reviews-v2")
for epoch in range(3):
    train_loss = 0.5 / (epoch + 1)         # giả lập
    run.log_metric(step=epoch, train_loss=train_loss, val_acc=0.7 + epoch * 0.05)
run.finish()
```

> Điểm mấu chốt không phải công cụ nào — mà là **mọi run đều được log tự động, gắn với commit
> và dataset version**. Chạy tay không log = kết quả biến mất khi bạn đóng terminal.

## So sánh run: chọn bằng số, không bằng cảm giác

Khi đã log nhiều run, dashboard cho bạn **so sánh** — sắp theo `val_acc`, lọc theo `lr`, vẽ
đường loss chồng lên nhau. Đây là lý do tracking tồn tại: **quyết định dựa trên bảng số, không
phải "hình như run hôm qua tốt hơn"**. Một run tốt mà không tái lập được thì vô dụng — nhờ
đã ghim commit + dataset + seed, bạn *chạy lại đúng nó* được.

## Versioning: model và dataset cũng cần version như code

Git version *code*. Nhưng ML còn hai thứ nữa cần version, và Git không hợp để giữ chúng
(file nặng, nhị phân):

- **Dataset** — data thay đổi (thêm mẫu, sửa nhãn) làm model đổi hành vi. Phải biết **run
  nào ăn dataset version nào**. Pattern (DVC): Git giữ một *con trỏ nhỏ* (hash) tới file data
  nằm ở storage riêng (S3...), nên bạn `checkout` một commit là ra đúng cả code lẫn data khớp.
- **Model** — mỗi lần train ra một artifact. Cần biết version, nó từ run nào, đã lên prod chưa.

**Model registry** là nơi quản lý vòng đời model đã train: đăng ký version, gắn stage
(`staging` → `production` → `archived`), và **liên kết ngược về run** đã tạo ra nó.

| Thứ | Công cụ điển hình | Version bằng gì |
|-----|-------------------|-----------------|
| Code | Git | Commit hash |
| Dataset | DVC / con trỏ + object storage | Hash nội dung |
| Model artifact | Model registry (MLflow...) | Version + stage |
| Experiment | MLflow / W&B | Run ID |

Sợi chỉ xuyên suốt: một model prod → truy về **run** đã tạo ra nó → run đó ghim **commit +
dataset version + params**. Đứt bất kỳ mắt xích nào là mất reproducibility.

## MLOps truyền thống vs LLMOps: "model" là gì?

Với ML cổ điển, artifact cần version rõ ràng là **model weights**. Với LLM, phần lớn ứng dụng
**không train weights** — bạn dùng model có sẵn qua API. Vậy cái gì là "model" cần version?

| Khía cạnh | MLOps (ML cổ điển) | LLMOps (ứng dụng LLM) |
|-----------|--------------------|-----------------------|
| Artifact chính | Model weights (`.pt`, `.onnx`) | **Prompt** + config model |
| "Train" là gì | Chạy training loop | Sửa prompt / RAG / few-shot / fine-tune |
| Dataset | Data train/test | **Eval set** (bộ câu hỏi + đáp án mong đợi) |
| Đổi hành vi do | Đổi weights/data | Đổi prompt, đổi model version (`sonnet-4`→`4.5`), đổi retrieval |
| "Version" cái gì | Model + dataset | **Prompt, eval set, model id, retrieval config** |
| Đo bằng | Accuracy/F1 cố định | Eval (bài 32) — thường cần LLM/người chấm |

> Trong LLMOps, **prompt và eval set chính là "model" và "dataset"**. Đổi một dấu phẩy trong
> system prompt có thể làm hành vi khác hẳn — nên **prompt phải nằm trong version control**,
> mỗi thay đổi là một "run" cần đo lại. Đừng sửa prompt trực tiếp trên production.

Nguyên tắc *tái lập được* không đổi: một câu trả lời prod cần truy về được **prompt version +
model id + retrieval config + eval kết quả** — y như ML cổ điển truy về commit + dataset + params.

## Cạm bẫy hay gặp

- **Quên version dataset** → cùng code, model khác nhau, không hiểu vì sao; mắt xích hay đứt nhất.
- **Không set seed** → không tái lập được run "tốt" đã lỡ tay chạy; ghim seed từ đầu.
- **Đặt tên file thay cho tracking** (`model_final_real_v3.pt`) → vài tuần là loạn; dùng registry.
- **Log mỗi metric cuối cùng** → không thấy đường cong loss, không biết overfit từ epoch nào.
- **LLMOps: sửa prompt trên prod không version** → không rollback được, không biết ai đổi gì.
- **Ghim commit nhưng không ghim môi trường** → đổi version thư viện là số lệch, vẫn không tái lập.

## Ghi nhớ

Model lên production là **bắt đầu vòng đời**, không phải kết thúc. **Reproducibility** đòi ghim
đủ năm thứ: **code (commit) + data (version) + params + môi trường + seed** — thiếu một là mất.
**Experiment tracking** (MLflow/W&B) log tự động mỗi run: **params, metrics theo step, artifacts,
metadata** — để **so sánh bằng số** và chạy lại đúng run tốt. **Versioning** phủ cả model và
dataset, không chỉ code: dataset dùng con trỏ + object storage (DVC), model dùng **registry**
gắn stage và **liên kết ngược về run**. Trong **LLMOps**, "model" là **prompt** và "dataset" là
**eval set** — version chúng như code, đừng sửa prompt thẳng trên prod. Sợi chỉ xuyên suốt:
**model prod → run → commit + dataset + params**; đứt mắt xích nào là mất khả năng tái lập.
