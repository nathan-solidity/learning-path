---
level: "python-core"
order: 2
title: "Kiểu dữ liệu & Collection"
est: "4-5 giờ"
checklist:
  - "Phân biệt các kiểu cơ bản: int, float, str, bool, None"
  - "Dùng thành thạo list (thêm/xóa/slice) và biết list là mutable"
  - "Dùng dict để tra cứu theo key và duyệt items()"
  - "Biết khi nào dùng tuple (bất biến) và set (phần tử duy nhất)"
  - "Hiểu mutable vs immutable và hệ quả khi gán/truyền tham số"
related:
  - "glossary:mutable-immutable"
---

## Vì sao đây là nền tảng

Hầu hết code Python là **thao tác trên collection**: list, dict, tuple, set. Chọn đúng cấu
trúc dữ liệu quyết định code chạy đúng và nhanh hay không. Đặc biệt phải hiểu **mutable vs
immutable** — nguồn của rất nhiều bug khó hiểu về sau (nhất là khi làm việc với pandas, ML).

## Kiểu cơ bản

```python
so_nguyen = 42            # int (không giới hạn độ lớn)
so_thuc = 3.14            # float
chuoi = "xin chào"        # str
dung_sai = True           # bool (True/False, viết hoa chữ đầu)
rong = None               # None: "không có giá trị" (khác 0, khác "")

print(type(so_nguyen))    # <class 'int'>
print(10 / 3)             # 3.333... (luôn ra float)
print(10 // 3)            # 3 (chia lấy nguyên)
print(10 % 3)             # 1 (chia lấy dư)
print(2 ** 10)            # 1024 (lũy thừa)
```

## list — danh sách có thứ tự, sửa được

```python
nums = [3, 1, 4, 1, 5]
nums.append(9)            # thêm cuối
nums.insert(0, 0)         # chèn vị trí
nums.remove(1)            # xóa giá trị 1 đầu tiên
print(nums[0], nums[-1])  # phần tử đầu / cuối

# slicing [start:stop:step] — dùng cực nhiều
print(nums[1:3])          # từ index 1 đến trước 3
print(nums[:2])           # 2 phần tử đầu
print(nums[::-1])         # đảo ngược list
print(len(nums))          # độ dài
```

## dict — tra cứu theo key

```python
user = {"name": "An", "age": 25}
print(user["name"])              # truy cập: KeyError nếu không có key
print(user.get("email", "N/A"))  # an toàn: trả mặc định nếu thiếu key
user["email"] = "an@x.com"       # thêm/sửa

for key, value in user.items():  # duyệt cả key và value
    print(f"{key}: {value}")

print("name" in user)            # kiểm tra key tồn tại
```

## tuple & set

```python
# tuple: giống list nhưng BẤT BIẾN (không sửa được) — dùng cho dữ liệu cố định
diem = (10.5, 20.3)          # tọa độ, không nên đổi
# diem[0] = 5                # ❌ TypeError

# set: tập hợp phần tử DUY NHẤT, không thứ tự — lọc trùng cực nhanh
tags = {"python", "web", "python"}   # → {"python", "web"}
tags.add("api")
print("web" in tags)         # kiểm tra tồn tại rất nhanh (O(1))
unique = set([1, 1, 2, 3])   # lọc trùng: {1, 2, 3}
```

## Mutable vs Immutable — điểm dễ dính bug

```python
# list là MUTABLE: gán chỉ tạo thêm tên trỏ cùng object
a = [1, 2, 3]
b = a
b.append(4)
print(a)          # [1, 2, 3, 4] ← a cũng đổi! vì a và b cùng trỏ 1 list

c = a.copy()      # muốn bản riêng: dùng copy()
c.append(5)
print(a)          # không đổi
```

| Kiểu | Mutable? | Dùng khi |
|------|----------|----------|
| list | ✅ sửa được | Danh sách thay đổi thường xuyên |
| dict | ✅ sửa được | Tra cứu theo key |
| set | ✅ sửa được | Phần tử duy nhất, kiểm tra tồn tại nhanh |
| tuple | ❌ bất biến | Dữ liệu cố định, làm key của dict |
| str | ❌ bất biến | Chuỗi (mọi thao tác tạo chuỗi mới) |

## Cạm bẫy hay gặp

- `b = a` với list **không copy** — cả hai trỏ cùng object; sửa `b` là sửa `a`. Dùng `.copy()`.
- Truy cập `dict[key]` với key không tồn tại → `KeyError`; dùng `.get(key, default)`.
- Nhầm `is` với `==`: `==` so giá trị, `is` so cùng object; so sánh giá trị luôn dùng `==`.
- Đặt list/dict làm **giá trị mặc định của tham số hàm** → chia sẻ giữa các lần gọi (bài 4).
- Tưởng set có thứ tự → set không đảm bảo thứ tự; cần thứ tự thì dùng list.

## Ghi nhớ

Bốn collection cốt lõi: **list** (có thứ tự, sửa được), **dict** (tra theo key), **tuple**
(bất biến), **set** (duy nhất). Nhớ **mutable vs immutable**: gán list/dict chỉ tạo thêm
tên trỏ cùng object — cần bản riêng thì `.copy()`. Slicing `[start:stop:step]` là công cụ
dùng hằng ngày.
