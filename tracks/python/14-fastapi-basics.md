---
level: "web-backend"
order: 14
title: "FastAPI cơ bản"
est: "5-6 giờ"
checklist:
  - "Cài đặt FastAPI + Uvicorn và chạy được app đầu tiên trả về JSON"
  - "Định nghĩa được endpoint với path param, query param và request body"
  - "Khai báo Pydantic model cho request và response, hiểu vì sao tách response_model"
  - "Viết được async endpoint và biết khi nào cần async, khi nào không"
  - "Mở được Swagger UI ở /docs và trả đúng status code cho từng loại thao tác"
  - "Dùng Depends để tách logic dùng chung (dependency injection cơ bản)"
related:
  - "glossary:api"
  - "glossary:dependency-injection"
  - "skill:nta-api-design-review"
---

## Vì sao quan trọng

Sau khi nắm Python nền tảng, bước vào nhánh web backend bạn cần một framework để dựng API.
**FastAPI** là lựa chọn phổ biến nhất hiện nay cho Python: nhanh, dựa trên `type hint` nên
tự sinh validation và tài liệu Swagger, hỗ trợ `async` sẵn. Khác với Flask (phải tự lắp
ráp nhiều thứ), FastAPI ép bạn khai báo kiểu dữ liệu rõ ràng — đây chính là điều biến type
hint từ "cho vui" thành "bắt buộc và có ích". Nắm chắc bài này là có khung cho mọi API viết
tiếp theo.

## App đầu tiên

```python
# main.py
from fastapi import FastAPI

app = FastAPI(title="My API")


@app.get("/")
async def read_root() -> dict[str, str]:
    # Trả về dict, FastAPI tự serialize thành JSON
    return {"message": "Xin chào FastAPI"}
```

```bash
pip install "fastapi[standard]"   # kèm sẵn Uvicorn
fastapi dev main.py               # chạy dev server, tự reload khi sửa code
```

> Mở `http://127.0.0.1:8000/docs` là có ngay **Swagger UI** tương tác — không phải viết
> thêm dòng nào. Đây là điểm mạnh lớn nhất của FastAPI so với các framework khác.

## Path param, query param, body

Ba nguồn dữ liệu vào, phân biệt qua **cách khai báo tham số**:

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


# Path param: nằm trong đường dẫn, type hint để FastAPI tự ép kiểu + validate
@app.get("/posts/{post_id}")
async def get_post(post_id: int, sort: str = "new"):
    # post_id ép sang int (sai kiểu → tự trả 422)
    # sort là query param vì không có trong path, lại có default
    return {"post_id": post_id, "sort": sort}
```

| Nguồn | Cách khai báo | Ví dụ URL | Dùng cho |
|-------|---------------|-----------|----------|
| Path param | Tên trùng `{...}` trong path | `/posts/42` | Định danh tài nguyên |
| Query param | Tham số có default, không trong path | `/posts/42?sort=new` | Lọc, phân trang, sắp xếp |
| Request body | Tham số kiểu Pydantic model | body JSON | Dữ liệu tạo/sửa |

> Khác Express (mọi thứ là string phải tự ép), FastAPI **tự ép kiểu theo type hint**.
> `post_id: int` mà client truyền `abc` sẽ trả `422 Unprocessable Entity` tự động.

## Pydantic model cho request & response

Đây là trái tim của FastAPI. Khai báo model bằng Pydantic v2, framework tự validate input
và sinh schema cho Swagger:

```python
from pydantic import BaseModel, EmailStr


# Model nhận vào (request body)
class UserCreate(BaseModel):
    email: EmailStr           # validate định dạng email luôn
    password: str
    full_name: str | None = None


# Model trả ra — KHÔNG chứa password
class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str | None = None


@app.post("/users", response_model=UserOut, status_code=201)
async def create_user(payload: UserCreate) -> UserOut:
    # payload đã được validate xong khi vào tới đây
    user = save_to_db(payload)         # giả định trả về object có id
    return user                        # response_model lọc, chỉ trả field của UserOut
```

> Luôn tách **model request** và **model response**. `response_model=UserOut` bảo đảm dù DB
> object có `password_hash` thì response cũng **không lộ** — FastAPI chỉ serialize field
> khai báo trong `UserOut`. Đây vừa là bảo mật, vừa là hợp đồng API rõ ràng.

## Async endpoint — khi nào cần

```python
import httpx


