---
level: "basic"
order: 2
title: "Các lệnh Git dùng nhiều nhất"
est: "3-4 giờ"
checklist:
  - "Khởi tạo được repo mới với git init và clone repo có sẵn"
  - "Dùng thành thạo git status / add / commit trong vòng lặp hằng ngày"
  - "Xem được lịch sử bằng git log và thay đổi bằng git diff"
  - "Viết được commit message rõ nghĩa (mỗi commit một mục đích)"
related:
  - "skill:nta-git-workflow"
  - "glossary:commit"
---

## Vòng lặp hằng ngày

90% thời gian dùng Git chỉ xoay quanh vài lệnh. Nắm chắc chúng trước khi học nâng cao.

```bash
git status                       # xem trạng thái working directory
git add app.py                   # thêm 1 file vào staging
git add .                        # thêm tất cả thay đổi vào staging
git commit -m "Add login form"   # commit các thay đổi đã stage
git log                          # xem lịch sử commit
```

## Bảng lệnh cốt lõi

| Lệnh | Mô tả | Ví dụ |
|------|-------|-------|
| `git init` | Khởi tạo một Git repository mới | `git init` |
| `git clone <url>` | Clone một repo có sẵn về máy | `git clone https://github.com/user/repo.git` |
| `git status` | Kiểm tra trạng thái working directory | `git status` |
| `git add <file>` | Thêm file vào staging area | `git add app.py` |
| `git add .` | Thêm tất cả thay đổi vào staging | `git add .` |
| `git commit -m "msg"` | Commit các thay đổi đã stage | `git commit -m "Initial commit"` |
| `git log` | Xem lịch sử commit | `git log --oneline` |
| `git diff` | Xem thay đổi **chưa** stage | `git diff` |
| `git diff --staged` | Xem thay đổi **đã** stage | `git diff --staged` |
| `git remote -v` | Liệt kê các remote repository | `git remote -v` |
| `git push origin <branch>` | Đẩy commit lên remote | `git push origin main` |
| `git pull origin <branch>` | Kéo thay đổi mới từ remote | `git pull origin main` |

Hai lệnh làm việc với remote đáng xem trực quan (`add`/`commit`/`push` đã minh họa ở bài
*Quy trình 4 vùng*):

**`git clone`** — tải toàn bộ repo (kèm lịch sử) từ remote về máy, lần đầu:

![git clone: remote về máy](/images/git-cmd-clone.png)

**`git pull`** — kéo commit mới từ remote và gộp vào branch hiện tại (`fetch` + `merge`):

![git pull: trước và sau](/images/git-cmd-pull.png)

## Đọc lịch sử gọn hơn

`git log` mặc định rất dài. Vài dạng hay dùng:

```bash
git log --oneline                # mỗi commit 1 dòng
git log --oneline --graph --all  # xem cả sơ đồ branch
git show <commit-id>             # xem chi tiết 1 commit
```

## Viết commit message tốt

Message là *tài liệu* cho người sau (kể cả bạn 3 tháng sau). Quy ước phổ biến:

- Dòng đầu ≤ 50 ký tự, **động từ mệnh lệnh**: `Add`, `Fix`, `Refactor`, không phải `Added`.
- Mỗi commit **một mục đích** — đừng gộp "fix bug + đổi màu nút + thêm API" vào một commit.
- Cần giải thích *vì sao* thì thêm dòng trống rồi viết body.

```
Fix null pointer khi user chưa có avatar

getAvatar() trả null với user mới → NPE ở template.
Trả về ảnh mặc định thay vì null.
```

> Muốn tự động sinh commit message chuẩn từ diff đang có: dùng skill `/nta-git-workflow commit`.
