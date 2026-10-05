---
level: "beginner"
order: 5
title: "State cục bộ với setState & vòng đời widget"
est: "4-5 giờ"
checklist:
  - "Tạo StatefulWidget và cập nhật UI bằng `setState`"
  - "Giải thích tách biệt Widget (bất biến) và State (giữ dữ liệu)"
  - "Dùng đúng các hàm vòng đời: `initState`, `dispose`, `didUpdateWidget`"
  - "Quản lý `TextEditingController`/`AnimationController` và `dispose` chúng"
  - "Biết giới hạn của setState và khi nào cần state management ở bài sau"
---

## StatefulWidget & setState

Khi dữ liệu **thay đổi theo thời gian** (bộ đếm, ô nhập, dữ liệu tải về), dùng
`StatefulWidget`. Gọi `setState(() {...})` để báo Flutter "state đã đổi, hãy dựng lại UI".

```dart
class Counter extends StatefulWidget {
  const Counter({super.key});
  @override
  State<Counter> createState() => _CounterState();
}

class _CounterState extends State<Counter> {
  int _count = 0;                    // state được giữ qua các lần rebuild

  void _increment() {
    setState(() {                    // báo có thay đổi → gọi lại build()
      _count++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('Đếm: $_count'),
        ElevatedButton(onPressed: _increment, child: const Text('+1')),
      ],
    );
  }
}
```

> **Nguyên tắc**: chỉ thay đổi biến state **bên trong** `setState`. Sửa biến ngoài
> `setState` → UI **không cập nhật** vì Flutter không biết cần dựng lại. Đây là lỗi hay gặp
> nhất của người mới.

## Widget vs State — tách biệt cố ý

- **Widget** (class `Counter`) là **bất biến** — tạo lại liên tục, rẻ.
- **State** (`_CounterState`) **tồn tại lâu dài** — giữ `_count` qua các lần widget dựng lại.

Nhờ tách biệt này, Flutter có thể dựng lại cây widget thoải mái mà không mất dữ liệu.

## Vòng đời State

```dart
class _MyState extends State<MyWidget> {
  @override
  void initState() {
    super.initState();
    // gọi 1 lần khi State được tạo: khởi tạo controller, mở stream, gọi API đầu tiên
  }

  @override
  void didUpdateWidget(MyWidget old) {
    super.didUpdateWidget(old);
    // widget cha dựng lại với tham số mới → phản ứng nếu cần
  }

  @override
  void dispose() {
    // gọi khi State bị hủy: đóng controller/stream để tránh RÒ RỈ BỘ NHỚ
    super.dispose();
  }
}
```

| Hàm | Khi nào chạy | Dùng để |
|-----|--------------|---------|
| `initState` | 1 lần, lúc khởi tạo | Khởi tạo controller, gọi API lần đầu |
| `build` | Mỗi lần rebuild | Dựng UI (không đặt logic nặng ở đây) |
| `dispose` | Khi bị hủy | Giải phóng tài nguyên |

## Controller phải được `dispose`

Các controller (nhập liệu, animation, cuộn) **giữ tài nguyên** — không `dispose` sẽ **rò rỉ bộ nhớ**.

```dart
class _FormState extends State<MyForm> {
  final _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();     // BẮT BUỘC
    super.dispose();
  }

  @override
  Widget build(BuildContext context) =>
      TextField(controller: _controller);
}
```

## Giới hạn của setState

`setState` tốt cho state **cục bộ trong một widget** (form, toggle, bộ đếm). Nhưng khi:

- nhiều widget **ở xa nhau** cần chung một dữ liệu (giỏ hàng, user đăng nhập),
- phải "khoan" dữ liệu qua nhiều tầng widget (prop drilling),

thì `setState` trở nên rối. Lúc đó cần **state management** (Riverpod) — học ở phần
Intermediate. Đừng vội: nắm chắc setState trước để hiểu *vì sao* cần công cụ mạnh hơn.

## Cạm bẫy hay gặp

- Sửa state ngoài `setState` → UI không đổi.
- Gọi API/logic nặng trong `build` (chạy mỗi rebuild) → đặt trong `initState`.
- Quên `dispose` controller → rò rỉ bộ nhớ, cảnh báo trong log.
- Gọi `setState` sau khi widget đã bị hủy → lỗi; kiểm tra `if (mounted)` khi cần.

## Ghi nhớ

`setState` là cách quản lý state **đơn giản nhất và luôn có sẵn**. Nhớ: đổi state trong
`setState`, khởi tạo trong `initState`, dọn dẹp trong `dispose`. Khi thấy dữ liệu phải đi
xuyên nhiều widget — đó là dấu hiệu cần Riverpod ở phần sau.
