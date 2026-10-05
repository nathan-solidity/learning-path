---
level: "python-advanced"
order: 9
title: "Iterator, Generator & Decorator"
est: "5-6 giờ"
checklist:
  - "Hiểu iterable vs iterator và cách for lặp qua chúng"
  - "Viết generator bằng yield và biết vì sao tiết kiệm bộ nhớ"
  - "Dùng generator expression cho dữ liệu lớn"
  - "Hiểu decorator là hàm nhận hàm, trả về hàm mới"
  - "Viết được một decorator đơn giản (ví dụ đo thời gian, log)"
related:
  - "glossary:generator"
  - "glossary:decorator"
  - "skill:nta-perf-audit"
---

## Vì sao quan trọng

Đây là ba khái niệm "nâng cao đặc trưng Python" xuất hiện khắp nơi trong code thư viện.
**Generator** giúp xử lý dữ liệu khổng lồ mà không nạp hết vào RAM (rất quan trọng cho
data/ML). **Decorator** là cách framework thêm hành vi (route, cache, auth) mà không sửa
hàm gốc — bạn sẽ gặp `@app.get`, `@property`, `@pytest.fixture` liên tục.

## Iterable vs Iterator

```python
# iterable: thứ có thể lặp (list, str, dict, file...) — có __iter__
nums = [1, 2, 3]

# iterator: đối tượng nhớ vị trí hiện tại — có __next__
it = iter(nums)
print(next(it))    # 1
print(next(it))    # 2
# for tự động gọi iter() rồi next() cho tới khi hết (StopIteration)
```

## Generator với yield

```python
# generator: sinh giá trị TỪNG CÁI khi cần, không tạo hết list trong bộ nhớ
def dem(n):
    i = 0
    while i < n:
        yield i          # 'yield' trả 1 giá trị rồi TẠM DỪNG, giữ nguyên trạng thái
        i += 1

for x in dem(3):         # 0, 1, 2
    print(x)

# so sánh bộ nhớ:
# ❌ list: tạo 10 triệu số trong RAM cùng lúc
tong = sum([i for i in range(10_000_000)])
# ✅ generator: mỗi lần chỉ giữ 1 số → gần như không tốn RAM
tong = sum(i for i in range(10_000_000))   # generator expression (dùng () thay [])
```

> Dùng generator khi **dữ liệu lớn hoặc vô hạn**, hoặc chỉ cần duyệt một lần. Dùng list khi
> cần truy cập ngẫu nhiên hay duyệt lại nhiều lần.

## Decorator — thêm hành vi không sửa hàm gốc

```python
import time
from functools import wraps

def do_thoi_gian(func):
    @wraps(func)                          # giữ tên/docstring hàm gốc
    def wrapper(*args, **kwargs):
        bat_dau = time.perf_counter()
        ket_qua = func(*args, **kwargs)   # gọi hàm gốc
        print(f"{func.__name__} chạy {time.perf_counter() - bat_dau:.4f}s")
        return ket_qua
    return wrapper

@do_thoi_gian                             # tương đương: cham = do_thoi_gian(cham)
def cham():
    time.sleep(0.5)

cham()                                    # cham chạy 0.50s
```

> Decorator **là hàm nhận một hàm và trả về hàm mới bọc quanh nó**. `@do_thoi_gian` chỉ là
> cú pháp gọn của `cham = do_thoi_gian(cham)`. Framework dùng pattern này để gắn route,
> cache, kiểm tra quyền... mà không đụng vào code hàm của bạn.

## Decorator thường gặp trong thực tế

```python
from functools import lru_cache

@lru_cache(maxsize=None)                  # nhớ kết quả, gọi lại với cùng tham số → tức thì
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

# @app.get("/users")   ← FastAPI: đăng ký route
# @property            ← biến method thành thuộc tính (bài 7)
# @staticmethod        ← method không cần self
```

## Cạm bẫy hay gặp

- Tưởng gọi generator là chạy ngay → nó **lười**, chỉ chạy khi bị lặp/`next()`.
- Duyệt generator xong rồi lặp lại → **rỗng**; generator chỉ đi được một lần.
- Viết decorator quên `@wraps(func)` → mất tên/docstring hàm gốc, khó debug.
- Nhầm `[...]` (list, tốn RAM) với `(...)` (generator expression, tiết kiệm) khi dữ liệu lớn.
- `lru_cache` trên hàm nhận tham số **không hashable** (list, dict) → `TypeError`.

## Ghi nhớ

**Generator** (`yield`) sinh giá trị từng cái, tiết kiệm RAM cho dữ liệu lớn — dùng `(...)`
thay `[...]`. **Decorator** là hàm bọc hàm để thêm hành vi (đo giờ, cache, route) mà không
sửa hàm gốc; nhớ `@wraps`. Hiểu hai thứ này để đọc được code framework, nơi `@...` xuất
hiện khắp nơi.
