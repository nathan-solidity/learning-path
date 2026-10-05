---
level: "technical"
order: 15
title: "Tự verify dữ liệu thực tế"
est: "3 giờ"
checklist:
  - "Chuyển được một câu hỏi nghiệp vụ thành cách kiểm chứng bằng dữ liệu"
  - "Đối chiếu được dữ liệu 2 nguồn (file khách gửi vs DB) để tìm chênh lệch"
  - "Phát hiện được các loại bất thường: trùng, thiếu, sai định dạng, ngoài khoảng"
  - "Biết khi nào một 'bug' thực ra là dữ liệu bẩn, không phải lỗi code"
related:
  - "glossary:db"
  - "playbook:ba"
---

## Từ câu hỏi nghiệp vụ đến kiểm chứng dữ liệu

Kỹ năng tổng hợp của cấp technical: gộp SQL + đọc dữ liệu để **tự trả lời** thay vì suy
đoán. Nguyên tắc xuyên suốt các rule nội bộ: điểm nào verify được từ nguồn thì phải verify
trước khi phát ngôn.

Ví dụ câu hỏi nghiệp vụ → cách kiểm chứng:

| Câu hỏi | Kiểm chứng bằng |
|---------|-----------------|
| "Có bao nhiêu khách chưa từng đặt đơn?" | `LEFT JOIN` customers–orders, đếm dòng orders NULL |
| "File khách gửi có khớp DB không?" | Đối chiếu từng dòng theo khóa (mã KH) |
| "Tại sao báo cáo lệch 3 đơn?" | So tổng theo từng ngày, tìm ngày lệch |

## Tự thử — verify bằng SQL ngay

Dùng Query Builder chọn bảng cần đếm/tổng hợp, hoặc viết SQL tự do. Thử ngay các câu tổng
hợp: đếm đơn theo trạng thái (`COUNT`), tổng tiền mỗi khách (`SUM`), giá trị đơn cao/thấp nhất
(`MAX`/`MIN`). Khi chọn một hàm tổng hợp, chú ý `GROUP BY` tự sinh cho các cột không tổng hợp —
đó là nguyên lý: cột không nằm trong hàm tổng hợp thì phải được nhóm.

[[sql-playground]]

## Đối chiếu 2 nguồn dữ liệu

Tình huống kinh điển: khách gửi file Excel, bảo "số liệu trên hệ thống sai". Trước khi kết
luận bug, BA đối chiếu:

1. **Chuẩn hóa** cả 2 nguồn về cùng khóa (mã đơn / mã KH), cùng định dạng.
2. Tìm dòng **chỉ có ở một bên** (thiếu/thừa).
3. Với dòng có ở cả hai, so **từng cột** để thấy chênh lệch giá trị.
4. Quy nguyên nhân: dữ liệu bẩn? khác timezone? khác quy tắc làm tròn? hay thật sự là bug?

## Các loại bất thường thường gặp

- **Trùng lặp**: cùng một bản ghi xuất hiện nhiều lần (`GROUP BY ... HAVING COUNT(*) > 1`).
- **Thiếu (NULL)**: cột bắt buộc mà rỗng.
- **Sai định dạng**: ngày `31/02`, email không hợp lệ, số âm ở chỗ không được âm.
- **Ngoài khoảng**: tuổi 200, số tiền vượt trần, ngày ở tương lai.
- **Mồ côi (orphan)**: đơn trỏ tới khách không tồn tại (vi phạm quan hệ khóa ngoại).

## "Bug" hay dữ liệu bẩn?

Rất nhiều "bug" khách báo thực ra là **dữ liệu lịch sử không sạch** (nhập tay sai, migrate
thiếu). BA verify được điều này sẽ:
- Tránh đổ oan cho code, tiết kiệm công dev.
- Đề xuất đúng hướng: sửa dữ liệu, hay thêm validation để không tái diễn.

> Kết luận "code sai" hay "dữ liệu sai" phải dựa trên đối chiếu thực tế, không phỏng đoán.
> Chưa verify được thì ghi rõ "chưa xác nhận" và nêu cách sẽ kiểm chứng.
