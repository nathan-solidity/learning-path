---
level: "python-advanced"
order: 8
title: "Xử lý lỗi & Logging"
est: "4-5 giờ"
checklist:
  - "Dùng try/except/else/finally đúng cách"
  - "Bắt exception cụ thể thay vì except trần (bare except)"
  - "Định nghĩa custom exception kế thừa Exception"
  - "Dùng raise để ném lỗi và raise ... from để giữ nguyên nguyên nhân"
  - "Dùng module logging thay cho print để ghi log"
related:
  - "glossary:exception"
---

## Vì sao quan trọng

Code thật luôn gặp lỗi: file không có, mạng rớt, dữ liệu sai định dạng. Xử lý exception
đúng cách giúp chương trình **hỏng có kiểm soát** thay vì crash bí ẩn. Và khi lên
production, **logging** thay cho `print` là cách duy nhất để biết chuyện gì đã xảy ra.

## try / except / else / finally

```python
try:
    so = int(input("Nhập số: "))
    ket_qua = 10 / so
except ValueError:                       # bắt lỗi CỤ THỂ
    print("Không phải số hợp lệ")
except ZeroDivisionError:
    print("Không chia được cho 0")
else:
    print(f"Kết quả: {ket_qua}")         # chạy khi KHÔNG có lỗi
finally:
    print("Luôn chạy dù có lỗi hay không")  # dọn dẹp tài nguyên
```

## Bắt exception cụ thể, không bắt trần

```python
# ❌ bare except: nuốt MỌI lỗi kể cả KeyboardInterrupt, che giấu bug
try:
    lam_viec()
except:
    pass                                 # lỗi biến mất không dấu vết

# ✅ bắt đúng loại, log lại
try:
    lam_viec()
except (ConnectionError, TimeoutError) as e:
    logger.error(f"Lỗi mạng: {e}")
    raise                                # ném lại nếu không xử lý được
```

## Custom exception & raise ... from

```python
class InsufficientFundsError(Exception):
    """Số dư không đủ."""

def rut_tien(so_du: float, so_tien: float) -> float:
    if so_tien > so_du:
        raise InsufficientFundsError(f"Cần {so_tien}, chỉ có {so_du}")
    return so_du - so_tien

# giữ nguyên nguyên nhân gốc khi bọc lại lỗi
try:
    data = json.loads(raw)
except json.JSONDecodeError as e:
    raise ValueError("Config không hợp lệ") from e   # 'from e' giữ traceback gốc
```

> Custom exception giúp code gọi **bắt đúng loại lỗi nghiệp vụ** thay vì đoán qua message.
> `raise X from e` giữ lại chuỗi nguyên nhân — cực quý khi debug.

## logging thay cho print

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

logger.debug("chi tiết cho dev")         # cấp thấp nhất
logger.info("chương trình khởi động")
logger.warning("cấu hình thiếu, dùng mặc định")
logger.error("gọi API thất bại")
logger.exception("có lỗi")               # tự kèm traceback (dùng trong except)
```

| print | logging |
|-------|---------|
| Luôn in ra stdout | Bật/tắt theo cấp độ (DEBUG/INFO/...) |
| Không có timestamp/level | Có thời gian, cấp độ, tên module |
| Khó tắt hàng loạt | Cấu hình tập trung, ghi ra file/hệ thống |
| Chỉ hợp code demo | Chuẩn cho production |

## Cạm bẫy hay gặp

- `except:` trần hoặc `except Exception: pass` → nuốt lỗi, che giấu bug; bắt cụ thể + log.
- Dùng exception cho luồng bình thường (điều khiển logic) → chậm và khó đọc.
- `print` để debug trên production → không có level, không tắt được; dùng `logging`.
- Bắt lỗi rồi `return None` âm thầm → tầng trên tưởng thành công; hãy raise hoặc log rõ.
- Quên `finally`/`with` để đóng tài nguyên khi có lỗi → rò rỉ file/connection.

## Ghi nhớ

Dùng **`try/except` bắt exception CỤ THỂ**, không bắt trần. `finally` để dọn dẹp. Tạo
**custom exception** cho lỗi nghiệp vụ, dùng `raise ... from e` giữ nguyên nhân gốc. Bỏ
`print` khi lên production — dùng **`logging`** với cấp độ và format để biết chuyện gì đang
xảy ra.
