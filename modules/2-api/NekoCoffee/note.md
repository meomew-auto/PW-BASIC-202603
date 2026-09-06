- CRUD
  -> CREATE - READ - UPDATE - DELETE
- bây giờ hệ thống code là FE và BE là hoàn toàn riêng biệt
- để giao tiếp thì 2 thằng này phải biết nhau và chấp nhận hay đồng thuận
- bank.com -> hackbank.com -> reject luôn qua cơ chế CORS - khi moin gười test API thì ít khi gặp CORS -> vì mọi người gọi trực tiếp xuông BE
- QUa FE là cơ chế giữa browser -> gọi xuốgn BE -> lúc này CORS mơi xảy ra

khi đi làm sẽ có các dự án liên quan đến FO - BO
FO thì tường là web f2f với KH - > kh sử dụng web này
BO : backofffice -> nhân viên công ty sử dụng

Content-Type: application/pdf
Content-Length: 5242880

Date: Sat, 05 Sep 2026 07:43:58 GMT
Content-Type: text/plain
Connection: keep-alive
Server: cloudflare
Nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD
Access-Control-Allow-Headers: Authorization, Content-Type, Accept, Origin, X-Requested-With
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 3600
cf-cache-status: DYNAMIC
Report-To: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=arwgYIv6rZgQbbFLYFXzORIO9ojbUXXphe%2ByR5GOXQKsryERHg4g1d74vU%2F%2Funx%2B0ymBdYM%2F%2BZspXZIR9oZWYZJ6Wq4kPVLHgpUm8zKRlJx86CRWp105LbmpyUtIt2ltWR%2F6lZR5mSr9ofBCJAUs"}]}
CF-RAY: a3639b225f8bff8b-SIN
alt-svc: h3=":443"; ma=86400

ốn Header CORS quan trọng nhất do Backend cấu hình:
Access-Control-Allow-Origin: Khai báo danh sách domain được phép gọi API (ví dụ: http://localhost:3000 hoặc \* cho phép tất cả).
Access-Control-Allow-Methods: Khai báo các Method được phép (ví dụ: GET, POST, PUT, PATCH, DELETE, OPTIONS).
Access-Control-Allow-Headers: Khai báo các Header được phép gửi lên (ví dụ: Authorization, Content-Type).
Access-Control-Allow-Credentials: Cho phép gửi kèm Cookie hay không (true/false).

bảo vệ request , bảo vệ data có rất nhiều
thì CORS là 1 trong nhóm thuộc bảo vệ đó

luồng API
gọi API test -> biết format response + body => convert sang interface của TS
-> dùng requqest gọi -> trả ra type(interface) của model hay api chúng ta đã convert

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RfcHdfMDFAdGVzdC5sb2NhbCIsImV4cCI6MTc4ODU5OTE2NCwiaWF0IjoxNzg4NTk3MzY0LCJyb2xlIjoic3RhZmYiLCJzdWIiOjIxLCJ1c2VybmFtZSI6InRlc3RfcHdfMDEifQ.F5gkfKwcDxBK11rHctPrJNySCWbuZ8txLdfvzN-f9eA

tất cả BA. PO,. PM đều sử dụng AI local hoặc claude để viết tài liệu review các thứ
jira mcp. ...
-> PHƯƠNG CHÂM: làm sao đữo tốn token nhất có thê mà vẫn đem lại hiệu quả cao
/public/products?search=Cà Phê Cầu Đất
Cà Phê Cầu Đất ->về cái dạng url interne chấp nhận

/api/products/{id}

{id} -> path param
