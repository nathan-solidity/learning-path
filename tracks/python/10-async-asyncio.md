---
level: "python-advanced"
order: 10
title: "Lập trình bất đồng bộ (asyncio)"
est: "5-6 giờ"
checklist:
  - "Hiểu khác biệt giữa I/O-bound và CPU-bound và khi nào async giúp ích"
  - "Viết hàm async def và dùng await"
  - "Chạy song song nhiều tác vụ với asyncio.gather"
  - "Phân biệt async (concurrency) với threading và multiprocessing"
  - "Biết dùng httpx/aiohttp để gọi API bất đồng bộ"
related:
  - "glossary:async-await"
  - "skill:nta-perf-audit"
  - "skill:nta-code-review"
---

## Vì sao quan trọng

Khi tool/API phải **chờ nhiều việc I/O** cùng lúc (gọi hàng chục API, đọc nhiều file, query
DB), làm tuần tự thì rất chậm. `asyncio` cho phép chạy **đồng thời (concurrency)** trên một
luồng — nền tảng của FastAPI và nhiều thư viện AI/LLM (gọi LLM song song). Nhưng async
không phải viên đạn bạc: phải hiểu khi nào nó thực sự giúp.

## I/O-bound vs CPU-bound — chọn đúng công cụ

```python
# I/O-bound: phần lớn thời gian là CHỜ (mạng, disk, DB) → async giúp nhiều
await httpx_get(url)

# CPU-bound: phần lớn thời gian là TÍNH (xử lý ảnh, ML, vòng lặp lớn) → async KHÔNG giúp
tong = sum(i * i for i in range(10**8))
```

| Loại việc | Ví dụ | Dùng gì |
|-----------|-------|---------|
| I/O-bound | Gọi API, query DB, đọc file | **asyncio** (hoặc threading) |
| CPU-bound | Tính toán, xử lý ảnh, ML | **multiprocessing** (nhiều tiến trình) |

> Python có **GIL** (Global Interpreter Lock) → một thời điểm chỉ một luồng chạy bytecode.
> Vì thế threading/async **không tăng tốc CPU-bound**; việc nặng CPU phải dùng
> multiprocessing hoặc thư viện native (NumPy).

## async def & await

```python
import asyncio

async def lay_du_lieu(id: int) -> str:
    await asyncio.sleep(1)               # giả lập I/O: "chờ mà không chặn"
    return f"data-{id}"

async def main():
    ket_qua = await lay_du_lieu(1)       # await: chờ coroutine xong
    print(ket_qua)

asyncio.run(main())                      # điểm khởi động chương trình async
```

> `async def` tạo **coroutine** — gọi nó KHÔNG chạy ngay mà trả về object; phải `await` (hoặc
> đưa vào event loop) mới chạy. Giống Node.js nhưng Python phải khai báo `async` rõ ràng.

## Chạy song song với gather

```python
async def main():
    # ❌ tuần tự: tổng = 1 + 1 + 1 = 3 giây
    a = await lay_du_lieu(1)
    b = await lay_du_lieu(2)
    c = await lay_du_lieu(3)

    # ✅ song song: tổng ≈ 1 giây (chờ chồng lên nhau)
    a, b, c = await asyncio.gather(
        lay_du_lieu(1),
        lay_du_lieu(2),
        lay_du_lieu(3),
    )

asyncio.run(main())
```

## Gọi API bất đồng bộ với httpx

```python
import asyncio, httpx

async def get_all(urls: list[str]):
    async with httpx.AsyncClient() as client:
        # gọi tất cả URL song song thay vì lần lượt
        tasks = [client.get(u) for u in urls]
        responses = await asyncio.gather(*tasks)
        return [r.json() for r in responses]
```

## async vs threading vs multiprocessing

| Cơ chế | Chạy gì đồng thời | Hợp với |
|--------|-------------------|---------|
| asyncio | Nhiều coroutine, 1 luồng | I/O-bound số lượng lớn |
| threading | Nhiều luồng (vẫn 1 GIL) | I/O-bound, code sẵn dạng blocking |
| multiprocessing | Nhiều tiến trình (nhiều core) | CPU-bound thật sự |

## Cạm bẫy hay gặp

- Gọi coroutine mà **quên `await`** → nhận về object coroutine, cảnh báo "never awaited".
- Gọi hàm **blocking** (`time.sleep`, `requests.get`) trong code async → chặn cả event loop.
- Dùng async cho việc **CPU-bound** rồi tưởng nhanh hơn → không, GIL vẫn chặn; dùng multiprocessing.
- `await` tuần tự các việc độc lập → chậm; dùng `asyncio.gather` chạy song song.
- Trộn code sync/async lộn xộn ("màu hàm") → khó bảo trì; chọn một phong cách nhất quán.

## Ghi nhớ

`asyncio` giúp **I/O-bound** chạy đồng thời trên một luồng: `async def` + `await`, chạy song
song bằng **`asyncio.gather`**. Với **CPU-bound** thì async vô dụng (do GIL) — dùng
**multiprocessing**. Đừng gọi hàm blocking trong code async. Đây là nền cho FastAPI và gọi
LLM song song ở các nhánh nâng cao.
