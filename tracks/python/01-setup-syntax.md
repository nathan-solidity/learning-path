---
level: "python-core"
order: 1
title: "Cài đặt & cú pháp cơ bản"
est: "3-4 giờ"
checklist:
  - "Cài Python 3.12+ và chạy được file .py cũng như REPL"
  - "Hiểu indentation (thụt lề) quyết định khối lệnh, không dùng dấu ngoặc {}"
  - "Khai báo biến và biết Python là dynamic typing nhưng khuyến khích type hint"
  - "Dùng f-string để format chuỗi và print/input cơ bản"
  - "Viết comment và docstring đúng chỗ"
related:
  - "glossary:repl"
  - "skill:nta-explain"
---

## Vì sao bắt đầu từ đây

Python nổi tiếng dễ đọc vì **dùng thụt lề (indentation) thay cho dấu ngoặc** để phân khối
lệnh. Điều này ép code phải sạch, nhưng cũng là **lỗi phổ biến nhất của người mới**: sai
một dấu space là chương trình chạy sai hoặc báo `IndentationError`. Nắm chắc cú pháp nền và
cách chạy code trước khi vào bất cứ thư viện nào.

## Cài đặt & chạy code

```bash
python3 --version        # kiểm tra: nên là 3.12+
python3 hello.py         # chạy một file
python3                  # mở REPL (gõ lệnh chạy ngay), thoát bằng exit()
```

> Trên macOS/Linux dùng `python3`; Windows thường là `python`. Nên cài qua **pyenv** hoặc
> **uv** để đổi version dễ. Bài 11 sẽ nói về môi trường ảo — tạm thời chạy trực tiếp là được.

## Indentation quyết định khối lệnh

```python
# ✅ đúng: khối lệnh nằm trong thụt lề (chuẩn 4 space)
if x > 0:
    print("dương")
    print("vẫn trong if")
print("ngoài if")

# ❌ sai: thiếu thụt lề → IndentationError
if x > 0:
print("lỗi")
```

> Python **không dùng `{}`** và **không cần `;`** cuối dòng. Dấu `:` mở khối, thụt lề định
> nghĩa nội dung khối. Dùng **4 space**, đừng trộn tab với space.

## Biến & dynamic typing

```python
name = "An"          # str, không cần khai báo kiểu
age = 25             # int
height = 1.75        # float
is_active = True     # bool

age = "hai mươi"     # hợp lệ: Python là dynamic typing, biến đổi kiểu được
```

Python **không bắt khai báo kiểu**, nhưng thực tế nên dùng **type hint** cho rõ ràng (bài 13):

```python
name: str = "An"
age: int = 25
```

## f-string & in/nhập

```python
name = "An"
age = 25

print(f"Tôi là {name}, {age} tuổi")          # f-string: cách format khuyên dùng
print(f"Sang năm: {age + 1}")                 # nhúng biểu thức trong {}
print(f"Giá: {1000000:,} đ")                  # định dạng số: 1,000,000

tuoi = input("Nhập tuổi: ")                   # input LUÔN trả về str
tuoi_so = int(tuoi)                           # phải ép kiểu để tính toán
```

## Comment & docstring

```python
# comment một dòng: giải thích vì sao, không phải cái gì

def tinh_dien_tich(rong: float, cao: float) -> float:
    """Tính diện tích hình chữ nhật.        <- docstring: mô tả hàm/module/class

    Dùng ba dấu nháy, đặt ngay dưới def.
    """
    return rong * cao
```

## So sánh nhanh với ngôn ngữ khác

| Đặc điểm | Python | Java/JS |
|----------|--------|---------|
| Khối lệnh | Thụt lề + `:` | Dấu `{}` |
| Kết thúc dòng | Xuống dòng | Dấu `;` |
| Khai báo kiểu | Không bắt buộc (dynamic) | Bắt buộc (Java) |
| Format chuỗi | f-string `f"{x}"` | Template literal / String.format |

## Cạm bẫy hay gặp

- Trộn tab và space trong cùng file → `TabError`. Đặt editor auto convert tab → 4 space.
- Quên dấu `:` sau `if`/`for`/`def` → `SyntaxError`.
- Tưởng `input()` trả về số → nó luôn trả `str`, phải `int()`/`float()` để tính.
- Dùng `print("x" + age)` với age là int → `TypeError`; dùng f-string thay vì cộng chuỗi.
- Sai thụt lề dù chỉ 1 space trong khối → chạy sai logic mà không báo lỗi rõ ràng.

## Ghi nhớ

Python dùng **thụt lề 4 space + dấu `:`** thay cho `{}`, không cần `;`. Biến là dynamic
typing nhưng nên thêm type hint. Dùng **f-string** để format chuỗi, nhớ `input()` luôn trả
`str`. Sạch từ thói quen thụt lề đúng ngay từ bài đầu.
