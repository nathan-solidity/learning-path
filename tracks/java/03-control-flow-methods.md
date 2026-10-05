---
level: "beginner"
order: 3
title: "Điều kiện, vòng lặp & method"
est: "3-4 giờ"
checklist:
  - "Viết được if/else if và switch (cả statement lẫn switch expression mới)"
  - "Chọn đúng vòng lặp: for khi biết số lần, for-each khi duyệt collection, while khi chưa biết"
  - "Dùng break/continue đúng chỗ, tránh vòng lặp lồng khó đọc"
  - "Khai báo method có tham số, giá trị trả về, và overload đúng cách"
  - "Phân biệt method static và instance; dùng varargs khi cần số tham số linh hoạt"
related:
  - "skill:nta-refactor"
  - "skill:nta-code-review"
---

## Câu điều kiện

```java
int score = 75;

if (score >= 90) {
    System.out.println("A");
} else if (score >= 80) {
    System.out.println("B");
} else {
    System.out.println("C");
}
```

Điều kiện trong Java **phải là boolean** — không có chuyện `if (1)` như C. `if (list)` cũng
sai; phải viết `if (!list.isEmpty())`.

## switch — statement và expression

**switch statement** kiểu cũ (dễ quên `break` → "fall-through"):

```java
switch (day) {
    case 1: System.out.println("Thứ Hai"); break;   // quên break → chạy luôn case dưới!
    case 7: System.out.println("Chủ Nhật"); break;
    default: System.out.println("Ngày khác");
}
```

**switch expression** (Java 14+) — gọn, an toàn, **trả về giá trị**, không cần `break`:

```java
String name = switch (day) {
    case 1, 2, 3, 4, 5 -> "Ngày làm việc";   // nhiều case gộp bằng dấu phẩy
    case 6, 7          -> "Cuối tuần";
    default            -> "Không hợp lệ";
};
```

> **Nên dùng switch expression** (`->`) cho code mới: không fall-through, buộc xử lý đủ
> nhánh, và gán trực tiếp được vào biến. Với `enum`/`sealed` còn được kiểm tra thiếu nhánh.

## Vòng lặp

```java
// for cổ điển — khi cần index
for (int i = 0; i < 5; i++) {
    System.out.println(i);
}

// for-each — duyệt array/collection, KHÔNG cần index (ưu tiên)
int[] nums = {10, 20, 30};
for (int n : nums) {
    System.out.println(n);
}

// while — chưa biết trước số vòng
while (scanner.hasNext()) { ... }

// do-while — chạy ít nhất 1 lần rồi mới kiểm tra
do { ... } while (retry < 3);
```

`break` thoát vòng lặp, `continue` bỏ qua phần còn lại của vòng hiện tại:

```java
for (int n : nums) {
    if (n < 0) continue;    // bỏ qua số âm
    if (n > 100) break;     // gặp số > 100 thì dừng hẳn
    process(n);
}
```

| Tình huống | Dùng |
|-----------|------|
| Biết số lần lặp, cần index | `for` cổ điển |
| Duyệt collection/array, không cần index | `for-each` |
| Chưa biết số lần (đọc tới hết, retry) | `while` |
| Chắc chắn chạy ≥ 1 lần | `do-while` |

## Method — khai báo & trả về

```java
// [access] [static] kiểuTrảVề tênMethod(tham số)
public int add(int a, int b) {
    return a + b;
}

public void printGreeting(String name) {   // void = không trả về gì
    System.out.println("Xin chào " + name);
}
```

## Overload — cùng tên, khác tham số

Java cho phép nhiều method **cùng tên** nếu **danh sách tham số khác nhau** (số lượng hoặc
kiểu). Trình biên dịch chọn method đúng theo tham số bạn truyền.

```java
public int max(int a, int b)        { return a > b ? a : b; }
public double max(double a, double b) { return a > b ? a : b; }
public int max(int a, int b, int c) { return max(max(a, b), c); }

max(3, 5);        // gọi bản int
max(3.0, 5.0);    // gọi bản double
max(1, 2, 3);     // gọi bản 3 tham số
```

> Overload **chỉ dựa vào tham số**, KHÔNG dựa vào kiểu trả về. Hai method chỉ khác kiểu
> trả về → lỗi biên dịch.

## static vs instance

```java
public class Calculator {
    static int counter = 0;      // thuộc về CLASS, dùng chung

    int value;                   // thuộc về từng OBJECT

    static int square(int x) {   // gọi không cần tạo object
        return x * x;
    }
}

Calculator.square(5);            // gọi static qua tên class
Calculator c = new Calculator(); // instance method cần object
c.value = 10;
```

- **static** = thuộc về class, dùng chung mọi object. Dùng cho hàm tiện ích thuần túy
  (`Math.max`, `Integer.parseInt`).
- **instance** = thuộc về từng object, truy cập được field của object đó.

## varargs — số tham số linh hoạt

```java
public int sum(int... numbers) {   // int... = 0 hoặc nhiều int
    int total = 0;
    for (int n : numbers) total += n;
    return total;
}

sum();            // 0
sum(1, 2);        // 3
sum(1, 2, 3, 4);  // 10
```

varargs phải là **tham số cuối cùng**. Bên trong, `numbers` là một mảng.

## Cạm bẫy hay gặp

- **Quên `break`** trong switch statement kiểu cũ → fall-through chạy nhầm nhiều case. Dùng
  switch expression `->` để tránh.
- **`if (a = b)`** (một dấu `=`) — may là Java không cho gán trong `if` trừ boolean, nhưng
  `if (flag = true)` vẫn lọt. Nhớ `==` để so sánh.
- **Sửa collection trong for-each** → `ConcurrentModificationException`. Dùng `Iterator` hoặc
  `removeIf`.
- **Overload nhầm với override**: overload = cùng tên khác tham số (bài này); override = ghi
  đè method lớp cha (bài OOP).

## Ghi nhớ

Ưu tiên **switch expression** và **for-each** cho code hiện đại, dễ đọc và ít bug. Với
method: overload là "cùng tên, khác tham số"; `static` cho hàm tiện ích không cần state,
`instance` khi cần dữ liệu của object.
