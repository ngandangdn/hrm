# HiCAS HRM

HiCAS HRM là hệ thống quản trị nhân sự full-stack dùng cho demo đồ án. Hệ thống hỗ trợ hồ sơ nhân sự, nghỉ phép, nghỉ việc, chấm công, thông báo, tài sản, phòng họp và báo cáo thống kê.

## Cấu Trúc Thư Mục

```text
HRM/
  Backend/       Mã nguồn FastAPI, requirements, file upload runtime
  Frontend/      Mã nguồn React/Vite, package.json, cấu hình UI
  Database/      Database SQLite demo, seed data, template import/xuất mẫu
  Scripts/       Script PowerShell để seed/chạy backend/chạy frontend
  README.md      Hướng dẫn sử dụng
```

Chi tiết:

```text
Backend/
  app/
    core/
    models/
    repositories/
    routers/
    schemas/
    services/
    utils/
  tools/run_demo_backend.py
  uploads/
  requirements.txt

Frontend/
  src/
  index.html
  package.json
  package-lock.json
  vite.config.ts
  tsconfig.json
  tailwind.config.js

Database/
  demo_hicas.db
  seed/seed_data.py
  templates/
    HopDongLaoDong_052026HiCAS.pdf
    mau_import_cham_cong_redmine.xlsx
    mau_import_cham_cong_tingop.xlsx
  tools/create_cham_cong_import_templates.py
```

## Chạy Nhanh Demo

### 1. Cài Backend

Tại thư mục gốc `HRM/`:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r Backend\requirements.txt
```

Nếu gặp lỗi `bcrypt/passlib` khi đăng nhập:

```powershell
.\.venv\Scripts\python.exe -m pip install "bcrypt<4.1" --force-reinstall
```

### 2. Cài Frontend

```powershell
cd Frontend
npm install
cd ..
```

### 3. Seed Dữ Liệu Mẫu

```powershell
.\Scripts\seed_database.ps1
```

Nếu PowerShell báo `running scripts is disabled`, chạy dạng:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File Scripts\seed_database.ps1
```

Script này tạo/cập nhật `Database/demo_hicas.db` và nạp dữ liệu mẫu đầy đủ cho demo.

### 4. Chạy Backend

Mở terminal thứ nhất tại thư mục gốc:

```powershell
.\Scripts\run_backend.ps1
```

Nếu PowerShell chặn script:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File Scripts\run_backend.ps1
```

Backend chạy tại:

```text
http://127.0.0.1:8000
```

Swagger:

```text
http://127.0.0.1:8000/docs
```

### 5. Chạy Frontend

Mở terminal thứ hai tại thư mục gốc:

```powershell
.\Scripts\run_frontend.ps1
```

Nếu PowerShell chặn script:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File Scripts\run_frontend.ps1
```

Frontend chạy tại:

```text
http://localhost:5173/dang-nhap
```

## Tài Khoản Demo

Mật khẩu chung:

```text
Hicas@123
```

| Vai trò | Email | Mã nhân viên | Ghi chú |
| --- | --- | --- | --- |
| Admin | `admin@hicas.com.vn` | `NV002` | Quản trị hệ thống, phân quyền |
| HCNS | `hcns@hicas.com.vn` | `NV001` | Quản lý nhân sự, duyệt, báo cáo |
| Quản lý | `quanly@hicas.com.vn` | `NV003` | Luồng quản lý cấp trung |
| Nhân viên | `nhanvien@hicas.com.vn` | `NV004` | Luồng nhân viên tự phục vụ |

Seed còn có các tài khoản nhân viên `NV005` đến `NV018`, dùng email trong hồ sơ nhân sự và cùng mật khẩu `Hicas@123`. Hai hồ sơ `NV019`, `NV020` là nhân sự đã nghỉ nên tài khoản bị khóa.

## Dữ Liệu Mẫu

Dữ liệu trong `Database/seed/seed_data.py` gồm:

- 20 hồ sơ nhân sự.
- 18 nhân sự đang làm việc, 2 nhân sự đã nghỉ.
- Hồ sơ có ngành nghề, trình độ học vấn, chuyên môn, trường học, kỹ năng, chứng chỉ, ngoại ngữ, tin học, kinh nghiệm.
- Hợp đồng lao động có link file mẫu.
- Quỹ phép, đơn nghỉ phép chờ duyệt/đã duyệt/từ chối/hủy.
- Bảng công tháng `07/2026` theo nhiều dự án.
- Thông báo cá nhân và thông báo chưa đọc.
- Tài sản, cấp phát, thu hồi, biên bản giao nhận.
- Phòng họp, lịch họp, thành viên lịch họp, luồng duyệt/từ chối/can thiệp.
- Báo cáo thống kê tháng `07/2026` với số liệu demo thực tế hơn.

