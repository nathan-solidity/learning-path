---
level: "beginner"
order: 3
title: "Widget & cây widget — nền tảng UI Flutter"
est: "5-6 giờ"
checklist:
  - "Tạo project bằng `flutter create` và hiểu vai trò file `lib/main.dart`"
  - "Giải thích 'mọi thứ là widget' và phân biệt StatelessWidget vs StatefulWidget"
  - "Dùng `MaterialApp`, `Scaffold`, `AppBar`, `Text`, `Icon`, `Image`, `Container`"
  - "Hiểu build context và cây widget; dùng hot reload để lặp nhanh"
  - "Áp dụng `const` cho widget tĩnh để tối ưu rebuild"
related:
  - "glossary:dev-git"
---

## Tạo & chạy project

```bash
flutter create my_app
cd my_app
flutter run           # chọn thiết bị/emulator; app khởi động
```

Điểm vào là `lib/main.dart`, hàm `main()` gọi `runApp(widget_gốc)`.

```dart
import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'My App',
      home: Scaffold(
        appBar: AppBar(title: const Text('Trang chủ')),
        body: const Center(child: Text('Xin chào Flutter')),
      ),
    );
  }
}
```

## "Mọi thứ là widget"

UI Flutter là một **cây widget** lồng nhau. Nút, chữ, khoảng đệm, cả layout — đều là widget.
Bạn **mô tả** UI muốn có (declarative); Flutter tự dựng và cập nhật.

```
MaterialApp
└─ Scaffold
   ├─ AppBar → Text('Trang chủ')
   └─ Center → Text('Xin chào Flutter')
```

- **`MaterialApp`**: gốc app theo Material Design (theme, routing, locale).
- **`Scaffold`**: khung một màn hình (app bar, body, nút nổi, drawer...).
- **`Center`, `Padding`, `Container`**: widget bố cục/trang trí.
- **`Text`, `Icon`, `Image`**: widget hiển thị nội dung.

## StatelessWidget vs StatefulWidget

| | StatelessWidget | StatefulWidget |
|---|---|---|
| Dữ liệu thay đổi theo thời gian? | Không | Có |
| Có `State` riêng? | Không | Có (giữ dữ liệu qua các lần rebuild) |
| Ví dụ | Nút, nhãn tĩnh, icon | Bộ đếm, form, danh sách tải từ mạng |

```dart
// Stateless: chỉ phụ thuộc input, không đổi
class Greeting extends StatelessWidget {
  final String name;
  const Greeting(this.name, {super.key});

  @override
  Widget build(BuildContext context) => Text('Chào $name');
}
```

`StatefulWidget` sẽ học kỹ ở bài sau (setState). Ý tưởng: khi state đổi, Flutter gọi lại
`build()` để **dựng lại** phần UI liên quan.

## Container — hộp đa năng

```dart
Container(
  width: 200,
  padding: const EdgeInsets.all(16),      // đệm trong
  margin: const EdgeInsets.only(top: 8),  // lề ngoài
  decoration: BoxDecoration(
    color: Colors.blue.shade100,
    borderRadius: BorderRadius.circular(12),
  ),
  child: const Text('Nội dung'),
)
```

## Hot reload — vũ khí năng suất

Sửa code UI → lưu (hoặc bấm `r` trong terminal) → **hot reload** áp dụng thay đổi trong
tích tắc **giữ nguyên state hiện tại**. `R` (hoa) = hot restart (khởi động lại, mất state).

> **Mẹo**: đặt `const` trước widget không đổi (`const Text(...)`, `const SizedBox(...)`).
> Widget `const` được Flutter **tái sử dụng**, không dựng lại — giảm rebuild, mượt hơn. Đây
> là tối ưu "miễn phí" nên tập thói quen ngay từ đầu.

## BuildContext là gì

`context` (tham số của `build`) là **vị trí của widget trong cây**. Qua nó bạn truy cập
theme, kích thước màn hình, điều hướng... (`Theme.of(context)`, `MediaQuery.of(context)`,
`Navigator.of(context)`). Sẽ dùng liên tục ở các bài sau.

## Cạm bẫy hay gặp

- Quên `const` → rebuild thừa, app kém mượt.
- Lồng widget quá sâu thành "kim tự tháp" khó đọc → tách thành widget con có tên.
- Nhầm `margin` (ngoài) với `padding` (trong).

## Ghi nhớ

Flutter là **UI declarative**: bạn mô tả cây widget, Flutter lo phần dựng và cập nhật. Nhớ
sự khác nhau **Stateless (không đổi) vs Stateful (có đổi)** và tận dụng **hot reload** để
học nhanh — đây là chương bạn sẽ "aha" về cách Flutter hoạt động.
