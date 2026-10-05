---
level: "advanced"
order: 8
title: "Merge conflict & git stash"
est: "3-4 giờ"
checklist:
  - "Giải thích được conflict xảy ra khi nào và vì sao"
  - "Đọc và xử lý được conflict marker (<<<<<<< ======= >>>>>>>)"
  - "Thực hiện đủ 7 bước xử lý conflict rồi hoàn tất merge"
  - "Dùng git stash để cất tạm thay đổi khi cần chuyển branch gấp"
related:
  - "glossary:merge-conflict"
---

## Merge conflict là gì?

**Conflict** xảy ra khi Git **không thể tự động gộp** các thay đổi — điển hình là hai
branch cùng sửa **cùng một dòng** trong cùng một file. Git không dám tự chọn bên nào đúng,
nên dừng lại và nhờ bạn quyết định.

Trên commit graph: cả `main` và `feature/login` đều sửa **cùng dòng 3**. Khi merge, Git
dừng lại — chỉ **sau khi bạn gỡ conflict thủ công** thì merge commit **M** mới được tạo:

![Commit graph khi merge bị conflict](/images/git-g-conflict.png)

Còn đây là luồng các bước xử lý khi gặp conflict:

![Luồng xử lý conflict](/images/git-conflict.png)

Conflict thường xảy ra khi:

- Merge hai branch cùng sửa một chỗ.
- Pull thay đổi mới khi đang có thay đổi ở local.
- Rebase khi các thay đổi chồng lấn nhau.
- Cherry-pick một commit đụng vào code đã đổi.

## Đọc conflict marker

Khi conflict, Git chèn marker vào file. Ví dụ `app.txt`:

```text
<<<<<<< HEAD
Old Code            (phần của branch hiện tại — main)
=======
New Code            (phần của branch được merge vào — feature/login)
>>>>>>> feature/login
```

- `<<<<<<< HEAD` → `=======`: code của branch **hiện tại**.
- `=======` → `>>>>>>> feature/login`: code của branch **được gộp vào**.

## 7 bước xử lý conflict

1. Git báo file đang bị conflict (`git status` liệt kê "both modified").
2. Mở file, tìm các conflict marker.
3. Giữ lại phần code đúng (có thể là một bên, hoặc kết hợp cả hai).
4. **Xóa hết** ba marker: `<<<<<<<`, `=======`, `>>>>>>>`.
5. Lưu file.
6. `git add <file>` — đánh dấu đã xử lý xong.
7. `git commit` — hoàn tất merge.

```bash
git merge feature/login          # conflict xảy ra
# ... sửa file, xóa marker, giữ code đúng ...
git add app.txt                  # đánh dấu đã xử lý
git commit                       # hoàn tất merge
```

## Hủy merge / rebase giữa chừng

Nếu rối quá, muốn quay lại trạng thái trước:

```bash
git merge --abort                # hủy merge, về trạng thái trước
git rebase --abort               # hủy rebase
git rebase --continue            # đã xử lý xong conflict → tiếp tục rebase
git merge --continue             # tiếp tục merge
```

## Git stash — cất tạm công việc

`git stash` cất các thay đổi hiện tại vào một nơi tạm để working directory sạch — hữu ích
khi bạn đang làm dở mà cần **chuyển branch gấp** (ví dụ fix hotfix).

```bash
git stash                        # cất tạm thay đổi ở local
git stash list                   # liệt kê các stash
git stash pop                    # áp dụng stash mới nhất & xóa nó
git stash apply                  # áp dụng stash nhưng VẪN giữ lại
git stash apply stash@{1}        # áp dụng một stash cụ thể
git stash drop                   # xóa stash mới nhất
git stash clear                  # xóa toàn bộ stash
```

**`git stash`** — cất tạm thay đổi, dọn sạch Working Directory để chuyển branch:

![git stash: trước và sau](/images/git-cmd-stash.png)

**`git stash pop`** — lấy lại thay đổi đã cất và xóa stash đó:

![git stash pop: trước và sau](/images/git-cmd-stash-pop.png)

Quy trình điển hình — đang sửa dở mà phải nhảy sang branch khác:

```bash
git stash                        # cất tạm thay đổi
git switch main                  # chuyển branch xử lý việc gấp
git pull                         # lấy bản mới
git switch feature/login         # quay lại branch cũ
git stash pop                    # lấy lại thay đổi đang làm dở
```

## Bảng tra nhanh

| Tình huống | Lệnh |
|-----------|------|
| Cất tạm công việc | `git stash` |
| Xem danh sách stash | `git stash list` |
| Áp dụng & xóa stash | `git stash pop` |
| Áp dụng (vẫn giữ) | `git stash apply` |
| Hủy Merge | `git merge --abort` |
| Hủy Rebase | `git rebase --abort` |
| Tiếp tục sau khi xử lý conflict | `git rebase --continue` / `git merge --continue` |
