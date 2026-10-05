---
level: "ruby"
order: 3
title: "OOP trong Ruby"
est: "5-6 giờ"
checklist:
  - "Định nghĩa class với initialize và attr_accessor, tạo object và gọi method"
  - "Phân biệt instance method, class method, và biến instance (@)"
  - "Dùng inheritance với `super` để tái dùng logic từ class cha"
  - "Viết một module và mixin vào class bằng `include`"
  - "Giải thích được include vs extend khác nhau chỗ nào"
  - "Hiểu duck typing và vì sao Ruby không cần khai báo interface"
---

## Vì sao OOP quan trọng với Rails

Mọi thứ trong Rails là object: model là class kế thừa `ApplicationRecord`, controller kế
thừa `ApplicationController`, concern là module mixin vào. Nắm OOP Ruby → hiểu vì sao
`User < ApplicationRecord` cho bạn `User.find`, `user.save` "miễn phí".

## Class & object

```ruby
class User
  # attr_accessor tạo sẵn getter + setter cho @name, @email
  attr_accessor :name, :email

  # initialize chạy khi gọi User.new — như constructor
  def initialize(name, email)
    @name  = name    # @name là biến instance — sống cùng object
    @email = email
  end

  # instance method — gọi trên từng object
  def greet
    "Xin chào, tôi là #{@name}"
  end
end

user = User.new("Nhân", "nhan@x.com")
user.name          # => "Nhân"   (getter do attr_accessor tạo)
user.name = "An"   # setter
user.greet         # => "Xin chào, tôi là An"
```

### Biến instance & các loại attr

```ruby
class User
  attr_reader   :id      # chỉ getter (đọc)
  attr_writer   :secret  # chỉ setter (ghi)
  attr_accessor :name    # cả getter + setter
end
```

> `@name` là **biến instance** — mỗi object có bản riêng. Không có `@` là biến local, chết
> ngay sau method. Đây là lỗi hay gặp: quên `@` → dữ liệu không lưu được vào object.

## Class method vs instance method

```ruby
class User
  def self.count        # class method — gọi trên chính class
    @@all ||= []
    @@all.length
  end

  def save              # instance method — gọi trên object
    self.class.all << self
  end
end

User.count    # class method — giống User.count trong Rails
user.save     # instance method — giống user.save trong Rails
```

`self.method_name` = định nghĩa method cấp class. Trong Rails, `User.where(...)` là class
method, `user.update(...)` là instance method — đây chính là lý do.

## Inheritance & `super`

```ruby
class Animal
  def initialize(name)
    @name = name
  end

  def describe
    "#{@name} là động vật"
  end
end

class Dog < Animal          # Dog kế thừa Animal
  def initialize(name, breed)
    super(name)             # gọi initialize của Animal
    @breed = breed
  end

  def describe
    super + ", giống #{@breed}"   # super gọi describe của cha rồi nối thêm
  end
end

Dog.new("Rex", "Corgi").describe   # => "Rex là động vật, giống Corgi"
```

> `super` (không ngoặc) truyền lại **y nguyên** các argument nhận được; `super(name)` truyền
> đúng cái bạn chỉ định; `super()` truyền rỗng. Nhầm 3 dạng này gây bug khó tìm.

## Module — mixin & namespace

Ruby chỉ cho kế thừa **1** class cha. Muốn chia sẻ hành vi giữa nhiều class không cùng
dòng dõi → dùng module mixin.

```ruby
module Greetable
  def greet
    "Xin chào từ #{name}"
  end
end

class User
  include Greetable       # trộn method của module vào làm INSTANCE method
  attr_reader :name
  def initialize(name); @name = name; end
end

User.new("Nhân").greet    # => "Xin chào từ Nhân"
```

Đây chính là cách Rails **concern** hoạt động: gom logic dùng chung vào module, `include`
vào nhiều model/controller.

### include vs extend

```ruby
module Sayable
  def say; "hi"; end
end

class A; include Sayable; end
class B; extend  Sayable; end

A.new.say   # => "hi"   — include: method thành INSTANCE method
B.say       # => "hi"   — extend:  method thành CLASS method
```

| | `include` | `extend` |
|---|---|---|
| Method trở thành | Instance method | Class method |
| Gọi trên | Object (`a.say`) | Class (`B.say`) |

## Duck typing — "nếu kêu quạc quạc thì là vịt"

Ruby không bắt khai báo interface. Nó không quan tâm object thuộc class nào, chỉ cần nó
**phản hồi đúng method**.

```ruby
def make_it_quack(thing)
  thing.quack    # miễn thing có method quack là chạy
end

class Duck;  def quack; "Quạc!";     end; end
class Person; def quack; "Giả vịt"; end; end

make_it_quack(Duck.new)    # => "Quạc!"
make_it_quack(Person.new)  # => "Giả vịt"  — không cần cùng class
```

Nhờ duck typing, code Ruby linh hoạt: bạn có thể thay object thật bằng object giả (mock)
trong test miễn nó có đủ method cần thiết.

## Cạm bẫy hay gặp

- Quên `@` → dữ liệu không lưu vào object (biến local chết ngay).
- Nhầm `super` với `super()` — cái sau truyền rỗng, dễ mất argument.
- `include` khi cần `extend` (hoặc ngược lại) → gọi method sai cấp.
- Lạm dụng biến class `@@` (chia sẻ toàn class, dễ gây bug trong web app đa request).

## Ghi nhớ

`class User < ApplicationRecord` và `include Trackable` trong Rails không phải phép thuật
— chỉ là inheritance + mixin thuần Ruby. Hiểu bài này, bạn đọc được cấu trúc mọi model và
controller Rails.
