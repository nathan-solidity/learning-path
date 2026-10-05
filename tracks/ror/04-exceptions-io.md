---
level: "ruby"
order: 4
title: "Exception Handling & I/O"
est: "4-5 giờ"
checklist:
  - "Viết được begin/rescue/ensure và hiểu ensure luôn chạy"
  - "Rescue đúng loại exception cụ thể, không rescue Exception/StandardError trần bừa bãi"
  - "Định nghĩa được custom exception class kế thừa StandardError"
  - "Dùng `raise` để phát lỗi có message rõ ràng"
  - "Đọc/ghi file bằng File.open kèm block (tự đóng file)"
  - "Ghép đường dẫn an toàn bằng File.join thay vì nối chuỗi tay"
---

## Vì sao xử lý lỗi đúng cách lại quan trọng

Trong web app, một exception không bắt sẽ làm sập request (hoặc trả 500 cho user). Nhưng
bắt lỗi **sai cách** còn tệ hơn: nuốt mất lỗi thật, che giấu bug, khiến debug thành ác mộng.
Bài này dạy bắt lỗi có chủ đích, không phải bọc `rescue` cho "hết đỏ".

## begin / rescue / ensure

```ruby
begin
  result = 10 / 0            # nổ ZeroDivisionError
rescue ZeroDivisionError => e
  puts "Lỗi: #{e.message}"   # => Lỗi: divided by 0
ensure
  puts "Luôn chạy dù có lỗi hay không"
end
```

- `begin ... rescue`: thử chạy, nếu lỗi thì nhảy vào `rescue`.
- `=> e`: bắt object exception để đọc `.message`, `.backtrace`.
- `ensure`: **luôn** chạy — dùng để dọn dẹp (đóng file, nhả kết nối).

### Rescue nhiều loại lỗi

```ruby
begin
  do_something
rescue ArgumentError => e
  puts "Sai tham số: #{e.message}"
rescue Timeout::Error => e
  puts "Quá thời gian, thử lại sau"
rescue => e                     # bắt StandardError (mặc định) — để cuối
  puts "Lỗi khác: #{e.message}"
end
```

> **Cạm bẫy nghiêm trọng — ĐỪNG rescue trần**: `rescue Exception => e` bắt **tất cả**, kể
> cả `SignalInterrupt` (Ctrl-C), `NoMemoryError`, `SyntaxError` — khiến chương trình không
> thể dừng và che luôn bug lập trình. Ngay cả `rescue => e` (StandardError) cũng nên dùng
> có chủ đích: chỉ rescue lỗi **bạn thật sự xử lý được**. Rescue quá rộng = nuốt bug.

| Viết | Bắt gì | Đánh giá |
|------|--------|----------|
| `rescue SomeError` | Đúng 1 loại | ✅ Tốt nhất — rõ ràng |
| `rescue => e` | StandardError | ⚠️ OK ở ranh giới ngoài cùng, cẩn thận |
| `rescue Exception => e` | MỌI thứ | ❌ Gần như luôn sai |

## raise — chủ động phát lỗi

```ruby
def withdraw(amount)
  raise ArgumentError, "Số tiền phải dương" if amount <= 0
  raise "Không đủ số dư" if amount > @balance   # mặc định là RuntimeError
  @balance -= amount
end
```

Phát lỗi sớm với message rõ ràng tốt hơn để dữ liệu sai đi sâu vào hệ thống rồi nổ ở chỗ
khó hiểu.

## Custom exception class

Khi muốn phân loại lỗi nghiệp vụ để tầng trên bắt riêng:

```ruby
class InsufficientFundsError < StandardError; end   # LUÔN kế thừa StandardError

class Account
  def withdraw(amount)
    raise InsufficientFundsError, "Thiếu #{amount - @balance}" if amount > @balance
    @balance -= amount
  end
end

begin
  account.withdraw(1_000_000)
rescue InsufficientFundsError => e     # bắt đúng loại nghiệp vụ
  puts "Từ chối: #{e.message}"
end
```

> Custom exception phải kế thừa `StandardError`, **không** kế thừa `Exception` trực tiếp —
> nếu không, `rescue => e` thông thường sẽ không bắt được nó.

### retry — thử lại

```ruby
attempts = 0
begin
  attempts += 1
  call_flaky_api
rescue Timeout::Error
  retry if attempts < 3       # chạy lại từ `begin`, tối đa 3 lần
  raise                       # hết lượt thì ném lại lỗi
end
```

## I/O — đọc & ghi file

```ruby
# GHI file — File.open với block tự đóng file khi xong (kể cả khi lỗi)
File.open("note.txt", "w") do |f|
  f.puts "Dòng 1"
  f.puts "Dòng 2"
end   # file tự đóng ở đây

# ĐỌC toàn bộ file
content = File.read("note.txt")     # => "Dòng 1\nDòng 2\n"

# ĐỌC từng dòng — tiết kiệm RAM với file lớn
File.foreach("note.txt") do |line|
  puts line.chomp                   # chomp bỏ ký tự xuống dòng
end

# THÊM vào cuối (append) — mode "a"
File.open("log.txt", "a") { |f| f.puts "sự kiện mới" }
```

| Mode | Ý nghĩa |
|------|---------|
| `"r"` | Đọc (mặc định) |
| `"w"` | Ghi — **xóa sạch** nội dung cũ |
| `"a"` | Ghi thêm vào cuối (append) |

> **Vì sao dùng block với `File.open`**: block đảm bảo file được đóng dù có exception giữa
> chừng — giống `ensure` nhưng gọn. Nếu gọi `File.open` không block, bạn phải tự `f.close`,
> quên là rò file handle.

### Đường dẫn — dùng File.join

```ruby
# ĐÚNG — File.join tự xử lý dấu / theo hệ điều hành
path = File.join("data", "reports", "2026.csv")   # "data/reports/2026.csv"

# SAI — nối chuỗi tay dễ thừa/thiếu dấu /
path = "data" + "/" + "reports"    # dễ thành "data//reports"

File.exist?(path)     # kiểm tra tồn tại trước khi đọc
File.basename(path)   # => "2026.csv"
File.dirname(path)    # => "data/reports"
```

## Cạm bẫy hay gặp

- `rescue Exception` — nuốt cả Ctrl-C và lỗi cú pháp. Dùng loại cụ thể.
- Rescue rồi im lặng (`rescue; end`) — bug biến mất không dấu vết.
- Custom exception kế thừa `Exception` thay vì `StandardError` → không bị bắt như mong đợi.
- Quên đóng file khi không dùng block → rò file handle.
- Mở file mode `"w"` khi định append → xóa mất dữ liệu cũ.

## Ghi nhớ

Bắt lỗi là để **xử lý** lỗi bạn lường trước được, không phải để "hết đỏ màn hình". Rescue
đúng loại, để lỗi ngoài dự kiến nổ ra cho bạn thấy. Với file, luôn ưu tiên `File.open` kèm
block để không phải nhớ đóng tay.
