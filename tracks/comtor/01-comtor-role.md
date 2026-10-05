---
level: "basic"
order: 1
title: "Vai trò Comtor & mô hình offshore Nhật"
est: "2-3 giờ"
checklist:
  - "Phân biệt được Comtor với BrSE và thông dịch viên thuần về trách nhiệm"
  - "Mô tả được vị trí của Comtor trong luồng giao tiếp khách Nhật → BrSE → dev VN"
  - "Kể được ít nhất 3 kỳ vọng của khách Nhật với người làm cầu nối"
  - "Giải thích được vì sao Comtor không được tự suy diễn nội dung"
  - "Biết khi nào cần nói 'tôi cần xác nhận lại' thay vì dịch đại"
---

## Comtor là ai?

**Comtor** (viết tắt của *Communicator*, đôi khi ghi コミュニケーター) là người **kết nối
ngôn ngữ và ý hiểu** giữa team dev Việt Nam và khách hàng / BrSE Nhật Bản trong dự án
offshore. Comtor dịch tài liệu, thông dịch cuộc họp, và làm rõ yêu cầu — nhưng **không quyết
định nội dung nghiệp vụ**.

## Comtor vs BrSE vs thông dịch viên

![Ba vai: thông dịch viên → Comtor → BrSE, mức trách nhiệm & chủ động tăng dần; Comtor không tự quyết nội dung](/images/cm-roles.png)

| | Thông dịch viên thuần | **Comtor** | BrSE (Bridge SE) |
|---|---|---|---|
| Nhiệm vụ chính | Dịch đúng câu chữ | Dịch + hiểu ngữ cảnh IT, làm rõ yêu cầu | Cầu nối kỹ thuật + quản lý một phần dự án |
| Kiến thức IT | Không bắt buộc | Cần hiểu thuật ngữ, luồng dev | Cần sâu (đọc spec, đánh giá khả thi) |
| Ra quyết định | Không | Không (chỉ chuyển tiếp, làm rõ) | Có (một phần scope, ưu tiên) |
| Ví dụ đầu ra | Dịch phát biểu tại họp | Dịch spec + note điểm mơ hồ để hỏi | Chốt cách hiểu với khách, giao dev |

> Comtor **không** phải BrSE thu nhỏ. Đừng tự chốt "chắc khách muốn thế này" — đó là việc
> của BrSE/khách. Comtor giỏi là người **chuyển tin trung thực** và **phát hiện chỗ chưa rõ**.

## Vị trí trong dự án offshore VN-JP

Luồng giao tiếp điển hình:

```
Khách Nhật (顧客/kokyaku) ⇄ BrSE ⇄ Comtor ⇄ Dev/QA Việt Nam
```

Comtor thường đứng giữa BrSE và team VN: nhận spec/chỉ thị tiếng Nhật, dịch cho dev; nhận
câu hỏi của dev, dịch ngược lên. Mỗi lần "chuyển tay" là một lần thông tin **có thể méo** —
nhiệm vụ của Comtor là làm cho nó **không méo**.

## Kỳ vọng của khách Nhật

- **正確 (seikaku – chính xác)**: dịch đúng, không thêm-bớt. Khách Nhật rất khó chịu khi phát
  hiện thông tin bị "chế".
- **報告 (hōkoku – báo cáo)**: cập nhật tiến độ đều đặn, không đợi được hỏi mới nói.
- **確認 (kakunin – xác nhận)**: khi chưa rõ thì hỏi lại, không tự đoán. Với khách Nhật,
  "hỏi lại để chắc" là chuyên nghiệp, không phải yếu kém.
- **納期 (nōki – hạn giao)**: giữ đúng hẹn; nếu trễ phải báo **sớm**, không báo sát giờ.

## Đạo đức nghề: không tự suy diễn

Tình huống thật: khách viết trong spec *「必要に応じて表示する」* (hitsuyō ni ōjite hyōji suru
– "hiển thị khi cần thiết"). Câu này **mơ hồ**: "khi cần" là khi nào?

> **Sai:** tự dịch thành "hiển thị khi user bấm nút" rồi để dev code theo → khách kiểm tra
> thấy khác ý → phải làm lại.
>
> **Đúng:** dịch trung thực "hiển thị khi cần thiết", kèm note: *"『必要に応じて』 nghĩa chưa
> rõ điều kiện — cần hỏi khách: cụ thể khi nào thì hiển thị?"* rồi đưa vào Q&A.

Comtor chuyển thông tin, **không sáng tạo** thông tin. Khi không chắc, câu an toàn là:
"Điểm này tôi cần xác nhận lại với khách/BrSE trước khi khẳng định."

## Cạm bẫy hay gặp

- **Đóng vai BrSE**: tự chốt cách hiểu thay khách → làm sai scope.
- **Dịch cho xong**: gặp câu mơ hồ vẫn dịch trơn tru, không đánh dấu → dev hiểu sai mà không
  ai biết.
- **Giấu chỗ không hiểu**: ngại hỏi lại vì sợ bị đánh giá → sai lan rộng.
- **Bỏ qua sắc thái**: dịch đúng nghĩa đen nhưng mất mức độ khẩn / lịch sự của khách.

## Ghi nhớ

Comtor là **cầu nối trung thực**, không phải người ra quyết định. Ba chữ vàng của khách Nhật:
**正確 (chính xác) – 確認 (xác nhận khi chưa rõ) – 報告 (báo cáo sớm)**. Chưa chắc thì hỏi lại —
đó là chuyên nghiệp, không phải yếu kém.
