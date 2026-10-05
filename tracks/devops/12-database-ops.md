---
level: "advanced"
order: 12
title: "Database ops & migration tại scale"
est: "5-6 giờ"
checklist:
  - "Chạy schema migration an toàn không downtime: backward-compatible, expand-contract"
  - "Giải thích vì sao migration khóa bảng lớn nguy hiểm và cách né (online DDL, batch)"
  - "Phân biệt backup logic và physical, và vì sao phải diễn tập restore định kỳ"
  - "Hiểu read replica, connection pooling, và khi nào cần chúng để chịu tải"
  - "Nhận ra khi nào CHƯA cần sharding/replica để tránh over-engineering"
related:
  - "skill:nta-db-review"
  - "skill:nta-migration-gen"
---

## Database là chỗ nguy hiểm nhất khi vận hành

App chết thì restart là xong. **Data hỏng hoặc mất thì không có nút undo.** Migration khóa bảng
sai giờ cao điểm có thể làm sập cả hệ thống. Vì thế thao tác với DB ở production đòi hỏi cẩn
trọng hơn mọi thứ khác — đây là phần nối lại DR (RTO/RPO ở bài SRE) với thực hành hằng ngày.

## Migration không downtime — expand/contract

Đổi schema khi hàng nghìn request/giây đang chạy: không thể "tắt app, sửa DB, bật lại". Mẫu an
toàn là **expand → migrate → contract**, mỗi bước **backward-compatible** (code cũ vẫn chạy):

```
Ví dụ: đổi tên cột `name` → `full_name`

1. EXPAND   : thêm cột `full_name` (nullable). Code cũ vẫn dùng `name`, chưa ảnh hưởng.
2. MIGRATE  : deploy code ghi cả hai cột; backfill dữ liệu cũ sang `full_name` theo batch.
3. CONTRACT : khi mọi bản đã đọc/ghi `full_name`, xóa cột `name`.
```

> **Không bao giờ** đổi/xóa cột trong một bước rồi deploy code cùng lúc. Trong khoảnh khắc
> rollout, code cũ và code mới **cùng chạy** — schema phải tương thích với cả hai. Expand trước,
> contract sau, và mỗi bước tự nó không phá version đang chạy.

## Cạm bẫy khóa bảng

Nhiều lệnh DDL **khóa bảng** khi chạy — trên bảng lớn, khóa vài phút = ứng dụng treo vài phút:

| Việc | Rủi ro | Cách an toàn |
|------|--------|--------------|
| `ALTER TABLE` thêm cột có DEFAULT trên MySQL cũ | Khóa & rewrite cả bảng | Dùng online DDL / gh-ost / pt-online-schema-change |
| `UPDATE` toàn bảng backfill | Khóa hàng loạt, sinh lock lớn | Chạy theo **batch** nhỏ, nghỉ giữa các batch |
| Thêm index trên bảng lớn | Khóa ghi lâu | `CREATE INDEX CONCURRENTLY` (Postgres) |

> Chạy migration nặng vào **giờ thấp điểm** và **luôn test trên bản sao production-size trước**.
> Một `ALTER TABLE` chạy 200ms trên bảng dev 1000 dòng có thể khóa 20 phút trên bảng prod 100 triệu dòng.

## Backup & restore

| Kiểu backup | Là gì | Đặc điểm |
|-------------|-------|----------|
| **Logic** (dump) | Xuất SQL/dữ liệu (pg_dump/mysqldump) | Linh hoạt, chậm, restore lâu với DB lớn |
| **Physical** (snapshot) | Copy file dữ liệu/block-level | Nhanh, khôi phục nhanh, ít linh hoạt hơn |

> Lặp lại bài SRE vì nó quá quan trọng: **"có backup" ≠ "restore được".** Backup không được diễn
> tập restore định kỳ là backup bạn chỉ *hy vọng* nó chạy. Test restore vào môi trường sạch theo
> lịch — đo cả **thời gian restore** (chính là RTO thực tế của bạn).

## Chịu tải: replica, pool, sharding

Khi một DB không kham nổi tải, các nấc thang (đi theo thứ tự, đừng nhảy cóc):

1. **Connection pooling** (PgBouncer...): mỗi kết nối DB tốn tài nguyên; pool tái dùng kết nối
   thay vì mở mới liên tục. **Thường là thứ cần trước tiên**, rẻ và hiệu quả.
2. **Read replica**: nhân bản DB để **phân tải đọc** — query đọc đi replica, ghi vẫn về primary.
   Hợp khi tải chủ yếu là đọc. Lưu ý **replication lag**: replica có thể chậm hơn primary vài ms.
3. **Sharding**: chia dữ liệu ra nhiều DB theo key (user_id...). Chịu tải ghi khổng lồ nhưng
   **cực kỳ phức tạp** — mất join xuyên shard, khó rebalance, khó transaction.

## Khi nào CHƯA cần

> Đừng shard khi một index còn thiếu. Đừng thêm read replica khi vấn đề là một query N+1. Phần
> lớn "DB chậm" giải quyết được bằng **index đúng, query tốt, và connection pool** — không phải
> bằng nhân bản hạ tầng. Profile trước (nối bài cost/performance), tối ưu query trước, rồi mới
> tính tới replica; sharding là lựa chọn cuối cùng khi đã hết đường khác.

## Cạm bẫy hay gặp

- **Đổi/xóa cột một bước cùng lúc deploy code** → code cũ trong lúc rollout gặp schema không khớp, lỗi hàng loạt.
- **Chạy `ALTER`/`UPDATE` nặng giờ cao điểm** → khóa bảng, treo ứng dụng.
- **Backfill toàn bảng một câu lệnh** → lock khổng lồ; phải chia batch.
- **Tin vào backup chưa từng test restore** → tới lúc cần mới biết hỏng.
- **Thêm replica/sharding trước khi sửa query/index** → tăng độ phức tạp mà không trúng nguyên nhân.
- **Quên replication lag** → đọc từ replica ngay sau khi ghi, ra dữ liệu cũ (read-after-write không nhất quán).

## Ghi nhớ

DB là nơi **không có nút undo** — thao tác cẩn trọng nhất. Migration không downtime dùng
**expand → migrate → contract**, mỗi bước **backward-compatible**; né **khóa bảng** bằng online
DDL và **batch**. Backup phải **diễn tập restore** mới tính là có. Chịu tải theo nấc: **connection
pool → read replica → sharding**, và **đừng nhảy cóc** — phần lớn vấn đề giải quyết bằng index/query
đúng trước khi cần tới replica hay sharding.
