---
level: "python-advanced"
order: 7
title: "OOP: Class & Dataclass"
est: "5-6 giờ"
checklist:
  - "Định nghĩa class với __init__, thuộc tính và method"
  - "Hiểu self và phân biệt instance attribute với class attribute"
  - "Dùng kế thừa (inheritance) và gọi super()"
  - "Dùng @dataclass để viết class chứa dữ liệu gọn hơn"
  - "Biết dùng @property và dunder method (__str__, __repr__, __eq__)"
related:
  - "glossary:oop"
---

## Vì sao quan trọng

OOP giúp gom dữ liệu và hành vi liên quan vào một chỗ (class). Framework Python (FastAPI,
Django, SQLAlchemy, PyTorch) đều xoay quanh class — không hiểu OOP thì không đọc được code
của chúng. Python còn có **`@dataclass`** giúp viết class chứa dữ liệu ngắn gọn, dùng cực
nhiều trong code hiện đại.

## Class cơ bản

```python
class User:
    loai = "người dùng"                 # class attribute: dùng chung mọi instance

    def __init__(self, ten: str, tuoi: int):
        self.ten = ten                   # instance attribute: riêng từng object
        self.tuoi = tuoi

    def gioi_thieu(self) -> str:         # method: tham số đầu luôn là self
        return f"{self.ten}, {self.tuoi} tuổi"

u = User("An", 25)
print(u.gioi_thieu())                    # An, 25 tuổi
print(u.ten)                             # An
```

> `self` là **chính object đang gọi method**. Python truyền nó tự động — bạn không truyền
> tay khi gọi (`u.gioi_thieu()` chứ không `u.gioi_thieu(u)`).

## Kế thừa & super()

```python
class Animal:
    def __init__(self, ten: str):
        self.ten = ten

    def keu(self) -> str:
        return "..."

class Dog(Animal):
    def __init__(self, ten: str, giong: str):
        super().__init__(ten)            # gọi __init__ của lớp cha
        self.giong = giong

    def keu(self) -> str:                # ghi đè (override) method cha
        return "Gâu gâu"

d = Dog("Mực", "Corgi")
print(d.ten, d.keu())                    # Mực Gâu gâu
```

## @dataclass — class chứa dữ liệu gọn

```python
from dataclasses import dataclass

# ❌ class thường: lặp __init__ dài dòng
class PointOld:
    def __init__(self, x, y):
        self.x = x
        self.y = y

# ✅ dataclass: tự sinh __init__, __repr__, __eq__
@dataclass
class Point:
    x: float
    y: float
    label: str = "origin"                # có giá trị mặc định

p = Point(1.0, 2.0)
print(p)                                 # Point(x=1.0, y=2.0, label='origin')
print(p == Point(1.0, 2.0))              # True (tự có __eq__)
```

> Dùng `@dataclass` cho mọi class **chủ yếu chứa dữ liệu** (DTO, config, bản ghi). Nó tự
> sinh constructor, so sánh, in đẹp — bớt code lặp và bớt lỗi.

## @property & dunder method

```python
class Circle:
    def __init__(self, r: float):
        self.r = r

    @property                            # dùng như thuộc tính, không cần ()
    def dien_tich(self) -> float:
        return 3.14159 * self.r ** 2

    def __str__(self) -> str:            # cách hiển thị cho người đọc (print)
        return f"Hình tròn r={self.r}"

    def __repr__(self) -> str:           # cách hiển thị cho debug (REPL, log)
        return f"Circle(r={self.r})"

c = Circle(2)
print(c.dien_tich)                       # 12.56636 (KHÔNG có dấu ())
print(c)                                 # Hình tròn r=2
```

## Cạm bẫy hay gặp

- Quên `self` trong method (`def f():` thay vì `def f(self):`) → `TypeError` khi gọi.
- Dùng **mutable class attribute** (list/dict) → chia sẻ giữa mọi instance; khởi tạo trong `__init__`.
- Không gọi `super().__init__()` khi kế thừa → thuộc tính lớp cha không được set.
- Nhầm `@property` là method → gọi `c.dien_tich()` (thừa `()`) khi đã là property.
- Lạm dụng kế thừa nhiều tầng → khó lần; ưu tiên **composition** (chứa object khác) khi hợp lý.

## Ghi nhớ

Class gom **dữ liệu (`self.x`) + hành vi (method)**; `self` là object hiện tại. Kế thừa
dùng `super()` để gọi lớp cha. Class chứa dữ liệu thì dùng **`@dataclass`** cho gọn. `@property`
biến method thành thuộc tính đọc; `__str__`/`__repr__` quyết định cách object hiển thị.
