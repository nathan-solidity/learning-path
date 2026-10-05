---
level: "ruby"
order: 2
title: "Method, Block, Proc & Lambda"
est: "5-6 giờ"
checklist:
  - "Định nghĩa method có default args và keyword args, gọi đúng cách"
  - "Giải thích được return ngầm (implicit return) của Ruby"
  - "Viết method nhận block và gọi bằng `yield` hoặc `&block`"
  - "Phân biệt được `do...end` và `{}` — khi nào dùng cái nào"
  - "Nêu đúng 2 khác biệt Proc vs Lambda (return và arity)"
  - "Đọc được một block trong code Rails (vd `respond_to`, `each`) và hiểu nó làm gì"
related:
  - "skill:nta-refactor"
  - "skill:nta-code-review"
---

## Vì sao đây là bài cốt lõi

Gần như mọi dòng Rails "đẹp" là block: `users.each`, `respond_to do |format|`,
`before_action`, `transaction do ... end`. Không hiểu block thì Rails trông như phép thuật.
Bài này khó hơn bài trước — nhưng nắm được thì đọc source Rails không còn bí.

## Method — định nghĩa & gọi

```ruby
def greet(name)
  "Xin chào #{name}"   # KHÔNG cần `return` — dòng cuối tự trả về
end

greet("Nhân")          # => "Xin chào Nhân"
greet "Nhân"           # ngoặc tùy chọn — Rails hay bỏ ngoặc
```

> **Return ngầm (implicit return)**: giá trị của **dòng cuối cùng** là giá trị trả về.
> `return` chỉ dùng khi cần thoát sớm. Viết `return "x"` ở dòng cuối là thừa.

### Default args & keyword args

```ruby
# Default argument
def greet(name, greeting = "Xin chào")
  "#{greeting} #{name}"
end
greet("Nhân")             # => "Xin chào Nhân"
greet("Nhân", "Chào")     # => "Chào Nhân"

# Keyword arguments — gọi rõ tên, không phụ thuộc thứ tự (Rails dùng RẤT nhiều)
def create_user(name:, role: "member")
  "#{name} (#{role})"
end
create_user(name: "Nhân")               # => "Nhân (member)"
create_user(role: "admin", name: "An")  # thứ tự tự do
```

Keyword args giống hệt cách bạn gọi `redirect_to path, status: :found` trong Rails.

## Block — "đoạn code truyền vào method"

Block là khối code đặt sau lời gọi method, bọc trong `do...end` hoặc `{}`.

```ruby
[1, 2, 3].each do |n|
  puts n * 2
end

# Cùng nghĩa, viết 1 dòng bằng {}
[1, 2, 3].each { |n| puts n * 2 }
```

### `do...end` vs `{}` — chọn cái nào

| Dùng | Khi nào |
|------|---------|
| `{ }` | Block **1 dòng**, ngắn gọn |
| `do...end` | Block **nhiều dòng** |

> **Cạm bẫy về precedence**: `{}` bám chặt hơn `do...end`.
> `puts [1,2,3].map { |n| n*2 }` → in `[2,4,6]`.
> `puts [1,2,3].map do |n| n*2 end` → in ra chính cái Enumerator (sai!), vì `do...end`
> gắn vào `puts` chứ không phải `map`. Quy tắc an toàn: 1 dòng dùng `{}`, nhiều dòng dùng
> `do...end` và cho vào biến trước.

### Nhận block trong method: `yield` và `&block`

```ruby
# Cách 1: yield — gọi block được truyền vào
def with_log
  puts "Bắt đầu"
  yield              # chạy block ở đây
  puts "Kết thúc"
end

with_log { puts "Đang làm việc" }
# => Bắt đầu / Đang làm việc / Kết thúc

# Cách 2: &block — biến block thành object để chuyển tiếp / kiểm tra
def with_log(&block)
  return "Không có block" unless block_given?
  block.call
end
```

Đây chính là cách `File.open("f") do |file| ... end` hoạt động: method mở file, `yield`
cho block xử lý, rồi tự đóng file.

## Proc & Lambda — "block đóng gói thành object"

Đôi khi ta muốn **lưu** một block vào biến để tái dùng. Đó là Proc và Lambda.

```ruby
square_proc   = Proc.new { |x| x * x }
square_lambda = ->(x) { x * x }     # cú pháp lambda: ->(args) { }

square_proc.call(4)     # => 16
square_lambda.call(4)   # => 16
```

### 2 khác biệt phải nhớ

**1. Cách `return` hành xử**

```ruby
def test_proc
  p = Proc.new { return 10 }
  p.call
  20        # KHÔNG bao giờ chạy tới — proc's return thoát cả method
end
test_proc   # => 10

def test_lambda
  l = -> { return 10 }
  l.call
  20        # CÓ chạy — lambda's return chỉ thoát khỏi lambda
end
test_lambda # => 20
```

**2. Kiểm tra số lượng argument (arity)**

```ruby
->(a, b) { }.call(1)          # ArgumentError — lambda NGHIÊM ngặt
Proc.new { |a, b| }.call(1)   # OK — proc dễ dãi, b = nil
```

| | Proc | Lambda |
|---|---|---|
| `return` | Thoát cả method chứa nó | Chỉ thoát khỏi lambda |
| Số argument sai | Bỏ qua (dễ dãi) | Báo lỗi (nghiêm ngặt) |
| Giống method hơn | Không | Có |

> Kinh nghiệm: cần một object gọi được mà hành xử "giống method" (kiểm tra arg, return
> gọn) → **lambda**. Trong Rails, `scope :active, -> { where(active: true) }` là lambda.

## Cạm bẫy hay gặp

- Nhầm `do...end` với `{}` ở method như `map` khi in trực tiếp (precedence — xem trên).
- Viết `return` thừa ở dòng cuối method.
- Dùng Proc rồi ngạc nhiên vì `return` trong nó thoát cả method gọi.
- Quên `block_given?` → gọi `yield` khi không có block → `LocalJumpError`.

## Ghi nhớ

Block = code truyền vào method; Proc/Lambda = block được lưu thành object. Rails DSL
(`scope`, `before_action`, `respond_to`) đứng trên nền này. Hiểu block là mở khóa 80%
"phép thuật" của Rails.
