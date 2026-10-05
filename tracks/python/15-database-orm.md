---
level: "web-backend"
order: 15
title: "Database & ORM (SQLAlchemy)"
est: "6-7 giờ"
checklist:
  - "Kết nối được DB và khai báo model/table bằng SQLAlchemy 2.0 (declarative)"
  - "Lấy session đúng cách qua dependency và đóng session sau mỗi request"
  - "Viết được CRUD đầy đủ: create, read, update, delete"
  - "Khai báo quan hệ relationship (one-to-many) giữa hai bảng"
  - "Nhận diện và tránh N+1 query bằng eager loading (selectinload/joinedload)"
  - "Bọc thao tác nhiều bước trong transaction và biết dùng Alembic để migration"
related:
  - "glossary:orm"
---

## Vì sao quan trọng

API không có dữ liệu bền vững thì vô nghĩa. **ORM** (Object-Relational Mapping) cho phép
thao tác DB bằng object Python thay vì viết SQL thô, giảm lỗi và code dễ đọc hơn. Trong
nhánh web backend, **SQLAlchemy 2.0** là ORM chuẩn cho Python — bài này gắn nó với FastAPI
(bài 14) để endpoint đọc/ghi được DB. Nhưng ORM là con dao hai lưỡi: viết ẩu sẽ sinh **N+1
query** giết chết performance. Bài này dạy dùng đúng ngay từ đầu.

## Kết nối DB & khai báo model

SQLAlchemy 2.0 dùng cú pháp `Mapped[...]` + `mapped_column()`, ăn khớp với type hint:

```python
# database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# echo=True để in SQL ra console — cực hữu ích khi học và debug N+1
engine = create_engine("postgresql+psycopg://user:pass@localhost/mydb", echo=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False)


class Base(DeclarativeBase):
    pass
```

```python
# models.py
from datetime import datetime
from sqlalchemy import String, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    # Quan hệ one-to-many: 1 user có nhiều post
    posts: Mapped[list["Post"]] = relationship(back_populates="author")


class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    author: Mapped["User"] = relationship(back_populates="posts")
```

> Đừng dùng `Base.metadata.create_all()` cho production để tạo bảng — nó không quản lý được
> thay đổi schema về sau. Dùng **Alembic migration** (phần cuối bài). `create_all()` chỉ
> tiện cho prototype/test nhanh.

## Session qua dependency

Session là "phiên làm việc" với DB. Mỗi request nên có session riêng và **đóng sau khi
xong**. Kết hợp với `Depends` của FastAPI:

```python
from typing import Annotated
from fastapi import Depends
from sqlalchemy.orm import Session
from database import SessionLocal


def get_db():
    db = SessionLocal()
    try:
        yield db            # cấp session cho handler
    finally:
        db.close()          # luôn đóng dù có lỗi hay không


# Alias gọn để tái sử dụng
DbSession = Annotated[Session, Depends(get_db)]
```

## CRUD đầy đủ

```python
from sqlalchemy import select
from fastapi import HTTPException


@app.post("/users", status_code=201)
def create_user(payload: UserCreate, db: DbSession):
    user = User(email=payload.email)
    db.add(user)
    db.commit()             # ghi xuống DB
    db.refresh(user)        # nạp lại để có id vừa sinh
    return user


@app.get("/users/{user_id}")
def get_user(user_id: int, db: DbSession):
    user = db.get(User, user_id)        # lấy theo primary key
    if user is None:
        raise HTTPException(404, "Không tìm thấy user")
    return user


@app.get("/users")
def list_users(db: DbSession):
    # 2.0 style: dùng select() thay cho query() cũ
    return db.scalars(select(User)).all()


@app.delete("/users/{user_id}", status_code=204)
def delete_user(user_id: int, db: DbSession):
    user = db.get(User, user_id)
    if user:
        db.delete(user)
        db.commit()
```

> Cú pháp `db.query(User)` là **1.x cũ**. SQLAlchemy 2.0 dùng `select()` + `db.scalars()`.
> Học code mới ngay để không phải sửa lại sau.

