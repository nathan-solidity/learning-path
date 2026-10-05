---
level: "basic"
order: 1
title: "Git là gì & quy trình 4 vùng"
est: "2-3 giờ"
checklist:
  - "Giải thích được Git là Distributed VCS và khác gì với GitHub"
  - "Vẽ lại được 4 vùng: Working Directory → Staging → Local Repo → Remote"
  - "Biết add / commit / push chuyển thay đổi qua từng vùng như thế nào"
  - "Cấu hình được user.name và user.email lần đầu dùng"
related:
  - "glossary:git"
---

## Git là gì?

**Git** là một **Distributed Version Control System (VCS)** — hệ thống quản lý phiên bản
phân tán. Nó giúp lập trình viên theo dõi mọi thay đổi trong code, quay lại phiên bản cũ,
và làm việc nhóm mà không giẫm chân nhau. "Phân tán" nghĩa là mỗi máy có **bản sao đầy đủ**
của toàn bộ lịch sử — không phụ thuộc một server trung tâm để xem lịch sử hay commit.

## Git vs GitHub — đừng nhầm

| | **Git** | **GitHub** |
|---|---------|-----------|
| Bản chất | Là một VCS (công cụ) | Là một nền tảng (dịch vụ) |
| Chạy ở đâu | Trên máy local | Trên cloud |
| Giao diện | Dòng lệnh (CLI) | Web + tích hợp |
| Vai trò | Theo dõi thay đổi file | Host repo, cộng tác nhóm |

Có thể dùng Git **không cần** GitHub (repo chỉ ở máy). GitHub (hoặc GitLab, Bitbucket) là
nơi **lưu trữ chung** để cả nhóm cùng làm.

## Vì sao nên dùng Git?

- Theo dõi mọi thay đổi trong dự án, quay lại được bất kỳ điểm nào.
- Làm việc trên nhiều phiên bản song song (branching & merging).
- Cộng tác nhóm không ghi đè code của nhau.
- Sao lưu và khôi phục code khi lỡ tay.

## Quy trình 4 vùng — mô hình cốt lõi

Đây là phần **quan trọng nhất** phải hiểu. Một thay đổi đi qua 4 vùng:

![Quy trình 4 vùng của Git](/images/git-workflow.png)

1. **Working Directory** — thư mục dự án bạn đang sửa. Thay đổi ở đây *chưa được theo dõi*.
2. **Staging Area** — "giỏ hàng" chứa thay đổi bạn *chọn* để đưa vào commit tiếp theo.
   Đưa vào bằng `git add`.
3. **Local Repository** — kho `.git` ở máy bạn. `git commit` ghi thay đổi từ staging vào đây.
4. **Remote Repository** — kho chung trên GitHub. `git push` đẩy commit từ local lên.

Chiều ngược lại: `git pull` / `fetch` kéo thay đổi từ remote về, `git restore` / `checkout`
lấy lại bản đã commit về working directory.

Ba lệnh cốt lõi đẩy thay đổi qua từng vùng — xem trạng thái *trước → sau* của mỗi lệnh:

**`git add`** — đưa thay đổi từ Working Directory vào Staging:

```bash
git add app.py            # WD → Staging
```

![git add: trước và sau](/images/git-cmd-add.png)

**`git commit`** — ghi thay đổi đã stage vào Local Repository (thành một commit mới):

```bash
git commit -m "Add app"   # Staging → Local repo
```

![git commit: trước và sau](/images/git-cmd-commit.png)

**`git push`** — đẩy commit từ Local lên Remote (GitHub) cho cả nhóm:

```bash
git push origin main      # Local → Remote
```

![git push: trước và sau](/images/git-cmd-push.png)

> **Tại sao có Staging Area?** Nó cho phép bạn commit *một phần* thay đổi. Ví dụ sửa 3 file
> nhưng chỉ muốn commit 1 file liên quan — chỉ `git add` file đó thôi.

## Cấu hình lần đầu

Mỗi commit ghi lại *ai* tạo ra nó. Đặt danh tính trước khi commit lần đầu:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --list                 # kiểm tra đã đặt đúng chưa
```

`--global` áp dụng cho mọi repo trên máy. Bỏ `--global` nếu chỉ muốn đặt cho repo hiện tại
(ví dụ dùng email công ty cho repo công việc).
