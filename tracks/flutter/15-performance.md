---
level: "advanced"
order: 15
title: "Tối ưu hiệu năng & render"
est: "5-6 giờ"
checklist:
  - "Dùng DevTools (Performance, Widget Inspector) để tìm jank"
  - "Giảm rebuild thừa: `const`, tách widget, chọn phạm vi `watch` hẹp"
  - "Tối ưu danh sách dài và ảnh (cache, resize, lazy)"
  - "Hiểu build/layout/paint và tránh công việc nặng trong `build`"
  - "Đo kích thước app và giảm bằng `--split-per-abi`/tree-shaking"
related:
  - "skill:nta-perf-audit"
  - "skill:nta-code-review"
---

## Đo trước, tối ưu sau

Đừng đoán. Chạy ở **profile mode** (gần với release) và dùng **DevTools**:

```bash
flutter run --profile          # KHÔNG đo hiệu năng ở debug mode (chậm giả tạo)
```

- **Performance view**: xem timeline khung hình; khung > 16ms (60fps) là **jank** (giật).
- **Widget Inspector**: xem cây widget, phát hiện lồng sâu / rebuild.
- Bật **"Track widget rebuilds"** để thấy widget nào dựng lại quá nhiều.

## Giảm rebuild — nguồn giật số 1

```dart
// ❌ cả màn hình rebuild khi count đổi
class Bad extends ConsumerWidget {
  Widget build(context, ref) {
    final count = ref.watch(counterProvider);
    return Column(children: [ExpensiveHeader(), Text('$count')]);
  }
}
```

- **Đặt `const`** cho widget không phụ thuộc state (`const ExpensiveHeader()`) → không dựng lại.
- **Tách widget con** để chỉ phần dùng state mới rebuild.
- **`watch` hẹp**: chỉ nghe đúng phần dữ liệu cần (`ref.watch(provider.select((s) => s.name))`)
  → không rebuild khi field khác đổi.
- Với `Consumer`, bọc **chỉ** phần nhỏ cần cập nhật thay vì cả widget.

## Danh sách & ảnh

- Luôn `ListView.builder`/`GridView.builder` cho danh sách dài (lazy) — đã học bài 4.
- Ảnh mạng: dùng `cached_network_image` để **cache**, tránh tải lại khi cuộn.
- **Resize ảnh** về đúng kích thước hiển thị (`cacheWidth`/`cacheHeight`) — đừng nạp ảnh
  4000px vào ô 100px (tốn RAM, decode chậm).
- `const` cho item tĩnh; tránh tạo closure/đối tượng nặng trong `itemBuilder`.

## Pipeline render: build → layout → paint

Flutter dựng UI qua 3 pha mỗi khung hình. Việc nặng đặt sai chỗ gây giật:

- **Không** tính toán nặng, gọi I/O, `jsonDecode` lớn trong `build`. Đưa ra `initState`/
  provider, hoặc `compute` (bài 11).
- Tránh `Opacity`/`Clip` diện rộng khi không cần — tốn paint. Ưu tiên `AnimatedOpacity`,
  `borderRadius` trên `BoxDecoration` thay vì `ClipRRect` khi có thể.
- `RepaintBoundary` cô lập vùng vẽ lại thường xuyên (vd animation) khỏi phần tĩnh.

## Kích thước app

```bash
flutter build apk --analyze-size        # xem thành phần nào nặng
flutter build apk --split-per-abi       # tách theo kiến trúc CPU → APK nhỏ hơn
```

- Ưu tiên **app bundle** (`.aab`) cho Google Play — Play tự tối ưu theo thiết bị.
- Bỏ asset/ font không dùng; Flutter **tree-shake icon** tự động khi build release.
- Kiểm tra dependency nặng không cần thiết (dùng `flutter pub deps`).

## Cạm bẫy hay gặp

- Đo ở **debug mode** rồi kết luận "chậm" — debug luôn chậm. Đo ở profile/release.
- `ref.watch` cả object lớn khi chỉ cần một field → rebuild thừa. Dùng `.select`.
- Nạp ảnh gốc quá lớn → OOM/giật. Resize + cache.
- Tối ưu sớm chỗ không phải bottleneck → luôn đo bằng DevTools trước.

## Ghi nhớ

Quy trình: **đo bằng DevTools ở profile mode → tìm jank (>16ms) → sửa đúng chỗ**. Ba đòn
bẩy lớn nhất: **giảm rebuild** (`const`, tách widget, `watch` hẹp/`select`), **danh sách/ảnh**
(builder + cache + resize), và **không để việc nặng trong `build`**. Đo trước, đừng đoán.
