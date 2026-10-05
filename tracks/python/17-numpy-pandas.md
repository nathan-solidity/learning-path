---
level: "data-analysis"
order: 17
title: "NumPy & pandas"
est: "6-7 giờ"
checklist:
  - "Giải thích được vì sao ndarray + vectorization nhanh hơn vòng lặp Python thuần"
  - "Tạo và thao tác Series, DataFrame; đọc dữ liệu từ CSV/Excel vào DataFrame"
  - "Chọn dữ liệu chính xác bằng loc/iloc và boolean indexing"
  - "Xử lý missing data: phát hiện NaN, dùng dropna/fillna đúng tình huống"
  - "Tổng hợp dữ liệu bằng groupby + hàm aggregate (sum/mean/count)"
  - "Gộp nhiều bảng bằng merge/join theo khóa chung"
related:
  - "glossary:dataframe"
  - "glossary:vectorization"
  - "skill:nta-perf-audit"
---

## Vì sao quan trọng

Nhánh phân tích dữ liệu bắt đầu ở đây. **NumPy** cung cấp `ndarray` — mảng số học tính toán
cực nhanh; **pandas** xây trên NumPy để cho ta **DataFrame** — bảng dữ liệu 2 chiều giống
sheet Excel nhưng lập trình được. Gần như mọi công việc data (đọc file, làm sạch, tổng hợp,
báo cáo) đều xoay quanh DataFrame. Nắm chắc chọn dữ liệu, xử lý NaN và groupby là đủ để làm
80% công việc thực tế.

## ndarray vs list — vì sao vectorization

Vòng lặp Python thuần chậm vì mỗi phép tính đều qua interpreter. NumPy đẩy phép tính xuống
tầng C, chạy trên cả mảng một lần — gọi là **vectorization**.

```python
import numpy as np

prices = np.array([100, 200, 300, 400])   # ndarray thay vì list
# ❌ vòng lặp thủ công: chậm, dài dòng
taxed = []
for p in prices:
    taxed.append(p * 1.1)
# ✅ vectorization: một phép nhân áp cho cả mảng
taxed = prices * 1.1                        # array([110., 220., 330., 440.])
```

| Tiêu chí | Python list + for | NumPy vectorization |
|----------|-------------------|---------------------|
| Tốc độ (1 triệu phần tử) | chậm (giây) | nhanh (mili giây) |
| Cú pháp | dài, dễ sai | ngắn, khai báo |
| Bộ nhớ | cao (mỗi phần tử là object) | thấp (kiểu số liền khối) |

> Nguyên tắc vàng của data trong Python: **thấy vòng `for` trên dữ liệu số → nghĩ ngay tới
> vectorization**. Skill `/nta-perf-audit` bắt đúng loại vòng lặp nên thay này.

## Series & DataFrame

```python
import pandas as pd

# Series: một cột có nhãn (index)
s = pd.Series([10, 20, 30], index=["a", "b", "c"])

# DataFrame: bảng nhiều cột — cách dùng phổ biến nhất
df = pd.DataFrame({
    "product": ["Áo", "Quần", "Mũ"],   # cột chuỗi
    "qty":     [5, 3, 8],               # cột số
    "price":   [120, 250, 80],
})
df["total"] = df["qty"] * df["price"]   # tạo cột mới bằng vectorization
```

![Cấu trúc DataFrame: mỗi hàng là một row có index, mỗi cột là một column có tên, giao giữa hàng và cột là ô dữ liệu; luồng đọc CSV vào DataFrame rồi xử lý](/images/python-dataframe.png)

## Đọc dữ liệu từ CSV/Excel

```python
df = pd.read_csv("sales.csv")                 # đọc CSV
df = pd.read_csv("sales.csv", parse_dates=["order_date"])  # ép cột ngày
df = pd.read_excel("sales.xlsx", sheet_name="Q1")          # đọc sheet Excel

df.head()      # xem 5 hàng đầu
df.info()      # kiểu dữ liệu từng cột + số dòng non-null
df.describe()  # thống kê nhanh cột số (mean, min, max...)
```

> `df.info()` là việc đầu tiên nên làm sau khi đọc file: nó lộ ngay cột nào sai kiểu (số
> bị đọc thành `object`) và cột nào thiếu dữ liệu.

## Chọn dữ liệu: loc / iloc / boolean indexing

