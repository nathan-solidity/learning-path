---
level: "basic"
order: 2
title: "Thuật ngữ IT & nghiệp vụ song ngữ"
est: "2-3 giờ"
checklist:
  - "Lập được glossary dự án 3 cột (VI - JP + romaji - EN) và giữ nó cập nhật"
  - "Dịch nhất quán một thuật ngữ trong toàn bộ tài liệu (không lúc này lúc khác)"
  - "Phân biệt được các cặp hay nhầm: spec/仕様書, bug/不具合, test case/テストケース"
  - "Tra cứu thuật ngữ theo đúng ngữ cảnh thay vì dịch máy móc"
  - "Biết ghi lại thuật ngữ mới phát sinh trong họp/chat vào glossary"
related:
  - "skill:nta-translate"
  - "glossary:comtor"
---

## Vì sao glossary quan trọng

Trong một dự án, cùng một khái niệm nếu **dịch mỗi lúc một kiểu** sẽ khiến khách và dev
hiểu lệch. Ví dụ "màn hình đăng nhập" lúc dịch 「ログイン画面」, lúc 「サインイン画面」 —
khách nghĩ là hai màn hình khác nhau. **Glossary** (bảng thuật ngữ thống nhất) chốt: một
khái niệm ⇒ một cách dịch, dùng xuyên suốt.

## Cấu trúc glossary dự án

Tối thiểu 3 cột, thêm cột "ghi chú ngữ cảnh" khi cần:

| Tiếng Việt | 日本語 (romaji) | English | Ghi chú |
|-----------|----------------|---------|---------|
| Tài liệu đặc tả | 仕様書 (shiyōsho) | specification / spec | Tài liệu mô tả yêu cầu |
| Lỗi (phần mềm) | 不具合 (fuguai) | bug / defect | Xem phân biệt bên dưới |
| Ca kiểm thử | テストケース (tesuto kēsu) | test case | |
| Màn hình | 画面 (gamen) | screen / page | |
| Yêu cầu | 要件 (yōken) | requirement | |
| Chức năng | 機能 (kinō) | function / feature | |
| Xác nhận | 確認 (kakunin) | confirm / check | |
| Bàn giao / hạn giao | 納品 / 納期 (nōhin / nōki) | delivery / deadline | |
| Môi trường (dev/test) | 環境 (kankyō) | environment | 本番 = production |

## Các cặp thuật ngữ hay nhầm

**spec — 仕様書 (shiyōsho)**: là **tài liệu đặc tả**, không phải "spec" nghĩa "thông số kỹ
thuật phần cứng". Khi khách nói 「仕様書に書いてある」 nghĩa là "đã ghi trong tài liệu đặc tả".

**bug — 不具合 (fuguai) vs バグ (bagu)**: khách Nhật thường dùng 不具合 (fuguai – "sự cố / điểm
không đúng") mang sắc thái nhẹ, lịch sự hơn バグ. Trong báo cáo cho khách, ưu tiên 不具合.

**修正 (shūsei) vs 変更 (henkō)**: 修正 = **sửa lỗi** (fix), 変更 = **thay đổi** (change/thêm
yêu cầu). Dịch nhầm hai từ này làm sai bản chất: một cái là dev có trách nhiệm sửa miễn phí,
một cái là yêu cầu mới có thể tính thêm effort.

> **Cảnh báo:** 「テスト」 trong tiếng Nhật có thể là *unit test*, *kiểm thử của QA*, hoặc
> *bản demo cho khách dùng thử*. Đừng mặc định — tra ngữ cảnh: khách đang nói về giai đoạn nào?

## Tra cứu đúng ngữ cảnh

Một từ Nhật có thể có nhiều nghĩa tùy ngành:

- 「対応」 (taiō): tùy ngữ cảnh là "xử lý", "hỗ trợ (tính năng)", hay "tương thích".
  - 「バグに対応する」 → "xử lý bug"
  - 「スマホに対応する」 → "hỗ trợ / tương thích với điện thoại"
- 「反映」 (han'ei): "phản ánh / áp dụng thay đổi vào" → 「本番に反映する」 = "áp dụng lên
  môi trường production".

Nguyên tắc: **không dịch từ đơn lẻ**, dịch **cả cụm trong ngữ cảnh**. Khi vẫn không chắc,
ghi vào Q&A để hỏi thay vì đoán.

## Ví dụ: dịch tốt vs xấu

> **Xấu (không nhất quán + sai sắc thái):**
> Câu 1: "Sửa lỗi màn hình login." → Câu 5 cùng file: "Fix bug trang sign-in."
> → Khách bối rối: login ≠ sign-in? lỗi ≠ bug?
>
> **Tốt (nhất quán, bám glossary):**
> Mọi chỗ đều dùng "màn hình đăng nhập / ログイン画面" và "lỗi / 不具合" giống nhau.

## Duy trì glossary sống

- Mỗi thuật ngữ mới phát sinh trong họp/chat → thêm ngay vào glossary.
- Chốt cách dịch với BrSE/dev một lần, sau đó **không đổi giữa chừng** dự án.
- Đặt glossary ở nơi cả team truy cập được (Sheet/Wiki), không giữ riêng trong máy mình.

## Cạm bẫy hay gặp

- **Dịch một khái niệm nhiều kiểu** trong cùng dự án → khách hiểu là nhiều thứ khác nhau.
- **Nhầm 修正 (fix) với 変更 (change)** → sai bản chất trách nhiệm/effort.
- **Dịch từ đơn lẻ bằng từ điển** mà bỏ ngữ cảnh IT → 「対応」 dịch cứng thành "đối ứng".
- **Không cập nhật glossary** → thuật ngữ mới mỗi người dịch một kiểu.

## Ghi nhớ

Một khái niệm ⇒ **một cách dịch**, dùng xuyên suốt. Glossary 3 cột (VI–JP–EN) là công cụ
số một của Comtor. Cẩn thận các cặp dễ nhầm: 仕様書/spec, 不具合/bug, 修正/変更. Không chắc
ngữ cảnh thì tra và hỏi, **đừng đoán**.
