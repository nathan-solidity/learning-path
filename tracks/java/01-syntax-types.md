---
level: "beginner"
order: 1
title: "Cú pháp cơ bản & kiểu dữ liệu"
est: "4-5 giờ"
checklist:
  - "Viết được một class có `main`, biên dịch bằng `javac` và chạy bằng `java`"
  - "Phân biệt kiểu nguyên thủy (int, double, boolean...) và wrapper class (Integer, Double)"
  - "Giải thích được autoboxing/unboxing và cạm bẫy so sánh Integer bằng `==`"
  - "Dùng `var` đúng chỗ (biến local) và biết khi nào KHÔNG nên dùng"
  - "Chọn đúng kiểu số theo nhu cầu: int/long cho số nguyên, BigDecimal cho tiền"
related:
  - "skill:nta-code-review"
  - "skill:nta-refactor"
---

## Cấu trúc một file Java

Java là ngôn ngữ **biên dịch** và **tĩnh kiểu (static typing)** — khai báo kiểu rõ ràng,
trình biên dịch bắt lỗi trước khi chạy. Mọi code phải nằm trong một `class`.

```java
// File: Hello.java  — tên file PHẢI trùng tên class public
public class Hello {
    // main là điểm bắt đầu chương trình
    public static void main(String[] args) {
        System.out.println("Xin chào Java");
    }
}
```

```bash
javac Hello.java     # biên dịch → tạo Hello.class (bytecode)
java Hello           # JVM chạy bytecode → in ra: Xin chào Java
```

> **Quy tắc bắt buộc**: file chứa class `public` phải đặt **đúng tên class** (`Hello.java`
> cho `class Hello`). Sai tên → lỗi biên dịch ngay. Từ Java 11, file 1 class chạy nhanh
> được bằng `java Hello.java` (không cần `javac` riêng).

## Kiểu nguyên thủy (primitive)

Java có 8 kiểu primitive — lưu **giá trị trực tiếp**, không phải object:

| Kiểu | Kích thước | Ví dụ | Dùng cho |
|------|-----------|-------|----------|
| `int` | 32-bit | `42` | Số nguyên thông dụng |
| `long` | 64-bit | `42L` | Số nguyên lớn (id, timestamp) |
| `double` | 64-bit | `3.14` | Số thực thông dụng |
| `float` | 32-bit | `3.14f` | Số thực ít dùng (độ chính xác thấp) |
| `boolean` | — | `true`/`false` | Đúng/sai |
| `char` | 16-bit | `'A'` | Một ký tự |
| `byte`, `short` | 8/16-bit | `1` | Hiếm dùng, tiết kiệm bộ nhớ |

```java
int age = 30;
long userId = 10_000_000_000L;   // dấu _ cho dễ đọc; hậu tố L bắt buộc
double price = 19.99;
boolean active = true;
char grade = 'A';
```

## Wrapper class & autoboxing

Mỗi primitive có một **wrapper class** tương ứng là object: `int → Integer`,
`double → Double`, `boolean → Boolean`... Cần wrapper khi làm việc với Collections
(`List<Integer>`, không có `List<int>`) hoặc khi giá trị có thể `null`.

```java
int a = 5;
Integer b = a;        // autoboxing: int → Integer (tự động)
int c = b;            // unboxing: Integer → int (tự động)

List<Integer> nums = new ArrayList<>();
nums.add(10);         // autoboxing khi thêm vào List
```

> **Cạm bẫy kinh điển — so sánh Integer bằng `==`:**
> ```java
> Integer x = 1000, y = 1000;
> System.out.println(x == y);        // false! (so sánh địa chỉ object)
> System.out.println(x.equals(y));   // true  (so sánh giá trị)
> ```
> Với object (kể cả wrapper), `==` so sánh **tham chiếu**, không phải giá trị. Luôn dùng
> `.equals()` cho wrapper và String. (Java cache Integer -128..127 nên số nhỏ lại "may mắn"
> đúng — càng dễ nhầm.)

Một cạm bẫy nữa: unbox một `Integer` đang `null` → **NullPointerException**.

```java
Integer count = null;
int n = count;   // 💥 NPE khi unboxing null
```

## `var` — suy luận kiểu (Java 10+)

`var` cho phép bỏ khai báo kiểu tường minh với **biến local**; trình biên dịch tự suy ra.

```java
var name = "Nhân";                    // String
var users = new ArrayList<String>();  // ArrayList<String>
var total = 0;                        // int

// KHÔNG dùng được:
// var x;              // thiếu giá trị khởi tạo → không suy được kiểu
// var y = null;       // null không có kiểu
```

Dùng `var` khi kiểu **đã rõ từ vế phải** (như `new ...`). Tránh khi làm mất thông tin:
`var result = service.process();` — người đọc không biết `result` kiểu gì.

## Độ chính xác số — đừng dùng double cho tiền

`double`/`float` là số dấu phẩy động nhị phân — **không biểu diễn chính xác** số thập phân.

```java
System.out.println(0.1 + 0.2);   // => 0.30000000000000004  😱
```

Với **tiền tệ / tính toán tài chính**, dùng `BigDecimal`:

```java
import java.math.BigDecimal;

BigDecimal a = new BigDecimal("0.1");   // dùng String, KHÔNG new BigDecimal(0.1)
BigDecimal b = new BigDecimal("0.2");
System.out.println(a.add(b));           // => 0.3  ✅
```

| Nhu cầu | Kiểu nên dùng |
|---------|--------------|
| Đếm, index, id | `int` / `long` |
| Số thực tính khoa học, tỉ lệ | `double` |
| **Tiền, giá, tính toán tài chính** | `BigDecimal` (khởi tạo bằng String) |

## Cạm bẫy hay gặp

- **`==` với object** so sánh tham chiếu, không so giá trị → dùng `.equals()`.
- **Unbox `null`** (Integer/Long/Boolean null gán vào primitive) → NPE.
- **`double` cho tiền** → sai số tích lũy. Dùng `BigDecimal`.
- **Chia số nguyên**: `5 / 2 == 2` (không phải 2.5). Muốn thực: `5.0 / 2`.
- **`int` tràn số**: `Integer.MAX_VALUE + 1` quay về số âm. Dùng `long` khi có thể lớn.

## Ghi nhớ

Java bắt bạn khai báo kiểu rõ ràng — đó là điểm mạnh: lỗi kiểu bị bắt lúc biên dịch, không
phải lúc chạy. Nhớ 2 điều dễ vấp nhất khi mới học: **`.equals()` chứ không `==`** cho
object, và **`BigDecimal` chứ không `double`** cho tiền.
