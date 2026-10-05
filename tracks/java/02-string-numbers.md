---
level: "beginner"
order: 2
title: "String, số & toán tử"
est: "3-4 giờ"
checklist:
  - "Giải thích được vì sao String immutable và khi nào cần StringBuilder"
  - "So sánh chuỗi đúng cách bằng `.equals()` / `.equalsIgnoreCase()`, không dùng `==`"
  - "Dùng được text block (\"\"\"...\"\"\") cho chuỗi nhiều dòng"
  - "Format chuỗi bằng `String.format` / `formatted` thay vì nối chuỗi lộn xộn"
  - "Hiểu ép kiểu số (casting) và tránh mất dữ liệu khi thu hẹp kiểu"
related:
  - "skill:nta-code-review"
  - "skill:nta-refactor"
---

## String là immutable

Trong Java, `String` **không thể thay đổi** sau khi tạo (immutable). Mọi thao tác "sửa"
chuỗi thực ra tạo một object String **mới**.

```java
String s = "Hello";
s.concat(" World");        // tạo chuỗi mới, KHÔNG gán lại
System.out.println(s);     // vẫn "Hello" — s không đổi

s = s.concat(" World");    // phải gán lại mới có tác dụng
System.out.println(s);     // "Hello World"
```

Lợi ích của immutable: an toàn khi share giữa nhiều thread, dùng làm key trong Map an toàn.
Cái giá: nối chuỗi trong vòng lặp tạo **rất nhiều object rác**.

## StringBuilder — khi nối chuỗi nhiều lần

```java
// ❌ CHẬM: mỗi vòng tạo 1 String mới (O(n²) bộ nhớ)
String result = "";
for (int i = 0; i < 1000; i++) {
    result += i + ",";
}

// ✅ NHANH: StringBuilder sửa tại chỗ (mutable)
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 1000; i++) {
    sb.append(i).append(",");
}
String result = sb.toString();
```

> **Quy tắc**: nối chuỗi vài lần cố định → dùng `+` cho dễ đọc. Nối trong **vòng lặp** hoặc
> nhiều bước động → dùng `StringBuilder`.

## So sánh chuỗi — luôn dùng `.equals()`

```java
String a = "hello";
String b = new String("hello");

a == b            // false! (2 object khác nhau trong bộ nhớ)
a.equals(b)       // true  (so sánh NỘI DUNG) ✅
a.equalsIgnoreCase("HELLO")   // true (bỏ qua hoa/thường)
```

> **Cạm bẫy hàng đầu của người mới**: dùng `==` so chuỗi. Đôi khi "may mắn" đúng vì Java
> gom các literal `"hello"` vào chung một chỗ (string pool), nhưng chuỗi từ input/DB/`new`
> sẽ sai. **Luôn `.equals()`**.
>
> Mẹo tránh NPE: so với literal đặt trước — `"admin".equals(role)` an toàn kể cả khi
> `role` là `null`.

## Text block — chuỗi nhiều dòng (Java 15+)

```java
// Cũ: escape \n và " rất rối
String json = "{\n  \"name\": \"Nhân\",\n  \"age\": 30\n}";

// Mới: text block """ ... """
String json = """
        {
          "name": "Nhân",
          "age": 30
        }
        """;
```

Rất tiện cho JSON, SQL, HTML nhúng trong code. Thụt lề được canh theo dòng `"""` đóng.

## Format chuỗi

```java
String name = "Nhân";
int age = 30;

// String.format hoặc .formatted (Java 15+, gọn hơn)
String msg1 = String.format("%s năm nay %d tuổi", name, age);
String msg2 = "%s năm nay %d tuổi".formatted(name, age);   // giống hệt

// Các placeholder hay dùng:
//  %s chuỗi   %d số nguyên   %f số thực   %.2f 2 chữ số thập phân   %n xuống dòng
String price = "Giá: %,.2f đ".formatted(1234567.5);   // "Giá: 1,234,567.50 đ"
```

## Toán tử & ép kiểu số

```java
int a = 7, b = 2;
System.out.println(a / b);      // 3  (chia nguyên — bỏ phần lẻ!)
System.out.println(a % b);      // 1  (chia lấy dư)
System.out.println((double) a / b);  // 3.5 (ép 1 vế sang double trước)
```

**Ép kiểu (casting)** giữa các kiểu số:

```java
// Mở rộng (widening) — tự động, an toàn
int i = 100;
long l = i;        // int → long OK
double d = i;      // int → double OK

// Thu hẹp (narrowing) — phải ép tay, CÓ THỂ mất dữ liệu
double price = 19.99;
int rounded = (int) price;   // 19 (cắt phần thập phân, không làm tròn!)

long big = 10_000_000_000L;
int overflow = (int) big;    // tràn → số sai
```

> **Cạm bẫy**: `(int) 19.99` ra `19` (cắt cụt), KHÔNG phải `20`. Muốn làm tròn dùng
> `Math.round(19.99)` → `20`.

## Cạm bẫy hay gặp

- **`==` so chuỗi** → dùng `.equals()`. Đây là lỗi số 1 của người mới học Java.
- **Chia số nguyên** `5/2 == 2` mất phần lẻ → ép `(double)` một vế nếu cần số thực.
- **`(int)` số thực cắt cụt** chứ không làm tròn → dùng `Math.round()`.
- **Nối chuỗi trong vòng lặp bằng `+`** → chậm, dùng `StringBuilder`.
- **`str.charAt(str.length())`** → lỗi index (index cuối là `length()-1`).

## Ghi nhớ

String immutable là nền tảng: hiểu nó bạn biết vì sao cần `StringBuilder` và vì sao
`.equals()` chứ không `==`. Với số, nhớ Java **chia nguyên mặc định** và **ép kiểu thu hẹp
làm mất dữ liệu** — hai chỗ hay ra bug âm thầm nhất.
