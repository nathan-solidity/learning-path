---
level: "sec-hardening"
order: 8
title: "Quản lý secret & credential"
est: "2-3 giờ"
checklist:
  - "Không hard-code secret (API key, password DB, token) trong source code"
  - "Đọc secret từ biến môi trường / secret manager, không từ code"
  - ".env nằm trong .gitignore; .env.example không chứa giá trị thật"
  - "Biết secret đã commit lên git vẫn còn trong history — phải rotate, không chỉ xoá"
  - "Không log secret ra console/file/log tập trung"
related:
  - "glossary:dev"
---

## Vì sao quan trọng

**Secret** là chìa khoá vào hệ thống: API key, password DB, token, private key, chuỗi kết
nối. Một secret bị lộ thường đủ để kẻ tấn công vào thẳng dữ liệu/hệ thống — bỏ qua mọi lớp
bảo mật khác. Rò rỉ secret qua source code là một trong những sự cố phổ biến và dễ tránh
nhất.

## Sai lầm #1: hard-code secret trong code

```python
# ❌ Hard-code — lộ khi push code, share màn hình, phân quyền repo
API_KEY = "sk_live_<redacted>"
db = connect("postgres://admin:P@ssw0rd@db.internal/prod")

# ✅ Đọc từ biến môi trường
import os
API_KEY = os.environ["API_KEY"]
db = connect(os.environ["DATABASE_URL"])
```

Secret trong code sẽ đi theo code tới **mọi nơi code đi**: repo, bản backup, CI log, máy
đồng nghiệp, fork. Tách secret **ra khỏi code** là nguyên tắc gốc.

## Nơi để secret

| Cách | Khi nào dùng |
|------|--------------|
| Biến môi trường (`.env`) | Dev/nhỏ; `.env` **không** commit |
| Secret manager (Vault, AWS/GCP Secrets Manager) | Production; có rotate, audit, phân quyền |
| CI/CD secret store | Secret dùng trong pipeline (build/deploy) |

- `.env` **phải** nằm trong `.gitignore`.
- Cung cấp `.env.example` liệt kê **tên** biến với giá trị rỗng/placeholder — **không** giá
  trị thật — để đồng đội biết cần khai báo gì.

```bash
# .env.example  (commit được — không có giá trị thật)
DATABASE_URL=
API_KEY=
JWT_SECRET=
```

## Secret đã lộ lên git: phải ROTATE

> **Ghi nhớ cốt lõi**: một khi secret đã được commit, nó **vĩnh viễn** nằm trong git
> history — kể cả sau khi bạn "xoá dòng đó" ở commit sau. Xoá khỏi file **không** đủ.

Khi lỡ commit secret:
1. **Rotate ngay** — tạo secret mới, thu hồi cái cũ (coi như đã lộ).
2. Gỡ khỏi history nếu cần (`git filter-repo`/BFG) — nhưng **rotate mới là việc bắt buộc**,
   vì có thể đã bị clone/log lại.
3. Rà lại tại sao lọt (thiếu `.gitignore`, thiếu pre-commit scan).

## Không log secret

Secret cũng rò rỉ qua **log**: in token khi debug, log full request/header (chứa
`Authorization`), log connection string. Che hoặc bỏ hẳn secret khỏi log (xem bài dữ liệu
nhạy cảm).

## Cạm bẫy hay gặp

- Hard-code "tạm để test" rồi quên gỡ trước khi push.
- Commit `.env` vì chưa thêm vào `.gitignore`.
- Xoá secret khỏi file, tưởng an toàn, nhưng không rotate → vẫn còn trong history.
- Đặt secret trong file config commit chung (`config.js`, `application.yml` bản có giá trị thật).
- Dán secret vào ticket/chat/log để "tiện" → lộ ra ngoài phạm vi kiểm soát.

## Ghi nhớ

**Không hard-code secret** — tách ra khỏi code, đọc từ **biến môi trường** hoặc **secret
manager**. `.env` vào `.gitignore`, `.env.example` chỉ chứa **tên** biến. Secret **đã commit
lên git thì phải ROTATE** — xoá dòng không đủ vì history vẫn còn. Không log secret.
