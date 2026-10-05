---
level: "intermediate"
order: 13
title: "Testing — unit, widget & integration test"
est: "6-7 giờ"
checklist:
  - "Viết unit test cho logic/model bằng package `test`"
  - "Viết widget test kiểm tra UI bằng `flutter_test` + `WidgetTester`"
  - "Mock dependency (repository/API) bằng `mocktail`"
  - "Override provider Riverpod trong test để cô lập"
  - "Viết integration test chạy trên thiết bị/emulator và đo coverage"
---

## Ba tầng test trong Flutter

| Tầng | Kiểm tra | Tốc độ | Công cụ |
|------|----------|--------|---------|
| **Unit** | Logic thuần (model, repository, notifier) | Nhanh nhất | `test` |
| **Widget** | Một widget dựng & phản ứng đúng | Nhanh | `flutter_test` |
| **Integration** | Cả app chạy thật, nhiều màn hình | Chậm | `integration_test` |

Nguyên tắc **kim tự tháp**: nhiều unit, vừa phải widget, ít integration.

## Unit test

```dart
// test/user_test.dart
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('User.fromJson parse đúng', () {
    final u = User.fromJson({'id': 1, 'name': 'Nhân', 'email': 'a@b.c'});
    expect(u.name, 'Nhân');
    expect(u.id, 1);
  });
}
```

```bash
flutter test                    # chạy toàn bộ test
flutter test test/user_test.dart
```

## Widget test

`WidgetTester` dựng widget trong môi trường test, `find`/`expect` kiểm tra, và mô phỏng tương tác.

```dart
testWidgets('bấm +1 tăng bộ đếm', (tester) async {
  await tester.pumpWidget(const MaterialApp(home: Counter()));

  expect(find.text('0'), findsOneWidget);          // trạng thái đầu
  await tester.tap(find.byIcon(Icons.add));         // bấm nút
  await tester.pump();                              // dựng lại sau setState
  expect(find.text('1'), findsOneWidget);          // đã tăng
});
```

`pump()` dựng lại một khung; `pumpAndSettle()` chờ mọi animation xong.

## Mock dependency với mocktail

Test không nên gọi API thật. Thay repository bằng mock:

```dart
class MockUserRepo extends Mock implements UserRepository {}

test('service trả danh sách user', () async {
  final repo = MockUserRepo();
  when(() => repo.getUsers()).thenAnswer((_) async => [User(id: 1, name: 'A', email: 'x')]);

  final result = await repo.getUsers();
  expect(result, hasLength(1));
});
```

## Override provider Riverpod trong test

Riverpod cho phép **thay provider bằng bản giả** để cô lập widget:

```dart
testWidgets('hiển thị danh sách từ provider', (tester) async {
  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        usersProvider.overrideWith((ref) async => [User(id: 1, name: 'A', email: 'x')]),
      ],
      child: const MaterialApp(home: UserList()),
    ),
  );
  await tester.pumpAndSettle();
  expect(find.text('A'), findsOneWidget);
});
```

Đây là lý do lớn khiến Riverpod dễ test: mọi phụ thuộc đều là provider, thay được trong test.

## Integration test — chạy app thật

```bash
flutter pub add integration_test --dev
```

```dart
// integration_test/app_test.dart
void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  testWidgets('luồng đăng nhập', (tester) async {
    await tester.pumpWidget(const MyApp());
    await tester.enterText(find.byKey(const Key('email')), 'a@b.c');
    await tester.tap(find.byKey(const Key('loginBtn')));
    await tester.pumpAndSettle();
    expect(find.text('Trang chủ'), findsOneWidget);
  });
}
```

```bash
flutter test integration_test          # chạy trên emulator/thiết bị
flutter test --coverage                # sinh coverage/lcov.info
```

## Cạm bẫy hay gặp

- Quên `await tester.pump()` sau tương tác → UI chưa cập nhật, assert sai.
- Test gọi API/DB thật → chậm, giòn (flaky). Luôn mock/override.
- Tìm widget bằng text dễ vỡ khi đổi copy → gắn `Key` cho phần tử cần test.
- Bỏ qua widget test vì "khó" → đây là tầng bắt lỗi UI rẻ nhất; đừng bỏ.

## Ghi nhớ

Ba tầng: **unit** (logic), **widget** (UI + tương tác), **integration** (luồng thật). Mock
API bằng `mocktail`, cô lập bằng **override provider** của Riverpod. Gắn `Key` cho phần tử
quan trọng để test bền. Có test rồi, refactor và lên store mới yên tâm — dẫn thẳng vào phần Advanced.
