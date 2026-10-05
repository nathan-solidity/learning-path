---
level: "beginner"
order: 4
title: "Layout — Row, Column, Flex & danh sách"
est: "5-6 giờ"
checklist:
  - "Dựng bố cục bằng `Row`/`Column` và căn chỉnh bằng main/cross axis alignment"
  - "Dùng `Expanded`/`Flexible` để chia không gian và tránh tràn (overflow)"
  - "Dùng `Stack`/`Positioned` để xếp chồng widget"
  - "Hiển thị danh sách dài hiệu quả bằng `ListView.builder`"
  - "Đọc hiểu lỗi 'RenderFlex overflowed' và cách xử lý"
related:
  - "skill:nta-code-review"
---

## Row & Column — trục chính và trục phụ

`Row` xếp con **theo hàng ngang**, `Column` **theo cột dọc**. Mỗi cái có:

- **`mainAxisAlignment`**: căn theo trục chính (Row = ngang, Column = dọc).
- **`crossAxisAlignment`**: căn theo trục vuông góc.

```dart
Column(
  mainAxisAlignment: MainAxisAlignment.center,      // căn giữa theo chiều dọc
  crossAxisAlignment: CrossAxisAlignment.start,     // căn trái theo chiều ngang
  children: const [
    Text('Dòng 1'),
    SizedBox(height: 8),          // khoảng cách giữa 2 widget
    Text('Dòng 2'),
  ],
)
```

| MainAxisAlignment | Ý nghĩa |
|-------------------|---------|
| `start` / `end` / `center` | Dồn đầu / cuối / giữa |
| `spaceBetween` | Cách đều, không đệm 2 mép |
| `spaceAround` / `spaceEvenly` | Cách đều có đệm mép |

## Expanded & Flexible — chia không gian

`Expanded` cho con **chiếm hết phần còn lại**; nhiều `Expanded` chia theo tỉ lệ `flex`.

```dart
Row(
  children: [
    Expanded(flex: 2, child: Container(color: Colors.red)),    // 2 phần
    Expanded(flex: 1, child: Container(color: Colors.blue)),   // 1 phần
  ],
)
```

> **Lỗi kinh điển — RenderFlex overflowed** (sọc vàng-đen): nội dung rộng/cao hơn không gian.
> Thường gặp khi `Text` dài trong `Row`. Cách xử lý:
> - Bọc `Text` trong `Expanded` để nó tự xuống dòng.
> - Dùng `Flexible` (co được, không bắt buộc chiếm hết như `Expanded`).
> - Với nội dung có thể dài hơn màn hình → dùng `SingleChildScrollView` hoặc `ListView`.

## Stack — xếp chồng

```dart
Stack(
  children: [
    Image.network('...'),                    // lớp dưới
    Positioned(                              // đặt vị trí tuyệt đối
      bottom: 8, right: 8,
      child: Container(color: Colors.black54, child: const Text('HD')),
    ),
  ],
)
```

## Danh sách — luôn dùng `ListView.builder` cho list dài

`ListView(children: [...])` dựng **tất cả** phần tử ngay lập tức → nặng nếu danh sách dài.
`ListView.builder` **chỉ dựng phần tử đang hiển thị** (lazy) → mượt với hàng nghìn item.

```dart
ListView.builder(
  itemCount: users.length,
  itemBuilder: (context, index) {
    final u = users[index];
    return ListTile(
      leading: const Icon(Icons.person),
      title: Text(u.name),
      subtitle: Text(u.email),
      onTap: () { /* mở chi tiết */ },
    );
  },
)
```

`GridView.builder` tương tự cho lưới. `ListTile` là widget dựng sẵn cho một dòng danh sách
(icon + tiêu đề + phụ đề + hành động).

## Widget bố cục hay dùng

| Widget | Dùng để |
|--------|---------|
| `Padding` | Thêm đệm quanh child |
| `SizedBox` | Khoảng trống cố định / ép kích thước |
| `Center` / `Align` | Căn child |
| `SingleChildScrollView` | Cho phép cuộn nội dung dài |
| `Wrap` | Như Row nhưng tự xuống dòng khi hết chỗ (vd chip tag) |
| `SafeArea` | Tránh tai thỏ / thanh trạng thái |

## Cạm bẫy hay gặp

- Đặt `Column` chứa nội dung dài mà không cuộn → overflow. Bọc `Expanded` + `ListView`.
- Đặt `ListView` trong `Column` mà không bọc `Expanded` → lỗi "unbounded height".
- Dùng `ListView(children: [...])` cho danh sách rất dài → tốn bộ nhớ; dùng `.builder`.

## Ghi nhớ

Layout Flutter xoay quanh **Row/Column + main/cross axis alignment**, và **Expanded/Flexible**
để chia không gian. Khi thấy sọc vàng-đen "overflowed", nghĩ ngay tới `Expanded`, `Flexible`,
hoặc cho cuộn. Với danh sách, mặc định dùng **`ListView.builder`**.
