---
level: "python-core"
order: 3
title: "Control flow & Comprehension"
est: "4-5 giờ"
checklist:
  - "Viết if/elif/else và dùng toán tử logic and/or/not"
  - "Dùng for lặp qua collection và range, biết enumerate/zip"
  - "Dùng while và break/continue đúng chỗ"
  - "Viết list/dict comprehension thay cho vòng lặp gom dữ liệu"
  - "Hiểu truthy/falsy trong Python (0, '', [], None đều là falsy)"
related:
  - "glossary:comprehension"
---

## Vì sao quan trọng

Control flow là logic của mọi chương trình. Nhưng điều làm code Python "Pythonic" là
**comprehension** — cách viết vòng lặp gom dữ liệu gọn trong một dòng. Đọc/viết được
comprehension là dấu hiệu bạn bắt đầu tư duy như một Python developer, không phải dịch code
từ ngôn ngữ khác.

## if / elif / else

```python
diem = 75

if diem >= 90:
    xep_loai = "A"
elif diem >= 70:
    xep_loai = "B"
else:
    xep_loai = "C"

# toán tử logic dùng TỪ, không dùng &&/||
if diem >= 50 and diem < 90:
    print("đạt nhưng chưa xuất sắc")

# viết gọn (ternary)
trang_thai = "đạt" if diem >= 50 else "rớt"
```

## Truthy / Falsy

```python
# Các giá trị FALSY (coi như False): 0, 0.0, "", [], {}, (), None, False
ten = ""
if not ten:                      # rỗng → falsy → vào đây
    print("tên trống")

items = []
if items:                        # list rỗng là falsy → KHÔNG vào đây
    print("có phần tử")
else:
    print("danh sách rỗng")      # chạy dòng này
```

> Đây là cách kiểm tra "rỗng" chuẩn Python: `if not items` thay vì `if len(items) == 0`.

## Vòng lặp for

```python
for so in [1, 2, 3]:             # lặp qua phần tử trực tiếp
    print(so)

for i in range(5):               # 0,1,2,3,4
    print(i)

# enumerate: lấy cả index và giá trị
for i, ten in enumerate(["An", "Bình"]):
    print(f"{i}: {ten}")

# zip: ghép nhiều list song song
for ten, tuoi in zip(["An", "Bình"], [25, 30]):
    print(f"{ten} {tuoi} tuổi")
```

> Python **không dùng** `for (i=0; i<n; i++)`. Lặp qua phần tử trực tiếp; cần index thì
> `enumerate`, ghép nhiều list thì `zip`.

## while & break/continue

```python
n = 0
while n < 10:
    n += 1
    if n == 3:
        continue         # bỏ qua vòng này, sang vòng tiếp
    if n == 7:
        break            # thoát hẳn vòng lặp
    print(n)             # in 1,2,4,5,6
```

## Comprehension — dấu ấn Python

```python
nums = [1, 2, 3, 4, 5]

# ❌ cách dài dòng
binh_phuong = []
for n in nums:
    binh_phuong.append(n ** 2)

# ✅ list comprehension: gọn, nhanh, Pythonic
binh_phuong = [n ** 2 for n in nums]

# có điều kiện lọc
chan = [n for n in nums if n % 2 == 0]        # [2, 4]

# dict comprehension
binh_phuong_dict = {n: n ** 2 for n in nums}  # {1:1, 2:4, ...}

# set comprehension (lọc trùng luôn)
do_dai = {len(w) for w in ["a", "bb", "cc"]}  # {1, 2}
```

| Cách viết | Khi nào dùng |
|-----------|--------------|
| Vòng for thường | Logic phức tạp, nhiều dòng trong thân |
| List comprehension | Biến đổi/lọc list → list mới, một biểu thức |
| Dict/set comprehension | Tạo dict/set từ dữ liệu có sẵn |
| Generator (bài 9) | Dữ liệu lớn, không cần giữ hết trong bộ nhớ |

## Cạm bẫy hay gặp

- Viết `for i in range(len(arr))` rồi `arr[i]` → nên lặp trực tiếp hoặc dùng `enumerate`.
- Comprehension lồng 3 tầng trở lên → khó đọc; lúc đó quay lại vòng for thường.
- Quên `range(n)` chạy 0 đến n-1, **không gồm n**.
- Dùng `if len(x) == 0` thay vì `if not x` — kém Pythonic (nhưng không sai).
- Nhầm `and`/`or` với `&`/`|` (`&`/`|` là bitwise, dùng cho số/set — không phải logic bool).

## Ghi nhớ

Khối logic dùng **if/elif/else** với `and`/`or`/`not` (viết bằng từ). Lặp bằng **for qua
phần tử** (`enumerate` lấy index, `zip` ghép list), không dùng vòng `for(i++)`. Ghi nhớ
**truthy/falsy**: `0/""/[]/None` đều falsy, kiểm tra rỗng bằng `if not x`. Học viết
**comprehension** để gom/lọc dữ liệu gọn — đây là chất Python.
