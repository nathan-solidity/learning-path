---
level: "advanced"
order: 18
title: "Hiệu năng & JVM"
est: "8-10 giờ"
checklist:
  - "Giải thích cấu trúc bộ nhớ JVM: heap, metaspace, stack và ý nghĩa -Xms/-Xmx"
  - "Chọn & đọc log của Garbage Collector (G1, ZGC)"
  - "Chẩn đoán bằng heap dump, thread dump, jcmd, JFR khi có sự cố"
  - "Dùng profiler xác định hot path thay vì đoán"
  - "Chạy load test và đọc p95/p99, không chỉ nhìn trung bình"
  - "Tối ưu đúng chỗ: query, cache, pool, payload, N+1, pagination"
---

## Nguyên tắc số 1: đo trước khi tối ưu

> "Premature optimization is the root of all evil." Đừng đoán chỗ chậm — **đo** bằng
> profiler/APM, tìm đúng bottleneck, sửa, rồi **đo lại** để xác nhận. Tối ưu chỗ không phải
> bottleneck là lãng phí và dễ làm code phức tạp thêm.

## Cấu trúc bộ nhớ JVM

```
┌─ Heap ────────────────────────┐   Object sống ở đây; GC dọn ở đây
│  Young Gen (Eden + Survivor)   │   Object mới, GC nhanh & thường xuyên
│  Old Gen                       │   Object sống lâu
├─ Metaspace ───────────────────┤   Metadata class (ngoài heap, native mem)
├─ Stack (mỗi thread 1)          │   Biến local, khung gọi hàm
└─ ...                           │
```

![Cấu trúc bộ nhớ JVM: Heap (Young Gen + Old Gen) nơi GC dọn, Metaspace, Stack; OOM khi hết Heap, StackOverflow khi đệ quy sâu](/images/java-jvm-memory.png)

Cờ cấu hình quan trọng:

```bash
java -Xms512m -Xmx512m -jar app.jar     # heap khởi tạo & tối đa (nên đặt BẰNG nhau ở prod)
```

- `-Xmx` quá nhỏ → `OutOfMemoryError`. Quá lớn → GC pause lâu, lãng phí.
- Đặt `-Xms == -Xmx` ở production để tránh JVM resize heap runtime (gây pause).
- **StackOverflowError** (đệ quy sâu) khác **OutOfMemoryError** (hết heap) — đọc đúng lỗi.

## Garbage Collector

GC tự dọn object không còn tham chiếu. Bạn không quản lý bộ nhớ tay, nhưng cần hiểu để tune:

| GC | Đặc điểm | Dùng khi |
|----|----------|----------|
| **G1** (mặc định) | Cân bằng throughput & pause | Đa số ứng dụng |
| **ZGC** | Pause cực thấp (<1ms), heap lớn | Latency-sensitive, heap hàng chục GB |
| **Parallel** | Throughput cao, pause dài | Batch, không quan tâm pause |

```bash
java -XX:+UseZGC -Xlog:gc*:file=gc.log -jar app.jar    # chọn GC + ghi GC log
```

Đọc GC log để thấy tần suất & thời gian pause. GC chạy liên tục / pause dài → dấu hiệu thiếu
heap hoặc **memory leak** (object đáng lẽ chết mà vẫn bị giữ tham chiếu).

## Chẩn đoán sự cố

```bash
jcmd <pid> Thread.print              # thread dump — tìm deadlock / thread kẹt
jcmd <pid> GC.heap_dump heap.hprof   # heap dump — phân tích rò bộ nhớ
jstack <pid>                         # thread dump (cách khác)
jcmd <pid> JFR.start duration=60s filename=rec.jfr   # Java Flight Recorder — ghi hồ sơ chạy
```

- **Thread dump**: app treo/chậm → xem thread đang làm gì, có deadlock/khoá không.
- **Heap dump**: nghi memory leak → mở bằng **Eclipse MAT** tìm object chiếm nhiều RAM và
  ai đang giữ nó.
- **JFR**: ghi lại chi tiết (allocation, GC, lock, method) với overhead thấp — dùng được cả
  ở production.

## Profiler — tìm hot path

Profiler cho biết **method nào tốn CPU/bộ nhớ nhất**:

- **async-profiler** — overhead thấp, flame graph rõ ràng, chạy được ở production.
- **IntelliJ Profiler / VisualVM** — tiện lúc dev.

Flame graph: thanh càng rộng = càng tốn thời gian. Tối ưu thanh rộng nhất trước.

## Load test — đọc p95/p99

Đừng chỉ nhìn **trung bình** — nó che giấu đuôi chậm. Nhìn **percentile**:

| Chỉ số | Ý nghĩa |
|--------|---------|
| p50 (median) | 50% request nhanh hơn giá trị này |
| **p95** | 95% nhanh hơn — 5% user chậm nhất |
| **p99** | 99% nhanh hơn — trải nghiệm tệ nhất |

> Trung bình 100ms nghe ổn, nhưng p99 = 3s nghĩa là 1% user (có thể là khách VIP tải nặng)
> đang khổ. **p95/p99 mới phản ánh trải nghiệm thật.**

Công cụ: **k6** (script JS, nhẹ), JMeter, Gatling. Chạy smoke → load → stress để tìm điểm
gãy.

## Tối ưu đúng chỗ (thường gặp nhất → hiếm)

1. **Query DB** — N+1, thiếu index, `SELECT *`, không phân trang. Đây là bottleneck **số 1**
   của app Java điển hình (xem bài JPA nâng cao).
2. **Thiếu cache** — dữ liệu đọc nhiều, đổi ít → cache (Redis/Caffeine).
3. **Connection pool** — HikariCP quá nhỏ → request xếp hàng chờ connection.
4. **Payload lớn** — trả cả cây object khổng lồ → dùng projection/pagination.
5. **Cuối cùng** mới tới tối ưu thuật toán/JVM tuning.

> Đa số vấn đề hiệu năng Java nằm ở **IO (DB/network)**, không phải CPU. Sửa query & cache
> thường cho hiệu quả lớn hơn nhiều so với tune GC.

## Cạm bẫy hay gặp

- **Tối ưu khi chưa đo** → sửa nhầm chỗ, phức tạp hóa vô ích.
- **Nhìn trung bình bỏ qua p95/p99** → đánh giá sai trải nghiệm.
- **`-Xmx` quá lớn "cho chắc"** → GC pause dài, lãng phí RAM.
- **Đổ lỗi GC** trong khi thủ phạm là N+1 query → luôn kiểm DB trước.
- **Cache mọi thứ** → sai dữ liệu (stale), tốn RAM. Cache có chủ đích + invalidation.
- **Không đóng tài nguyên** (stream/connection) → rò, hết pool.

## Ghi nhớ

Hiệu năng là chu trình **đo → tìm bottleneck → sửa → đo lại**, không phải đoán. Hiểu bộ nhớ
JVM (heap/metaspace/stack) và GC (G1 mặc định, ZGC cho low-latency) để đọc triệu chứng. Công
cụ: **thread dump / heap dump / JFR / profiler**. Nhìn **p95/p99**. Và nhớ: thủ phạm phổ
biến nhất là **query DB (N+1, index)**, không phải JVM.
