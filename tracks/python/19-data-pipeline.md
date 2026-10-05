---
level: "data-analysis"
order: 19
title: "Data pipeline & ETL"
est: "6-7 giờ"
checklist:
  - "Giải thích được 3 bước ETL (Extract-Transform-Load) và vai trò từng bước"
  - "Làm sạch dữ liệu: chuẩn hóa kiểu, bỏ trùng, xử lý outlier"
  - "Viết transform theo method chaining bằng .pipe cho dễ đọc, dễ test"
  - "Đọc dữ liệu từ nhiều nguồn: CSV, database (SQL), API"
  - "Tổ chức pipeline thành hàm tái lặp được và xuất kết quả ra file/DB"
  - "Áp dụng kỹ thuật tiết kiệm bộ nhớ với dữ liệu lớn: chunksize, dtype phù hợp"
related:
  - "glossary:etl"
  - "glossary:dataframe"
  - "skill:nta-refactor"
---

## Vì sao quan trọng

Dữ liệu thực tế bẩn và nằm rải rác: CSV từ phòng kinh doanh, bảng trong database, JSON từ
API. **ETL (Extract-Transform-Load)** là khung tư duy chuẩn để biến đống đó thành dữ liệu
sạch, dùng được, và làm lại được mỗi kỳ. Pipeline tốt là pipeline **tái lặp** (chạy lại cho
kết quả như nhau) và **đọc được** (người sau hiểu được). Đây là kỹ năng phân biệt người
"nghịch data" với người "làm data engineering".

## ETL là gì

| Bước | Việc làm | Ví dụ |
|------|----------|-------|
| **Extract** | lấy dữ liệu thô từ nguồn | đọc CSV, query DB, gọi API |
| **Transform** | làm sạch + biến đổi | bỏ trùng, ép kiểu, tính cột mới |
| **Load** | ghi kết quả ra đích | xuất CSV/Parquet, ghi vào DB |

> Nguyên tắc: **không bao giờ sửa file nguồn**. Extract đọc bản thô, Transform tạo bản mới,
> Load ghi ra nơi khác. Như vậy chạy lại luôn cho kết quả nhất quán và dễ debug.

## Extract — đọc từ nhiều nguồn

```python
import pandas as pd

# CSV
df_csv = pd.read_csv("sales.csv")

# Database (SQL) — dùng SQLAlchemy engine
from sqlalchemy import create_engine
engine = create_engine("postgresql://user:pass@localhost/shop")
df_db = pd.read_sql("SELECT * FROM orders WHERE created_at >= '2026-01-01'", engine)

# API — trả JSON, ép thẳng vào DataFrame
import requests
data = requests.get("https://api.example.com/orders", timeout=10).json()
df_api = pd.DataFrame(data["items"])
```

## Transform — làm sạch dữ liệu

```python
def clean(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()                                   # không sửa bản gốc
    # chuẩn hóa kiểu
    df["order_date"] = pd.to_datetime(df["order_date"], errors="coerce")
    df["price"] = pd.to_numeric(df["price"], errors="coerce")
    # bỏ trùng
    df = df.drop_duplicates(subset=["order_id"])
    # chuẩn hóa chuỗi: bỏ khoảng trắng, thống nhất chữ thường
    df["product"] = df["product"].str.strip().str.lower()
    # xử lý outlier: cắt giá âm hoặc quá lớn
    df = df[(df["price"] > 0) & (df["price"] < 1_000_000)]
    return df
```

> `errors="coerce"` biến giá trị không ép được thành `NaN` thay vì làm sập cả pipeline —
> sau đó `isna()` để đếm và quyết định xử lý. An toàn hơn để nó nổ giữa chừng.

## Method chaining với .pipe

`.pipe` cho phép nối các bước transform thành chuỗi đọc từ trên xuống, mỗi hàm nhận và trả
DataFrame:

