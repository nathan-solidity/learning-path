---
level: "beginner"
order: 6
title: "Điều hướng nhiều màn hình & truyền dữ liệu"
est: "4-5 giờ"
checklist:
  - "Chuyển màn hình bằng `Navigator.push`/`pop` và truyền dữ liệu qua constructor"
  - "Nhận dữ liệu trả về từ màn hình con qua `Navigator.pop(result)`"
  - "Dùng named routes và hiểu ưu/nhược so với push trực tiếp"
  - "Biết vì sao dự án lớn nên dùng router khai báo (go_router)"
  - "Dùng `showDialog`/`showModalBottomSheet` cho popup"
---

## Navigator — ngăn xếp màn hình

Flutter quản lý màn hình như một **ngăn xếp (stack)**: `push` đặt màn mới lên trên, `pop`
gỡ màn hiện tại để quay lại.

```dart
// Từ màn A sang màn B
Navigator.push(
  context,
  MaterialPageRoute(builder: (context) => const DetailScreen()),
);

// Quay lại
Navigator.pop(context);
```

## Truyền dữ liệu sang màn con

Cách sạch nhất: **qua constructor** của widget màn hình.

```dart
class DetailScreen extends StatelessWidget {
  final User user;
  const DetailScreen({super.key, required this.user});

  @override
  Widget build(BuildContext context) =>
      Scaffold(appBar: AppBar(title: Text(user.name)));
}

// gọi
Navigator.push(context,
  MaterialPageRoute(builder: (_) => DetailScreen(user: selectedUser)));
```

## Nhận dữ liệu trả về

`push` trả về một `Future` hoàn thành khi màn con `pop`. Màn con truyền kết quả qua `pop`.

```dart
// Màn cha: chờ kết quả
final result = await Navigator.push<bool>(
  context,
  MaterialPageRoute(builder: (_) => const ConfirmScreen()),
);
if (result == true) { /* người dùng đã xác nhận */ }

// Màn con: trả kết quả
Navigator.pop(context, true);
```

## Named routes

Khai báo route theo tên trong `MaterialApp` — gọn khi nhiều màn hình cố định.

```dart
MaterialApp(
  routes: {
    '/': (_) => const HomeScreen(),
    '/settings': (_) => const SettingsScreen(),
  },
);

Navigator.pushNamed(context, '/settings');
```

Nhược điểm: truyền tham số qua named route hơi vụng (`arguments` không kiểu chặt), và không
hỗ trợ tốt deep link / web URL.

## go_router cho dự án thật

Với app nhiều màn, có deep link, hoặc chạy cả web, cộng đồng dùng **`go_router`** (khai báo
route tập trung, URL rõ ràng, hỗ trợ redirect/guard đăng nhập).

```dart
final router = GoRouter(routes: [
  GoRoute(path: '/', builder: (_, __) => const HomeScreen()),
  GoRoute(
    path: '/user/:id',
    builder: (_, state) => UserScreen(id: state.pathParameters['id']!),
  ),
]);

// điều hướng
context.go('/user/42');
```

> **Khuyến nghị**: app nhỏ học `Navigator.push` để hiểu bản chất; app thật (nhiều màn, có
> đăng nhập, cần bảo vệ route) chuyển sang `go_router`.

## Dialog & bottom sheet

```dart
// hộp thoại xác nhận
final ok = await showDialog<bool>(
  context: context,
  builder: (_) => AlertDialog(
    title: const Text('Xóa?'),
    actions: [
      TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Hủy')),
      TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Xóa')),
    ],
  ),
);

// bảng trượt từ dưới lên
showModalBottomSheet(context: context, builder: (_) => const FilterSheet());
```

## Cạm bẫy hay gặp

- Dùng `context` sai sau `await` khi widget có thể đã bị hủy → kiểm tra `if (context.mounted)`.
- Quên `await` khi cần kết quả từ màn con.
- Lạm dụng named routes cho app có deep link → chuyển go_router sớm.

## Ghi nhớ

Điều hướng = **ngăn xếp**: `push` để đi, `pop` để về (kèm kết quả nếu cần). Truyền dữ liệu
sạch nhất là **qua constructor**. App nhỏ dùng `Navigator`; app thật dùng **`go_router`**.
