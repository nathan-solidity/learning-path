---
level: "ai-adv-ml"
order: 22
title: "Nền tảng Machine Learning"
est: "6-7 giờ"
checklist:
  - "Phân biệt được supervised vs unsupervised, và cho ví dụ bài toán cho mỗi loại"
  - "Chia được dữ liệu train/val/test đúng cách và giải thích vai trò từng phần"
  - "Nhận diện được overfitting vs underfitting qua khoảng cách train/val error"
  - "Giải thích được trade-off bias-variance bằng lời của mình"
  - "Chọn được metric phù hợp (accuracy/precision/recall/F1) cho bài toán mất cân bằng"
  - "Train được một model scikit-learn end-to-end và đọc được classification report"
related:
  - "glossary:machine-learning"
  - "glossary:overfitting"
  - "skill:nta-code-review"
---

## Vì sao quan trọng

Ở cấp Cơ bản và Trung cấp, bạn đã **dùng model có sẵn** qua API: gọi LLM, embedding, RAG.
Bạn coi model như hộp đen — đưa input, nhận output. Cấp này mở hộp đen ra: hiểu **bên trong
model học thế nào** để can thiệp sâu — fine-tune, chọn kiến trúc, chẩn đoán khi model sai.

> Phần này để **HIỂU và tối ưu** model. Nếu bạn chỉ gọi API model có sẵn, đây là kiến thức
> nền giúp bạn debug tốt hơn, chứ **không bắt buộc**. Nó cần thiết khi bạn tự train/fine-tune.

Bài này là nền của mọi thứ phía sau: neural network (bài 23) và PyTorch (bài 24) đều là
Machine Learning — chỉ khác ở chỗ model phức tạp hơn.

## Supervised vs Unsupervised

**Machine Learning** là để máy **học pattern từ dữ liệu** thay vì viết luật tay. Hai nhánh chính:

| Loại | Dữ liệu có gì | Máy học gì | Ví dụ |
|------|---------------|------------|-------|
| **Supervised** | Input **kèm nhãn** (đáp án) | Ánh xạ input → nhãn | Phân loại email spam, dự đoán giá nhà |
| **Unsupervised** | Chỉ có input, **không nhãn** | Cấu trúc ẩn trong dữ liệu | Gom nhóm khách hàng (clustering), giảm chiều |

Supervised lại chia hai: **classification** (nhãn rời rạc — spam/không spam) và **regression**
(giá trị liên tục — giá nhà bao nhiêu triệu). Đa số bài toán thực tế bạn gặp là supervised.

> Embedding ở bài 7 chính là một dạng học biểu diễn — gần với unsupervised. LLM được train
> theo kiểu self-supervised: đoán token tiếp theo, "nhãn" tự sinh ra từ chính văn bản.

## Train / Validation / Test split

Đây là quy tắc **sống còn**. Nếu bạn đánh giá model trên chính dữ liệu nó đã học, con số đẹp
là ảo — như cho học sinh thi lại đúng đề đã ôn. Chia ba phần:

| Phần | Tỷ lệ điển hình | Dùng để |
|------|-----------------|---------|
| **Train** | ~60-70% | Model học từ đây (fit tham số) |
| **Validation** | ~15-20% | Chọn hyperparameter, so sánh model, phát hiện overfit |
| **Test** | ~15-20% | Đo hiệu năng cuối cùng — **chỉ đụng một lần** |

Nguyên tắc vàng: **test set chỉ được nhìn một lần cuối**. Nếu bạn tinh chỉnh model dựa trên
test set, bạn đã vô tình "học" nó → con số không còn phản ánh dữ liệu thật ngoài đời.

## Overfitting vs Underfitting

Đây là hai kiểu "học sai" phổ biến nhất:

- **Underfitting** — model **quá đơn giản**, không nắm nổi pattern. Sai cả trên train lẫn val.
  (Như học vẹt sơ sài, cái gì cũng không thuộc.)
- **Overfitting** — model **học thuộc lòng** cả nhiễu trong train data. Đúng trên train nhưng
  sai trên val/test. (Như học tủ đúng đề cũ, gặp đề mới là trượt.)

> Dấu hiệu nhận biết: nhìn **khoảng cách** giữa train error và val error.
> Train tốt + val tệ → **overfit**. Cả hai đều tệ → **underfit**. Cả hai đều tốt và sát nhau → ổn.

Cách chống overfit: thêm dữ liệu, đơn giản hoá model, **regularization** (phạt độ phức tạp),
dừng sớm (early stopping — dừng khi val error bắt đầu tăng).

## Bias-Variance trade-off

Đây là cách nói lý thuyết hơn của overfit/underfit:

- **Bias cao** = giả định của model quá cứng nhắc → bỏ sót pattern → **underfit**.
- **Variance cao** = model quá nhạy với từng điểm dữ liệu → bắt cả nhiễu → **overfit**.

Trade-off: giảm bias thường làm tăng variance và ngược lại. Model tốt là điểm **cân bằng** —
đủ linh hoạt để nắm pattern thật, đủ ổn định để không đuổi theo nhiễu. Không có model "hoàn hảo",
chỉ có model cân bằng phù hợp với dữ liệu của bạn.

## Loss function và Gradient descent (khái niệm)

Model học bằng cách **giảm sai số**. Sai số đó đo bằng **loss function**:

