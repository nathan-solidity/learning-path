---
level: "python-core"
order: 5
title: "String & File I/O"
est: "4-5 giờ"
checklist:
  - "Dùng thành thạo các method chuỗi: split, join, strip, replace, upper/lower"
  - "Đọc/ghi file text với with open() và hiểu vì sao dùng context manager"
  - "Đọc/ghi JSON bằng module json"
  - "Làm việc với đường dẫn bằng pathlib thay vì nối chuỗi"
  - "Hiểu encoding (utf-8) khi đọc/ghi file có tiếng Việt"
related:
  - "glossary:context-manager"
  - "skill:nta-code-review"
---

## Vì sao quan trọng

Gần như mọi tool và script đều **đọc dữ liệu vào, xử lý, ghi ra**: đọc file config, parse
CSV/JSON, ghi log, xuất báo cáo. Nắm string method và file I/O đúng cách (context manager,
encoding, pathlib) giúp tránh lỗi file không đóng, hỏng ký tự tiếng Việt, và đường dẫn sai
khi chạy trên máy khác.

## String method dùng nhiều nhất

```python
s = "  Xin Chào, Thế Giới  "

print(s.strip())                    # bỏ khoảng trắng đầu/cuối
print(s.lower())                    # thường hóa
print(s.replace("Chào", "Hi"))      # thay thế
print("a,b,c".split(","))           # tách → ['a', 'b', 'c']
print("-".join(["a", "b", "c"]))    # nối → 'a-b-c'
print("chào".startswith("ch"))      # True
print("file.txt".endswith(".txt"))  # True
print("abc".find("b"))              # 1 (vị trí, -1 nếu không có)
```

> `split()` và `join()` là cặp đôi xử lý chuỗi quan trọng nhất: tách chuỗi thành list, gom
> list thành chuỗi. Nhớ `join` gọi trên **dấu nối**, nhận list làm tham số.

## Đọc/ghi file với context manager

```python
# ✅ LUÔN dùng with: tự động đóng file kể cả khi có lỗi
with open("data.txt", "r", encoding="utf-8") as f:
    noi_dung = f.read()             # đọc toàn bộ
    # hoặc đọc từng dòng (tiết kiệm bộ nhớ với file lớn):
    # for dong in f:
    #     print(dong.strip())

with open("out.txt", "w", encoding="utf-8") as f:
    f.write("dòng 1\n")
    f.write("dòng 2\n")
```

| Mode | Ý nghĩa |
|------|---------|
| `"r"` | Đọc (mặc định); lỗi nếu file không tồn tại |
| `"w"` | Ghi, **xóa sạch** nội dung cũ |
| `"a"` | Ghi thêm vào cuối (append) |
| `"x"` | Tạo mới; lỗi nếu đã tồn tại |

> **Vì sao dùng `with`**: nó là *context manager*, tự gọi `f.close()` khi ra khỏi khối kể
> cả khi có exception. Không dùng `with` → dễ quên đóng file, rò rỉ tài nguyên.

## JSON — định dạng trao đổi phổ biến nhất

```python
import json

data = {"ten": "An", "tuoi": 25, "tags": ["python", "web"]}

# ghi JSON ra file
with open("user.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)  # ensure_ascii=False giữ tiếng Việt

# đọc JSON từ file
with open("user.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# chuỗi JSON <-> dict
s = json.dumps(data, ensure_ascii=False)   # dict → chuỗi
d = json.loads(s)                           # chuỗi → dict
```

## pathlib — làm việc với đường dẫn

```python
from pathlib import Path

# ❌ nối chuỗi: sai trên Windows (\ vs /), dễ lỗi
path = "data" + "/" + "file.txt"

# ✅ pathlib: đúng trên mọi OS
p = Path("data") / "file.txt"       # dùng / để nối
print(p.exists())                   # file tồn tại?
print(p.suffix)                     # '.txt'
print(p.stem)                       # 'file'
print(p.parent)                     # 'data'

# đọc/ghi nhanh không cần open()
Path("note.txt").write_text("xin chào", encoding="utf-8")
noi_dung = Path("note.txt").read_text(encoding="utf-8")
```

## Cạm bẫy hay gặp

- Không dùng `with` → file không đóng, có thể mất dữ liệu chưa flush hoặc rò rỉ handle.
- Quên `encoding="utf-8"` → tiếng Việt/emoji hỏng hoặc `UnicodeDecodeError` (nhất là Windows).
- Mở mode `"w"` khi định append → **xóa sạch** file cũ; muốn thêm thì dùng `"a"`.
- Nối đường dẫn bằng `+` với `/` → sai trên Windows; dùng `pathlib` hoặc `os.path.join`.
- `json.dump` không đặt `ensure_ascii=False` → tiếng Việt bị escape thành `\uxxxx`.

## Ghi nhớ

String: nhớ cặp **`split`/`join`** và các method `strip/replace/lower`. File: **luôn dùng
`with open(..., encoding="utf-8")`** — context manager tự đóng file an toàn. Dữ liệu trao
đổi dùng **`json`** (`dump`/`load`), đường dẫn dùng **`pathlib`** (`Path(...) / "file"`)
thay vì nối chuỗi.
