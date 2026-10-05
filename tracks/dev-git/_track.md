---
track: "dev-git"
role: "dev-git"
group: "dev"
group_title: "Developer"
group_icon: "💻"
group_summary: "Lộ trình cho lập trình viên — chọn ngôn ngữ/framework bạn muốn học chuyên sâu."
variant: "Git & GitHub"
variant_desc: "Cẩm nang Git từ căn bản đến xử lý sự cố: 4 vùng của Git, branch, merge/rebase, sửa sai (reset/revert), quy trình GitHub (PR/fork) và gỡ conflict — dùng chung cho mọi Developer."
title: "Git & GitHub"
icon: "🔀"
summary: "Lộ trình Git & GitHub dành cho mọi lập trình viên: hiểu 4 vùng của Git và quy trình add → commit → push, làm chủ branch, phân biệt merge/rebase/cherry-pick, sửa sai an toàn (reset/revert/restore), quy trình cộng tác trên GitHub (Pull Request, fork), và xử lý merge conflict + git stash khi làm việc nhóm."
levels:
  - key: "basic"
    title: "Cơ bản"
    desc: "Git là gì, 4 vùng và quy trình add → commit → push, các lệnh dùng nhiều nhất, trạng thái file và .gitignore — đủ để làm việc một mình trên một repo."
  - key: "branching"
    title: "Nhánh & hợp nhất"
    desc: "Tạo và quản lý branch, gộp code bằng merge/rebase/cherry-pick — nền tảng để làm việc nhóm và phát triển tính năng song song."
  - key: "advanced"
    title: "Cộng tác & xử lý sự cố"
    desc: "Sửa sai an toàn (reset/revert/restore/rm/mv), remote & quy trình GitHub (Pull Request, fork), và gỡ merge conflict + git stash — kỹ năng để cộng tác nhóm không sợ mất code."
---

## Về lộ trình này

Git là công cụ **bắt buộc** với mọi lập trình viên, bất kể ngôn ngữ. Lộ trình này không
phụ thuộc RoR hay Java — học một lần, dùng cho mọi dự án. Mục tiêu: **dùng Git tự tin,
không sợ mất code**, và cộng tác nhóm trơn tru trên GitHub.

Học tuần tự **Cơ bản → Nhánh & hợp nhất → Cộng tác & xử lý sự cố**. Mỗi bài có checklist
tự đánh giá — tick khi bạn tự tin **làm được trên máy thật**, không chỉ hiểu lý thuyết.

### Vì sao học theo thứ tự này

Rất nhiều lỗi Git của người mới đến từ việc **không hiểu Git lưu code ở đâu** (4 vùng:
working directory → staging → local repo → remote). Nắm chắc mô hình này trước thì
`add`, `commit`, `reset`, `stash` mới hết "ma thuật". Sau đó mới đến branch (làm việc song
song) và cuối cùng là xử lý sự cố (conflict, reset nhầm) — phần khiến người mới sợ Git nhất.

| Cấp độ | Bạn làm được gì sau khi xong |
|--------|------------------------------|
| Cơ bản | Khởi tạo repo, commit sạch sẽ, đẩy lên GitHub, dùng `.gitignore` đúng |
| Nhánh & hợp nhất | Làm tính năng trên branch riêng, gộp về main bằng merge hoặc rebase |
| Cộng tác & xử lý sự cố | Sửa commit lỗi mà không mất code, làm PR/fork, gỡ conflict bình tĩnh |

### Cấu hình lần đầu

Trước khi commit lần đầu, đặt danh tính (hiện trong lịch sử commit):

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --list          # xem toàn bộ config
```

### Nguyên tắc vàng khi dùng Git

1. **Commit thường xuyên**, mỗi commit một mục đích, message rõ nghĩa.
2. **Pull bản mới nhất** trước khi bắt đầu việc mới.
3. Dùng **feature branch**, đừng code thẳng trên `main`.
4. **Không bao giờ** `push --force` lên branch chung (`main`, `develop`).
5. Xử lý **conflict** cẩn thận, test lại rồi mới commit.

> Gặp thuật ngữ lạ thì mở `term-glossary`.
