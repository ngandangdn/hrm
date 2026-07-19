-- Demo data for local HRM flows.
-- Backend source remains unchanged; import this file manually after FastAPI has created tables.
-- Login accounts after import:
--   admin@hicas.vn    / Demo@123456
--   hcns@hicas.vn     / Demo@123456
--   nhanvien@hicas.vn / Nhanvien@123456

USE datn_hrm0;

INSERT INTO VaiTro (id_VaiTro, tenVaiTro, moTa) VALUES
  ('ADMIN', 'Quan tri he thong', 'Toan quyen he thong'),
  ('HCNS', 'Nhan su HCNS', 'Quan ly nhan su, phan quyen va phe duyet'),
  ('NV', 'Nhan vien', 'Nguoi dung nhan vien thong thuong')
ON DUPLICATE KEY UPDATE
  tenVaiTro = VALUES(tenVaiTro),
  moTa = VALUES(moTa);

INSERT INTO Quyen (id_Quyen, tenQuyen, moTa, hanhDong) VALUES
  ('Q_PHAN_QUYEN', 'Phan quyen', 'Xem va cap nhat vai tro tai khoan', 'phan_quyen'),
  ('Q_PHE_DUYET', 'Phe duyet yeu cau', 'Duyet hoac tu choi yeu cau cap nhat ho so', 'phe_duyet'),
  ('Q_DANH_MUC', 'Quan ly danh muc', 'CRUD danh muc dung chung', 'danh_muc'),
  ('Q_HO_SO_CA_NHAN', 'Ho so ca nhan', 'Xem va gui yeu cau cap nhat ho so', 'ho_so_ca_nhan'),
  ('Q_NGHI_VIEC', 'Nghi viec', 'Tao don va quyet dinh nghi viec', 'nghi_viec')
ON DUPLICATE KEY UPDATE
  tenQuyen = VALUES(tenQuyen),
  moTa = VALUES(moTa),
  hanhDong = VALUES(hanhDong);

INSERT INTO VaiTro_Quyen (id_VaiTro, id_Quyen) VALUES
  ('ADMIN', 'Q_PHAN_QUYEN'),
  ('ADMIN', 'Q_PHE_DUYET'),
  ('ADMIN', 'Q_DANH_MUC'),
  ('ADMIN', 'Q_HO_SO_CA_NHAN'),
  ('ADMIN', 'Q_NGHI_VIEC'),
  ('HCNS', 'Q_PHAN_QUYEN'),
  ('HCNS', 'Q_PHE_DUYET'),
  ('HCNS', 'Q_DANH_MUC'),
  ('HCNS', 'Q_HO_SO_CA_NHAN'),
  ('HCNS', 'Q_NGHI_VIEC'),
  ('NV', 'Q_HO_SO_CA_NHAN'),
  ('NV', 'Q_NGHI_VIEC')
ON DUPLICATE KEY UPDATE
  id_VaiTro = VALUES(id_VaiTro);

INSERT INTO TaiKhoan (id_TaiKhoan, email, matKhau, trangThai, id_VaiTro) VALUES
  ('ADMIN001', 'admin@hicas.vn', '$2b$12$6p95jmmaVZO1asNHR3MAuefpiyr4Cv8jr6r3dwJiQbkAgleIaCOkS', 1, 'ADMIN'),
  ('NV001', 'hcns@hicas.vn', '$2b$12$6p95jmmaVZO1asNHR3MAuefpiyr4Cv8jr6r3dwJiQbkAgleIaCOkS', 1, 'HCNS'),
  ('NV002', 'nhanvien@hicas.vn', '$2b$12$MIX5Hjkf2PTnMWMh0k8QMeuIkM5SptR2NptwZE/BsXBBMWD8/uHpm', 1, 'NV'),
  ('NV003', 'nhanvien2@hicas.vn', '$2b$12$MIX5Hjkf2PTnMWMh0k8QMeuIkM5SptR2NptwZE/BsXBBMWD8/uHpm', 1, 'NV')
ON DUPLICATE KEY UPDATE
  email = VALUES(email),
  matKhau = VALUES(matKhau),
  trangThai = VALUES(trangThai),
  id_VaiTro = VALUES(id_VaiTro);

INSERT INTO NhanVien (
  id_NhanVien, hoTen, email, sdt, maSoThue, gioiTinh, diaChi, ngaySinh, cccd, trangThaiLamViec, chucVu
) VALUES
  ('ADMIN001', 'Quản trị hệ thống', 'admin@hicas.vn', '0900000000', '0100000000', 'Nam', 'Hà Nội', '1990-01-01', '001090000000', 1, 'Admin'),
  ('NV001', 'Nguyễn Văn A', 'hcns@hicas.vn', '0901000001', '0100000001', 'Nam', 'Hà Nội', '1991-02-10', '001091000001', 1, 'Trưởng phòng HCNS'),
  ('NV002', 'Trần Thị B', 'nhanvien@hicas.vn', '0902000002', '0100000002', 'Nữ', 'Hà Nội', '1996-05-20', '001096000002', 1, 'Nhân viên Hành chính'),
  ('NV003', 'Lê Văn C', 'nhanvien2@hicas.vn', '0903000003', '0100000003', 'Nam', 'Hà Nội', '1997-09-15', '001097000003', 1, 'Nhân viên Vận hành')
