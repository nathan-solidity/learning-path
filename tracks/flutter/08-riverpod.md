---
level: "intermediate"
order: 8
title: "Quản lý state với Riverpod"
est: "7-8 giờ"
checklist:
  - "Giải thích vì sao cần state management thay cho setState khi app lớn"
  - "Bọc app trong `ProviderScope` và đọc provider bằng `ConsumerWidget`/`ref.watch`"
  - "Phân biệt `Provider`, `StateProvider`, `NotifierProvider`, `FutureProvider`"
  - "Dùng `ref.watch` (lắng nghe, rebuild) vs `ref.read` (đọc 1 lần, trong callback)"
  - "Tổ chức state một màn hình bằng `Notifier`/`AsyncNotifier`"
---

## Vì sao cần Riverpod

Ở phần Beginner, `setState` đủ cho state cục bộ. Nhưng khi **nhiều màn hình xa nhau** cần
chung dữ liệu (user đăng nhập, giỏ hàng, theme), truyền qua constructor xuyên nhiều tầng
(*prop drilling*) trở nên rối và dễ lỗi. **Riverpod** cho phép **khai báo state ở một nơi**
và **đọc từ bất kỳ đâu** trong cây widget, có kiểm tra kiểu chặt lúc biên dịch.

> Cộng đồng Flutter hiện ưu tiên **Riverpod** cho dự án mới (an toàn hơn `Provider` thuần,
> test dễ). Track này dạy Riverpod làm state management chính.

## Cài đặt & ProviderScope

```bash
flutter pub add flutter_riverpod
```

Bọc gốc app trong `ProviderScope` (nơi lưu trạng thái các provider):

```dart
void main() => runApp(const ProviderScope(child: MyApp()));
```

## Provider — nguồn dữ liệu chỉ đọc

```dart
final greetingProvider = Provider<String>((ref) => 'Xin chào');

// đọc trong widget
class Hello extends ConsumerWidget {
  const Hello({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final greeting = ref.watch(greetingProvider);
    return Text(greeting);
  }
}
```

`ConsumerWidget` thay cho `StatelessWidget` và cấp thêm `ref` để đọc provider.

## StateProvider — một giá trị đơn giản đổi được

```dart
final counterProvider = StateProvider<int>((ref) => 0);

class Counter extends ConsumerWidget {
  const Counter({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final count = ref.watch(counterProvider);       // rebuild khi đổi
    return Column(children: [
      Text('$count'),
      ElevatedButton(
        onPressed: () => ref.read(counterProvider.notifier).state++,
        child: const Text('+1'),
      ),
    ]);
  }
}
```

## `ref.watch` vs `ref.read`

| | `ref.watch` | `ref.read` |
|---|---|---|
| Lắng nghe thay đổi? | Có → rebuild khi state đổi | Không, đọc 1 lần |
| Đặt ở đâu | Trong `build` | Trong callback (onPressed...) |

> **Quy tắc vàng**: `watch` trong `build`, `read` trong callback. Dùng `watch` trong
> callback → cảnh báo/rebuild thừa; dùng `read` trong `build` → UI không cập nhật.

## Notifier — gom state phức tạp + logic

Với state có nhiều thao tác (thêm/xóa/sửa danh sách), dùng `Notifier`:

```dart
class TodoNotifier extends Notifier<List<Todo>> {
  @override
  List<Todo> build() => [];              // state khởi tạo

  void add(Todo t) => state = [...state, t];       // gán state MỚI (bất biến)
  void remove(String id) =>
      state = state.where((t) => t.id != id).toList();
}

final todoProvider = NotifierProvider<TodoNotifier, List<Todo>>(TodoNotifier.new);

// dùng
final todos = ref.watch(todoProvider);                 // đọc danh sách
ref.read(todoProvider.notifier).add(newTodo);          // gọi thao tác
```

> **Quan trọng**: luôn **gán `state` bằng object mới** (`[...state, x]`), không sửa tại chỗ
> (`state.add(x)`). Riverpod so sánh tham chiếu để biết có đổi — sửa tại chỗ → UI không cập nhật.

## FutureProvider — dữ liệu bất đồng bộ

Cho dữ liệu tải từ mạng/DB, dùng `FutureProvider` + `AsyncValue` (tự xử lý loading/error) —
sẽ dùng nhiều ở bài gọi API tiếp theo.

```dart
final userProvider = FutureProvider<User>((ref) async {
  return await api.fetchUser();
});

// trong widget
final asyncUser = ref.watch(userProvider);
return asyncUser.when(
  data: (user) => Text(user.name),
  loading: () => const CircularProgressIndicator(),
  error: (e, _) => Text('Lỗi: $e'),
);
```

## Cạm bẫy hay gặp

- Sửa state tại chỗ (`state.add`) thay vì gán mới → UI không rebuild.
- Dùng `watch` trong callback hoặc `read` trong `build` → sai hành vi.
- Quên `ProviderScope` bọc app → lỗi khi đọc provider.

## Ghi nhớ

Riverpod tách **state ra khỏi widget**: khai báo provider một nơi, `ref.watch` để đọc và
tự rebuild, `ref.read(...notifier)` để gọi hành động. Nhớ **watch-trong-build, read-trong-callback**
và **luôn gán state mới**. Đây là kỹ năng bản lề để xây app thật ở các bài sau.
