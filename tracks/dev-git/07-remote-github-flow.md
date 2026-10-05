---
level: "advanced"
order: 7
title: "Remote & quy trình GitHub"
est: "3-4 giờ"
checklist:
  - "Phân biệt clone / fetch / pull / push làm gì với remote"
  - "Thực hiện được quy trình GitHub hằng ngày: branch → commit → push → PR"
  - "Hiểu Pull Request để làm gì và luồng review → merge"
  - "Phân biệt origin và upstream trong mô hình fork"
related:
  - "glossary:pull-request"
---

## Remote là gì?

**Remote** là phiên bản dự án được lưu trên internet (GitHub/GitLab), cho phép cả nhóm
cùng cộng tác. `origin` là tên mặc định của remote bạn clone về.

```bash
git remote -v                            # liệt kê remote
git remote add origin <url>              # thêm remote
git remote remove origin                 # xóa remote
```

## Clone vs Fetch vs Pull vs Push

| Lệnh | Tác dụng |
|------|----------|
| `git clone <url>` | Tải toàn bộ repo về (lần đầu) |
| `git fetch` | Chỉ **tải** thay đổi về, **không** gộp vào code đang làm |
| `git pull` | `fetch` + `merge` — tải về và gộp luôn vào branch hiện tại |
| `git push` | Đẩy commit ở local lên remote |

> `fetch` an toàn để "xem có gì mới" mà không đụng vào code đang sửa. `pull` = fetch rồi
> merge ngay. Nếu muốn rebase thay vì merge khi kéo về: `git pull --rebase`.

## Quy trình GitHub hằng ngày

Đây là vòng lặp bạn sẽ lặp mỗi ngày khi làm việc nhóm:

![Quy trình GitHub](/images/git-github-flow.png)

```bash
git clone <url>                          # 1. Clone repo (lần đầu)
git switch -c feature/login              # 2. Tạo branch
git add .                                # 3. Code & commit
git commit -m "Add login API"
git push origin feature/login            # 4. Push branch lên remote
# 5. Mở Pull Request trên GitHub
# 6. Cả nhóm review code
# 7. Merge PR vào main (người có quyền trên repo thực hiện)
git switch main
git pull origin main                     # 8. Kéo bản mới nhất về
```

## Pull Request (PR) — trái tim của cộng tác

**Pull Request** là đề nghị gộp branch của bạn vào branch chính, kèm nơi để cả nhóm
**review, thảo luận và phê duyệt** trước khi merge. Lợi ích:

- Code được người khác đọc trước khi vào `main` → bắt bug sớm.
- Có lịch sử thảo luận: vì sao thay đổi thế này.
- Chạy CI (test/build tự động) trước khi merge.

> **Lưu ý quyền hạn:** merge/approve PR trên remote là trách nhiệm của **chủ repo**, không
> phải developer tự merge. Bạn tạo PR và chờ review; merge do người có quyền thực hiện.

## Upstream vs Origin (mô hình fork)

Khi đóng góp cho repo bạn **không có quyền push trực tiếp**, bạn **fork** nó về tài khoản
của mình:

| | **origin** | **upstream** |
|---|-----------|-------------|
| Là gì | Bản fork của bạn | Repo gốc ban đầu |
| Trỏ tới | GitHub repo của bạn | Repo gốc |
| Bạn làm gì | Push thay đổi lên đây | Fetch thay đổi từ đây |

```bash
git remote add upstream <original_repo_url>   # thêm upstream (chỉ khi fork)
git fetch upstream                            # lấy thay đổi mới từ repo gốc
git switch main
git merge upstream/main                        # cập nhật main của bạn theo repo gốc
```

Luồng fork: **Fork** repo gốc → clone bản fork → tạo branch → push lên origin (fork của
bạn) → mở PR về repo gốc → cả nhóm review → chủ repo merge.

## Tính năng GitHub hữu ích

| Tính năng | Mục đích |
|-----------|----------|
| Pull Request | Đề xuất thay đổi & review |
| Issues | Theo dõi bug, task, tính năng |
| Projects | Bảng Kanban quản lý công việc |
| Actions (CI/CD) | Tự động build, test, deploy |
| Fork | Sao chép repo về tài khoản của bạn |