ON DUPLICATE KEY UPDATE
  hoTen = VALUES(hoTen),
  email = VALUES(email),
  sdt = VALUES(sdt),
  maSoThue = VALUES(maSoThue),
  gioiTinh = VALUES(gioiTinh),
  diaChi = VALUES(diaChi),
  ngaySinh = VALUES(ngaySinh),
  cccd = VALUES(cccd),
  trangThaiLamViec = VALUES(trangThaiLamViec),
  chucVu = VALUES(chucVu);

INSERT INTO HopDong (id_HopDong, loaiHopDong, ngayBatDau, ngayKetThuc, trangThaiHopDong, tepHopDong, id_NhanVien) VALUES
  ('HD-ADMIN001', 'Không xác định thời hạn', '2022-01-01', NULL, 1, NULL, 'ADMIN001'),
  ('HD-NV001', 'Không xác định thời hạn', '2022-01-01', NULL, 1, NULL, 'NV001'),
  ('HD-NV002', 'Xác định thời hạn 12 tháng', '2024-01-01', '2026-12-31', 1, NULL, 'NV002'),
  ('HD-NV003', 'Xác định thời hạn 12 tháng', '2024-06-01', '2026-12-31', 1, NULL, 'NV003')
ON DUPLICATE KEY UPDATE
  loaiHopDong = VALUES(loaiHopDong),
  ngayBatDau = VALUES(ngayBatDau),
  ngayKetThuc = VALUES(ngayKetThuc),
  trangThaiHopDong = VALUES(trangThaiHopDong),
  tepHopDong = VALUES(tepHopDong),
  id_NhanVien = VALUES(id_NhanVien);

INSERT INTO QuyPhep (
  id_QuyPhep, id_NhanVien, nam, tongQuyPhep, soNgayDaDung, soNgayChoDuyet, ngayCapNhat, trangThai
) VALUES
  ('QP-NV001-2026', 'NV001', 2026, 12.0, 1.0, 0.0, '2026-07-10 08:00:00', 1),
  ('QP-NV002-2026', 'NV002', 2026, 12.0, 2.0, 1.0, '2026-07-10 08:00:00', 1),
  ('QP-NV003-2026', 'NV003', 2026, 12.0, 3.0, 0.0, '2026-07-10 08:00:00', 1)
ON DUPLICATE KEY UPDATE
  tongQuyPhep = VALUES(tongQuyPhep),
  soNgayDaDung = VALUES(soNgayDaDung),
  soNgayChoDuyet = VALUES(soNgayChoDuyet),
  ngayCapNhat = VALUES(ngayCapNhat),
  trangThai = VALUES(trangThai);

INSERT INTO DonNghiPhep (
  id_DonPhep, loaiPhep, ngayTao, tuNgay, denNgay, trangThai, lyDoTuChoi, lyDo, thoiGianDuyet, nguoiDuyet, id_NhanVien, id_QuyPhep
) VALUES
  ('DNP-DEMO-001', 'Phep nam', '2026-07-01 09:00:00', '2026-07-15', '2026-07-15', 0, NULL, 'Nghi viec gia dinh', NULL, 'PENDING', 'NV002', 'QP-NV002-2026'),
  ('DNP-DEMO-002', 'Phep nam', '2026-06-20 10:00:00', '2026-06-25', '2026-06-26', 1, NULL, 'Nghi phep ca nhan', '2026-06-21 08:30:00', 'NV001', 'NV003', 'QP-NV003-2026'),
  ('DNP-DEMO-003', 'Nghi om', '2026-05-12 14:00:00', '2026-05-13', '2026-05-13', 2, 'Chua bo sung xac nhan y te', 'Nghi om', '2026-05-12 16:00:00', 'NV001', 'NV002', 'QP-NV002-2026'),
  ('DNP-DEMO-004', 'Phep nam', '2026-04-01 08:20:00', '2026-04-05', '2026-04-05', 3, NULL, 'Huy do doi lich ca nhan', NULL, 'PENDING', 'NV002', 'QP-NV002-2026')
ON DUPLICATE KEY UPDATE
  loaiPhep = VALUES(loaiPhep),
  ngayTao = VALUES(ngayTao),
  tuNgay = VALUES(tuNgay),
  denNgay = VALUES(denNgay),
  trangThai = VALUES(trangThai),
  lyDoTuChoi = VALUES(lyDoTuChoi),
  lyDo = VALUES(lyDo),
  thoiGianDuyet = VALUES(thoiGianDuyet),
  nguoiDuyet = VALUES(nguoiDuyet),
  id_NhanVien = VALUES(id_NhanVien),
  id_QuyPhep = VALUES(id_QuyPhep);

