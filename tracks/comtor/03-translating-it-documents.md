---
level: "intermediate"
order: 3
title: "Dịch tài liệu IT chính xác"
est: "3-4 giờ"
checklist:
  - "Dịch spec/test case/báo cáo giữ đúng nghĩa kỹ thuật, không thêm-bớt thông tin"
  - "Nhận diện được câu mơ hồ và đánh dấu để hỏi lại thay vì tự đoán"
  - "Giữ nguyên số liệu, tên field, giá trị điều kiện — không 'làm mượt' chúng"
  - "Dùng đúng 敬語 cơ bản (ですます) khi dịch tài liệu gửi khách"
  - "Phân biệt được câu khẳng định, phủ định, và điều kiện trong tiếng Nhật kỹ thuật"
related:
  - "skill:nta-translate"
  - "skill:nta-qa-sheet"
---

## Nguyên tắc số một: không thêm, không bớt

Tài liệu IT là **hợp đồng ngầm** giữa khách và dev. Dịch spec không phải viết văn — mục tiêu
là **bảo toàn thông tin**, kể cả sự mơ hồ của bản gốc. Nếu bản gốc mơ hồ, bản dịch cũng phải
mơ hồ **giống hệt** (rồi đánh dấu để hỏi), chứ không được "tự làm rõ".

> **Cực kỳ quan trọng:** đừng "sửa" bản gốc khi dịch. Nếu spec ghi thiếu điều kiện, nhiệm vụ
> của bạn là **báo cáo chỗ thiếu**, không phải tự điền vào.

## Giữ nguyên yếu tố kỹ thuật

Không được "làm mượt" hay dịch những thứ sau:

- **Tên field / biến / API**: `user_id`, `createdAt`, `/api/login` — giữ nguyên.
- **Số liệu & đơn vị**: 「最大100件」 → "tối đa 100 bản ghi" (không đổi thành "khoảng 100").
- **Giá trị điều kiện**: 「0以上」 = ">= 0" (bao gồm 0), khác 「0より大きい」 = "> 0" (không gồm 0).
- **Trạng thái**: 有効/無効 (yūkō/mukō) = "hợp lệ/không hợp lệ" hoặc "bật/tắt" tùy ngữ cảnh.

## Câu điều kiện & phủ định — nơi hay sai nhất

Tiếng Nhật kỹ thuật có nhiều cấu trúc dễ dịch ngược nghĩa:

| Tiếng Nhật (romaji) | Nghĩa | Bẫy |
|---------------------|-------|-----|
| 〜場合 (baai) | "trong trường hợp ~" | Điều kiện, không phải "luôn luôn" |
| 〜以外 (igai) | "ngoài ~ ra" | Loại trừ, dễ dịch ngược |
| 〜なければならない (nakereba naranai) | "bắt buộc phải ~" | Ràng buộc mạnh |
| 〜てはいけない (te wa ikenai) | "không được phép ~" | Cấm, không phải "không cần" |
| 〜とは限らない (to wa kagiranai) | "không nhất thiết ~" | Phủ định một phần |

> **Bẫy phủ định kép:** 「登録できないわけではない」 (tōroku dekinai wake de wa nai) =
> "**không phải là không đăng ký được**" → tức là **CÓ THỂ** đăng ký. Dịch vội dễ ra ngược.

## Xử lý câu mơ hồ: hỏi lại, đừng đoán

Ví dụ spec: 「エラー時は適切なメッセージを表示する」 (erā-ji wa tekisetsu na messēji o hyōji
suru – "khi lỗi thì hiển thị thông báo phù hợp").

"Phù hợp" (適切な / tekisetsu na) là **mơ hồ** — nội dung gì? Ai định nghĩa?

> **Sai:** tự dịch và tự thêm "hiển thị thông báo 'Đã xảy ra lỗi, vui lòng thử lại'".
>
> **Đúng:** dịch trung thực "hiển thị thông báo phù hợp", rồi đưa vào Q&A:
> *"『適切なメッセージ』 nội dung cụ thể là gì? Có bảng message chuẩn không?"*

## 敬語 (keigo) cơ bản khi gửi khách

Tài liệu và mail gửi khách dùng thể lịch sự **ですます (desu/masu)**, không dùng thể thô
(だ/である) trừ khi là tài liệu kỹ thuật nội bộ đã thống nhất.

- Thường: 修正した (đã sửa) → Lịch sự: 修正しました (shūsei shimashita)
- Đề nghị xác nhận: ご確認をお願いいたします (go-kakunin o onegai itashimasu – "kính mong
  xác nhận giúp").

## Ví dụ: dịch tốt vs xấu (spec)

Bản gốc: 「金額が0以下の場合、登録できないようにする。」

> **Xấu:** "Nếu số tiền nhỏ thì không cho đăng ký." → mất "0以下" (<= 0), "nhỏ" là bao nhiêu?
>
> **Tốt:** "Trong trường hợp số tiền **<= 0**, không cho phép đăng ký." → giữ nguyên điều
> kiện chính xác, rõ bao gồm cả giá trị 0.

## Cạm bẫy hay gặp

- **Tự làm rõ câu mơ hồ** thay vì đánh dấu hỏi → dev code theo phỏng đoán của Comtor.
- **Dịch ngược điều kiện/phủ định** (以外, ではない, phủ định kép) → sai logic nghiệp vụ.
- **Làm tròn số liệu** ("tối đa 100" thành "khoảng 100") → sai ràng buộc.
- **Dịch tên field/API** → dev không map được về code.
- **Nhầm 0以上 (>=0) với 0より大きい (>0)** → sai một biên giá trị.

## Ghi nhớ

Dịch tài liệu IT là **bảo toàn thông tin**, không phải viết lại. Giữ nguyên số liệu, điều
kiện, tên field. Mơ hồ ở bản gốc thì **giữ mơ hồ + đánh dấu hỏi**, không tự điền. Cẩn thận
nhất với câu **điều kiện và phủ định** — đó là nơi dịch sai gây hậu quả nặng nhất.
