---
level: "advanced"
order: 13
title: "Mobile & cross-browser testing"
est: "3-4 giờ"
checklist:
  - "Giải thích compatibility testing và vì sao 'chạy tốt máy tôi' không đủ"
  - "Xác định ma trận thiết bị/trình duyệt cần test dựa trên dữ liệu người dùng thật"
  - "Kể các đặc thù mobile: mạng yếu, xoay màn hình, gián đoạn (cuộc gọi), pin, cảm ứng"
  - "Phân biệt responsive web, native app và hybrid — mỗi loại test khác nhau"
  - "Biết khi nào dùng thiết bị thật vs giả lập (emulator/simulator) vs cloud device farm"
related:
  - "skill:nta-frontend-checklist"
  - "skill:nta-test-run"
---

## "Chạy tốt trên máy tôi" không phải kết luận

Bài non-functional nêu compatibility là một trục riêng. Bài này đi sâu: người dùng thật vào app
bằng **đủ loại** trình duyệt, kích cỡ màn hình, hệ điều hành, tốc độ mạng — mỗi tổ hợp là một
chỗ có thể vỡ mà máy dev không bao giờ thấy.

> "Máy tôi chạy được" là câu nguy hiểm nhất trong QA. Máy dev là Chrome mới nhất, mạng cáp
> quang, màn hình lớn. Khách hàng có thể là Safari cũ trên iPhone màn nhỏ, mạng 3G chập chờn.
> Compatibility testing thu hẹp khoảng cách giữa "môi trường lý tưởng" và "thế giới thật".

## Chọn ma trận test bằng dữ liệu, không bằng cảm tính

Không thể test mọi tổ hợp — chọn theo **người dùng thật của sản phẩm này**:

```
Nguồn quyết định: analytics (Google Analytics...) của chính sản phẩm
→ Trình duyệt: Chrome 68%, Safari 22%, Edge 6%, còn lại 4%
→ Thiết bị:    iPhone 45%, Android tầm trung 40%, desktop 15%
→ OS:          iOS 16-17, Android 12-14
```

> Đừng đoán "chắc ai cũng dùng Chrome". Mở analytics của đúng sản phẩm đó ra. Với khách Nhật,
> tỷ lệ có thể lệch mạnh — nhiều thị trường Nhật vẫn dùng thiết bị/trình duyệt mà nơi khác đã bỏ.
> Ma trận test phải bám **dữ liệu người dùng thật**, và nên hỏi BrSE về thiết bị phổ biến ở
> phía khách.

## Đặc thù mobile — nhiều thứ web không có

Test mobile không chỉ là "web thu nhỏ". Có cả một lớp tình huống riêng:

| Khía cạnh | Phải test |
|-----------|-----------|
| **Mạng yếu/đổi mạng** | 3G chậm, mất mạng giữa chừng, chuyển Wi-Fi↔4G |
| **Xoay màn hình** | Portrait ↔ landscape, layout có vỡ, mất dữ liệu đang nhập không |
| **Gián đoạn** | Có cuộc gọi/thông báo/app khác chen vào rồi quay lại |
| **Cảm ứng** | Vùng chạm đủ lớn, swipe/pinch, bàn phím ảo che input |
| **Tài nguyên** | Ngốn pin, nóng máy, chạy nền, tốn data |
| **Quyền & thông báo** | Xin quyền camera/vị trí, xử lý khi user từ chối |

## Ba loại app — test khác nhau

| Loại | Là gì | Lưu ý test |
|------|-------|-----------|
| **Responsive web** | Web co giãn theo màn hình | Test qua trình duyệt mobile; tập trung breakpoint layout |
| **Native** | App viết riêng cho iOS/Android | Test qua store build; đặc thù từng OS, cần thiết bị/simulator |
| **Hybrid** | Web nhúng trong vỏ native | Kết hợp cả hai; hay lỗi ở chỗ web↔native giao tiếp |

## Thiết bị thật vs giả lập vs device farm

| Cách | Khi nào dùng |
|------|-------------|
| **Emulator/Simulator** | Test nhanh nhiều kích cỡ lúc phát triển; rẻ, sẵn |
| **Thiết bị thật** | Test cuối, và những thứ giả lập không mô phỏng đúng: cảm ứng thật, hiệu năng thật, camera, cảm biến, mạng thật |
| **Cloud device farm** (BrowserStack…) | Cần nhiều thiết bị/OS mà không mua nổi hết |

> Giả lập tiện nhưng **nói dối về hiệu năng và trải nghiệm chạm**. Một app mượt trên simulator
> Mac mạnh có thể giật trên điện thoại tầm trung thật. Ít nhất những case quan trọng và bản cuối
> phải chạy trên **thiết bị thật** — nhất là phần hiệu năng, cử chỉ, và camera/cảm biến.

## Cạm bẫy hay gặp

- **"Chạy tốt máy tôi" là kết luận** → bỏ sót lỗi trên trình duyệt/thiết bị của khách.
- **Chọn ma trận theo cảm tính** → test nhầm thiết bị ít ai dùng, bỏ thiết bị đông người.
- **Chỉ test trên emulator** → hiệu năng và trải nghiệm chạm thật khác hẳn.
- **Bỏ qua tình huống mạng yếu/gián đoạn** → app vỡ khi mất mạng hoặc có cuộc gọi chen vào.
- **Quên xoay màn hình** → layout landscape vỡ hoặc mất dữ liệu đang nhập.
- **Không hỏi BrSE về thiết bị phía khách Nhật** → ma trận lệch với thực tế người dùng.

## Ghi nhớ

**Compatibility testing** thu hẹp khoảng cách giữa "máy dev lý tưởng" và "thế giới thật" — chọn
**ma trận thiết bị/trình duyệt theo analytics thật**, không đoán. Mobile có lớp đặc thù riêng:
**mạng yếu, xoay màn hình, gián đoạn, cảm ứng, pin, quyền**. Phân biệt responsive/native/hybrid
vì mỗi loại test khác. Dùng emulator để nhanh, nhưng bản quan trọng và cuối phải chạy **thiết bị
thật** — giả lập nói dối về hiệu năng và trải nghiệm chạm.
