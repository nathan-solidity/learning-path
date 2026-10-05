---
level: "beginner"
order: 4
title: "OOP nền tảng — class, đóng gói, kế thừa"
est: "4-5 giờ"
checklist:
  - "Khai báo được class có field, constructor, và dùng `this` đúng chỗ"
  - "Áp dụng encapsulation: field private + getter/setter, hiểu vì sao không để field public"
  - "Giải thích 4 access modifier: private, (package), protected, public"
  - "Dùng inheritance với extends/super/override và từ khóa final đúng lúc"
  - "Nhận ra khi nào nên kế thừa và khi nào nên dùng composition thay thế"
related:
  - "skill:nta-code-review"
  - "skill:nta-refactor"
---

## Class & object

**Class** là bản thiết kế; **object** là thực thể tạo từ bản thiết kế đó.

```java
public class User {
    // field — trạng thái của object
    private String name;
    private int age;

    // constructor — khởi tạo object
    public User(String name, int age) {
        this.name = name;   // this.name = field, name = tham số
        this.age = age;
    }

    // method — hành vi
    public String greet() {
        return "Xin chào, tôi là " + name;
    }
}

// Tạo object bằng new
User u = new User("Nhân", 30);
System.out.println(u.greet());
```

`this` trỏ tới **object hiện tại**, dùng để phân biệt field với tham số cùng tên.

## Encapsulation — đóng gói

Nguyên tắc: **giấu field** (private), chỉ cho truy cập qua method. Giúp kiểm soát dữ liệu
và đổi cài đặt bên trong mà không ảnh hưởng code ngoài.

```java
public class BankAccount {
    private double balance;   // KHÔNG ai sửa trực tiếp được

    public double getBalance() {
        return balance;
    }

    public void deposit(double amount) {
        if (amount <= 0) throw new IllegalArgumentException("Số tiền phải > 0");
        balance += amount;    // kiểm soát được điều kiện
    }
}
```

> **Vì sao không để field public?** Nếu `balance` public, bất kỳ đâu cũng gán
> `account.balance = -999` được, phá vỡ quy tắc nghiệp vụ. Encapsulation buộc mọi thay đổi
> đi qua method có kiểm tra.

## Access modifier — 4 mức

| Modifier | Cùng class | Cùng package | Class con | Mọi nơi |
|----------|:---------:|:------------:|:---------:|:-------:|
| `private` | ✅ | ❌ | ❌ | ❌ |
| *(không ghi)* — package-private | ✅ | ✅ | ❌ | ❌ |
| `protected` | ✅ | ✅ | ✅ | ❌ |
| `public` | ✅ | ✅ | ✅ | ✅ |

Quy tắc thực tế: **field để `private`**, method public nếu là API dùng bên ngoài, còn lại
để mức hẹp nhất có thể.

## Inheritance — kế thừa

Class con `extends` class cha để **tái dùng** và **mở rộng**.

```java
public class Animal {
    protected String name;

    public Animal(String name) { this.name = name; }

    public String sound() { return "..."; }
}

public class Dog extends Animal {
    public Dog(String name) {
        super(name);          // gọi constructor lớp cha — PHẢI ở dòng đầu
    }

    @Override                 // annotation báo "ghi đè method cha"
    public String sound() {
        return "Gâu gâu";
    }
}

Animal a = new Dog("Mực");
System.out.println(a.sound());   // "Gâu gâu" — chạy bản của Dog
```

- `super(...)` gọi constructor lớp cha; `super.method()` gọi method lớp cha.
- `@Override` không bắt buộc nhưng **nên luôn ghi** — biên dịch báo lỗi nếu bạn viết sai
  tên/tham số (tưởng override mà thành overload).

## final — chặn thay đổi

```java
final int MAX = 100;          // hằng số — không gán lại được
final class Utils { }         // class không cho kế thừa (vd String)
public final void run() { }   // method không cho override
```

## Kế thừa hay composition?

Kế thừa dễ bị lạm dụng. Câu hỏi: quan hệ là **"is-a"** hay **"has-a"**?

```java
// ✅ is-a: Dog LÀ Animal → kế thừa hợp lý
class Dog extends Animal { }

// ❌ has-a: Car KHÔNG "là" Engine → đừng kế thừa
class Car extends Engine { }        // sai tư duy
// ✅ đúng: Car CÓ Engine → composition
class Car {
    private Engine engine;          // chứa Engine như một field
}
```

> **Nguyên tắc**: "Ưu tiên composition hơn inheritance." Kế thừa tạo ràng buộc chặt với
> lớp cha; đổi lớp cha dễ vỡ lớp con. Composition linh hoạt hơn — bài OOP nâng cao sẽ dùng
> interface để làm điều này sạch hơn.

## Cạm bẫy hay gặp

- **Field public** phá encapsulation → luôn `private` + getter/setter khi cần.
- **Quên `super(...)`** khi lớp cha không có constructor mặc định → lỗi biên dịch.
- **Không ghi `@Override`** → viết sai chữ ký thành overload, method cha vẫn chạy, bug khó
  tìm.
- **Kế thừa sâu nhiều tầng** (A→B→C→D) → khó bảo trì. Giữ cây kế thừa nông.
- **Lạm dụng kế thừa** cho quan hệ "has-a" → dùng composition.

## Ghi nhớ

OOP nền tảng gói trong 3 chữ: **đóng gói** (field private, kiểm soát qua method), **kế thừa**
(extends + super + @Override cho quan hệ is-a), và biết **khi nào KHÔNG kế thừa** (dùng
composition cho has-a). Luôn ghi `@Override` để trình biên dịch bắt lỗi giúp bạn.
