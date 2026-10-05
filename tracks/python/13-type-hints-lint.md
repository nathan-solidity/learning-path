---
level: "tooling-quality"
order: 13
title: "Type hint & Lint/Format"
est: "4-5 giờ"
checklist:
  - "Thêm type hint cho tham số và giá trị trả về của hàm"
  - "Dùng các kiểu phổ biến: list[int], dict[str, int], Optional, Union (|)"
  - "Chạy mypy để bắt lỗi kiểu trước khi chạy code"
  - "Dùng ruff/black để lint và format tự động"
  - "Cấu hình công cụ trong pyproject.toml và chạy trong pre-commit"
related:
  - "glossary:type-hint"
  - "skill:nta-code-review"
  - "skill:nta-formatter-setup"
---

## Vì sao quan trọng

Python là dynamic typing — linh hoạt nhưng dễ giấu bug tới lúc chạy mới lộ. **Type hint** +
**mypy** đưa việc bắt lỗi kiểu lên sớm (khi code, không phải khi user gặp lỗi). **ruff/black**
tự động giữ code sạch và thống nhất style, chấm dứt tranh cãi format trong team. Đây là bộ
công cụ chuẩn của dự án Python nghiêm túc.

## Type hint cơ bản

```python
def chao(ten: str, lan: int = 1) -> str:      # tham số: kiểu, trả về: -> kiểu
    return f"Xin chào {ten}! " * lan

# biến (khi cần rõ)
tuoi: int = 25
ten_ds: list[str] = ["An", "Bình"]

# collection generic
def tong(nums: list[int]) -> int: ...
def dem(tu_dien: dict[str, int]) -> int: ...
```

> Type hint **không bắt buộc và không ảnh hưởng lúc chạy** — Python không tự kiểm tra. Nó
> phục vụ **con người đọc**, **IDE gợi ý**, và **mypy kiểm tra tĩnh**.

## Optional, Union, và các kiểu hay dùng

```python
from typing import Optional

# giá trị có thể là None
def tim(id: int) -> Optional[str]:     # = str | None
    ...

# Python 3.10+: dùng | gọn hơn
def xu_ly(x: int | str) -> None:       # nhận int HOẶC str
    ...

def cau_hinh(port: int | None = None) -> None:
    ...
```

## mypy — bắt lỗi kiểu trước khi chạy

```bash
pip install mypy
mypy myapp/
```

```python
def cong(a: int, b: int) -> int:
    return a + b

cong("2", 3)        # mypy báo lỗi NGAY: "2" là str, không phải int
                    # (chạy thực tế cũng lỗi, nhưng mypy bắt trước khi chạy)
```

## ruff & black — lint và format tự động

```bash
pip install ruff

ruff check .        # lint: tìm lỗi, import thừa, biến không dùng...
ruff check --fix .  # tự sửa những lỗi sửa được
ruff format .       # format code (thay black, cùng phong cách)
```

| Công cụ | Làm gì |
|---------|--------|
| ruff | Lint (bắt lỗi/mùi code) + format, cực nhanh — thay flake8/isort/black |
| black | Format code theo một chuẩn cố định (ruff format tương thích) |
| mypy | Kiểm tra type tĩnh, bắt lỗi kiểu trước khi chạy |

## Cấu hình tập trung & pre-commit

```toml
# pyproject.toml
[tool.ruff]
line-length = 100

[tool.mypy]
python_version = "3.12"
strict = true
```

```yaml
# .pre-commit-config.yaml — tự chạy lint/format/type-check trước mỗi commit
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    hooks:
      - id: ruff
      - id: ruff-format
```

> Dùng `/nta-formatter-setup` để sinh nhanh bộ config chuẩn (editorconfig + ruff + pre-commit)
> cho cả team.

## Cạm bẫy hay gặp

- Tưởng type hint **ép kiểu lúc chạy** → không; phải chạy `mypy` mới kiểm tra.
- Dùng `Any` khắp nơi → mất hết lợi ích type check; chỉ dùng khi thật sự cần.
- Không chạy lint/format trong CI/pre-commit → code merge vào lệch style, khó review.
- Format tay theo ý mình → xung đột với black/ruff; để công cụ quyết định, đừng cãi nhau.
- Bật `strict = true` giữa dự án cũ lớn → ngập lỗi; bật dần từng module.

## Ghi nhớ

Thêm **type hint** (`def f(x: int) -> str`) cho hàm để IDE gợi ý và **mypy** bắt lỗi kiểu
sớm — nhớ nó không kiểm tra lúc chạy. Dùng **ruff** (lint + format, rất nhanh) giữ code sạch
thống nhất. Cấu hình trong `pyproject.toml`, chạy tự động bằng **pre-commit**. Đây là chuẩn
làm việc chuyên nghiệp, áp dụng cho mọi nhánh nâng cao.
