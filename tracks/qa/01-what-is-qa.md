---
level: "basic"
order: 1
title: "QA là gì & vai trò trong dự án"
est: "1-2 giờ"
checklist:
  - "Phân biệt được QA, QC và Tester về phạm vi và trách nhiệm"
  - "Giải thích được 'phòng bệnh vs chữa bệnh' và vì sao review spec sớm rẻ hơn"
  - "Định vị được QA tham gia ở những giai đoạn nào của vòng đời phần mềm (SDLC)"
  - "Hiểu vì sao chi phí sửa lỗi tăng dần khi phát hiện càng muộn"
  - "Nắm các thuật ngữ nền tảng qua bảng glossary (test case, bug, regression, SDLC...)"
related:
  - "skill:nta-test-case"
---

## Bắt đầu từ đâu?

Nếu bạn hoàn toàn mới với kiểm thử, đừng lo về kỹ thuật vội. Bài này chỉ trả lời ba câu nền
tảng: **QA là ai, làm gì, và đứng ở đâu** trong một dự án phần mềm. Nắm ba câu này rồi, các bài
sau (mindset, thiết kế test case) mới có chỗ bám.

## QA, QC hay Tester — khác nhau ở đâu?

Ba từ hay bị dùng lẫn, nhưng phạm vi khác nhau:

![QA phòng lỗi bằng quy trình, QC tìm lỗi trong sản phẩm, Tester thực thi kiểm thử](/images/qa-roles.png)

| Vai trò | Quan tâm gì | Ví dụ hoạt động |
|---------|-------------|-----------------|
| **QA** (Quality Assurance) | **Quy trình** để phòng lỗi từ đầu | Định nghĩa Definition of Done, review spec, chuẩn hóa cách test |
| **QC** (Quality Control) | **Sản phẩm** — tìm lỗi đã có | Chạy test case, so sánh kết quả với spec |
| **Tester** | Người **thực thi** việc kiểm thử | Viết & chạy test, log bug |

> Cách nhớ đơn giản: QA là **"phòng bệnh"** (ngăn lỗi phát sinh), QC là **"chữa bệnh"** (tìm lỗi
> đã có). Trong dự án offshore nhỏ, một người thường **kiêm cả ba** — nhưng đừng đánh mất góc QA:
> review spec sớm rẻ hơn nhiều so với bắt bug ở giai đoạn test.

## QA đứng ở đâu trong vòng đời phần mềm?

Nhiều người mới tưởng QA chỉ vào **sau khi code xong**. Thực ra QA có giá trị nhất khi tham gia
**từ đầu** — ngay lúc đọc yêu cầu/spec:

![QA tham gia từ giai đoạn yêu cầu; chi phí sửa lỗi tăng dần từ spec đến production](/images/qa-sdlc.png)

- **Vào sớm ở tầng yêu cầu**: đọc spec, hỏi "cái này khi lỗi thì sao, biên ở đâu" — bắt lỗi khi
  nó mới chỉ là một câu mơ hồ trong tài liệu, chưa thành code.
- **Test sớm ở tầng dev**: đừng đợi tới cuối; đẩy test ở integration/system sớm nhất có thể.

> Quy luật quan trọng nhất của cả nghề QA: **chi phí sửa lỗi tăng theo cấp số càng phát hiện
> muộn**. Một hiểu lầm về yêu cầu bắt ở lúc review spec sửa mất vài phút. Cũng hiểu lầm đó lọt tới
> production thì thành một sự cố, một bản vá gấp, và một khách hàng mất niềm tin. Đây là lý do QA
> giỏi luôn kéo việc kiểm tra về **sớm** nhất có thể.

## Thuật ngữ nền tảng (glossary)

Vài từ sẽ gặp liên tục trong các bài sau — nắm trước cho đỡ ngợp:

| Thuật ngữ | Nghĩa gọn |
|-----------|-----------|
| **Test case** | Một kịch bản kiểm thử: điều kiện đầu → các bước → kết quả mong đợi |
| **Bug / Defect** | Một chỗ phần mềm chạy sai so với mong đợi |
| **Happy path** | Luồng "đẹp nhất": người dùng làm đúng mọi thứ, không lỗi |
| **Edge case** | Trường hợp biên/hiếm gặp — nơi bug hay ẩn (số âm, mất mạng, bấm 2 lần) |
| **Regression** | Lỗi cũ **tái phát** sau khi sửa/thêm chỗ khác; "regression test" = test lại để chắc không tái phát |
| **Spec** | Tài liệu đặc tả: phần mềm **phải** làm gì. Nguồn sự thật để so kết quả |
| **SDLC** | Software Development Life Cycle — vòng đời phần mềm: yêu cầu → thiết kế → code → test → release → vận hành |
| **SUT** | System Under Test — hệ thống/phần đang được kiểm thử |
| **UAT** | User Acceptance Test — khách/end-user xác nhận đúng nhu cầu trước khi go-live |

> Không cần học thuộc lòng ngay. Cứ quay lại bảng này khi gặp từ lạ ở các bài sau — sau vài lần
> là nhớ tự nhiên.

## Cạm bẫy hay gặp

- **Nghĩ QA chỉ là "bấm thử app cuối cùng"** → bỏ lỡ giá trị lớn nhất là review spec sớm.
- **Lẫn lộn QA và QC** → không phân biệt được "phòng lỗi" và "tìm lỗi", làm thiếu phần phòng.
- **Đợi code xong mới bắt đầu nghĩ về test** → mất cơ hội bắt lỗi rẻ ở giai đoạn yêu cầu.
- **Ngại thuật ngữ tiếng Anh** → thực ra chỉ vài chục từ lõi, gặp lại vài lần là quen.

## Ghi nhớ

**QA** phòng lỗi bằng **quy trình** (phòng bệnh), **QC** tìm lỗi trong **sản phẩm** (chữa bệnh),
**Tester** là người **thực thi** — dự án nhỏ một người kiêm cả ba. QA có giá trị nhất khi vào
**sớm**, ngay từ lúc review spec, vì **chi phí sửa lỗi tăng theo cấp số càng phát hiện muộn**.
Nắm vài thuật ngữ nền tảng (test case, bug, happy path, edge case, regression, spec) trước khi đi
tiếp — bài sau sẽ dùng chúng liên tục.
