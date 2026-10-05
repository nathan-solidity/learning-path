---
level: "branching"
order: 4
title: "Branch & quản lý branch"
est: "3-4 giờ"
checklist:
  - "Giải thích được branch là gì và vì sao không code thẳng trên main"
  - "Tạo, chuyển, đổi tên và xóa branch thành thạo"
  - "Phân biệt git switch / checkout / branch cho từng thao tác"
  - "Thực hiện được một quy trình: tạo branch → code → merge về main → xóa branch"
related:
  - "skill:nta-git-workflow"
  - "glossary:branch"
---

## Branch là gì?

**Branch** là một nhánh phát triển riêng biệt. Nó cho phép bạn làm tính năng mới mà
**không ảnh hưởng** đến code chính (`main`). Khi tính năng xong và ổn định, bạn gộp
(merge) branch đó về `main`.

Vì sao không code thẳng trên `main`? Vì `main` là code đang chạy/đang được cả nhóm dùng.
Code dở dang trên `main` làm hỏng bản của mọi người. Branch cho bạn một "vùng nháp" an toàn.

![Luồng làm việc với branch](/images/git-branch-flow.png)

Trong thực tế, cấu trúc branch thường là:

```
main ── feature/login
     ── feature/payment
     ── feature/profile
```

## Các lệnh về branch

```bash
git branch                       # liệt kê branch ở local
git branch -a                    # liệt kê tất cả branch (cả remote)
git branch --show-current        # xem branch hiện tại

git switch feature/login         # chuyển sang branch (cách mới, khuyến nghị)
git switch -c feature/payment    # tạo & chuyển sang branch mới
git checkout feature/login       # chuyển branch (cách cũ, vẫn dùng được)
git checkout -b feature/payment  # tạo & chuyển (cách cũ)

git branch -m new-name           # đổi tên branch hiện tại
git branch -d feature/login      # xóa branch (an toàn — chặn nếu chưa merge)
git branch -D feature/login      # xóa branch (ép buộc — kể cả chưa merge)
```

> `git switch` / `git restore` là lệnh mới (Git 2.23+) tách vai trò của `git checkout`
> vốn làm quá nhiều việc. Khuyến nghị dùng `switch` để chuyển branch cho rõ ràng.

Các lệnh branch thay đổi con trỏ HEAD và danh sách branch — xem trực quan *trước → sau*:

**`git switch -c`** — tạo branch mới từ vị trí hiện tại và chuyển sang nó:

![git switch -c: tạo & chuyển branch](/images/git-cmd-switch-c.png)

**`git switch`** — chuyển HEAD sang một branch đã có:

![git switch: chuyển branch](/images/git-cmd-switch.png)

**`git branch -d`** — xóa branch đã merge (an toàn):

![git branch -d: xóa branch](/images/git-cmd-branch-d.png)

## Bảng tra nhanh

| Hành động | Lệnh |
|-----------|------|
| Liệt kê branch local | `git branch` |
| Liệt kê tất cả branch | `git branch -a` |
| Chuyển branch | `git switch <branch>` |
| Tạo & chuyển branch | `git switch -c <branch>` |
| Đổi tên branch | `git branch -m <new-name>` |
| Xóa branch (an toàn) | `git branch -d <branch>` |
| Xóa branch (ép buộc) | `git branch -D <branch>` |
| Gộp branch | `git merge <branch>` |
| Xem branch hiện tại | `git branch --show-current` |
| Xem sơ đồ branch | `git log --oneline --graph` |

## Một quy trình mẫu

```bash
git switch -c feature/login      # tạo branch từ main
# ... viết code ...
git add .                        # stage thay đổi
git commit -m "Add login API"    # commit trên branch feature
git switch main                  # quay về main
git merge feature/login          # gộp branch vào main
git branch -d feature/login      # xóa branch đã merge
```

> **Đặt tên branch:** dùng quy ước rõ ràng như `feature/`, `bugfix/`, `hotfix/` +
> mô tả ngắn (`feature/login`, `bugfix/null-avatar`). Skill `/nta-git-workflow branch`
> gợi ý tên branch phù hợp theo nội dung thay đổi.
