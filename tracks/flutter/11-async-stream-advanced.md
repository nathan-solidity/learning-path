---
level: "intermediate"
order: 11
title: "Async nâng cao — Stream, isolate & xử lý đồng thời"
est: "5-6 giờ"
checklist:
  - "Dùng `StreamBuilder` và `StreamProvider` cho dữ liệu realtime"
  - "Chạy nhiều `Future` song song với `Future.wait` và hiểu `then`/`catchError`"
  - "Giải thích event loop & microtask; vì sao Dart đơn luồng vẫn 'không block'"
  - "Đưa xử lý nặng sang isolate (`compute`) để không giật UI"
  - "Chống spam gọi API bằng debounce trên stream"
related:
  - "skill:nta-code-review"
  - "skill:nta-perf-audit"
---

## Event loop — vì sao đơn luồng vẫn mượt

Dart chạy trên **một luồng** với **event loop**. Khi gặp `await`, hàm **nhường luồng** cho
việc khác thay vì đứng chờ, tới khi kết quả sẵn sàng mới chạy tiếp. Nhờ đó UI không "đơ" khi
đợi mạng. Nhưng **việc tính toán nặng, đồng bộ** (parse JSON khổng lồ, xử lý ảnh) **vẫn chặn**
luồng → phải đẩy sang isolate (bên dưới).

- **Microtask queue**: ưu tiên cao (vd `Future.microtask`, `scheduleMicrotask`).
- **Event queue**: I/O, timer, gesture, `Future` thường.

## StreamBuilder & StreamProvider

`Stream` phát nhiều giá trị theo thời gian (bài 2). Trong UI, `StreamBuilder` dựng lại mỗi
khi có giá trị mới:

```dart
StreamBuilder<int>(
  stream: counterStream(),
  builder: (context, snapshot) {
    if (snapshot.hasError) return Text('Lỗi: ${snapshot.error}');
    if (!snapshot.hasData) return const CircularProgressIndicator();
    return Text('Giá trị: ${snapshot.data}');
  },
)
```

Với Riverpod, `StreamProvider` bọc stream thành `AsyncValue` (dùng `.when` như FutureProvider):

```dart
final messagesProvider = StreamProvider<List<Message>>((ref) {
  return ref.watch(chatRepoProvider).watchMessages();   // vd Firestore snapshots
});
```

## Chạy song song nhiều Future

Gọi tuần tự các API độc lập là **lãng phí** — chạy song song bằng `Future.wait`:

```dart
// Tuần tự: tốn ~ t1 + t2
final user = await fetchUser();
final posts = await fetchPosts();

// Song song: tốn ~ max(t1, t2)
final results = await Future.wait([fetchUser(), fetchPosts()]);
final user = results[0] as User;
final posts = results[1] as List<Post>;
```

`then`/`catchError` là cách nối Future không dùng `await` (ít dùng hơn nhưng cần biết đọc):

```dart
fetchUser().then((u) => print(u.name)).catchError((e) => print('lỗi $e'));
```

## Isolate — cho việc CPU nặng

Dart chia sẻ bộ nhớ **không** qua nhiều luồng; muốn tính toán nặng song song, dùng
**isolate** (bộ nhớ riêng, giao tiếp qua message). Cách đơn giản nhất: `compute`.

```dart
// hàm nặng phải là top-level hoặc static
List<Item> parseBigJson(String raw) {
  final list = jsonDecode(raw) as List;
  return list.map((e) => Item.fromJson(e)).toList();
}

// chạy trên isolate khác → UI không giật
final items = await compute(parseBigJson, rawJsonString);
```

> **Khi nào cần isolate**: khi thao tác đồng bộ nặng > ~16ms làm rớt khung hình (UI khựng).
> Ví dụ: parse JSON rất lớn, giải mã ảnh, tính toán mật mã. Gọi mạng **không** cần isolate
> (đã bất đồng bộ sẵn).

## Debounce — chống gọi API liên tục

Ô tìm kiếm gõ mỗi ký tự gọi API là lãng phí. Debounce chỉ gọi sau khi ngừng gõ:

```dart
Timer? _debounce;
void onChanged(String q) {
  _debounce?.cancel();
  _debounce = Timer(const Duration(milliseconds: 400), () {
    ref.read(searchProvider.notifier).search(q);   // chỉ gọi khi ngừng gõ 400ms
  });
}
```

(Gói `rxdart` cung cấp `debounceTime` cho stream nếu muốn cách khai báo hơn.)

## Cạm bẫy hay gặp

- Quên hủy `StreamSubscription`/`Timer` trong `dispose` → rò rỉ, callback chạy sau khi hủy.
- Đặt tính toán nặng trong `build` hoặc luồng chính → UI giật; đẩy sang `compute`.
- Dùng `Future.wait` cho các bước **phụ thuộc nhau** (bước 2 cần kết quả bước 1) → sai; chỉ
  song song hóa việc độc lập.

## Ghi nhớ

Dart đơn luồng + event loop: `await` giúp không block khi chờ I/O, nhưng **tính toán nặng
vẫn chặn** → dùng `compute`/isolate. `Stream` + `StreamBuilder`/`StreamProvider` cho dữ liệu
realtime. Song song hóa việc độc lập bằng `Future.wait`, và debounce để tiết kiệm gọi mạng.
