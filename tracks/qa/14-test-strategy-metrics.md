---
level: "advanced"
order: 16
title: "Test strategy, plan & metrics"
est: "4-5 giờ"
checklist:
  - "Phân biệt test strategy (định hướng dài hạn) và test plan (cụ thể cho một release)"
  - "Viết được test plan gọn: phạm vi, cách tiếp cận, tài nguyên, lịch, rủi ro, tiêu chí"
  - "Định nghĩa entry/exit criteria và 'definition of done' cho việc test"
  - "Chọn metric có ý nghĩa và tránh metric bị lạm dụng (đếm số case, đếm bug)"
  - "Ước lượng effort test và truyền đạt rủi ro chất lượng cho quản lý/BrSE"
---

## Từ người test giỏi thành người dẫn dắt chất lượng

Các bài trước là **kỹ năng thực thi**. Bài này là **kỹ năng lập kế hoạch và giao tiếp** — thứ
phân biệt một tester tốt với một QA lead. Bạn học cách **quyết định test gì, tới đâu là đủ**, và
**nói được với quản lý/BrSE** về rủi ro chất lượng bằng ngôn ngữ họ hiểu.

## Strategy vs plan

| | Test strategy | Test plan |
|--|---------------|-----------|
| **Tầm** | Dài hạn, cả tổ chức/dự án | Một release/sprint cụ thể |
| **Nội dung** | Nguyên tắc chung: tầng test, công cụ, môi trường, tiêu chuẩn | Phạm vi lần này, ai làm gì, lịch, rủi ro |
| **Đổi thường xuyên?** | Ít | Mỗi release |

## Một test plan gọn gồm gì

Không cần tài liệu 40 trang — một test plan hữu ích trả lời rõ vài câu:

```
1. Phạm vi     : test gì, KHÔNG test gì (out of scope) — càng rõ càng ít cãi sau
2. Cách tiếp cận: manual/auto ở đâu, loại test nào (functional, perf, security...)
3. Tài nguyên  : ai test, môi trường nào, data ở đâu
4. Lịch        : mốc thời gian, phụ thuộc vào dev giao khi nào
5. Rủi ro      : chỗ nào rủi ro cao, thiếu thời gian thì cắt gì trước
6. Tiêu chí    : entry (khi nào bắt đầu test được) & exit (khi nào coi là xong)
```

> Phần giá trị nhất thường là **"KHÔNG test gì"**. Ghi rõ out-of-scope biến kỳ vọng ngầm thành
> thỏa thuận rõ ràng — để sau này không có cảnh "sao chỗ này không test" khi nó vốn nằm ngoài
> phạm vi đã chốt. Với dự án khách Nhật, phần này nên được BrSE xác nhận với khách từ đầu.

## Entry / exit criteria — khi nào bắt đầu, khi nào xong

- **Entry criteria**: điều kiện để **bắt đầu** test. Ví dụ: build deploy được lên test env, smoke
  test pass, spec đã chốt. Không đủ entry mà lao vào test là phí công (test trên build hỏng).
- **Exit criteria**: điều kiện để **coi test là xong**. Ví dụ: đã chạy hết case ưu tiên cao,
  không còn bug nghiêm trọng mở, coverage đạt ngưỡng, rủi ro còn lại đã được chấp nhận rõ ràng.

> Không có exit criteria thì "test bao giờ mới xong" trở thành cảm tính, và thường là "hết thời
> gian thì xong" — nguy hiểm. Định nghĩa exit **trước khi bắt đầu** biến quyết định go/no-go
> thành đối chiếu tiêu chí, thay vì tranh cãi dưới áp lực deadline.

## Metric — chọn cái có ý nghĩa

Đo sai còn hại hơn không đo. Nhiều metric QA phổ biến **dễ bị lạm dụng**:

| Metric nghe hay nhưng lừa | Vì sao lừa | Thay bằng |
|---------------------------|-----------|-----------|
| **Số test case** | Nhiều case không nghĩa là phủ tốt; đẻ case rác để đạt chỉ tiêu | Coverage theo rủi ro/yêu cầu |
| **Số bug tester tìm** | Khuyến khích báo bug vụn, hoặc phạt tester ở module ổn | Bug nghiêm trọng lọt ra prod (escaped defects) |
| **% test case pass** | Pass 100% các case dễ vẫn có thể bỏ sót vùng nguy hiểm | Rủi ro còn lại đã cover chưa |

> Mọi metric đều bị "chơi" khi nó thành mục tiêu (Goodhart's law). Đếm số case → người ta đẻ case
> rác. Đếm bug tìm được → người ta báo bug vụn. Chọn metric đo **kết quả thật** (lỗi lọt ra prod,
> rủi ro đã phủ) chứ không đo **hoạt động** (số case, số bug), và luôn hỏi "metric này khuyến
> khích hành vi gì".

## Truyền đạt rủi ro cho quản lý/BrSE

Kỹ năng cuối, và quan trọng nhất với QA lead: **dịch tình trạng test thành ngôn ngữ ra quyết định**.

- Không nói "còn 30 case chưa chạy" → nói "luồng thanh toán **chưa test**, đây là rủi ro cao cho
  go-live; cần thêm 1 ngày hoặc chấp nhận rủi ro này một cách có ý thức".
- Đưa **lựa chọn kèm rủi ro**, để quản lý/khách **quyết**, không giấu rủi ro để "cho kịp".

## Cạm bẫy hay gặp

- **Không định nghĩa out-of-scope** → cãi nhau "sao không test cái này" sau go-live.
- **Không có exit criteria** → "xong" thành "hết giờ", chất lượng tùy may rủi.
- **Đo bằng số case/số bug** → tối ưu sai, đẻ case rác hoặc báo bug vụn.
- **Giấu rủi ro để kịp deadline** → sự cố prod, mất niềm tin, đúng thứ QA phải ngăn.
- **Test plan 40 trang không ai đọc** → hình thức; plan phải gọn và được dùng thật.
- **Không cho quản lý/BrSE lựa chọn** → họ không quyết được, hoặc quyết mù.

## Ghi nhớ

**Test strategy** định hướng dài hạn, **test plan** cụ thể cho một release — gọn thôi, nhưng phải
rõ **phạm vi (gồm out-of-scope)** và **entry/exit criteria**. Chọn **metric đo kết quả thật**
(lỗi lọt prod, rủi ro đã phủ), tránh metric hoạt động (số case, số bug) vì chúng bị "chơi". Và kỹ
năng quyết định cấp lead: **truyền đạt rủi ro** cho quản lý/BrSE bằng lựa chọn rõ ràng, để họ
quyết có ý thức — không giấu rủi ro để cho kịp.
