---
level: "machine-learning"
order: 21
title: "ML Workflow & Đánh giá model"
est: "6-7 giờ"
checklist:
  - "Chọn đúng metric cho bài toán: accuracy/precision/recall/F1 cho classification, MAE/RMSE cho regression"
  - "Đọc được confusion matrix và giải thích false positive vs false negative"
  - "Nhận biết overfitting vs underfitting qua khoảng cách điểm train và điểm test"
  - "Dùng cross-validation để đánh giá model ổn định thay vì một lần split may rủi"
  - "Tuning hyperparameter bằng GridSearchCV mà không rò rỉ dữ liệu test"
  - "Lưu và load lại model đã train bằng joblib để dùng ở production"
related:
  - "glossary:overfitting"
  - "skill:nta-code-review"
  - "skill:nta-perf-audit"
---

## Vì sao quan trọng

Train một model thì dễ — hai dòng `fit`/`predict`. Câu hỏi khó là: **model này có thực sự
tốt không, hay chỉ trông có vẻ tốt?** Rất nhiều model đạt "accuracy 95%" nhưng vô dụng ngoài
thực tế vì đo sai chỉ số hoặc rò rỉ dữ liệu.

Đây là bài quan trọng nhất của nhánh ML. **Đánh giá đúng quan trọng hơn model phức tạp.** Một
LogisticRegression được đánh giá cẩn thận đáng tin hơn một mạng neural được đo bằng metric sai.

## Chọn metric — regression

Với label là số, ta đo **sai lệch** giữa dự đoán và thực tế:

```python
from sklearn.metrics import mean_absolute_error, root_mean_squared_error

mae = mean_absolute_error(y_test, predictions)   # sai số trung bình, cùng đơn vị với label
rmse = root_mean_squared_error(y_test, predictions)  # phạt nặng sai số lớn
```

| Metric | Ý nghĩa | Khi nào dùng |
|---|---|---|
| MAE | Sai số tuyệt đối trung bình | Muốn con số dễ giải thích, ít nhạy outlier |
| RMSE | Căn bậc hai của bình phương sai số | Khi sai số lớn đặc biệt tệ (phạt nặng) |

## Chọn metric — classification

Accuracy (tỉ lệ đoán đúng) nghe hợp lý nhưng **rất dễ đánh lừa** khi dữ liệu mất cân bằng.

> Bài toán phát hiện gian lận: 99% giao dịch hợp lệ. Một model đoán "tất cả đều hợp lệ" đạt
> **accuracy 99%** mà không bắt được một vụ gian lận nào. Accuracy cao nhưng model vô dụng.

Ta cần các chỉ số tinh hơn:

| Metric | Công thức khái niệm | Trả lời câu hỏi |
|---|---|---|
| Precision | TP / (TP + FP) | Trong số dự đoán "dương", bao nhiêu đúng? |
| Recall | TP / (TP + FN) | Trong số thực sự "dương", bắt được bao nhiêu? |
| F1 | Trung bình điều hòa của P và R | Cân bằng cả hai |

```python
from sklearn.metrics import classification_report

print(classification_report(y_test, predictions))  # in đủ precision/recall/F1 mỗi lớp
```

Chọn theo cái giá của lỗi: chẩn đoán ung thư cần **recall cao** (đừng bỏ sót bệnh nhân); lọc
spam cần **precision cao** (đừng chặn nhầm email quan trọng).

## Confusion matrix

Bảng 2x2 phơi bày model sai kiểu gì:

|  | Dự đoán: Dương | Dự đoán: Âm |
|---|---|---|
| **Thực tế: Dương** | True Positive (TP) | False Negative (FN) — bỏ sót |
| **Thực tế: Âm** | False Positive (FP) — báo động giả | True Negative (TN) |

```python
from sklearn.metrics import confusion_matrix
print(confusion_matrix(y_test, predictions))
```

FN và FP có hậu quả khác nhau tùy bài toán — chính vì thế một con số accuracy không đủ.

## Overfitting vs underfitting

Đây là hai kiểu "học sai":

| Hiện tượng | Điểm train | Điểm test | Nghĩa là |
|---|---|---|---|
| Underfitting | Thấp | Thấp | Model quá đơn giản, chưa học được gì |
| Vừa vặn | Cao | Cao | Mục tiêu cần đạt |
| Overfitting | Rất cao | Thấp | Model học thuộc lòng train, không tổng quát hóa |

