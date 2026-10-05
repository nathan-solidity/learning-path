---
level: "branching"
order: 5
title: "Merge, Rebase & Cherry-pick"
est: "4-5 giờ"
checklist:
  - "Giải thích được merge làm gì và khi nào sinh ra merge commit"
  - "Hiểu rebase tạo lịch sử tuyến tính và vì sao nó ghi lại commit"
  - "Nêu được quy tắc vàng: không rebase branch đã push/dùng chung"
  - "Biết cherry-pick để lấy một commit cụ thể sang branch khác"
related:
  - "glossary:merge"
  - "skill:nta-git-workflow"
---

## Ba cách đưa code từ branch này sang branch khác

Merge, rebase và cherry-pick đều gộp thay đổi — nhưng khác nhau về **lịch sử** để lại.

![Merge vs Rebase](/images/git-merge-vs-rebase.png)

## MERGE — gộp và giữ nguyên lịch sử

Gộp các thay đổi từ một branch vào branch khác, tạo ra một **merge commit** (M) nối hai
nhánh lại. Lịch sử giữ nguyên, thấy rõ hai nhánh từng tồn tại song song.

```bash
git switch main
git merge feature/login          # gộp feature/login vào main
```

Trên commit graph: `main` và `feature/login` phân kỳ từ B, `merge` tạo commit **M** nối
hai nhánh — cả C, D, E đều còn nguyên trong lịch sử.

![Commit graph khi merge](/images/git-g-merge.png)

## REBASE — di chuyển commit lên base mới

Rebase "nhấc" chuỗi commit của branch bạn và đặt lại lên **đầu** branch base. Kết quả là
lịch sử **tuyến tính**, gọn gàng, như thể bạn vừa mới tách nhánh xong.

```bash
git switch feature/login
git rebase main                  # đặt commit của feature lên trên main mới nhất
```

**Trước rebase** — `feature/login` tách từ B, `main` đã đi tiếp tới C (hai nhánh phân kỳ):

![Commit graph trước khi rebase](/images/git-g-rebase-before.png)

**Sau rebase** — D, E được đặt lại lên trên C thành **D', E'** (ID mới). Lịch sử thành một
đường thẳng, không còn nhánh rẽ, không có merge commit:

![Commit graph sau khi rebase](/images/git-g-rebase-after.png)

Lưu ý: rebase **ghi lại** (rewrite) các commit — commit cũ D, E biến thành D', E' với ID
mới. Đây là điểm mấu chốt của quy tắc vàng bên dưới.

## CHERRY-PICK — lấy đúng một commit

Áp dụng **một (hoặc vài) commit cụ thể** từ branch này sang branch khác, không cần gộp cả
branch.

```bash
git switch main
git cherry-pick f1a2b3c          # lấy đúng commit f1a2b3c sang main
```

Trên commit graph: chỉ đúng commit **D (fix)** được chép sang `main` (thành một commit mới),
các commit C, E khác của `feature` **không** đi theo:

![Commit graph khi cherry-pick](/images/git-g-cherrypick.png)

Dùng khi: một hotfix nằm trên branch khác mà bạn chỉ cần đúng fix đó, chưa muốn merge cả branch.

## Merge vs Rebase

| Tiêu chí | MERGE | REBASE |
|----------|-------|--------|
| Lịch sử | Giữ nguyên toàn bộ | Tạo lịch sử tuyến tính |
| Commit | Sinh ra một merge commit mới | Các commit cũ bị ghi lại (ID mới) |
| Phù hợp với | Cộng tác nhóm, branch dùng chung | Branch cá nhân, muốn lịch sử gọn |
| Rủi ro | An toàn | Ghi lại lịch sử — cần cẩn thận |

## Quy tắc vàng của rebase

> **Không bao giờ rebase một branch đã push / đang được người khác dùng chung.**

Vì rebase đổi ID commit, người khác đã pull branch đó sẽ bị lệch lịch sử, gây rối loạn và
conflict khó gỡ. Chỉ rebase branch **cá nhân, chưa chia sẻ**. Với branch chung, dùng merge.

## Khi nào dùng cái gì?

- **MERGE** khi làm việc nhóm và muốn giữ lại toàn bộ lịch sử (branch dùng chung).
- **REBASE** khi làm trên branch riêng và muốn lịch sử gọn, tuyến tính.
- **CHERRY-PICK** khi chỉ cần một commit cụ thể, không cần cả branch.

```bash
# Ví dụ rebase: đưa feature lên đầu main rồi merge cho lịch sử phẳng
git switch feature/login
git rebase main
git switch main
git merge feature/login          # merge fast-forward, không sinh merge commit
```
