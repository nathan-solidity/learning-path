---
level: "beginner"
order: 8
title: "Lambda, Stream API, Date/Time & JSON"
est: "5-6 giờ"
checklist:
  - "Viết được lambda và dùng 4 functional interface: Function, Supplier, Consumer, Predicate"
  - "Xử lý collection bằng Stream: map, filter, collect, groupingBy, reduce"
  - "Dùng flatMap khi có cấu trúc lồng nhau (list of list)"
  - "Làm việc với LocalDate/LocalDateTime/Duration, tránh Date cũ"
  - "Serialize/deserialize JSON bằng Jackson ObjectMapper với annotation cơ bản"
related:
  - "skill:nta-code-review"
  - "skill:nta-refactor"
---

## Lambda & functional interface

**Lambda** là hàm ẩn danh viết gọn. Nó cài đặt một **functional interface** (interface có
đúng 1 method trừu tượng).

```java
// Cũ: anonymous class dài dòng
Runnable r1 = new Runnable() {
    public void run() { System.out.println("chạy"); }
};

// Lambda: gọn
Runnable r2 = () -> System.out.println("chạy");
```

4 functional interface hay dùng nhất (`java.util.function`):

| Interface | Method | Ý nghĩa | Ví dụ lambda |
|-----------|--------|---------|--------------|
| `Function<T,R>` | `R apply(T)` | Nhận T, trả R | `x -> x * 2` |
| `Supplier<T>` | `T get()` | Không nhận, trả T | `() -> new User()` |
| `Consumer<T>` | `void accept(T)` | Nhận T, không trả | `x -> System.out.println(x)` |
| `Predicate<T>` | `boolean test(T)` | Nhận T, trả boolean | `x -> x > 0` |

**Method reference** — lambda chỉ gọi 1 method, viết ngắn hơn:

```java
list.forEach(x -> System.out.println(x));   // lambda
list.forEach(System.out::println);          // method reference — giống hệt
names.stream().map(String::toUpperCase);    // s -> s.toUpperCase()
```

## Stream API — xử lý dữ liệu khai báo

Stream cho phép xử lý collection theo kiểu "dây chuyền" (pipeline), thay for lồng nhau:

```java
List<User> users = ...;

// Lấy tên user trên 18 tuổi, viết hoa, sắp xếp
List<String> result = users.stream()
    .filter(u -> u.getAge() >= 18)        // lọc
    .map(User::getName)                    // biến đổi User → String
    .map(String::toUpperCase)
    .sorted()
    .collect(Collectors.toList());         // gom lại thành List
```

Các thao tác cốt lõi:

```java
// filter — lọc theo điều kiện
stream.filter(n -> n % 2 == 0)

// map — biến đổi từng phần tử
stream.map(u -> u.getEmail())

// collect — gom kết quả
.collect(Collectors.toList())
.collect(Collectors.toSet())

// count / anyMatch / allMatch
long n = users.stream().filter(u -> u.isActive()).count();
boolean hasAdmin = users.stream().anyMatch(u -> u.isAdmin());
```

**groupingBy** — gom nhóm (rất hay dùng):

```java
// Gom user theo thành phố → Map<String, List<User>>
Map<String, List<User>> byCity = users.stream()
    .collect(Collectors.groupingBy(User::getCity));

// Đếm số user mỗi thành phố → Map<String, Long>
Map<String, Long> countByCity = users.stream()
    .collect(Collectors.groupingBy(User::getCity, Collectors.counting()));
```

**reduce** — gộp về 1 giá trị:

```java
int total = orders.stream()
    .map(Order::getAmount)
    .reduce(0, Integer::sum);        // cộng dồn từ 0
```

**flatMap** — làm phẳng cấu trúc lồng nhau:

```java
List<List<String>> nested = List.of(
    List.of("a", "b"), List.of("c", "d")
);
List<String> flat = nested.stream()
    .flatMap(List::stream)           // gộp các list con thành 1 stream
    .collect(Collectors.toList());   // [a, b, c, d]
```

> **Cạm bẫy**: Stream **dùng một lần** — đã `collect`/`forEach` thì không tái sử dụng được.
> Và đừng lạm dụng Stream cho vòng lặp đơn giản có side-effect — for-each thường rõ hơn.

## Date & Time API (java.time)

Dùng `java.time` (Java 8+), **quên `java.util.Date`/`Calendar` cũ** (rối và không
thread-safe).

```java
import java.time.*;

LocalDate today = LocalDate.now();                  // 2026-08-18 (chỉ ngày)
LocalDateTime now = LocalDateTime.now();            // ngày + giờ
LocalDate birth = LocalDate.of(1995, 3, 15);

// Tính toán — immutable, trả object mới
LocalDate nextWeek = today.plusWeeks(1);
long age = ChronoUnit.YEARS.between(birth, today);

// Khoảng thời gian
Duration d = Duration.ofHours(2).plusMinutes(30);

// Có múi giờ khi cần
ZonedDateTime vn = ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
```

## JSON với Jackson

Jackson (`ObjectMapper`) là thư viện JSON mặc định trong Spring Boot.

```java
import com.fasterxml.jackson.databind.ObjectMapper;

ObjectMapper mapper = new ObjectMapper();

// Object → JSON (serialize)
User user = new User("Nhân", 30);
String json = mapper.writeValueAsString(user);   // {"name":"Nhân","age":30}

// JSON → Object (deserialize)
User back = mapper.readValue(json, User.class);
```

Annotation hay dùng:

```java
public class UserDto {
    @JsonProperty("full_name")      // đổi tên field trong JSON
    private String name;

    @JsonIgnore                     // bỏ qua field này khi serialize
    private String password;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate birthDate;
}
```

> Với `java.time`, Spring Boot tự cấu hình Jackson đọc/ghi đúng. Ngoài Spring, cần đăng ký
> `mapper.registerModule(new JavaTimeModule())`.

## Cạm bẫy hay gặp

- **Tái dùng Stream đã tiêu thụ** → `IllegalStateException`. Mỗi stream dùng 1 lần.
- **Lạm dụng Stream** cho logic đơn giản/có side-effect → for-each dễ đọc hơn.
- **Dùng `Date`/`Calendar` cũ** → chuyển sang `java.time`.
- **`ObjectMapper` tạo mới mỗi request** → nặng; tái dùng 1 instance (Spring inject sẵn).
- **Field không có getter** → Jackson mặc định không serialize được (hoặc cần cấu hình).

## Ghi nhớ

Lambda + Stream biến vòng lặp thành pipeline khai báo: `filter → map → collect`. Nhớ
`groupingBy` cho gom nhóm và `flatMap` cho cấu trúc lồng. Ngày giờ dùng `java.time`, JSON
dùng Jackson `ObjectMapper` — cả hai được Spring Boot tích hợp sẵn ở bài sau.
