---
track: "java"
role: "dev-java"
group: "dev"
group_title: "Developer"
group_icon: "💻"
group_summary: "Lộ trình cho lập trình viên — chọn ngôn ngữ/framework bạn muốn học chuyên sâu."
variant: "Java / Spring Boot"
variant_desc: "Từ Java core đến Spring Boot developer thực chiến: ngôn ngữ, OOP, Collections/Stream, REST API với Spring, JPA & Security, tới kiến trúc, message queue, JVM và vận hành."
title: "Java / Spring Boot Developer"
icon: "☕"
summary: "Lộ trình từ Java core đến Spring Boot developer thực chiến: cú pháp & OOP, Collections/Stream/Exception, REST API với Spring Boot, JPA & Security nâng cao, tới kiến trúc hệ thống, Kafka/queue, JVM tuning và DevOps."
levels:
  - key: "beginner"
    title: "Beginner"
    desc: "Java core (cú pháp, OOP, Collections/Stream/Exception/IO) và Spring Boot cơ bản (REST API, JPA, validation, test) — đủ để tự làm một API nhỏ hoàn chỉnh."
  - key: "intermediate"
    title: "Intermediate"
    desc: "JPA/Hibernate nâng cao (N+1, transaction, lock, cache), Spring Security (JWT, OAuth2, OWASP), thiết kế & chất lượng code, và xử lý bất đồng bộ (thread, CompletableFuture, @Async, @Scheduled)."
  - key: "advanced"
    title: "Advanced"
    desc: "Kiến trúc hệ thống (Clean/Hexagonal, DDD, microservices), message queue & event-driven (Kafka, outbox, saga), hạ tầng (gateway, resilience, tracing), hiệu năng & JVM, và DevOps/vận hành."
---

## Về lộ trình này

Lộ trình dành cho người học **Java + Spring Boot** từ nền tảng ngôn ngữ đến làm được ứng
dụng production và tham gia hệ thống lớn. Thiết kế theo hướng **học đến đâu code được đến
đó**: mỗi cấp độ đều có bài thực hành/dự án nhỏ, không chỉ đọc lý thuyết.

Học tuần tự **Beginner → Intermediate → Advanced**. Mỗi bài có checklist tự đánh giá —
tick khi bạn tự tin đã nắm và **code được**, không chỉ hiểu lý thuyết. Tiến độ tính theo
số item đã tick.

### Vì sao học theo thứ tự này

Spring Boot "ẩn" rất nhiều thứ theo auto-configuration và annotation. Nếu nhảy thẳng vào
Spring mà chưa chắc Java core (OOP, Collections, Generics, Stream, Exception), bạn sẽ
**copy code mà không hiểu vì sao chạy** và bí khi lỗi. Nắm Java core trước giúp đọc được
stack trace, hiểu bean hoạt động thế nào và tự debug.

| Cấp độ | Bạn làm được gì sau khi xong |
|--------|------------------------------|
| Beginner | Viết Java thành thạo (OOP, Collections, Stream) và dựng được REST API Spring Boot có DB, validation, test |
| Intermediate | Tối ưu JPA (N+1, transaction, cache), bảo mật với Spring Security, viết code sạch, xử lý tác vụ nền/bất đồng bộ |
| Advanced | Thiết kế kiến trúc (Clean/DDD/microservices), làm event-driven với Kafka, tune JVM, và vận hành trên K8s/cloud |

### Môi trường & tài nguyên

- JDK: cài bằng **SDKMAN!** (`sdk install java 21-tem`) để đổi version dễ dàng. Ưu tiên
  **Java 21 LTS** (có virtual thread, record, sealed, pattern matching).
- Build tool: **Maven** hoặc **Gradle**. Editor: **IntelliJ IDEA** (Community đủ dùng).
- Tài liệu chính thức: [Spring Boot docs](https://docs.spring.io/spring-boot/index.html),
  [Baeldung](https://www.baeldung.com), [Java™ Tutorials](https://docs.oracle.com/javase/tutorial/).
- Mỗi bài có ví dụ code chạy được — nên gõ lại và chạy thử, đừng chỉ đọc.

Nội dung liên kết với `term-glossary` (tra thuật ngữ) — gặp thuật ngữ lạ thì mở glossary.
