---
level: "python-core"
order: 6
title: "Module & Package cơ bản"
est: "3-4 giờ"
checklist:
  - "Import module theo nhiều cách: import, from...import, as"
  - "Tách code ra nhiều file .py và import lẫn nhau"
  - "Hiểu if __name__ == '__main__' dùng để làm gì"
  - "Dùng một vài module chuẩn hữu ích (datetime, random, math, os)"
  - "Hiểu package (thư mục có __init__.py) và cách tổ chức code theo thư mục"
related:
  - "glossary:module"
---

## Vì sao quan trọng

Khi code lớn lên, không thể nhét tất cả vào một file. **Module** (file `.py`) và **package**
(thư mục chứa module) giúp chia code theo chức năng, tái sử dụng và tránh trùng lặp. Hiểu
import và `if __name__ == "__main__"` là điều kiện để đọc bất cứ dự án Python thật nào.

## Các cách import

```python
import math                      # dùng: math.sqrt(9)
from math import sqrt, pi        # dùng thẳng: sqrt(9), pi
from math import sqrt as can     # đổi tên: can(9)
import numpy as np               # alias quen thuộc (bài data/ML)

# ❌ tránh: from math import *  → nhập hết, dễ đè tên, không rõ đến từ đâu
```

## Tách code thành nhiều file

```python
# ---- file: calc.py ----
def cong(a, b):
    return a + b

def tru(a, b):
    return a - b

# ---- file: main.py (cùng thư mục) ----
from calc import cong, tru

print(cong(2, 3))     # 5
```

> Import theo **tên file không có `.py`**. Python tìm module trong thư mục hiện tại, rồi
> tới các đường dẫn trong `sys.path`.

## if __name__ == "__main__"

```python
# ---- file: calc.py ----
def cong(a, b):
    return a + b

if __name__ == "__main__":
    # CHỈ chạy khi gọi trực tiếp `python calc.py`
    # KHÔNG chạy khi file này bị import từ nơi khác
    print("test:", cong(2, 3))
```

> Khi bị `import`, `__name__` là tên module (`"calc"`). Khi chạy trực tiếp, `__name__` là
> `"__main__"`. Dùng khối này để đặt code chạy thử / entry point mà không ảnh hưởng khi
> file được import.

## Vài module chuẩn hữu ích

```python
import datetime, random, math, os

print(datetime.date.today())          # ngày hôm nay
print(datetime.datetime.now())        # thời điểm hiện tại
print(random.randint(1, 6))           # số ngẫu nhiên 1-6
print(random.choice(["a", "b", "c"])) # chọn ngẫu nhiên
print(math.ceil(4.2), math.floor(4.8))# 5 4
print(os.getcwd())                    # thư mục hiện tại
print(os.environ.get("HOME"))         # biến môi trường
```

## Package — tổ chức theo thư mục

```
myapp/
├── __init__.py          # đánh dấu đây là package (có thể rỗng)
├── models/
│   ├── __init__.py
│   └── user.py
└── utils/
    ├── __init__.py
    └── format.py
```

```python
# import từ package
from myapp.models.user import User
from myapp.utils.format import to_currency
```

> Thư mục có `__init__.py` là một **package**. Python hiện đại (3.3+) hỗ trợ "namespace
> package" không cần `__init__.py`, nhưng thêm file rỗng này vẫn là thói quen an toàn, rõ ràng.

## Cạm bẫy hay gặp

- `from module import *` → nhập tất cả, đè tên biến, khó biết hàm đến từ đâu; import cụ thể.
- Đặt tên file trùng module chuẩn (vd `random.py`, `json.py`) → import nhầm file của mình.
- Quên `if __name__ == "__main__"` → code test chạy luôn cả khi file bị import.
- **Circular import** (a import b, b import a) → lỗi; tách phần chung ra module thứ ba.
- Chạy `python file.py` từ sai thư mục → `ModuleNotFoundError` vì đường dẫn tương đối lệch.

## Ghi nhớ

Chia code thành **module** (file `.py`) và **package** (thư mục). Import cụ thể (`from x
import y`), tránh `import *`. Dùng **`if __name__ == "__main__"`** cho code chạy trực tiếp
để không ảnh hưởng khi bị import. Thư viện chuẩn (`datetime`, `random`, `os`, `math`...) có
sẵn rất nhiều — tra trước khi tự viết.