## Tránh N+1 query — bẫy lớn nhất của ORM

N+1 xảy ra khi bạn lấy N bản ghi rồi lặp qua từng cái để truy vấn quan hệ → 1 query đầu +
N query con:

```python
# ❌ N+1: mỗi lần u.posts sẽ bắn thêm 1 query → 100 user = 101 query
users = db.scalars(select(User)).all()
for u in users:
    print(u.posts)          # lazy load: query riêng cho từng user

# ✅ Eager loading: nạp posts cùng lúc, chỉ 1-2 query tổng cộng
from sqlalchemy.orm import selectinload

users = db.scalars(
    select(User).options(selectinload(User.posts))
).all()
for u in users:
    print(u.posts)          # đã có sẵn, không query thêm
```

| Chiến lược | Cách chạy | Hợp cho |
|------------|-----------|---------|
| Lazy (mặc định) | Query khi truy cập quan hệ | Chỉ dùng ít, lẻ tẻ |
| `selectinload` | 1 query phụ dùng `IN (...)` | One-to-many (danh sách) |
| `joinedload` | JOIN chung 1 query | Many-to-one / one-to-one |

> Bật `echo=True` khi dev để **nhìn thấy** số query thực tế in ra console. Thấy hàng loạt
> `SELECT` giống nhau trong vòng lặp là dấu hiệu N+1.

## Transaction

Nhiều thao tác phải "tất cả hoặc không gì cả" → bọc trong transaction:

```python
def transfer(db: Session, from_id: int, to_id: int, amount: int):
    try:
        sender = db.get(Account, from_id)
        receiver = db.get(Account, to_id)
        sender.balance -= amount
        receiver.balance += amount
        db.commit()             # cả hai thay đổi cùng ghi
    except Exception:
        db.rollback()           # có lỗi → hoàn tác toàn bộ
        raise
```

> `commit()` chốt thay đổi, `rollback()` hủy toàn bộ nếu giữa chừng có lỗi. Không có
> transaction, tiền có thể bị trừ mà không được cộng — dữ liệu sai lệch.

## Migration với Alembic (ngắn gọn)

Khi model đổi (thêm cột, đổi bảng), Alembic sinh script cập nhật schema có version:

```bash
pip install alembic
alembic init migrations                          # khởi tạo 1 lần
alembic revision --autogenerate -m "add posts"   # tự sinh migration từ diff model
alembic upgrade head                             # áp dụng lên DB
alembic downgrade -1                             # lùi lại 1 bước khi cần
```

> Luôn **đọc lại** file migration `--autogenerate` sinh ra trước khi chạy — nó có thể bỏ
> sót đổi tên cột (hiểu nhầm thành drop + add, mất dữ liệu).

## Cạm bẫy hay gặp

- N+1 query: lặp qua danh sách rồi truy cập quan hệ mà không `selectinload`/`joinedload`.
- Quên `db.close()` → rò rỉ connection, cạn connection pool khi tải cao. Dùng `get_db` với
  `yield`/`finally`.
- Quên `db.commit()` sau khi `add`/`delete` → thay đổi không được ghi xuống DB.
- Dùng `create_all()` cho production thay vì Alembic → không quản lý được thay đổi schema.
- Chạy migration `--autogenerate` mà không đọc lại → mất dữ liệu do drop/add nhầm cột.

## Ghi nhớ

SQLAlchemy 2.0 dùng `Mapped[...]` + `select()` — tránh cú pháp `query()` cũ. Session lấy
qua `Depends(get_db)` và **luôn đóng** bằng `finally`. Nhớ `commit()` sau mỗi thay đổi. Kẻ
thù lớn nhất là **N+1 query** — bật `echo=True` để nhìn thấy nó và dùng **eager loading**
(`selectinload`/`joinedload`) để diệt. Bọc thao tác nhiều bước trong **transaction**. Quản
lý schema bằng **Alembic**, không phải `create_all()`.
