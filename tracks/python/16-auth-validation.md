---
level: "web-backend"
order: 16
title: "Auth & Validation"
est: "5-6 giờ"
checklist:
  - "Viết validation nâng cao với Pydantic v2: field constraint và field_validator"
  - "Băm mật khẩu bằng bcrypt (passlib) trước khi lưu, không bao giờ lưu plaintext"
  - "Tạo và verify JWT access token cho luồng đăng nhập"
  - "Viết dependency get_current_user để bảo vệ route bằng token"
  - "Phân quyền theo role bằng dependency (require_role)"
  - "Hiểu vì sao JWT được ký chứ không mã hóa, và các rủi ro khi lưu token"
related:
  - "glossary:jwt"
  - "glossary:dependency-injection"
  - "skill:nta-security-audit"
---

## Vì sao quan trọng

API mở toang cho ai cũng gọi là API chưa dùng được. Bài này ghép nốt hai mảnh còn thiếu để
API sẵn sàng thực chiến: **validation chặt** (chặn dữ liệu bẩn ngay cửa) và **auth** (xác
thực + phân quyền). Trong nhánh web backend, đây là nơi lỗ hổng bảo mật hay xuất hiện nhất
— lưu mật khẩu sai cách hay quên kiểm tra quyền đều dẫn tới sự cố nghiêm trọng. FastAPI +
Pydantic v2 làm cả hai việc này gọn gàng qua `Depends` (bài 14).

## Validation nâng cao với Pydantic v2

Ngoài ép kiểu cơ bản, Pydantic v2 cho khai báo ràng buộc chi tiết và validator tùy chỉnh:

```python
from pydantic import BaseModel, EmailStr, Field, field_validator


class UserRegister(BaseModel):
    email: EmailStr
    # Field constraint: ràng buộc ngay trên field
    username: str = Field(min_length=3, max_length=20, pattern=r"^[a-zA-Z0-9_]+$")
    password: str = Field(min_length=8)
    age: int = Field(ge=0, le=150)          # ge = >=, le = <=

    # Validator tùy chỉnh: kiểm tra logic phức tạp hơn
    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not any(c.isdigit() for c in v):
            raise ValueError("Mật khẩu phải có ít nhất 1 chữ số")
        return v
```

| Ràng buộc | Ý nghĩa |
|-----------|---------|
| `min_length` / `max_length` | Độ dài chuỗi/list |
| `ge` / `le` / `gt` / `lt` | So sánh số (>=, <=, >, <) |
| `pattern` | Regex cho chuỗi |
| `field_validator` | Logic tùy chỉnh, ném `ValueError` khi sai |

> Validate ở **tầng model** (Pydantic) chặn dữ liệu bẩn trước khi chạm business logic hay
> DB. Sai ràng buộc → FastAPI tự trả `422` kèm thông báo chi tiết field nào sai, không cần
> viết tay.

## Băm mật khẩu — không bao giờ lưu plaintext

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Khi đăng ký: băm rồi lưu hash
def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)          # bcrypt một chiều, không giải ngược được


# Khi đăng nhập: so sánh
def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)
```

> ❌ **Không bao giờ** lưu mật khẩu dạng thô, và đừng dùng md5/sha256 (nhanh → dễ brute
> force). ✅ bcrypt cố tình **chậm** để chống dò. Khi đăng nhập sai, báo lỗi mơ hồ "sai
> email hoặc mật khẩu" — đừng tiết lộ email nào tồn tại.

## JWT — tạo & verify token

JWT là chuỗi chứa payload đã **ký** bằng secret. Server phát khi đăng nhập, client gửi kèm
mỗi request để chứng minh danh tính:

```python
from datetime import datetime, timedelta, timezone
import jwt                                  # thư viện PyJWT

SECRET_KEY = "..."                          # đọc từ env, KHÔNG hard-code
ALGORITHM = "HS256"


def create_access_token(user_id: int, role: str) -> str:
    payload = {
        "sub": str(user_id),                # subject = ai
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=15),  # hết hạn ngắn
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    # Sai chữ ký / hết hạn → ném exception
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
```

> Payload JWT **chỉ được ký, không mã hóa** — ai cũng decode base64 đọc được. Đừng nhét mật
> khẩu hay dữ liệu nhạy cảm vào. Ký để chống **sửa đổi**, không phải để **giấu**.

![Luồng xác thực JWT: client gửi email và mật khẩu để đăng nhập, server verify mật khẩu bằng bcrypt rồi phát access token đã ký; client lưu token và gửi kèm header Authorization Bearer ở mỗi request tiếp theo; dependency get_current_user decode và verify chữ ký cùng hạn token, hợp lệ thì cho vào handler, sai hoặc hết hạn thì trả 401](/images/python-jwt-flow.png)

## Dependency bảo vệ route: get_current_user

`Depends` biến việc xác thực thành một dependency tái sử dụng, gắn vào bất kỳ route nào:

```python
from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

# Khai báo scheme: FastAPI tự đọc header Authorization: Bearer <token>
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: DbSession,
) -> User:
    creds_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token không hợp lệ",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token)
        user_id = int(payload["sub"])
    except Exception:
        raise creds_error

    user = db.get(User, user_id)
    if user is None:
        raise creds_error
    return user


# Dùng: chỉ cần thêm dependency là route được bảo vệ
CurrentUser = Annotated[User, Depends(get_current_user)]


@app.get("/me")
def read_me(user: CurrentUser):
    return {"id": user.id, "email": user.email}
```

## Phân quyền theo role

Xác thực (bạn là ai) khác phân quyền (bạn được làm gì). Tách ra dependency riêng:

```python
def require_role(*roles: str):
    def checker(user: CurrentUser) -> User:
        if user.role not in roles:
            raise HTTPException(403, "Không đủ quyền")
        return user
    return checker


# Chỉ admin mới xóa được
@app.delete("/users/{user_id}", status_code=204)
def delete_user(user_id: int, admin: Annotated[User, Depends(require_role("admin"))]):
    ...
```

| Khái niệm | Câu hỏi | Làm ở đâu |
|-----------|---------|-----------|
| Authentication | Bạn là ai? | `get_current_user` (verify token) |
| Authorization | Bạn được làm gì? | `require_role` (kiểm tra role) |

> Verify token xong **chưa đủ** — phải kiểm tra **quyền**. Lỗ hổng kinh điển: "đăng nhập
> rồi làm được mọi thứ" vì quên tầng phân quyền.

## Cạm bẫy hay gặp

- Lưu mật khẩu plaintext hoặc hash nhanh (md5/sha) → lộ DB là lộ hết mật khẩu.
- Nhét dữ liệu nhạy cảm vào payload JWT tưởng "được mã hóa" → ai cũng decode đọc được.
- Hard-code `SECRET_KEY` trong source hoặc dùng key yếu/mặc định → giả mạo được token.
- Token không set `exp` (hoặc hạn quá dài) → lộ là dùng được gần như vĩnh viễn.
- Verify token nhưng quên kiểm tra role → user thường gọi được endpoint admin.

## Ghi nhớ

Validate chặt ở **tầng Pydantic** (field constraint + `field_validator`) để chặn dữ liệu
bẩn ngay cửa. Băm mật khẩu bằng **bcrypt** (một chiều, chậm có chủ đích). JWT được **ký,
không mã hóa** — đừng nhét bí mật, `SECRET_KEY` đọc từ env và đặt `exp` ngắn. Tách rõ **xác
thực** (`get_current_user`) và **phân quyền** (`require_role`) thành hai dependency. Chạy
`/nta-security-audit` để soát lỗ hổng auth.
