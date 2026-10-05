---
level: "beginner"
order: 1
title: "Dart căn bản — cú pháp, kiểu & null safety"
est: "4-5 giờ"
checklist:
  - "Cài Flutter SDK, chạy `flutter doctor` không còn lỗi chặn"
  - "Khai báo biến với `var`, `final`, `const` và biết khi nào dùng cái nào"
  - "Giải thích null safety: phân biệt `String` và `String?`, dùng `?.`, `??`, `!`"
  - "Viết hàm có tham số vị trí, tham số tên (`{}`) và giá trị mặc định"
  - "Dùng collection (List/Map/Set), collection-if và spread operator `...`"
related:
  - "skill:nta-code-review"
---

## Dart là gì

Flutter viết bằng **Dart** — ngôn ngữ tĩnh kiểu (static typing), biên dịch **AOT** (ahead-of-time)
ra mã máy khi release nên app chạy nhanh, và **JIT** khi dev để có **hot reload**. Nắm chắc
Dart trước là bắt buộc: mọi widget đều là code Dart.

Sau khi cài Flutter SDK, luôn chạy trước:

```bash
flutter doctor        # kiểm tra Xcode, Android SDK, thiết bị... còn thiếu gì
```

## Biến: `var`, `final`, `const`

```dart
var name = 'Nhân';        // suy kiểu → String, đổi giá trị được
final age = 30;           // gán 1 lần, cố định lúc chạy (runtime)
const pi = 3.14;          // hằng số biên dịch (compile-time)

String city = 'Hà Nội';   // khai báo kiểu tường minh
```

> **Phân biệt `final` vs `const`**: `final` cố định khi chạy (vd `final now = DateTime.now()`
> hợp lệ). `const` phải biết giá trị **lúc biên dịch** (`const now = DateTime.now()` ❌ sai).
> Trong Flutter, dùng `const` cho widget không đổi giúp **tối ưu rebuild** — sẽ gặp lại nhiều.

## Null safety — điểm cốt lõi của Dart hiện đại

Mặc định biến **không được null**. Muốn cho phép null, thêm `?` vào kiểu.

```dart
String name = 'A';     // KHÔNG được gán null
String? nickname;      // được null (mặc định là null)

int len = nickname.length;    // ❌ lỗi biên dịch: nickname có thể null
int len = nickname?.length ?? 0;   // ✅ nếu null thì trả 0
```

| Toán tử | Ý nghĩa |
|---------|---------|
| `?.` | Gọi member chỉ khi khác null (null-aware) |
| `??` | Giá trị thay thế khi vế trái null |
| `??=` | Gán nếu đang null |
| `!` | Khẳng định "chắc chắn không null" — **NPE lúc chạy nếu sai** |

> **Cạm bẫy**: `!` (bang operator) tắt kiểm tra null. Chỉ dùng khi bạn **chắc chắn** giá trị
> khác null; lạm dụng `!` là quay lại thời hay crash vì null. Ưu tiên `?.` và `??`.

## Hàm & tham số tên

```dart
int add(int a, int b) => a + b;         // arrow function cho hàm 1 biểu thức

// Tham số tên đặt trong {}, dùng `required` nếu bắt buộc
String greet(String name, {String greeting = 'Xin chào', bool loud = false}) {
  final msg = '$greeting, $name';
  return loud ? msg.toUpperCase() : msg;
}

greet('Nhân');                          // Xin chào, Nhân
greet('Nhân', greeting: 'Hi', loud: true);   // HI, NHÂN
```

Tham số tên (named parameter) là **kiểu tham số bạn sẽ gặp liên tục** khi dựng widget:
`Text('Hi', style: ..., textAlign: ...)`.

## Collection

```dart
final nums = [1, 2, 3];                 // List<int>
final user = {'name': 'Nhân', 'age': 30};   // Map<String, Object>
final tags = {'dart', 'flutter'};       // Set<String> (không trùng)

nums.add(4);
final doubled = nums.map((n) => n * 2).toList();   // [2,4,6,8]
final evens = nums.where((n) => n.isEven).toList(); // [2,4]
```

**Collection-if / for / spread** — rất hay dùng khi build danh sách widget:

```dart
final showExtra = true;
final items = [
  'A',
  'B',
  if (showExtra) 'C',          // chỉ thêm khi điều kiện đúng
  for (var i = 0; i < 3; i++) 'item$i',
  ...['X', 'Y'],               // spread: chèn phần tử của list khác
];
```

## String

```dart
final name = 'Nhân';
final s = 'Xin chào $name, độ dài ${name.length}';   // string interpolation
final multi = '''
dòng 1
dòng 2''';                                            // chuỗi nhiều dòng
```

## Cạm bẫy hay gặp

- Quên `?` khi giá trị có thể null → không compile; hoặc lạm dụng `!` → crash lúc chạy.
- Dùng `==` cho object tự định nghĩa mà chưa override `==`/`hashCode` → so sánh tham chiếu.
- Nhầm `const` với `final`: `const` cần giá trị biết trước lúc build.
- Chia số nguyên: `5 ~/ 2 == 2` (toán tử `~/` mới là chia lấy nguyên; `/` trả `double`).

## Ghi nhớ

Dart là nền của mọi thứ trong Flutter. Hai điều dễ vấp nhất: **null safety** (dùng `?.`/`??`
thay vì `!`) và **tham số tên** (vì widget đâu đâu cũng dùng). Nắm chắc chương này trước khi
đụng tới widget.
