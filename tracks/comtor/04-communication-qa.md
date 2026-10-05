---
level: "intermediate"
order: 4
title: "Giao tiếp & xử lý Q&A dev ↔ khách"
est: "3-4 giờ"
checklist:
  - "Vận hành được một Q&A sheet: đặt câu hỏi rõ ràng, theo dõi trạng thái, đóng câu hỏi"
  - "Áp dụng 報連相 (hōrensō): báo cáo - liên lạc - trao đổi đúng lúc"
  - "Viết được mail/chat business lịch sự đúng mực với khách Nhật"
  - "Làm rõ yêu cầu mơ hồ bằng câu hỏi đóng/có phương án thay vì câu hỏi mở chung chung"
  - "Nhận diện được 'はい' mang nghĩa 'tôi đang nghe' vs 'tôi đồng ý'"
---

## 報連相 (hōrensō) — xương sống giao tiếp Nhật

Ba chữ ghép từ:

- **報告 (hōkoku – báo cáo):** báo kết quả/tiến độ. VD: "Task A đã xong, đang test."
- **連絡 (renraku – liên lạc):** chia sẻ thông tin, thông báo sự kiện. VD: "Ngày mai VN nghỉ lễ."
- **相談 (sōdan – trao đổi/xin ý kiến):** hỏi trước khi quyết, khi gặp vấn đề. VD: "Yêu cầu này
  làm tăng effort, xin ý kiến khách."

> Khách Nhật đánh giá cao người **báo sớm và báo đủ**. Im lặng cho tới khi xong (hoặc tới khi
> hỏng) là điều tối kỵ. "No news" với khách Nhật **không** phải "good news".

## Q&A sheet — công cụ làm rõ có hệ thống

Khi dev/Comtor có câu hỏi cho khách, đừng hỏi lẻ tẻ qua chat rồi quên. Dùng **Q&A sheet**
(bảng hỏi-đáp) để theo dõi. Một dòng Q&A tốt gồm:

![Luồng Q&A: dev nêu điểm mơ hồ → Comtor viết câu hỏi rõ → Q&A sheet song ngữ → khách trả lời → đóng, câu treo là rủi ro tiến độ](/images/cm-qa-flow.png)

| # | Câu hỏi (VI) | 質問 (JP) | Ngữ cảnh (spec nào) | Trạng thái | Trả lời |
|---|-------------|-----------|--------------------|------------|---------|
| 1 | Khi số tiền = 0 thì xử lý thế nào? | 金額が0の場合の処理は? | Spec màn hình đăng ký, mục 3.2 | Đang chờ | — |

Nguyên tắc viết câu hỏi tốt:

- **Nêu ngữ cảnh:** trích spec/màn hình cụ thể, không hỏi trống.
- **Câu hỏi đóng khi có thể:** dễ trả lời hơn câu mở.
- **Kèm phương án nếu có:** "Chúng tôi định xử lý theo cách A. Khách xác nhận A hay muốn cách khác?"

## Làm rõ yêu cầu mơ hồ

Yêu cầu khách: "Làm cho màn hình đẹp hơn." → quá mơ hồ để code.

> **Câu hỏi tệ (mở, chung chung):** "Khách muốn màn hình thế nào ạ?" → khách cũng khó trả lời.
>
> **Câu hỏi tốt (đóng, có phương án):** "Về màn hình danh sách, khách muốn (a) tăng cỡ chữ,
> (b) đổi màu nút chính, hay (c) giãn khoảng cách các dòng? Có thể chọn nhiều."

## Viết mail/chat business

Cấu trúc mail Nhật cơ bản:

```
お世話になっております。（otsukare/osewa – lời chào mở đầu）
[Nội dung chính: rõ ràng, một ý một đoạn]
お手数ですが、ご確認のほどよろしくお願いいたします。（kính mong xác nhận giúp）
```

- Mở đầu bằng câu chào chuẩn 「お世話になっております」 (osewa ni natte orimasu).
- Nội dung **ngắn, một ý một đoạn**; việc cần khách làm để rõ ("cần xác nhận trước ngày X").
- Kết bằng 「よろしくお願いいたします」 (yoroshiku onegai itashimasu).

## Bẫy 「はい」 (hai) — không phải lúc nào cũng là "đồng ý"

Trong tiếng Nhật, 「はい」 (hai) thường chỉ là **"vâng, tôi đang nghe / tôi hiểu bạn nói gì"**
(aizuchi – tiếng đệm), **không** nhất thiết là "tôi đồng ý".

> **Tình huống thật:** dev trình bày phương án qua thông dịch, khách gật và nói 「はい、はい」.
> Comtor dịch thành "khách đồng ý rồi" → dev triển khai → sau khách nói "tôi đâu có đồng ý,
> tôi chỉ nghe thôi".
>
> **Xử lý đúng:** khi cần chốt, hỏi lại một câu xác nhận đóng: 「この方針で進めてよろしいでしょうか？」
> (kono hōshin de susumete yoroshii deshō ka – "Tiến hành theo phương án này được chứ ạ?").
> Chỉ khi khách nói rõ 「はい、大丈夫です / お願いします」 mới coi là chốt.

## Cạm bẫy hay gặp

- **Im lặng tới khi xong/hỏng** → vi phạm 報連相, khách mất tin.
- **Hỏi lẻ tẻ qua chat, không lưu vết** → câu hỏi rơi rụng, hỏi lại nhiều lần.
- **Câu hỏi mơ hồ cho khách** ("khách muốn sao?") → khách khó trả lời, kéo dài.
- **Hiểu 「はい」 = đồng ý** → chốt nhầm, triển khai sai.
- **Mail dài dòng, nhiều ý một đoạn** → khách bỏ sót việc cần làm.

## Ghi nhớ

Giao tiếp Nhật xoay quanh **報連相**: báo sớm, báo đủ, hỏi trước khi quyết. Dùng **Q&A sheet**
để làm rõ có hệ thống, hỏi bằng **câu đóng kèm phương án**. Và luôn nhớ: **「はい」 chưa chắc là
đồng ý** — muốn chốt thì hỏi lại một câu xác nhận rõ ràng.
