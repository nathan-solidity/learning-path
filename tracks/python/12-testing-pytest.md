---
level: "tooling-quality"
order: 12
title: "Testing với pytest"
est: "5-6 giờ"
checklist:
  - "Viết và chạy test bằng pytest với hàm test_ và assert"
  - "Dùng fixture để chuẩn bị dữ liệu/tài nguyên cho test"
  - "Dùng parametrize để chạy một test với nhiều bộ dữ liệu"
  - "Mock/patch dependency bên ngoài (API, DB, thời gian)"
  - "Hiểu test pyramid và đo coverage"
related:
  - "glossary:unit-test"
---

## Vì sao quan trọng

Code không test là code **không biết đúng hay sai** cho tới khi vỡ trên production. `pytest`
là framework test phổ biến nhất của Python — cú pháp gọn (chỉ cần `assert`), fixture mạnh,
hệ sinh thái plugin lớn. Có test, bạn refactor và nâng cấp thư viện mà không sợ làm hỏng
thứ đang chạy.

## Test đầu tiên với pytest

```python
# ---- file: calc.py ----
def cong(a, b):
    return a + b

# ---- file: test_calc.py ----   (tên file & hàm bắt đầu bằng test_)
from calc import cong

def test_cong_so_duong():
    assert cong(2, 3) == 5       # chỉ cần assert, pytest lo phần còn lại

def test_cong_so_am():
    assert cong(-1, -1) == -2
```

```bash
pytest                    # chạy tất cả test
pytest -v                 # chi tiết từng test
pytest test_calc.py::test_cong_so_duong   # chạy đúng một test
```

## Fixture — chuẩn bị dữ liệu/tài nguyên

```python
import pytest

@pytest.fixture
def user_mau():
    return {"ten": "An", "tuoi": 25}     # dữ liệu dùng lại cho nhiều test

def test_ten(user_mau):                  # nhận fixture qua tham số
    assert user_mau["ten"] == "An"

@pytest.fixture
def db():
    conn = tao_ket_noi()                 # setup trước test
    yield conn                           # trả cho test dùng
    conn.close()                         # teardown SAU test (dọn dẹp)
```

## parametrize — một test, nhiều bộ dữ liệu

```python
import pytest

@pytest.mark.parametrize("a, b, mong_doi", [
    (2, 3, 5),
    (-1, 1, 0),
    (0, 0, 0),
])
def test_cong(a, b, mong_doi):
    assert cong(a, b) == mong_doi        # chạy 3 lần với 3 bộ dữ liệu

# test exception
def test_chia_khong():
    with pytest.raises(ZeroDivisionError):
        chia(1, 0)
```

## Mock — cô lập dependency bên ngoài

```python
from unittest.mock import patch

# không gọi API thật khi test → mock nó
@patch("myapp.services.httpx.get")
def test_lay_thoi_tiet(mock_get):
    mock_get.return_value.json.return_value = {"temp": 30}
    assert lay_thoi_tiet("HN") == 30     # test logic, không phụ thuộc mạng
```

> Mock những thứ **chậm, không ổn định, hoặc có tác dụng phụ**: API mạng, DB, thời gian,
> gửi email. Test phải chạy nhanh và cho kết quả giống nhau mọi lần.

## Test pyramid & coverage

```bash
pip install pytest-cov
pytest --cov=myapp --cov-report=term-missing   # đo % dòng code được test
```

![Test pyramid: đáy rộng nhiều unit test nhanh, giữa là integration test, đỉnh hẹp ít E2E test chậm](/images/python-test-pyramid.png)

## Cạm bẫy hay gặp

- Đặt sai tên (file không bắt đầu `test_`, hàm không `test_`) → pytest không tìm thấy.
- Test phụ thuộc lẫn nhau (test B cần test A chạy trước) → dễ vỡ; mỗi test phải độc lập.
- Không mock API/DB → test chậm, chập chờn, hỏng khi mất mạng.
- Chạy đua theo 100% coverage → coverage cao vẫn có thể test dở; ưu tiên test đúng hành vi.
- Test implementation thay vì behavior → đổi code nội bộ là test đỏ dù kết quả vẫn đúng.

## Ghi nhớ

`pytest`: hàm/file bắt đầu `test_`, kiểm tra bằng **`assert`**. **Fixture** chuẩn bị & dọn
dẹp tài nguyên (`yield` để teardown). **`parametrize`** chạy một test với nhiều dữ liệu.
**Mock** những thứ chậm/không ổn định (API, DB). Nhiều unit test ở đáy, ít E2E ở đỉnh;
coverage là tham khảo, không phải mục tiêu.
