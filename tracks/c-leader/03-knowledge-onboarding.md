---
level: "intermediate"
order: 3
title: "Quản lý knowledge & onboarding member mới"
est: "3-4 giờ"
checklist:
  - "Giải thích được vì sao knowledge hay thất thoát trong team offshore"
  - "Phân biệt được 3 loại knowledge: HANDOFF (phiên), MEMORY (dự án), glossary (thuật ngữ)"
  - "Xây được cấu trúc knowledge base tối thiểu cho một dự án"
  - "Lập được checklist onboarding rút thời gian member mới bắt nhịp"
  - "Chuẩn hóa được một quy trình lặp lại thành tài liệu dùng chung"
---

## Vì sao knowledge hay thất thoát

Trong team offshore, kiến thức dự án phần lớn nằm trong **đầu vài người** — thường là
người làm lâu nhất. Khi họ nghỉ phép, chuyển dự án, hoặc nghỉ việc, kiến thức đó biến mất.
Triệu chứng dễ thấy:

- Member mới hỏi những câu mà "ai cũng biết" nhưng không ai viết ra.
- Cùng một quyết định thiết kế bị bàn lại nhiều lần vì không ai nhớ đã chốt gì.
- Sau nghỉ Tết, cả team quên context, mất vài ngày "khởi động lại".
- Khách hỏi "sao hồi đó lại làm thế này?" — không ai trả lời được.

> Tình huống thật: khách yêu cầu đổi một constraint. Team làm theo. 3 tháng sau lỗi nổ ra,
> hóa ra constraint đó từng được quyết định **xử lý ở application layer chứ không phải DB**
> — nhưng quyết định ấy chỉ nằm trong chat cũ, không ai ghi lại. Đó là chi phí của
> knowledge thất thoát.

## 3 loại knowledge cần phân biệt

| Loại | Vòng đời | Nội dung | Ví dụ |
|------|----------|----------|-------|
| **HANDOFF** | Theo phiên/ngày | Đang làm gì, trạng thái, việc tiếp | "Đang fix bug login, còn case OAuth chưa xong" |
| **MEMORY** | Theo dự án | Quyết định đã chốt, lý do, bài học | "Constraint X xử lý ở app layer, không DB" |
| **Glossary** | Lâu dài | Thuật ngữ nghiệp vụ, viết tắt của khách | "kanri = quản lý; TF = 取引先 = đối tác" |

HANDOFF chống mất context giữa các phiên/người. MEMORY chống "hồi sinh quyết định đã chốt".
Glossary chống hiểu sai thuật ngữ khách Nhật.

## Knowledge base tối thiểu cho một dự án

Không cần cầu kỳ. Bắt đầu với cấu trúc nhỏ mà **thực sự được cập nhật**:

```
docs/
  glossary.md          # thuật ngữ nghiệp vụ + viết tắt khách Nhật
  decisions.md         # quyết định đã chốt + lý do (mini-ADR)
  setup.md             # dựng môi trường dev từ số 0
  conventions.md       # coding convention, naming, git flow của dự án
.memory/HANDOFF.md     # trạng thái phiên gần nhất
```

Nguyên tắc: **một trang được đọc còn hơn mười trang bị bỏ quên**. Knowledge chết (không ai
cập nhật) còn nguy hơn không có — vì người ta tin vào thông tin cũ.

## Onboarding member mới

Mục tiêu onboarding: rút thời gian từ "nhìn code lơ ngơ" xuống "commit được PR đầu tiên".
Checklist mẫu cho ngày đầu:

| Việc | Kết quả mong đợi |
|------|------------------|
| Đọc `setup.md`, dựng môi trường | Chạy được app local |
| Đọc `glossary.md` + `conventions.md` | Hiểu thuật ngữ + quy tắc code |
| Ghép cặp (pairing) với member cũ 1 buổi | Nắm luồng chính của hệ thống |
| Giao 1 task nhỏ có thật (không phải bài tập giả) | PR đầu tiên trong 2-3 ngày |
| Lead review kỹ PR đầu, giải thích convention | Member hiểu chuẩn chất lượng team |

> Sai lầm hay gặp: quăng member mới vào task lớn ngay để "tiết kiệm thời gian". Kết quả:
> họ làm sai convention, lead sửa lại tốn hơn. Task nhỏ đầu tiên là khoản đầu tư, không
> phải lãng phí.

## Chuẩn hóa quy trình lặp lại

Khi một việc được làm **lần thứ ba** theo cùng cách, đó là tín hiệu nên chuẩn hóa thành
tài liệu/checklist: quy trình release, quy trình xử lý bug từ khách, cách viết commit
message, cách setup CI. Chuẩn hóa giúp việc không phụ thuộc trí nhớ và ai cũng làm giống
nhau.

## Cạm bẫy hay gặp

- **Knowledge chết**: viết một lần rồi không ai cập nhật → thông tin sai còn hại hơn không có.
- **Tài liệu quá dài**: không ai đọc hết → ưu tiên ngắn, đúng, dễ tìm.
- **Chỉ lưu trong đầu người giỏi nhất** → người đó là single point of failure.
- **Onboarding bằng bài tập giả** → member không nắm được hệ thống thật.
- **Không ghi lý do quyết định** → quyết định bị bàn lại hoặc hồi sinh sai.

## Ghi nhớ

Knowledge thất thoát là chi phí ẩn lớn nhất của team offshore. Phân biệt **HANDOFF (phiên),
MEMORY (quyết định dự án), glossary (thuật ngữ)**. Knowledge base tối thiểu nhưng **sống**
tốt hơn đồ sộ mà chết. Onboarding tốt = task nhỏ thật + pairing + review kỹ PR đầu. Việc
làm lần thứ ba theo cùng cách thì **chuẩn hóa** nó.