```python
print("Train:", model.score(X_train, y_train))  # ví dụ 0.99
print("Test :", model.score(X_test, y_test))     # ví dụ 0.72 → khoảng cách lớn = overfit
```

> **Khoảng cách lớn giữa điểm train và điểm test là dấu hiệu overfitting.** Cách chữa: lấy
> thêm dữ liệu, giảm độ phức tạp model (giảm `max_depth`), hoặc dùng regularization.

## Cross-validation

Một lần train/test split có thể may rủi — biết đâu tập test tình cờ dễ. **Cross-validation**
chia dữ liệu thành k phần, lần lượt lấy mỗi phần làm test, huấn luyện trên phần còn lại:

```python
from sklearn.model_selection import cross_val_score

scores = cross_val_score(pipe, X_train, y_train, cv=5)  # chia 5 lần
print(scores.mean(), "±", scores.std())  # điểm trung bình và độ dao động
```

Độ dao động (std) lớn nghĩa là model không ổn định — tin vào trung bình 5 lần đáng hơn một
lần split duy nhất.

## Tuning hyperparameter với GridSearchCV

Hyperparameter là tham số bạn chọn trước khi train (`max_depth`, `C`...). GridSearchCV thử
mọi tổ hợp và chọn tổ hợp tốt nhất bằng cross-validation:

```python
from sklearn.model_selection import GridSearchCV

param_grid = {"clf__C": [0.1, 1, 10], "clf__max_iter": [500, 1000]}
grid = GridSearchCV(pipe, param_grid, cv=5, scoring="f1")
grid.fit(X_train, y_train)             # chỉ chạy trên TRAIN

print(grid.best_params_)               # tổ hợp tốt nhất
final_score = grid.score(X_test, y_test)  # test chỉ dùng MỘT lần, ở cuối cùng
```

## Tránh data leakage

Data leakage là khi thông tin từ test lẻn vào lúc train — kết quả đẹp giả tạo, ra thực tế sập.

- ❌ Fit scaler/encoder trên toàn bộ dữ liệu **trước** khi split.
- ❌ Dùng tập test để chọn hyperparameter, rồi lại báo cáo điểm trên chính tập đó.
- ✅ Gói tiền xử lý vào **Pipeline** và đưa pipeline vào cross-validation — mỗi fold tự fit lại tiền xử lý chỉ trên phần train của fold đó.
- ✅ Giữ tập test "trong hộp niêm phong", chỉ mở ra đo **một lần duy nhất** ở cuối.

## Lưu và load model

Sau khi hài lòng, lưu model để dùng ở production mà không train lại:

```python
import joblib

joblib.dump(grid.best_estimator_, "model.joblib")  # lưu cả pipeline (tiền xử lý + model)
loaded = joblib.load("model.joblib")               # load lại ở service khác
loaded.predict(new_data)
```

Lưu cả **pipeline** chứ không chỉ model — nếu không, ở production bạn lại phải tự scale/encode
đúng cách, rất dễ sai.

## Cạm bẫy hay gặp

- Tin mỗi accuracy khi dữ liệu mất cân bằng → dùng precision/recall/F1 và nhìn confusion matrix.
- Chọn hyperparameter bằng tập test rồi báo cáo luôn điểm đó → điểm lạc quan giả, dùng cross-validation trên train.
- Nhầm điểm train cao là model tốt → phải so với điểm test; khoảng cách lớn là overfit.
- Fit tiền xử lý trước khi split → data leakage; luôn gói vào Pipeline.
- Chỉ lưu model mà quên scaler/encoder → dữ liệu production vào sai định dạng, dự đoán rác.

## Ghi nhớ

**Đánh giá đúng quan trọng hơn model phức tạp.** Chọn metric theo bài toán:
**accuracy/precision/recall/F1** cho classification (cẩn thận khi mất cân bằng),
**MAE/RMSE** cho regression. Đọc **confusion matrix** để hiểu model sai kiểu gì. Khoảng cách
train–test lớn là **overfitting**. Dùng **cross-validation** thay vì một lần split, tuning
bằng **GridSearchCV** chỉ trên train. Tránh **data leakage** bằng **Pipeline** và niêm phong
tập test. Lưu/load bằng **joblib**, luôn lưu cả pipeline.
