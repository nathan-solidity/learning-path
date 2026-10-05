---
level: "beginner"
order: 5
title: "OOP nâng cao — interface, abstract, polymorphism"
est: "4-5 giờ"
checklist:
  - "Phân biệt abstract class và interface, chọn đúng cái cho từng tình huống"
  - "Dùng default & static method trong interface"
  - "Giải thích polymorphism, upcasting/downcasting và instanceof pattern matching"
  - "Override đúng equals() & hashCode() và hiểu vì sao phải đi cặp"
  - "Chọn đúng giữa enum, record, sealed class cho từng nhu cầu"
---

## Abstract class vs Interface

Cả hai định nghĩa "khuôn mẫu" cho lớp con, nhưng khác mục đích:

```java
// Abstract class — "là một loại" + có thể chứa state & code chung
public abstract class Shape {
    protected String color;              // có field/state
    public Shape(String color) { this.color = color; }

    public abstract double area();       // method trừu tượng — con PHẢI cài
    public String describe() {           // method có sẵn — con dùng chung
        return "Hình " + color + " diện tích " + area();
    }
}

// Interface — "có khả năng" — hợp đồng hành vi
public interface Drawable {
    void draw();                         // mặc định public abstract
}
```

```java
public class Circle extends Shape implements Drawable {
    private double radius;
    public Circle(String color, double radius) {
        super(color);
        this.radius = radius;
    }
    @Override public double area() { return Math.PI * radius * radius; }
    @Override public void draw() { System.out.println("Vẽ hình tròn"); }
}
```

| | Abstract class | Interface |
|---|---|---|
| Ý nghĩa | "is-a" (là một loại) | "can-do" (có khả năng) |
| Kế thừa | Chỉ 1 (`extends`) | Nhiều (`implements A, B, C`) |
| Field/state | Có | Không (chỉ hằng số) |
| Constructor | Có | Không |
| Khi nào | Có code/state dùng chung | Chỉ định nghĩa hợp đồng |

> **Quy tắc chọn**: cần chia sẻ **state + code** giữa các lớp liên quan chặt → abstract
> class. Chỉ định nghĩa **khả năng** mà nhiều lớp không liên quan có thể có → interface.
> Vì Java chỉ cho kế thừa 1 class nhưng nhiều interface, interface linh hoạt hơn.

## default & static method trong interface

Từ Java 8, interface có thể có method **có sẵn thân hàm**:

```java
public interface Logger {
    void log(String msg);

    default void logError(String msg) {   // lớp cài KHÔNG bắt buộc override
        log("[ERROR] " + msg);
    }

    static Logger console() {             // hàm tiện ích gắn với interface
        return System.out::println;
    }
}
```

`default` giúp thêm method mới vào interface **mà không phá vỡ** các lớp đã cài trước đó.

## Polymorphism — đa hình

Cùng một lời gọi, chạy cài đặt khác nhau tùy object thực sự là gì:

```java
List<Shape> shapes = List.of(
    new Circle("đỏ", 2),
    new Rectangle("xanh", 3, 4)
);

for (Shape s : shapes) {
    System.out.println(s.area());   // gọi đúng area() của từng loại
}
```

**Upcasting** (con → cha) tự động; **downcasting** (cha → con) phải ép và nên kiểm tra:

```java
Shape s = new Circle("đỏ", 2);      // upcasting — tự động

// instanceof pattern matching (Java 16+) — kiểm tra & ép trong 1 bước
if (s instanceof Circle c) {         // nếu đúng, tự tạo biến c kiểu Circle
    System.out.println(c.area());
}
```

> Cách cũ phải viết `if (s instanceof Circle) { Circle c = (Circle) s; ... }`. Pattern
> matching gộp lại, gọn và an toàn hơn.

## equals() & hashCode() — phải đi cặp

Mặc định `equals()` so sánh **tham chiếu** (như `==`). Muốn so sánh theo **giá trị**, phải
override — và **luôn override cả hai cùng lúc**.

```java
public class Point {
    private final int x, y;
    // constructor...

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Point p)) return false;
        return x == p.x && y == p.y;
    }

    @Override
    public int hashCode() {
        return Objects.hash(x, y);
    }
}
```

> **Vì sao phải đi cặp?** `HashMap`/`HashSet` dùng `hashCode()` để tìm nhóm, rồi `equals()`
> để so trong nhóm. Nếu override `equals` mà quên `hashCode`, hai object "bằng nhau" lại rơi
> vào 2 nhóm khác nhau → `Set` chứa trùng, `Map` không tìm thấy key. Bug âm thầm rất khó
> chịu.

`Comparable` (thứ tự tự nhiên) và `Comparator` (thứ tự tùy biến) cho việc sắp xếp:

```java
list.sort(Comparator.comparing(User::getAge).thenComparing(User::getName));
```

## enum, record, sealed — chọn cái nào

```java
// enum — tập giá trị cố định, hữu hạn
public enum Status { PENDING, ACTIVE, CLOSED }

// record (Java 16+) — data class bất biến, tự sinh constructor/getter/equals/hashCode/toString
public record Point(int x, int y) { }
Point p = new Point(1, 2);
p.x();   // getter tự sinh (không phải getX())

// sealed (Java 17+) — giới hạn CHÍNH XÁC những class được kế thừa
public sealed interface Shape permits Circle, Rectangle { }
```

| Dùng | Khi nào |
|------|---------|
| `enum` | Tập giá trị cố định (trạng thái, loại, ngày trong tuần) |
| `record` | Chứa dữ liệu bất biến (DTO, value object) — bớt boilerplate |
| `sealed` | Muốn kiểm soát đúng những lớp con được phép (switch bắt đủ nhánh) |

## Cạm bẫy hay gặp

- **Override `equals` quên `hashCode`** → hỏng `HashMap`/`HashSet`. Luôn đi cặp (IDE sinh
  giúp cả hai).
- **Downcasting không kiểm tra** → `ClassCastException`. Dùng `instanceof` pattern matching.
- **Interface chỉ để "gom hằng số"** → anti-pattern; dùng `enum` hoặc class hằng.
- **Dùng abstract class khi chỉ cần hợp đồng** → mất khả năng đa kế thừa; ưu tiên interface.
- **Tạo record rồi cố sửa field** → record bất biến, không có setter.

## Ghi nhớ

Interface = "có khả năng gì" (nhiều, linh hoạt); abstract class = "là loại gì" (có state/code
chung). Nhớ **equals + hashCode luôn đi cặp**. Với dữ liệu hiện đại: `enum` cho tập cố định,
`record` cho DTO bất biến, `sealed` khi cần kiểm soát lớp con.
