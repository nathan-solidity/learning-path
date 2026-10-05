---
level: "machine-learning"
order: 20
title: "Machine Learning với scikit-learn"
est: "6-7 giờ"
checklist:
  - "Phân biệt được supervised vs unsupervised và xác định đâu là feature, đâu là label"
  - "Chia dữ liệu train/test đúng cách bằng train_test_split (có random_state)"
  - "Huấn luyện được một model regression (LinearRegression) và một classifier (LogisticRegression/DecisionTree)"
  - "Dùng đúng luồng fit trên train, predict trên test — không bao giờ ngược lại"
  - "Tiền xử lý cơ bản: StandardScaler cho số, encode categorical cho chữ"
  - "Gói tiền xử lý + model vào một Pipeline sklearn để tránh lặp code và rò rỉ dữ liệu"
related:
  - "glossary:machine-learning"
---

## Vì sao quan trọng

Với lập trình truyền thống, bạn viết **rule** bằng tay: `if tuổi > 18 then ...`. Machine
Learning lật ngược lại: bạn đưa **dữ liệu** kèm đáp án, máy tự **học ra rule**. Khi bài toán
quá nhiều biến để viết `if` bằng tay (dự đoán giá nhà từ 50 đặc trưng, lọc spam từ nội dung
email), ML là công cụ đúng.

**scikit-learn** là thư viện ML phổ biến nhất của Python cho dữ liệu dạng bảng. Nó có một
API cực nhất quán: mọi model đều có `.fit()` để học và `.predict()` để dự đoán. Học được
luồng này một lần là dùng lại cho hàng trăm thuật toán. Đây là điểm khởi đầu của cả nhánh ML.

## ML là gì: học từ dữ liệu

Ta có một bảng dữ liệu. Mỗi **dòng** là một mẫu (sample). Các **cột đầu vào** gọi là
**feature** (đặc trưng). Cột ta muốn dự đoán gọi là **label** (nhãn, hay target).

| diện tích (feature) | số phòng (feature) | giá — label |
|---|---|---|
| 50 | 2 | 2.1 tỷ |
| 80 | 3 | 3.4 tỷ |
| ? | ? | máy dự đoán |

> **Feature là câu hỏi, label là đáp án.** Model học mối liên hệ feature → label từ dữ liệu
> cũ, rồi áp dụng cho dữ liệu mới chưa có đáp án.

## Supervised vs unsupervised

| Loại | Có label không? | Ví dụ | Thuật toán |
|---|---|---|---|
| Supervised | Có (dạy máy bằng đáp án) | Dự đoán giá, phân loại spam | LinearRegression, LogisticRegression |
| Unsupervised | Không | Gom nhóm khách hàng | KMeans |

Trong supervised còn chia nhỏ:
- **Regression**: label là **số liên tục** (giá nhà, nhiệt độ).
- **Classification**: label là **nhãn rời rạc** (spam / không spam, chó / mèo).

Bài này tập trung vào supervised — chiếm phần lớn ứng dụng ML thực tế.

## Train/test split — quy tắc vàng

Không bao giờ đánh giá model trên chính dữ liệu nó đã học. Giống như cho học sinh làm lại
đúng đề đã ôn — điểm cao không chứng minh gì. Ta **giữ lại** một phần dữ liệu làm bài kiểm tra:

```python
from sklearn.model_selection import train_test_split

# X là feature, y là label
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,       # giữ 20% để kiểm tra
    random_state=42,     # cố định để kết quả lặp lại được
)
```

![Quy trình ML: dữ liệu được chia thành train và test, train dùng để huấn luyện model, sau đó model dự đoán trên test, cuối cùng so sánh dự đoán với đáp án thật để đánh giá](/images/python-ml-workflow.png)

## Model đầu tiên: regression

```python
from sklearn.linear_model import LinearRegression

model = LinearRegression()
model.fit(X_train, y_train)          # học từ dữ liệu train
predictions = model.predict(X_test)  # dự đoán trên test (dữ liệu model chưa thấy)
```