# ✅ async: có I/O chờ (gọi API ngoài, query DB async) → nhường CPU cho request khác
@app.get("/weather")
async def get_weather(city: str):
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"https://api.example.com/{city}")
    return resp.json()


# ✅ def thường: nếu code đồng bộ / CPU-bound, FastAPI tự chạy trong threadpool
@app.get("/compute")
def heavy_compute(n: int):
    return {"result": sum(range(n))}
```

| Loại handler | Khi nào dùng | FastAPI xử lý |
|--------------|--------------|---------------|
| `async def` | Có `await` (I/O bất đồng bộ) | Chạy trực tiếp trên event loop |
| `def` thường | Code đồng bộ, CPU-bound | Tự đẩy sang threadpool, không block |

> ❌ Đừng viết `async def` rồi gọi hàm blocking (như `time.sleep`, `requests.get`) bên
> trong — nó **block cả event loop**, làm chậm mọi request. ✅ Trong `async def` chỉ dùng
> thư viện async (`httpx`, `asyncpg`); còn code đồng bộ thì để `def` thường.

![Vòng đời một request trong FastAPI: client gửi request tới Uvicorn, đi qua routing khớp path và method, các dependency Depends chạy trước, Pydantic validate path/query/body (sai thì trả 422), tới handler xử lý logic và gọi DB, kết quả được response_model lọc rồi serialize thành JSON trả về client](/images/python-fastapi-flow.png)

## Status code đúng chuẩn

```python
from fastapi import HTTPException


@app.post("/posts", status_code=201)          # tạo mới → 201 Created
async def create_post(payload: PostCreate):
    return payload


@app.get("/posts/{post_id}")
async def get_post(post_id: int):
    post = find_post(post_id)
    if post is None:
        # Báo lỗi đúng cách: raise HTTPException, không return dict lỗi
        raise HTTPException(status_code=404, detail="Không tìm thấy bài viết")
    return post
```

| Thao tác | Status thành công |
|----------|-------------------|
| GET đọc dữ liệu | 200 |
| POST tạo mới | 201 Created |
| PUT/PATCH sửa | 200 |
| DELETE xóa | 204 No Content |
| Validation lỗi | 422 (tự động) |

## Dependency injection với Depends

`Depends` cho phép tách logic dùng chung (lấy DB session, đọc tham số phân trang, xác thực)
ra hàm riêng và tái sử dụng:

```python
from fastapi import Depends
from typing import Annotated


# Hàm dependency: gom tham số phân trang dùng chung nhiều endpoint
def pagination(page: int = 1, size: int = 20) -> dict[str, int]:
    offset = (page - 1) * size
    return {"limit": size, "offset": offset}


@app.get("/posts")
async def list_posts(pg: Annotated[dict, Depends(pagination)]):
    # pg đã có limit/offset tính sẵn, không lặp code ở từng endpoint
    return {"limit": pg["limit"], "offset": pg["offset"]}
```

> `Depends` là cách FastAPI làm **dependency injection**: khai báo "tôi cần thứ này", để
> framework tự gọi và truyền vào. Bài 15 dùng nó để cấp DB session, bài 16 dùng để lấy
> `current_user`. Nắm chắc pattern này vì nó xuất hiện xuyên suốt.

## Cạm bẫy hay gặp

- Dùng `async def` nhưng gọi thư viện blocking (`requests`, `time.sleep`) bên trong → block
  event loop, giảm throughput cả app. Dùng thư viện async hoặc để `def` thường.
- Trả trực tiếp DB object không qua `response_model` → lộ field nhạy cảm như `password_hash`.
- Return `{"error": "..."}` với status 200 khi có lỗi → dùng `raise HTTPException` để đúng
  status code, client mới xử lý được.
- Quên `status_code=201` cho POST tạo mới → client khó phân biệt tạo thành công.
- Nhồi hết endpoint vào `main.py` → tách theo `APIRouter` (như `express.Router`) từ sớm.

## Ghi nhớ

FastAPI biến **type hint** thành validation và tài liệu tự động. Tách **model request** và
**response_model** để không lộ dữ liệu nhạy cảm. Dùng `async def` **chỉ khi** có I/O async,
còn lại để `def` thường cho FastAPI tự đẩy sang threadpool. Báo lỗi bằng `raise
HTTPException` với đúng status code. `Depends` là dependency injection — nền tảng cho DB
session và xác thực ở các bài sau. Mở `/docs` để test ngay. Chạy `/nta-api-design-review`
để soát thiết kế API.
