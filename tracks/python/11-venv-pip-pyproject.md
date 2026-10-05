---
level: "tooling-quality"
order: 11
title: "Môi trường ảo & Quản lý package"
est: "3-4 giờ"
checklist:
  - "Tạo và kích hoạt môi trường ảo (venv) cho từng dự án"
  - "Cài package bằng pip và ghi lại requirements.txt"
  - "Hiểu vì sao KHÔNG cài package vào Python hệ thống"
  - "Hiểu pyproject.toml và công cụ hiện đại (uv/poetry)"
  - "Phân biệt dependency chạy (runtime) với dependency phát triển (dev)"
related:
  - "glossary:virtual-environment"
  - "skill:nta-dep-audit"
---

## Vì sao đây là bước phân biệt dev chuyên nghiệp

Người mới hay `pip install` thẳng vào Python hệ thống → dự án A cần pandas 1.x, dự án B cần
2.x, xung đột, hỏng cả máy. **Môi trường ảo** cô lập package theo từng dự án. Đây là thứ
**bắt buộc** trước mọi nhánh nâng cao — data/ML đặc biệt hay xung đột version thư viện.

## venv — môi trường ảo chuẩn (có sẵn)

```bash
python3 -m venv .venv           # tạo môi trường ảo trong thư mục .venv

# kích hoạt:
source .venv/bin/activate       # macOS/Linux
# .venv\Scripts\activate        # Windows

# dấu (.venv) xuất hiện đầu dòng lệnh → đang trong môi trường ảo
python -m pip install requests  # cài vào .venv, KHÔNG đụng Python hệ thống

deactivate                      # thoát môi trường ảo
```

> Luôn thêm `.venv/` vào `.gitignore` — không commit môi trường ảo, chỉ commit danh sách
> package (`requirements.txt`/`pyproject.toml`) để người khác tự cài lại.

## pip & requirements.txt

```bash
pip install requests fastapi        # cài package
pip install "django>=4,<5"          # ghim khoảng version
pip freeze > requirements.txt       # xuất TẤT CẢ package + version hiện có
pip install -r requirements.txt     # cài lại đúng bộ đó trên máy khác
pip list                            # xem đã cài gì
```

## pyproject.toml — chuẩn hiện đại

```toml
# pyproject.toml — khai báo dự án & dependency tập trung
[project]
name = "myapp"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [            # package cần khi CHẠY
    "fastapi>=0.110",
    "httpx",
]

[project.optional-dependencies]
dev = [                     # package chỉ cần khi PHÁT TRIỂN
    "pytest",
    "ruff",
    "mypy",
]
```

> Tách **runtime dependency** (app cần để chạy) khỏi **dev dependency** (chỉ cần để test/
> lint) — production không nên cài pytest, ruff. `requirements.txt` vẫn phổ biến, nhưng dự
> án mới nên dùng `pyproject.toml`.

## uv / poetry — nhanh & hiện đại

```bash
# uv: cực nhanh, đang là xu hướng (thay pip + venv + pip-tools)
uv venv                     # tạo môi trường ảo
uv add fastapi              # thêm dependency (tự cập nhật pyproject.toml)
uv add --dev pytest         # thêm dev dependency
uv run python main.py       # chạy trong môi trường của dự án
uv sync                     # cài đúng bộ package theo lockfile
```

| Công cụ | Ưu điểm | Khi nào |
|---------|---------|---------|
| venv + pip | Có sẵn, ai cũng hiểu | Học, dự án nhỏ |
| uv | Rất nhanh, lock chặt | Dự án mới, khuyên dùng |
| poetry | Quản lý & publish package | Thư viện, dự án lớn |

## Cạm bẫy hay gặp

- `pip install` khi **chưa kích hoạt venv** → cài vào Python hệ thống, gây xung đột toàn máy.
- Commit thư mục `.venv/` vào git → repo phình to; chỉ commit file khai báo package.
- Không ghim version → máy khác cài bản mới hơn, code chạy khác đi (dùng lockfile/`freeze`).
- Trộn `pip install` với `poetry`/`uv` trong cùng dự án → lệch trạng thái; chọn một công cụ.
- Cài dev tool (pytest, ruff) vào dependency runtime → image production nặng và thừa.

## Ghi nhớ

**Mỗi dự án một môi trường ảo** (`python -m venv .venv` rồi `activate`), không cài package
vào Python hệ thống. Ghi lại package bằng `requirements.txt` (`pip freeze`) hoặc
`pyproject.toml`; tách **runtime** vs **dev** dependency. Dự án mới nên thử **uv** — nhanh
và quản lý lock chặt. Không commit `.venv/`.