- Regression thường dùng **MSE** (Mean Squared Error) — trung bình bình phương chênh lệch.
- Classification thường dùng **cross-entropy** — phạt nặng khi model tự tin mà sai.

Loss là **một con số**: càng nhỏ, model càng đúng. Việc học = tìm tham số làm loss nhỏ nhất.

**Gradient descent** là cách tìm đó, bằng trực giác:

> Tưởng tượng bạn đứng trên đồi trong sương mù, muốn xuống đáy thung lũng (loss thấp nhất).
> Bạn sờ xem quanh chân dốc xuống hướng nào, bước một bước nhỏ theo hướng đó, rồi lặp lại.
> "Độ dốc" chính là **gradient**; "độ dài mỗi bước" là **learning rate** (bài 23 nói kỹ).

Đây là cơ chế học chung của gần như mọi model ML hiện đại, kể cả neural network và LLM.

## Metrics: Accuracy, Precision, Recall, F1

**Accuracy** (tỷ lệ đúng) là metric đầu tiên ai cũng nghĩ tới — nhưng nó **lừa** khi dữ liệu
mất cân bằng. Ví dụ 99% email không spam: model đoán "tất cả đều không spam" đạt accuracy 99%
nhưng vô dụng (bỏ sót 100% spam).

Với classification, dùng bốn khái niệm quanh **lớp positive** (ví dụ: "là spam"):

| Metric | Trả lời câu hỏi | Công thức trực giác |
|--------|-----------------|---------------------|
| **Precision** | Trong số dự đoán positive, bao nhiêu **đúng thật**? | đúng-positive / (tất cả dự đoán positive) |
| **Recall** | Trong số positive thật, model **bắt được** bao nhiêu? | đúng-positive / (tất cả positive thật) |
| **F1** | Cân bằng precision và recall (trung bình điều hoà) | 2·P·R / (P+R) |

> Chọn metric theo cái giá của sai lầm. Lọc spam mà xoá nhầm mail quan trọng (false positive)
> đắt → ưu tiên **precision**. Sàng lọc ung thư mà bỏ sót ca bệnh (false negative) đắt →
> ưu tiên **recall**. Không rõ ưu tiên bên nào → dùng **F1**.

## Ví dụ nhỏ với scikit-learn

Train một classifier phân loại hoa Iris, chia dữ liệu đúng cách và đọc metrics.

```python
# Python 3.12+ — cài: pip install scikit-learn
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score

# 1) Nạp dữ liệu: X = đặc trưng (4 số đo cánh hoa), y = nhãn (3 loài hoa)
X, y = load_iris(return_X_y=True)

# 2) Chia train/test — stratify giữ tỷ lệ các lớp cân bằng ở cả 2 phần
#    random_state cố định để kết quả tái lập được
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

# 3) Train model (fit tham số trên train — model "học" ở đây)
model = LogisticRegression(max_iter=200)
model.fit(X_train, y_train)

# 4) Đánh giá trên test set (dữ liệu model CHƯA từng thấy)
y_pred = model.predict(X_test)
print("Accuracy:", accuracy_score(y_test, y_pred))
print(classification_report(y_test, y_pred, target_names=load_iris().target_names))
```

`classification_report` in precision/recall/F1 cho **từng lớp** — đây là thứ bạn nên đọc thay
vì chỉ nhìn accuracy tổng. Nếu một lớp có recall thấp, model đang bỏ sót lớp đó.

> Muốn kiểm chứng model có overfit không? So `model.score(X_train, y_train)` với
> `model.score(X_test, y_test)`. Chênh lệch lớn (train cao, test thấp) = dấu hiệu overfit.

## Cạm bẫy hay gặp

- **Dùng test set để tinh chỉnh** → con số cuối bị "nhiễm", không phản ánh dữ liệu thật.
- **Chỉ nhìn accuracy** với dữ liệu mất cân bằng → tưởng model giỏi mà thực ra vô dụng.
- **Quên stratify** khi chia dữ liệu → một lớp có thể vắng mặt trong test set.
- **Data leakage** — thông tin từ test lọt vào train (ví dụ chuẩn hoá trên toàn bộ dữ liệu
  trước khi chia) → model đẹp ảo, sập khi lên production.
- **Đổ lỗi cho model khi thật ra lỗi dữ liệu** — nhãn sai, dữ liệu lệch thì model nào cũng hỏng.

## Ghi nhớ

**Machine Learning** để máy học pattern từ dữ liệu: **supervised** (có nhãn) vs **unsupervised**
(không nhãn). Luôn chia **train/val/test**, và **test set chỉ đụng một lần cuối**. Nhìn khoảng
cách train-val để bắt **overfit** (thuộc lòng, val tệ) vs **underfit** (quá đơn giản, cả hai tệ) —
đây chính là trade-off **bias-variance**. Model học bằng cách giảm **loss** qua **gradient
descent** (bước xuống dốc theo độ dốc). Đừng chỉ tin **accuracy** — với dữ liệu mất cân bằng,
dùng **precision** (dự đoán đúng bao nhiêu), **recall** (bắt được bao nhiêu) và **F1** (cân bằng
hai cái). scikit-learn cho bạn train một model end-to-end trong chục dòng — nền để hiểu neural
network ở bài sau.
