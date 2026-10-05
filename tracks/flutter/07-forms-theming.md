---
level: "beginner"
order: 7
title: "Form, nhập liệu & giao diện (theme) — dự án Beginner"
est: "6-7 giờ"
checklist:
  - "Dựng form với `Form`, `TextFormField` và validate bằng `validator`"
  - "Đọc giá trị input qua `TextEditingController` hoặc `onSaved`"
  - "Tùy biến theme (màu, font, dark mode) bằng `ThemeData`"
  - "Dùng widget tương tác: `ElevatedButton`, `Switch`, `Checkbox`, `DropdownButton`"
  - "Hoàn thành app Beginner: nhiều màn hình + form có validate + theme"
related:
  - "skill:nta-code-review"
  - "skill:nta-test-gen"
---

## Form & validation

`Form` gom nhiều `TextFormField` và validate cùng lúc qua một `GlobalKey<FormState>`.

```dart
class LoginForm extends StatefulWidget {
  const LoginForm({super.key});
  @override
  State<LoginForm> createState() => _LoginFormState();
}

class _LoginFormState extends State<LoginForm> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();

  @override
  void dispose() { _emailCtrl.dispose(); super.dispose(); }

  void _submit() {
    if (_formKey.currentState!.validate()) {     // chạy mọi validator
      final email = _emailCtrl.text.trim();
      // xử lý đăng nhập...
    }
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        children: [
          TextFormField(
            controller: _emailCtrl,
            decoration: const InputDecoration(labelText: 'Email'),
            keyboardType: TextInputType.emailAddress,
            validator: (v) {
              if (v == null || v.isEmpty) return 'Bắt buộc nhập email';
              if (!v.contains('@')) return 'Email không hợp lệ';
              return null;                        // null = hợp lệ
            },
          ),
          const SizedBox(height: 16),
          ElevatedButton(onPressed: _submit, child: const Text('Đăng nhập')),
        ],
      ),
    );
  }
}
```

`InputDecoration` tùy biến nhãn, hint, icon, viền của ô nhập. `keyboardType` chọn loại bàn
phím (email, số, điện thoại).

## Widget tương tác

```dart
bool _agree = false;
String? _city = 'HN';

Switch(value: _agree, onChanged: (v) => setState(() => _agree = v));
Checkbox(value: _agree, onChanged: (v) => setState(() => _agree = v!));
DropdownButton<String>(
  value: _city,
  items: const [
    DropdownMenuItem(value: 'HN', child: Text('Hà Nội')),
    DropdownMenuItem(value: 'HCM', child: Text('TP.HCM')),
  ],
  onChanged: (v) => setState(() => _city = v),
);
```

## Theme — giao diện nhất quán

Định nghĩa màu, font, kiểu chữ **một chỗ** trong `ThemeData`, mọi widget kế thừa.

```dart
MaterialApp(
  theme: ThemeData(
    colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo),
    useMaterial3: true,
    textTheme: const TextTheme(bodyMedium: TextStyle(fontSize: 16)),
  ),
  darkTheme: ThemeData.dark(useMaterial3: true),
  themeMode: ThemeMode.system,    // theo cài đặt hệ thống (sáng/tối)
  home: const HomeScreen(),
);
```

Trong widget, lấy giá trị theme qua `context` để không hard-code màu:

```dart
Text('Tiêu đề', style: Theme.of(context).textTheme.titleLarge);
Container(color: Theme.of(context).colorScheme.primary);
```

> **Nguyên tắc**: đừng rải màu/kích thước cứng khắp nơi. Định nghĩa ở `ThemeData`, dùng qua
> `Theme.of(context)` — đổi thương hiệu hoặc bật dark mode chỉ sửa một chỗ.

## Dự án Beginner — chốt kiến thức

Kết hợp mọi thứ đã học từ bài 1–7 thành **một app hoàn chỉnh nhỏ**, ví dụ *Danh bạ* hoặc
*Ghi chú*:

- **Nhiều màn hình**: danh sách → chi tiết → màn thêm/sửa (bài 6).
- **Danh sách** `ListView.builder` hiển thị bản ghi (bài 4).
- **Form có validate** để thêm/sửa bản ghi (bài này).
- **State cục bộ** `setState` giữ danh sách trong bộ nhớ (bài 5).
- **Theme** nhất quán, hỗ trợ dark mode (bài này).

Chưa cần API hay database — dữ liệu giữ trong bộ nhớ là đủ để luyện. Phần Intermediate sẽ
thêm gọi mạng, lưu trữ và Riverpod.

## Cạm bẫy hay gặp

- Quên `_formKey.currentState!.validate()` trước khi submit → gửi dữ liệu chưa hợp lệ.
- Quên `dispose` các `TextEditingController`.
- Hard-code màu thay vì dùng theme → khó bảo trì, không hỗ trợ dark mode.

## Ghi nhớ

Form Flutter xoay quanh **`Form` + `TextFormField` + `validator`** (trả `null` là hợp lệ).
Giao diện nhất quán nhờ **`ThemeData` + `Theme.of(context)`**. Hoàn thành app Beginner là
cột mốc: bạn đã dựng được một ứng dụng thật nhiều màn hình. Tiếp theo — làm cho nó "sống"
với dữ liệu mạng và Riverpod.