```python
df["price"]              # chọn 1 cột (Series)
df[["product", "price"]] # chọn nhiều cột (DataFrame)

df.loc[0, "product"]     # loc: theo NHÃN (index + tên cột)
df.iloc[0, 1]            # iloc: theo VỊ TRÍ số (hàng 0, cột 1)

# boolean indexing: lọc theo điều kiện — cách lọc chuẩn của pandas
df[df["price"] > 100]                          # giá > 100
df[(df["qty"] >= 5) & (df["price"] < 200)]     # nhiều điều kiện: dùng & | và ngoặc
```

| Cách | Dùng khi | Ví dụ |
|------|----------|-------|
| `loc` | biết tên nhãn/cột | `df.loc[df["qty"] > 3, "product"]` |
| `iloc` | biết vị trí số | `df.iloc[0:5, :]` (5 hàng đầu) |
| boolean | lọc theo điều kiện | `df[df["price"] > 100]` |

> Toán tử phải là `&` `|` `~` (không phải `and`/`or`) và **mỗi điều kiện bọc trong ngoặc**.
> Quên ngoặc → lỗi hoặc kết quả sai vì thứ tự ưu tiên toán tử.

## Xử lý missing data (NaN)

```python
df.isna().sum()          # đếm NaN mỗi cột — luôn kiểm tra trước khi tính toán

df.dropna()              # bỏ mọi hàng có NaN (cẩn thận: mất dữ liệu)
df.dropna(subset=["price"])  # chỉ bỏ hàng thiếu 'price'

df["price"].fillna(0)                        # điền 0
df["price"].fillna(df["price"].mean())       # điền bằng giá trị trung bình
```

> **Đừng so sánh NaN bằng `==`**: `NaN == NaN` cho `False`. Luôn dùng `df.isna()` /
> `df.notna()` để dò giá trị thiếu. NaN cũng khiến cột số bị đọc thành kiểu `float`.

## groupby & aggregate

Câu hỏi kiểu "mỗi nhóm bao nhiêu?" → dùng `groupby`.

```python
# doanh thu theo từng sản phẩm
df.groupby("product")["total"].sum()

# nhiều thống kê một lúc
df.groupby("product").agg(
    total_qty=("qty", "sum"),
    avg_price=("price", "mean"),
    orders=("product", "count"),
)
```

## merge / join nhiều bảng

```python
orders = pd.DataFrame({"order_id": [1, 2, 3], "customer_id": [10, 10, 20]})
customers = pd.DataFrame({"customer_id": [10, 20], "name": ["An", "Bình"]})

# ghép order với tên khách theo khóa chung customer_id
merged = orders.merge(customers, on="customer_id", how="left")
```

| `how` | Ý nghĩa |
|-------|---------|
| `inner` | chỉ giữ khóa có ở CẢ hai bảng (mặc định) |
| `left` | giữ mọi hàng bảng trái, thiếu thì NaN |
| `right` | giữ mọi hàng bảng phải |
| `outer` | giữ tất cả hai bên |

## Cạm bẫy hay gặp

- Dùng vòng `for` lặp từng hàng (`for i in range(len(df))`) thay vì vectorization → chậm gấp
  hàng chục lần và code dài.
- `SettingWithCopyWarning`: gán giá trị lên một slice (`df[df.x > 0]["y"] = 1`) không chắc
  đổi được bản gốc — dùng `df.loc[df.x > 0, "y"] = 1`.
- So sánh NaN bằng `==` thay vì `isna()` → luôn ra `False`, lọc sai.
- Cột kiểu `object` (chuỗi lẫn lộn) nặng bộ nhớ và chậm; ép về `int`/`float`/`category` khi
  hợp lý bằng `astype`.
- Nhầm `loc` (theo nhãn) với `iloc` (theo vị trí) → lấy nhầm dữ liệu, nhất là sau khi lọc
  xong index không còn liên tục.

## Ghi nhớ

**NumPy ndarray + vectorization** thay vòng lặp cho tốc độ. **DataFrame** là trung tâm mọi
việc data: đọc bằng `read_csv`/`read_excel`, chọn bằng **`loc`/`iloc`/boolean indexing**,
xử lý thiếu bằng **`isna` → `dropna`/`fillna`** (không so sánh NaN bằng `==`), tổng hợp bằng
**`groupby` + `agg`**, gộp bảng bằng **`merge`** với `how` phù hợp.
