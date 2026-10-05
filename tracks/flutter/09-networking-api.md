---
level: "intermediate"
order: 9
title: "Gọi REST API — http, Dio & parse JSON"
est: "7-8 giờ"
checklist:
  - "Gọi API bằng `http`/`Dio` (GET/POST) và xử lý status code"
  - "Parse JSON thành model qua `fromJson`/`toJson` (thủ công hoặc code-gen)"
  - "Hiển thị trạng thái loading/data/error bằng `AsyncValue` của Riverpod"
  - "Tổ chức tầng gọi mạng qua lớp Repository, tách khỏi UI"
  - "Xử lý lỗi mạng (timeout, 4xx/5xx) và hiển thị thân thiện"
---

## Chọn client: http hay Dio

- **`http`**: gọn nhẹ, đủ cho app đơn giản.
- **`Dio`**: mạnh hơn — interceptor (gắn token, log), timeout, hủy request, upload tiến trình.
  Khuyến nghị cho app thật.

```bash
flutter pub add dio        # hoặc: flutter pub add http
```

## Gọi GET & parse JSON

Định nghĩa **model** với `fromJson`:

```dart
class User {
  final int id;
  final String name;
  final String email;
  User({required this.id, required this.name, required this.email});

  factory User.fromJson(Map<String, dynamic> json) => User(
    id: json['id'] as int,
    name: json['name'] as String,
    email: json['email'] as String,
  );

  Map<String, dynamic> toJson() => {'id': id, 'name': name, 'email': email};
}
```

Gọi API và parse:

```dart
final dio = Dio(BaseOptions(baseUrl: 'https://api.example.com'));

Future<List<User>> fetchUsers() async {
  final res = await dio.get('/users');
  final list = res.data as List;
  return list.map((e) => User.fromJson(e as Map<String, dynamic>)).toList();
}
```

> **Mẹo code-gen**: viết `fromJson`/`toJson` tay dễ sai với model lớn. Dùng **`json_serializable`**
> (+ `build_runner`) để sinh tự động, hoặc **`freezed`** cho model bất biến kèm `copyWith`.

## Repository — tách gọi mạng khỏi UI

Đừng gọi `dio.get` thẳng trong widget. Gom vào **Repository** để dễ test, đổi nguồn, tái dùng.

```dart
class UserRepository {
  final Dio _dio;
  UserRepository(this._dio);

  Future<List<User>> getUsers() async {
    final res = await _dio.get('/users');
    return (res.data as List)
        .map((e) => User.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}

// cung cấp qua Riverpod
final dioProvider = Provider((ref) => Dio(BaseOptions(baseUrl: '...')));
final userRepoProvider =
    Provider((ref) => UserRepository(ref.watch(dioProvider)));
```

## Hiển thị loading/data/error với AsyncValue

Kết hợp với Riverpod `FutureProvider` (bài trước): `AsyncValue.when` lo cả 3 trạng thái,
bạn không phải tự quản cờ `isLoading`.

```dart
final usersProvider = FutureProvider<List<User>>((ref) {
  return ref.watch(userRepoProvider).getUsers();
});

class UserList extends ConsumerWidget {
  const UserList({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(usersProvider);
    return async.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('Lỗi tải: $e')),
      data: (users) => ListView.builder(
        itemCount: users.length,
        itemBuilder: (_, i) => ListTile(title: Text(users[i].name)),
      ),
    );
  }
}
```

Kéo để tải lại: `ref.invalidate(usersProvider)` (Riverpod sẽ gọi lại).

## POST & gửi dữ liệu

```dart
Future<User> createUser(String name, String email) async {
  final res = await _dio.post('/users', data: {'name': name, 'email': email});
  return User.fromJson(res.data as Map<String, dynamic>);
}
```

## Xử lý lỗi cho tử tế

```dart
try {
  return await repo.getUsers();
} on DioException catch (e) {
  if (e.type == DioExceptionType.connectionTimeout) {
    throw 'Kết nối quá lâu, thử lại sau';
  }
  if (e.response?.statusCode == 401) {
    throw 'Phiên đăng nhập hết hạn';
  }
  throw 'Không tải được dữ liệu';
}
```

> **Nguyên tắc**: bắt lỗi ở tầng repository, **ném thông điệp thân thiện** cho UI; đừng để
> stack trace kỹ thuật hiện ra cho người dùng. Interceptor của Dio là nơi lý tưởng để gắn
> token và log tập trung.

## Cạm bẫy hay gặp

- Ép kiểu JSON sai (`json['id']` là String nhưng ép `as int`) → lỗi lúc chạy. Kiểm tra API thật.
- Gọi API thẳng trong `build` → gọi lại mỗi rebuild. Dùng `FutureProvider`.
- Quên xử lý loading/error → UI treo hoặc trắng khi mạng chậm/lỗi.

## Ghi nhớ

Luồng chuẩn: **Repository** gọi Dio và trả model → **FutureProvider** bọc thành `AsyncValue`
→ **UI** `.when(loading/data/error)`. Tách gọi mạng khỏi UI giúp test được và bảo trì dễ.
Với model lớn, dùng code-gen (`json_serializable`/`freezed`) thay vì viết `fromJson` tay.
