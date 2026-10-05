---
level: "beginner"
order: 2
title: "Dart OOP & lập trình bất đồng bộ"
est: "4-5 giờ"
checklist:
  - "Viết class có constructor (kể cả named & factory), getter/setter"
  - "Dùng kế thừa, abstract class, interface (`implements`) và `mixin`"
  - "Giải thích `Future`, `async`/`await` và bắt lỗi bằng try/catch"
  - "Phân biệt `Future` (một giá trị) và `Stream` (chuỗi giá trị theo thời gian)"
  - "Dùng `enum` (kể cả enhanced enum) và `sealed class`/pattern matching cơ bản"
related:
  - "skill:nta-code-review"
  - "skill:nta-refactor"
---

## Class & constructor

```dart
class User {
  final String name;
  final int age;

  // constructor rút gọn: gán thẳng vào field
  User(this.name, this.age);

  // named constructor
  User.guest() : name = 'Khách', age = 0;

  // getter tính toán
  bool get isAdult => age >= 18;

  @override
  String toString() => 'User($name, $age)';
}

final u = User('Nhân', 30);
final g = User.guest();
print(u.isAdult);   // true
```

**Factory constructor** — trả về instance có sẵn hoặc chọn subtype tùy input (hay dùng khi
parse JSON):

```dart
class User {
  final String name;
  User(this.name);

  factory User.fromJson(Map<String, dynamic> json) => User(json['name'] as String);
}
```

## Kế thừa, abstract, interface, mixin

```dart
abstract class Animal {
  String sound();                 // method trừu tượng, không có thân
  void describe() => print('Kêu: ${sound()}');
}

class Dog extends Animal {
  @override
  String sound() => 'Gâu';
}
```

Dart **không có `interface` keyword** — mọi class đều dùng được như interface qua
`implements` (buộc cài đặt lại toàn bộ). **`mixin`** dùng để **tái sử dụng hành vi** cho
nhiều class không cùng cây kế thừa:

```dart
mixin Logger {
  void log(String msg) => print('[LOG] $msg');
}

class Service with Logger {}    // Service giờ có method log()
```

## Bất đồng bộ — `Future`, `async`/`await`

Gọi API, đọc file, truy vấn DB... đều **mất thời gian** → trả về `Future<T>` (một giá trị
sẽ có trong tương lai). Đây là kiến thức **bắt buộc** vì mọi app đều gọi mạng.

```dart
Future<String> fetchName() async {
  await Future.delayed(Duration(seconds: 1));   // giả lập chờ mạng
  return 'Nhân';
}

Future<void> main() async {
  print('bắt đầu');
  final name = await fetchName();     // dừng ở đây tới khi có kết quả
  print('chào $name');
}
```

**Bắt lỗi** bằng try/catch như code đồng bộ:

```dart
try {
  final data = await api.load();
} catch (e) {
  print('Lỗi: $e');
} finally {
  print('xong');
}
```

> **Cạm bẫy**: quên `await` → bạn cầm một `Future` chưa hoàn thành thay vì giá trị. Dấu
> hiệu: in ra `Instance of 'Future<...>'`, hoặc UI hiện dữ liệu rỗng rồi mới có.

## `Stream` — nhiều giá trị theo thời gian

`Future` cho **một** giá trị; `Stream` cho **một chuỗi** giá trị (vd: vị trí GPS liên tục,
tin nhắn realtime, sự kiện bấm nút).

```dart
Stream<int> counter() async* {          // async* + yield tạo stream
  for (var i = 1; i <= 3; i++) {
    await Future.delayed(Duration(seconds: 1));
    yield i;                             // phát ra một giá trị
  }
}

await for (final n in counter()) {      // lắng nghe từng giá trị
  print(n);                             // 1, rồi 2, rồi 3
}
```

Trong Flutter, `Stream` gắn với widget `StreamBuilder` để UI tự cập nhật mỗi khi có giá trị mới.

## Enum & pattern matching

```dart
enum Status { active, inactive, banned }

// enhanced enum: enum có field & method (Dart 2.17+)
enum Role {
  admin('Quản trị'),
  user('Người dùng');

  final String label;
  const Role(this.label);
}

final s = Status.active;
final text = switch (s) {              // switch expression + pattern
  Status.active => 'Đang hoạt động',
  Status.inactive => 'Tạm ngưng',
  Status.banned => 'Bị khóa',
};
```

`sealed class` + `switch` cho phép compiler **bắt buộc xử lý đủ mọi trường hợp** — nền tảng
để mô hình hóa state (Loading / Data / Error) ở các bài sau.

## Ghi nhớ

OOP của Dart quen thuộc, nhưng hai thứ **đặc thù và quan trọng nhất** cho Flutter là:
**`async`/`await` + `Future`** (mọi lệnh gọi mạng) và **`Stream`** (dữ liệu realtime). Quên
`await` là lỗi kinh điển của người mới — luôn tự hỏi "hàm này có trả `Future` không?".
