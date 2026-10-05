---
level: "advanced"
order: 15
title: "CI/CD & quality gates cho QA"
est: "3-4 giờ"
checklist:
  - "Giải thích vai trò QA dịch chuyển thế nào khi test chạy tự động trong pipeline"
  - "Hiểu quality gate: điều kiện tự động chặn merge/deploy khi chất lượng không đạt"
  - "Đặt gate hợp lý: test đỏ chặn merge, coverage tối thiểu, không lỗi nghiêm trọng mới"
  - "Phân biệt shift-left (test sớm) và test ở các tầng khác nhau của pipeline"
  - "Xử lý flaky test trong CI để gate đáng tin, không bị bỏ qua"
related:
  - "skill:nta-test-run"
  - "skill:nta-deploy-checklist"
---

## QA không còn chỉ là "khâu cuối"

Truyền thống: dev code xong ném qua QA, QA test tay rồi mới cho lên. Với CI/CD, test **chạy tự
động mỗi lần push**, và QA dịch chuyển từ "người bấm test cuối cùng" sang "người **thiết kế hệ
thống kiểm soát chất lượng** trong pipeline". Bài automation dạy viết test; bài này dạy **đặt
chúng vào pipeline làm cổng gác**.

> Vai trò QA không biến mất khi test tự động — nó **nâng cấp**. Thay vì tự tay chạy 200 case
> regression mỗi lần deploy, bạn thiết kế để 200 case đó tự chạy và **tự chặn** nếu đỏ. Thời
> gian tiết kiệm được dồn vào exploratory và test những thứ máy không làm được.

## Quality gate là gì

**Quality gate** = điều kiện tự động phải **đạt** thì thay đổi mới được đi tiếp (merge/deploy).
Không đạt → pipeline đỏ → chặn lại.

| Gate điển hình | Chặn khi |
|----------------|----------|
| **Test phải xanh** | Có test unit/integration/E2E fail |
| **Coverage tối thiểu** | Độ phủ tụt dưới ngưỡng (ví dụ < 70%) |
| **Không lỗi nghiêm trọng mới** | Scan security/lint phát hiện lỗi mức cao |
| **Không giảm chất lượng** | Code mới làm tụt các chỉ số so với baseline |

> Gate biến chất lượng từ "hy vọng ai đó nhớ kiểm" thành "**không đạt thì không qua được, chấm
> hết**". Sức mạnh nằm ở chỗ nó **không thiên vị**: không phụ thuộc reviewer hôm nay bận hay
> không, deadline gấp hay không — luật là luật cho mọi commit.

## Đặt gate ở đâu trong pipeline

Test rẻ/nhanh chạy trước, đắt/chậm chạy sau — hỏng sớm thì cắt sớm, tiết kiệm thời gian:

```
Push code
  ├─ Lint + unit test        (giây)      ← chặn sớm nhất, feedback nhanh
  ├─ Integration + API test  (phút)      ← trước khi merge
  ├─ Build + deploy staging
  └─ E2E critical path       (chậm)      ← trước khi lên prod
```

Đây chính là **test pyramid** áp vào thời gian: gate nhẹ trước cho feedback nhanh, gate nặng sau
làm hàng rào cuối trước prod.

## Shift-left — test càng sớm càng rẻ

**Shift-left** = đẩy việc test về **sớm hơn** trong vòng đời, thay vì dồn cuối.

> Một lỗi bắt được lúc code (unit test) sửa trong vài phút. Cũng lỗi đó lọt tới staging thì tốn
> một chu kỳ điều tra; lọt lên prod thì tốn một sự cố. Chi phí sửa lỗi **tăng theo cấp số** càng
> để muộn. Shift-left kéo điểm phát hiện về gần lúc gây lỗi nhất — gate ở CI là công cụ chính để
> làm điều đó tự động.

QA shift-left còn tham gia **sớm hơn cả code**: review spec/acceptance criteria để bắt lỗi từ
lúc yêu cầu còn mơ hồ — rẻ nhất trong tất cả.

## Flaky test giết chết quality gate

Bài automation đã cảnh báo flaky test. Trong CI hậu quả nặng hơn: **gate chỉ có tác dụng nếu
người ta tin nó**.

> Khi một gate hay đỏ vì lý do vặt (flaky), team học cách "cứ chạy lại cho xanh" hoặc "bỏ qua,
> chắc lại flaky". Tới lúc đó gate **chết** — vì fail thật cũng bị bỏ qua như fail giả. Một gate
> không đáng tin còn tệ hơn không có gate, vì nó tạo cảm giác an toàn giả. Flaky test trong CI
> phải bị **tách ra (quarantine) và sửa ngay**.

## Cạm bẫy hay gặp

- **Cho merge được khi test đỏ** → gate thành trang trí, regression lọt.
- **Gate quá gắt** (coverage 100%, chặn mọi cảnh báo nhỏ) → team tìm cách lách/tắt.
- **Nhồi E2E chậm vào gate chặn merge** → mỗi PR chờ rất lâu, dev bực.
- **Bỏ qua flaky test trong CI** → gate mất uy tín, fail thật bị coi như flaky.
- **QA rời khỏi pipeline** (giao hết cho dev) → mất tiếng nói về ngưỡng chất lượng.
- **Không đặt ngưỡng rõ** cho gate → tranh cãi mỗi lần, không nhất quán.

## Ghi nhớ

Với CI/CD, QA dịch chuyển từ "bấm test cuối" sang **thiết kế quality gate** trong pipeline. Gate
là điều kiện tự động **chặn merge/deploy** khi chất lượng không đạt — không thiên vị, luật cho
mọi commit. Đặt gate theo **test pyramid**: nhẹ/nhanh trước, nặng/chậm sau. **Shift-left** kéo
điểm phát hiện lỗi về sớm nhất có thể vì sửa muộn đắt theo cấp số. Và giữ **flaky test** khỏi CI
— gate chỉ có giá trị khi người ta còn tin nó.
