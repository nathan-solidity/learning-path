---
level: "advanced"
order: 6
title: "Sửa sai — reset, revert, restore, rm, mv"
est: "3-4 giờ"
checklist:
  - "Hoàn tác được thay đổi chưa commit bằng git restore"
  - "Phân biệt reset --soft / --mixed / --hard và hậu quả của từng cái"
  - "Biết dùng revert cho branch chung, reset cho branch local"
  - "Khôi phục được commit lỡ xóa bằng git reflog"
related:
  - "glossary:reset"
  - "skill:nta-git-workflow"
---

## Hoàn tác thay đổi CHƯA commit

```bash
git restore <file>               # bỏ thay đổi trong 1 file (về bản commit cuối)
git restore .                    # bỏ thay đổi trong tất cả file
git restore --staged <file>      # bỏ stage (giữ thay đổi, đưa khỏi staging)
git restore --staged .           # bỏ stage tất cả
```

`git restore <file>` **xóa vĩnh viễn** thay đổi chưa commit của file đó — cẩn thận.

**`git restore <file>`** — bỏ thay đổi, đưa file về bản commit cuối:

![git restore: trước và sau](/images/git-cmd-restore.png)

**`git restore --staged <file>`** — chỉ bỏ stage, **giữ** nguyên thay đổi:

![git restore --staged: trước và sau](/images/git-cmd-restore-staged.png)

## Hoàn tác COMMIT — reset

`git reset` di chuyển HEAD về commit trước đó. Ba chế độ khác nhau ở chỗ **giữ hay bỏ**
thay đổi:

```bash
git reset --soft HEAD~1          # bỏ commit, GIỮ thay đổi trong staging
git reset --mixed HEAD~1         # bỏ commit, giữ thay đổi (bỏ stage) — mặc định
git reset --hard HEAD~1          # bỏ commit VÀ xóa luôn thay đổi — cẩn thận!
```

**Trên commit graph, cả ba chế độ đều giống nhau**: HEAD lùi từ `c3` về `c2`, còn `c3` rời
khỏi nhánh. Điểm khác biệt (`--soft` / `--mixed` / `--hard`) nằm ở **thay đổi của c3 đi
đâu** — thể hiện ở ba hình bên dưới.

**Trước reset** — HEAD đang ở c3:

![Commit graph trước khi reset](/images/git-g-reset-before.png)

**Sau `reset HEAD~1`** — HEAD về c2, c3 không còn trên nhánh (nhưng vẫn cứu được bằng
`git reflog`, xem cuối bài):

![Commit graph sau khi reset](/images/git-g-reset-after.png)

Ba hình *trước → sau* dưới đây cho thấy khác biệt then chốt giữa ba chế độ — **thay đổi
của c3 nằm ở đâu** (staging / working dir / bị xóa):

- `--soft`: chỉ gỡ commit, code vẫn staged — hay dùng để "gộp lại rồi commit lại".

  ![git reset --soft: trước và sau](/images/git-cmd-reset-soft.png)

- `--mixed` (mặc định): gỡ commit, code về working directory (chưa stage).

  ![git reset --mixed: trước và sau](/images/git-cmd-reset-mixed.png)

- `--hard`: gỡ commit và **xóa sạch** thay đổi. Mất code nếu chưa lưu đâu khác.

  ![git reset --hard: trước và sau](/images/git-cmd-reset-hard.png)

Xóa N commit gần nhất: `git reset --hard HEAD~N`.

## Reset vs Revert

| Tiêu chí | RESET | REVERT |
|----------|-------|--------|
| Tác dụng | Đưa HEAD về commit trước đó | Tạo commit mới để hoàn tác |
| Lịch sử | Ghi lại (xóa) lịch sử | Không thay đổi lịch sử |
| An toàn trên branch chung | Không (nên tránh) | Có (an toàn) |
| Dùng khi | Làm ở local | Làm việc theo nhóm |

```bash
git revert <commit-id>           # tạo commit mới đảo ngược commit cũ
git revert HEAD                  # revert commit cuối cùng
```

Trên commit graph: revert **không xóa** c3 mà tạo thêm commit **c4** đảo ngược nội dung
c3. Lịch sử giữ nguyên toàn bộ (c1→c2→c3→c4) — vì thế an toàn trên branch chung:

![Commit graph khi revert](/images/git-g-revert.png)

> **Quy tắc:** commit đã push lên branch chung thì **dùng revert**, không reset. Reset ghi
> lại lịch sử → người khác đã pull sẽ bị lệch.

## Xóa & di chuyển file

```bash
git rm <file>                    # xóa khỏi working dir & staging
git rm --cached <file>           # chỉ gỡ khỏi Git, GIỮ file trên đĩa
git mv old-name new-name         # đổi tên / di chuyển file
```

**`git rm`** — xóa file khỏi cả đĩa lẫn Git:

![git rm: trước và sau](/images/git-cmd-rm.png)

**`git rm --cached`** — gỡ khỏi Git nhưng **giữ** file trên đĩa (gỡ `.env` đã lỡ commit):

![git rm --cached: trước và sau](/images/git-cmd-rm-cached.png)

**`git mv`** — đổi tên / di chuyển file (Git ghi nhận là rename):

![git mv: trước và sau](/images/git-cmd-mv.png)

`git rm --cached` chính là cách gỡ file đã lỡ commit (ví dụ `.env`) ra khỏi theo dõi mà
không xóa file thật.

## Cứu code lỡ mất — git reflog

`git reflog` ghi lại **mọi** lần HEAD di chuyển, kể cả commit bạn đã "xóa" bằng reset. Đây
là phao cứu sinh khi lỡ tay:

```bash
git reflog                              # xem mọi hành động, có commit-id đã xóa
git reset --hard <commit-id>            # quay lại đúng commit đó
git switch -c recovered <commit-id>     # hoặc tạo branch mới từ commit đã mất
```

Tiếp nối ví dụ reset ở trên: c3 tưởng như đã mất, nhưng `git reflog` cho bạn commit-id của
nó — tạo branch `recovered` từ đúng commit đó là lấy lại được:

![Commit graph khi cứu commit bằng reflog](/images/git-g-reflog.png)

> Gần như **không có gì bị mất vĩnh viễn** trong Git trong vài chục ngày — reflog giữ lại.
> Đừng hoảng khi reset nhầm; mở reflog ra tìm lại commit-id.

## Bảng tra nhanh

| Tác vụ | Lệnh |
|--------|------|
| Hoàn tác thay đổi (chưa stage) | `git restore <file>` |
| Bỏ stage | `git restore --staged <file>` |
| Hoàn tác commit cuối (giữ code) | `git reset --soft HEAD~1` |
| Hoàn tác commit cuối (xóa hẳn) | `git reset --hard HEAD~1` |
| Revert một commit (an toàn) | `git revert <commit-id>` |
| Xóa file | `git rm <file>` |
| Đổi tên / di chuyển | `git mv old new` |
| Cứu commit đã mất | `git reflog` + `git reset --hard <id>` |
