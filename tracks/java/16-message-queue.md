---
level: "advanced"
order: 16
title: "Message queue & event-driven"
est: "8-10 giờ"
checklist:
  - "Giải thích producer/consumer/topic/partition/consumer group"
  - "Cấu hình Kafka: key & partition, offset, hiểu at-least-once vs exactly-once"
  - "Dùng DLQ và retry với RabbitMQ/SQS hoặc Spring Kafka"
  - "Áp dụng Outbox pattern để đồng bộ DB và message an toàn"
  - "Thiết kế saga cho transaction phân tán và eventual consistency"
  - "Đảm bảo consumer idempotent và giữ thứ tự khi cần"
---

## Vì sao cần message queue

Gọi đồng bộ (REST) giữa nhiều service tạo **ràng buộc chặt**: service A chờ B, B chết thì A
lỗi. Message queue cho phép **giao tiếp bất đồng bộ, tách rời**: A gửi message rồi tiếp tục;
B xử lý khi rảnh. Lợi ích: chịu tải cao (buffer), chịu lỗi (retry/DLQ), mở rộng độc lập.

```
Producer → [ Topic/Queue ] → Consumer(s)
```

## Khái niệm cốt lõi (Kafka)

| Khái niệm | Ý nghĩa |
|-----------|---------|
| **Producer** | Bên gửi message |
| **Consumer** | Bên nhận & xử lý |
| **Topic** | Kênh logic chứa message (vd `orders`) |
| **Partition** | Topic chia nhỏ để song song; thứ tự chỉ đảm bảo TRONG 1 partition |
| **Offset** | Vị trí message trong partition; consumer đọc tới đâu nhớ tới đó |
| **Consumer group** | Nhóm consumer chia nhau partition để scale |

> **Key quyết định partition**: message cùng `key` (vd `orderId`) luôn vào **cùng partition**
> → giữ đúng thứ tự cho key đó. Không set key → phân bổ xoay vòng (mất đảm bảo thứ tự).

![Producer gửi message theo key vào partition của topic; consumer group chia nhau partition; consumer idempotent để tránh xử lý trùng với at-least-once](/images/java-kafka-flow.png)

## Đảm bảo giao hàng: at-least-once vs exactly-once

| Mức | Nghĩa | Đánh đổi |
|-----|-------|----------|
| **At-most-once** | Có thể mất message | Nhanh, không retry |
| **At-least-once** | Không mất, nhưng **có thể trùng** | Phổ biến nhất — consumer phải **idempotent** |
| **Exactly-once** | Không mất, không trùng | Phức tạp, chậm hơn (Kafka transactions) |

> Thực tế đa số dùng **at-least-once + consumer idempotent**. "Exactly-once" tốn kém và
> thường không cần nếu consumer đã idempotent.

## Spring Kafka — producer & consumer

```java
// Producer
@Service
public class OrderProducer {
    private final KafkaTemplate<String, OrderEvent> kafka;
    public OrderProducer(KafkaTemplate<String, OrderEvent> kafka) { this.kafka = kafka; }

    public void publish(OrderEvent event) {
        kafka.send("orders", event.orderId(), event);   // key = orderId → giữ thứ tự
    }
}

// Consumer
@Component
public class OrderConsumer {
    @KafkaListener(topics = "orders", groupId = "billing")
    public void handle(OrderEvent event) {
        if (alreadyProcessed(event.eventId())) return;   // idempotent guard
        billingService.charge(event);
    }
}
```

## DLQ & retry

Message xử lý lỗi mãi → không nên chặn queue vô hạn. **Dead Letter Queue (DLQ)** chứa
message lỗi để xử lý sau/điều tra.

```java
@Bean
public DefaultErrorHandler errorHandler(KafkaTemplate<Object, Object> template) {
    var recoverer = new DeadLetterPublishingRecoverer(template);   // đẩy sang <topic>.DLT
    return new DefaultErrorHandler(recoverer,
        new FixedBackOff(1000L, 3));      // retry 3 lần, cách 1s, rồi vào DLQ
}
```

RabbitMQ tương tự: khai báo `x-dead-letter-exchange`; SQS có `RedrivePolicy` trỏ DLQ.

## Outbox pattern — vấn đề "dual write"

Vấn đề: bạn cần **lưu DB** và **gửi message** cùng lúc. Nếu lưu DB xong rồi gửi message mà
service crash giữa chừng → DB có, message không (hoặc ngược lại). Không thể bọc DB và Kafka
trong một transaction ACID.

**Giải pháp Outbox**: ghi message vào **bảng outbox trong cùng transaction DB**, một tiến
trình riêng đọc bảng outbox và publish lên Kafka.

```
[ Transaction: lưu Order + ghi row vào outbox ]  ← nguyên tử trong DB
                    ↓
[ Relay đọc outbox → publish Kafka → đánh dấu đã gửi ]
```

```java
@Transactional
public void createOrder(Order order) {
    orderRepository.save(order);
    outboxRepository.save(new OutboxEvent("OrderCreated", toJson(order)));  // cùng transaction
}
// Relay riêng (Debezium CDC hoặc @Scheduled) đọc outbox chưa gửi → publish
```

> Outbox đảm bảo "**DB và message luôn khớp**" mà không cần distributed transaction. Đây là
> pattern nền tảng của event-driven đáng tin cậy.

## Saga — transaction phân tán

Một nghiệp vụ trải qua nhiều service (đặt hàng → trừ kho → thanh toán → giao hàng), không có
transaction ACID chung. **Saga** chia thành chuỗi bước cục bộ, mỗi bước có **compensating
action** để hoàn tác nếu bước sau lỗi.

```
Đặt hàng → Trừ kho → Thanh toán ──✗ lỗi──→ Hoàn kho (compensate) → Huỷ đơn
```

- **Choreography**: mỗi service phát event, service khác lắng nghe (phi tập trung, dễ rối
  khi nhiều bước).
- **Orchestration**: một orchestrator điều phối tuần tự (rõ ràng, dễ theo dõi).

**Eventual consistency**: dữ liệu giữa các service **không nhất quán tức thì** mà đúng dần
sau khi các event xử lý xong. Chấp nhận điều này là cái giá của kiến trúc phân tán.

## Idempotency & thứ tự

- **Idempotent consumer**: lưu `eventId` đã xử lý (DB/Redis), gặp lại thì bỏ qua. Bắt buộc
  với at-least-once.
- **Thứ tự**: chỉ đảm bảo trong 1 partition. Cần thứ tự theo entity → dùng entity id làm
  **key**. Đừng giả định thứ tự toàn cục.

## Cạm bẫy hay gặp

- **Dual write** (lưu DB rồi gửi message ngoài transaction) → lệch dữ liệu khi crash. Dùng
  Outbox.
- **Consumer không idempotent** với at-least-once → xử lý trùng (tính tiền 2 lần).
- **Giả định thứ tự toàn cục** → sai; thứ tự chỉ trong partition, theo key.
- **Không có DLQ** → 1 message độc làm kẹt cả consumer.
- **Lạm dụng exactly-once** → phức tạp không cần thiết nếu đã idempotent.
- **Nhảy vào microservices + Kafka quá sớm** cho hệ nhỏ → over-engineer.

## Ghi nhớ

Message queue tách rời service và chịu tải/lỗi tốt hơn. Nhớ: **key quyết định partition &
thứ tự**, đa số dùng **at-least-once nên consumer phải idempotent**, dùng **Outbox** để DB
và message không lệch, và **saga + eventual consistency** cho nghiệp vụ trải nhiều service.
DLQ để message lỗi không kẹt hệ thống.
