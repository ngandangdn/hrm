# Huong dan chay va dang nhap demo

## Tai khoan demo

Sau khi import `docs/demo-data.sql` hoac chay `tools/setup_demo_sqlite.py`, co the dang nhap bang cac tai khoan sau:

| Vai tro | Email | Mat khau | Ghi chu |
| --- | --- | --- | --- |
| Admin | `admin@hicas.vn` | `Demo@123456` | Test phan quyen/toan quyen |
| HCNS | `hcns@hicas.vn` | `Demo@123456` | Test phan quyen, duyet yeu cau, danh muc |
| Nhan vien | `nhanvien@hicas.vn` | `Nhanvien@123456` | Test luong nhan vien |
| Nhan vien | `nhanvien2@hicas.vn` | `Nhanvien@123456` | Test luong nghi viec da co quyet dinh |

## Chay backend voi MySQL

1. Cai dependency Python:

```powershell
python -m pip install -r requirements.txt
```

Neu dung `passlib==1.7.4` va gap loi voi `bcrypt 5.x`, ha bcrypt ve ban tuong thich:

```powershell
python -m pip install --user "bcrypt<4.1" --force-reinstall
```

2. Dam bao MySQL dang chay va database URL dung voi `app/core/config.py`.
Mac dinh hien tai la:

```text
mysql+pymysql://root:password@localhost:3306/datn_hrm0
```

3. Chay backend:

```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Lan dau chay, backend se tao bang theo SQLModel trong moi truong dev.

## Import data mau MySQL

Sau khi backend da tao bang, import data mau:

```powershell
mysql -u root -p datn_hrm0 < docs/demo-data.sql
```

Neu MySQL khong nam trong PATH, mo MySQL Workbench, chon database `datn_hrm0`, mo file `docs/demo-data.sql` va chay script.

## Chay nhanh bang SQLite demo

Neu MySQL local chua dang nhap duoc, co the dung database demo SQLite ngoai backend:

```powershell
python tools/setup_demo_sqlite.py
$env:DB_URL = "sqlite:///./demo_hicas.db"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Luu y mo frontend bang `http://localhost:5173/dang-nhap` vi CORS backend dang cho phep origin `localhost:5173`.

## Chay frontend

```powershell
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

Mo trinh duyet:

```text
http://localhost:5173/dang-nhap
```

## Luong demo F1-F3

1. Dang nhap HCNS:
   - Email: `hcns@hicas.vn`
   - Mat khau: `Demo@123456`
2. Vao `Quan ly he thong > Phan quyen`.
   - Chon `NV002` hoac nhap ma nhan vien.
   - Doi vai tro va bam `Luu thay doi`.
3. Vao `Quan ly he thong > Duyet yeu cau`.
   - Se thay yeu cau mau `YC-DEMO-001`.
   - Mo chi tiet, phe duyet hoac tu choi.
4. Vao `Danh muc`.
   - Xem danh muc phong hop mau: `PH-101`, `PH-201`, `PH-301`.
   - Them/sua/xoa/import/export phong hop.
5. Vao cac man hinh ho so/nghi viec cua F3.
   - Ho so nhan vien mau: `NV001`, `NV002`, `NV003`.
   - Don nghi viec dang cho xu ly: `DNV-DEMO-001`.
   - Don nghi viec da lap quyet dinh: `DNV-DEMO-002`.
   - Quyet dinh nghi viec mau: `QDNV-DEMO-001`.

## Luu y contract

- File data mau nam trong `docs/` va `tools/`, khong phai migration/seed backend.
- Backend van la nguon contract chinh. Khong sua router/schema/model/service de chay frontend.
- Mat khau trong SQL/script da duoc hash bang bcrypt, khop voi `verify_password()` trong `app/core/security.py`.