Chỉ hai dòng cốt lõi: `fit` để học, `predict` để dùng. Mọi model trong sklearn đều theo
đúng khuôn này.

## Model thứ hai: classifier

```python
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier

# LogisticRegression: phân loại tuyến tính, nhanh, hay dùng làm baseline
clf = LogisticRegression(max_iter=1000)
clf.fit(X_train, y_train)

# DecisionTree: học "cây câu hỏi", dễ hiểu nhưng dễ overfit
tree = DecisionTreeClassifier(max_depth=5)  # giới hạn độ sâu để bớt overfit
tree.fit(X_train, y_train)

print(clf.predict(X_test[:5]))        # nhãn dự đoán
print(clf.predict_proba(X_test[:5]))  # xác suất mỗi nhãn
```

> Đừng chọn model phức tạp ngay từ đầu. Bắt đầu bằng model đơn giản (Logistic/Linear) làm
> **baseline** — nếu model phức tạp không hơn baseline đáng kể, baseline thắng vì dễ hiểu, dễ bảo trì.

## Tiền xử lý cơ bản

Model chỉ hiểu số, và nhiều model nhạy với thang đo. Hai việc hay làm nhất:

**Scale feature số** — đưa các cột về cùng thang đo (thu nhập hàng triệu và tuổi 0-100 lệch
nhau quá lớn):

```python
from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)  # học mean/std TỪ train
X_test_scaled = scaler.transform(X_test)         # chỉ transform, KHÔNG fit lại
```

❌ `scaler.fit_transform(X_test)` — fit trên test là **rò rỉ dữ liệu (data leakage)**.
✅ `scaler.transform(X_test)` — chỉ áp thông số đã học từ train.

**Encode categorical** — biến cột chữ ("Hà Nội", "Đà Nẵng") thành số:

```python
from sklearn.preprocessing import OneHotEncoder

encoder = OneHotEncoder(handle_unknown="ignore")  # bỏ qua giá trị lạ ở test
X_encoded = encoder.fit_transform(X_train[["city"]])
```

## Pipeline — gói mọi thứ lại

Vấn đề: bạn phải nhớ scale train rồi scale test đúng thứ tự, mỗi lần predict lặp lại. Rất
dễ quên và gây leakage. **Pipeline** gói tiền xử lý + model thành một khối:

```python
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

pipe = Pipeline([
    ("scaler", StandardScaler()),           # bước 1: chuẩn hóa
    ("clf", LogisticRegression(max_iter=1000)),  # bước 2: model
])

pipe.fit(X_train, y_train)   # tự scale train rồi fit model
pipe.predict(X_test)         # tự scale test bằng đúng thông số đã học
```

Giờ `fit`/`predict` gọi trên nguyên pipeline — scaler tự chỉ fit trên train, không còn chỗ
cho leakage lẻn vào.

## Cạm bẫy hay gặp

- Đánh giá model trên dữ liệu train → điểm ảo cao, ra thực tế sập; luôn chấm điểm trên test.
- `fit` scaler/encoder trên toàn bộ dữ liệu trước khi split → data leakage, kết quả đẹp giả tạo.
- Quên scale feature với model nhạy thang đo (Logistic, SVM, KNN) → model chạy nhưng kém hẳn.
- Không đặt `random_state` → mỗi lần chạy ra kết quả khác, không debug được.
- Encode categorical ở train và test tách rời, không xử lý giá trị lạ → test lỗi khi gặp nhãn mới.

## Ghi nhớ

ML là **học rule từ dữ liệu**, không viết rule tay. Phân biệt **feature** (đầu vào) và
**label** (đáp án), **supervised** (có label) và **unsupervised** (không). Luôn
**train/test split** và chỉ đánh giá trên test. Mọi model theo khuôn **`fit` rồi `predict`**.
Tiền xử lý (**StandardScaler**, encode categorical) và model nên gói vào **Pipeline** để
tránh lặp code và **data leakage**. Bắt đầu bằng model đơn giản làm baseline.