```python
def add_total(df):   df = df.copy(); df["total"] = df["qty"] * df["price"]; return df
def filter_paid(df): return df[df["status"] == "paid"]

result = (
    df_csv
    .pipe(clean)          # làm sạch
    .pipe(add_total)      # thêm cột tính toán
    .pipe(filter_paid)    # lọc đơn đã thanh toán
)
```

```python
# ❌ khó đọc, biến trung gian rối, dễ dùng nhầm bản cũ
tmp1 = clean(df_csv)
tmp2 = add_total(tmp1)
result = filter_paid(tmp1)   # bug: lỡ dùng tmp1 thay vì tmp2

# ✅ chuỗi .pipe: rõ thứ tự, không có biến trung gian để dùng nhầm
```

> Mỗi hàm transform nên **thuần** (chỉ dựa vào đầu vào, trả bản mới, không đổi biến ngoài).
> Như vậy test được từng bước độc lập. Skill `/nta-refactor` giúp tách bước rối thành chuỗi.

## Load & tổ chức pipeline tái lặp

Gom cả ETL vào một hàm để chạy lại được:

```python
def run_pipeline(src_path: str, out_path: str) -> pd.DataFrame:
    df = pd.read_csv(src_path)                    # Extract
    result = df.pipe(clean).pipe(add_total).pipe(filter_paid)  # Transform
    result.to_parquet(out_path, index=False)      # Load (Parquet nhẹ hơn CSV)
    return result

if __name__ == "__main__":
    run_pipeline("sales_raw.csv", "sales_clean.parquet")
```

| Định dạng xuất | Khi dùng |
|----------------|----------|
| CSV | chia sẻ cho người khác mở bằng Excel |
| Parquet | dữ liệu lớn, lưu kèm kiểu, đọc lại nhanh & nhẹ |
| ghi vào DB (`to_sql`) | đưa kết quả cho ứng dụng khác dùng |

## Dữ liệu lớn — tiết kiệm bộ nhớ

Khi file to hơn RAM, đừng đọc hết một lần:

```python
# đọc theo lô (chunk) rồi cộng dồn kết quả
total = 0
for chunk in pd.read_csv("huge.csv", chunksize=100_000):
    total += chunk["total"].sum()

# khai báo dtype tiết kiệm ngay khi đọc — giảm RAM đáng kể
df = pd.read_csv("huge.csv", dtype={
    "product": "category",   # chuỗi lặp lại nhiều → category rất nhẹ
    "qty": "int32",          # int32 thay vì int64 mặc định
})
usecols = pd.read_csv("huge.csv", usecols=["order_id", "total"])  # chỉ đọc cột cần
```

> `category` cho cột chuỗi ít giá trị khác nhau (product, region, status) và ép số về kiểu
> nhỏ (`int32`, `float32`) thường cắt được nửa RAM trở lên.

## Cạm bẫy hay gặp

- Sửa trực tiếp file/DataFrame nguồn → chạy lại pipeline ra kết quả khác, không tái lặp được.
- Ép kiểu không dùng `errors="coerce"` → một ô rác làm sập cả job thay vì thành NaN xử lý sau.
- Quên `drop_duplicates` sau khi merge nhiều nguồn → số liệu bị đếm trùng, báo cáo sai.
- Đọc cả file khổng lồ bằng một `read_csv` → hết RAM; quên `chunksize`/`dtype`/`usecols`.
- Cột `object` (chuỗi) không ép về `category` với dữ liệu lớn → tốn RAM và chậm khi groupby.

## Ghi nhớ

Tư duy theo **ETL**: Extract từ nhiều nguồn (CSV/DB/API), Transform để làm sạch (**ép kiểu
với `coerce`, bỏ trùng, cắt outlier**), Load ra đích (**Parquet cho dữ liệu lớn**). Viết
transform thành **hàm thuần** nối bằng **`.pipe`** để dễ đọc và test. Gói cả pipeline vào
một hàm **tái lặp được**. Dữ liệu lớn thì **`chunksize` + `dtype` tiết kiệm** (category,
int32) và chỉ đọc cột cần. Không bao giờ sửa dữ liệu nguồn.