## Luồng Demo Gợi Ý

### Hồ Sơ Nhân Sự

1. Đăng nhập `hcns@hicas.com.vn`.
2. Vào `Hồ sơ nhân sự`.
3. Kiểm tra danh sách 20 nhân sự.
4. Chọn một nhân sự để xem thông tin cá nhân, liên hệ, học vấn, kỹ năng, hợp đồng và file hợp đồng.

### Nghỉ Phép

1. Đăng nhập `nhanvien@hicas.com.vn`.
2. Vào `Nghỉ phép > Tạo đơn phép`.
3. Tạo đơn nghỉ phép.
4. Đăng nhập `hcns@hicas.com.vn`.
5. Vào `Nghỉ phép > Danh sách đơn`.
6. Duyệt hoặc từ chối đơn.

### Chấm Công

1. Đăng nhập HCNS hoặc Quản lý.
2. Vào `Chấm công`.
3. Chọn tháng `07/2026`.
4. Xem bảng công, chi tiết bảng công, số giờ logtime, giờ thực tế, số lần đi muộn.

Tạo lại file mẫu import chấm công:

```powershell
.\Scripts\create_attendance_templates.ps1
```

File được tạo trong `Database/templates/`.

### Tài Sản

1. Vào `Tài sản`.
2. Xem danh sách tài sản.
3. Cấp phát tài sản cho nhân viên.
4. Thu hồi tài sản và nhập tình trạng thu hồi.
5. Kiểm tra lịch sử giao nhận theo phân quyền.

### Phòng Họp

1. Vào `Phòng họp`.
2. Tạo lịch họp mới, chọn phòng và thành viên.
3. Vào màn duyệt lịch họp bằng HCNS/Admin.
4. Duyệt, từ chối hoặc can thiệp lịch họp.

### Báo Cáo

1. Vào `Báo cáo`.
2. Chọn kỳ `01/07/2026 - 31/07/2026`.
3. Xem 4 loại báo cáo:
   - Hành chính
   - Hiệu suất
   - Tổng hợp
   - Quản trị
4. Xuất Excel/PDF nếu cần.

Số liệu mẫu kỳ `07/2026`:

- 18 nhân viên đang làm.
- 2 nhân viên đã nghỉ.
- 4 hợp đồng còn hiệu lực sắp hết hạn.
- 3 đơn nghỉ việc trong kỳ.
- 7 dự án có dữ liệu chấm công.
- 22 tài sản đang sử dụng.
- 10 tài sản sẵn sàng.
- 19 lịch họp trong kỳ.

## Build Và Kiểm Tra

Frontend:

```powershell
cd Frontend
npm run build
```

Backend import check:

```powershell
.\.venv\Scripts\python.exe -c "import sys; sys.path.insert(0, 'Backend'); import app.main; print('backend ok')"
```

## Chạy Với MySQL

SQLite demo là luồng khuyến nghị để demo nhanh. Nếu cần MySQL:

1. Tạo database:

```sql
CREATE DATABASE datn_hrm0 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Cấu hình biến môi trường:

```powershell
$env:DB_URL = "mysql+pymysql://root:password@localhost:3306/datn_hrm0"
$env:ENVIRONMENT = "dev"
```

3. Chạy backend:

```powershell
.\.venv\Scripts\python.exe Backend\tools\run_demo_backend.py
```

4. Seed dữ liệu vào MySQL:

```powershell
$env:DB_URL = "mysql+pymysql://root:password@localhost:3306/datn_hrm0"
$env:ENVIRONMENT = "seed"
.\.venv\Scripts\python.exe Database\seed\seed_data.py
```

## Lỗi Thường Gặp

### Không Đăng Nhập Được

Kiểm tra:

- Backend đang chạy tại `http://127.0.0.1:8000`.
- Frontend đang chạy tại `http://localhost:5173`.
- Đã chạy `.\Scripts\seed_database.ps1`.
- Dùng đúng tài khoản, ví dụ `hcns@hicas.com.vn` / `Hicas@123`.

### Port Đã Được Sử Dụng

```powershell
netstat -ano | Select-String ":8000"
netstat -ano | Select-String ":5173"
Stop-Process -Id <PID> -Force
```

### Muốn Làm Mới Lại Data Demo

```powershell
.\Scripts\seed_database.ps1
```

Sau đó restart backend.

## Ghi Chú

- File `.venv`, `node_modules`, `dist`, log và cache không nằm trong cấu trúc nguồn. Có thể tạo lại bằng các lệnh cài đặt ở trên.
- Backend serve file upload từ `Backend/uploads` qua endpoint `/uploads`.
- Dữ liệu demo chính nằm ở `Database/seed/seed_data.py`.
- Không dùng các file launcher tạm kiểu `.codex-run-*.cmd`; thay bằng script rõ tên trong `Scripts/`.