INSERT INTO PhongHop (id_Phong, tenPhong, sucChua, trangThai, moTa) VALUES
  ('PH-101', 'Phong hop Hoa Sen', 12, 1, 'Phong hop nho tang 1'),
  ('PH-201', 'Phong hop Tre', 24, 1, 'Phong hop lon tang 2'),
  ('PH-301', 'Phong dao tao', 40, 1, 'Phong dao tao noi bo')
ON DUPLICATE KEY UPDATE
  tenPhong = VALUES(tenPhong),
  sucChua = VALUES(sucChua),
  trangThai = VALUES(trangThai),
  moTa = VALUES(moTa);

-- One pending profile update request for F2 approval flow.
INSERT INTO YeuCauCapNhatHoSo (id_YeuCau, ngayGui, trangThai, nguoiDuyet, thoiGianDuyet, ghiChu, id_NhanVien) VALUES
  ('YC-DEMO-001', '2026-07-10 08:30:00', 0, 'PENDING', NULL, NULL, 'NV002'),
  ('YC-DEMO-002', '2026-07-09 09:00:00', 1, 'NV001', '2026-07-09 10:00:00', 'Da duyet', 'NV003')
ON DUPLICATE KEY UPDATE
  ngayGui = VALUES(ngayGui),
  trangThai = VALUES(trangThai),
  nguoiDuyet = VALUES(nguoiDuyet),
  thoiGianDuyet = VALUES(thoiGianDuyet),
  ghiChu = VALUES(ghiChu),
  id_NhanVien = VALUES(id_NhanVien);

INSERT INTO ChiTietCapNhatHoSo (id_ChiTiet, id_YeuCau, tenTruong, nhomThongTin, giaTriCu, giaTriMoi, ghiChu) VALUES
  ('CT-DEMO-001', 'YC-DEMO-001', 'sdt', 'lien_he', '0902000002', '0988123456', 'Nhan vien cap nhat so dien thoai'),
  ('CT-DEMO-002', 'YC-DEMO-002', 'diaChi', 'lien_he', 'Ha Noi', 'Da Nang', 'Da duyet dia chi moi')
ON DUPLICATE KEY UPDATE
  id_YeuCau = VALUES(id_YeuCau),
  tenTruong = VALUES(tenTruong),
  nhomThongTin = VALUES(nhomThongTin),
  giaTriCu = VALUES(giaTriCu),
  giaTriMoi = VALUES(giaTriMoi),
  ghiChu = VALUES(ghiChu);

-- Demo resignation/offboarding data for F3 flows.
INSERT INTO DonNghiViec (
  id_DonNghiViec, ngayTao, ngayLamViecCuoi, lyDoNghiViec, noiDungBanGiao, trangThai, ghiChu, id_NhanVien
) VALUES
  ('DNV-DEMO-001', '2026-07-01 09:00:00', '2026-08-15', 'Ly do ca nhan', 'Ban giao tai lieu va tai khoan noi bo', 0, 'Cho HCNS xu ly', 'NV002'),
  ('DNV-DEMO-002', '2026-06-20 14:00:00', '2026-07-31', 'Chuyen noi cong tac', 'Ban giao cong viec cho quan ly truc tiep', 1, 'Da lap quyet dinh', 'NV003')
ON DUPLICATE KEY UPDATE
  ngayTao = VALUES(ngayTao),
  ngayLamViecCuoi = VALUES(ngayLamViecCuoi),
  lyDoNghiViec = VALUES(lyDoNghiViec),
  noiDungBanGiao = VALUES(noiDungBanGiao),
  trangThai = VALUES(trangThai),
  ghiChu = VALUES(ghiChu),
  id_NhanVien = VALUES(id_NhanVien);

INSERT INTO QuyetDinhNghiViec (
  id_QuyetDinh, soQuyetDinh, ngayKy, nguoiKy, lyDoNghiViec, tepQuyetDinh, id_DonNghiViec
) VALUES
  ('QDNV-DEMO-001', 'QD-2026-001', '2026-07-05', 'Nguyễn Van A', 'Chuyen noi cong tac', NULL, 'DNV-DEMO-002')
ON DUPLICATE KEY UPDATE
  soQuyetDinh = VALUES(soQuyetDinh),
  ngayKy = VALUES(ngayKy),
  nguoiKy = VALUES(nguoiKy),
  lyDoNghiViec = VALUES(lyDoNghiViec),
  tepQuyetDinh = VALUES(tepQuyetDinh),
  id_DonNghiViec = VALUES(id_DonNghiViec);
