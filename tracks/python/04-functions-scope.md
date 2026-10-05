---
level: "python-core"
order: 4
title: "Hàm & Scope"
est: "4-5 giờ"
checklist:
  - "Định nghĩa hàm với tham số vị trí, mặc định, và type hint"
  - "Dùng *args và **kwargs để nhận số lượng tham số linh hoạt"
  - "Phân biệt tham số vị trí (positional) và tham số theo tên (keyword)"
  - "Hiểu scope (local/global) và vì sao không nên dùng biến global"
  - "Tránh bẫy mutable default argument"
related:
  - "glossary:scope"
  - "skill:nta-code-review"
  - "skill:nta-refactor"
---

## Vì sao quan trọng

Hàm là đơn vị tái sử dụng code. Python cho phép truyền tham số **rất linh hoạt** (mặc định,
theo tên, số lượng tùy ý) — nắm được giúp đọc code thư viện (đầy `*args, **kwargs`) và viết
API hàm dễ dùng. Kèm theo là hiểu **scope** để tránh bug biến "biến mất" hay bị ghi đè ngoài
ý muốn.

## Định nghĩa hàm

```python
def chao(ten: str, loi: str = "Xin chào") -> str:
    """Trả về lời chào."""          # docstring
    return f"{loi}, {ten}!"

print(chao("An"))                    # dùng mặc định: "Xin chào, An!"
print(chao("Bình", "Hi"))           # ghi đè mặc định
print(chao(loi="Hello", ten="An"))  # gọi theo TÊN, thứ tự tùy ý
```

## Positional vs keyword argument

```python
def tao_user(ten, tuoi, email):
    ...

tao_user("An", 25, "an@x.com")                     # positional: đúng thứ tự
tao_user(ten="An", email="an@x.com", tuoi=25)      # keyword: rõ ràng, thứ tự tùy ý
```

> Khi hàm có nhiều tham số, **gọi theo tên** giúp code tự giải thích: `create(active=True)`
> rõ hơn `create(True)`.

## *args & **kwargs

```python
def tong(*args):                     # gom mọi positional arg thành tuple
    return sum(args)

print(tong(1, 2, 3, 4))              # 10

def config(**kwargs):                # gom mọi keyword arg thành dict
    for k, v in kwargs.items():
        print(f"{k} = {v}")

config(debug=True, port=8000)        # debug=True, port=8000

# kết hợp: thứ tự bắt buộc là (vị trí, *args, **kwargs)
def f(a, *args, **kwargs):
    ...
```

## Scope: local vs global

```python
x = 10                    # global

def f():
    x = 20                # LOCAL mới, không ảnh hưởng global
    print(x)              # 20

f()
print(x)                  # 10 (global không đổi)

# muốn sửa global (KHÔNG khuyến khích) phải khai báo:
def tang():
    global x
    x += 1                # giờ mới sửa được global
```

> **Tránh dùng `global`.** Thay vì sửa biến ngoài, hãy **truyền vào tham số và return kết
> quả** — code dễ test và dễ hiểu hơn nhiều.

## Bẫy mutable default argument

```python
# ❌ BẪY KINH ĐIỂN: default list được tạo MỘT LẦN, chia sẻ giữa các lần gọi
def them(item, gio=[]):
    gio.append(item)
    return gio

print(them("a"))    # ['a']
print(them("b"))    # ['a', 'b'] ← không phải ['b']! list cũ vẫn còn

# ✅ đúng: dùng None làm sentinel
def them(item, gio=None):
    if gio is None:
        gio = []
    gio.append(item)
    return gio
```

## Cạm bẫy hay gặp

- **Mutable default** (`def f(x=[])`) → list/dict dùng chung giữa các lần gọi; dùng `None`.
- Lạm dụng `global` → khó test, khó lần theo luồng dữ liệu; hãy truyền tham số & return.
- Quên `return` → hàm trả về `None` ngầm, gọi xong "mất" kết quả.
- Đặt tham số mặc định trước tham số bắt buộc → `SyntaxError`.
- Nhầm `*args` (tuple) với `**kwargs` (dict) — một cái vị trí, một cái theo tên.

## Ghi nhớ

Hàm Python truyền tham số linh hoạt: **mặc định**, **theo tên**, và `*args`/`**kwargs` cho
số lượng tùy ý. Ưu tiên **gọi theo tên** khi nhiều tham số. Hiểu **scope**: biến trong hàm
là local; tránh `global` — hãy truyền vào và return ra. Cẩn thận **mutable default
argument**, luôn dùng `None` rồi khởi tạo bên trong.
