import { DeleteOutlined, DownloadOutlined, EditOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Empty, Input, Modal, Space, Table, Tooltip, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { AxiosError } from 'axios';
import { useMemo, useState } from 'react';

import { axiosClient } from '@/api/axiosClient';
import type { ApiResponse } from '@/types/common';
import DanhMucDrawer, { type FormField } from './DanhMucDrawer';
import ImportModal, { type ImportResult } from './ImportModal';

interface DanhMucTableProps<T extends Record<string, unknown>> {
  title: string;
  apiEndpoint: string;
  columns: ColumnsType<T>;
  formFields: FormField[];
  idField: keyof T;
  lockedFields?: (keyof T)[];
  pageSize?: number;
}

function getBackendMessage(error: unknown) {
  const axiosError = error as AxiosError<{ detail?: string; message?: string }>;
  return axiosError.response?.data?.detail ?? axiosError.response?.data?.message ?? 'Có lỗi xảy ra, vui lòng thử lại';
}

export default function DanhMucTable<T extends Record<string, unknown>>({
  title,
  apiEndpoint,
  columns,
  formFields,
  idField,
  lockedFields = [],
  pageSize = 20,
}: DanhMucTableProps<T>) {
  // Component nền tái sử dụng cho các danh mục sau: Loại phép, Chức vụ, Phòng ban...
  // Mỗi danh mục chỉ truyền columns/formFields/idField, không viết lại UI CRUD/import/export.
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [editing, setEditing] = useState<T | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult>();

  const queryKey = ['danh-muc', apiEndpoint, page, pageSize];
  const listQuery = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await axiosClient.get<ApiResponse<T[]>>(apiEndpoint, { params: { page, size: pageSize } });
      return response.data.data;
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['danh-muc', apiEndpoint] });

  const createMutation = useMutation({
    mutationFn: async (payload: Partial<T>) => {
      const response = await axiosClient.post<ApiResponse<T>>(apiEndpoint, payload);
      return response.data.data;
    },
    onSuccess: () => {
      message.success('Thêm mới danh mục thành công');
      setDrawerOpen(false);
      void invalidate();
    },
    onError: (error) => {
      if ((error as AxiosError).response?.status === 409) {
        message.error(getBackendMessage(error));
      } else {
        message.error(getBackendMessage(error));
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<T> }) => {
      const response = await axiosClient.put<ApiResponse<T>>(`${apiEndpoint}/${encodeURIComponent(id)}`, payload);
      return response.data.data;
    },
    onSuccess: () => {
      message.success('Cập nhật danh mục thành công');
      setDrawerOpen(false);
      setEditing(null);
      void invalidate();
    },
    onError: (error) => message.error(getBackendMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: async (item: T) => {
      const id = String(item[idField]);
      const response = await axiosClient.delete<ApiResponse<{ id: string }>>(`${apiEndpoint}/${encodeURIComponent(id)}`);
      return response.data.data;
    },
    onSuccess: () => {
      message.success('Xóa danh mục thành công');
      void invalidate();
    },
  });

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axiosClient.post<ApiResponse<ImportResult>>(`${apiEndpoint}/import`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    },
    onSuccess: (data) => {
      setImportResult(data);
      void invalidate();
    },
    onError: (error) => message.error(getBackendMessage(error)),
  });

  const data = useMemo(() => {
    const rows = listQuery.data ?? [];
    if (!keyword.trim()) return rows;
    const normalized = keyword.trim().toLowerCase();
    return rows.filter((row) => Object.values(row).some((value) => String(value ?? '').toLowerCase().includes(normalized)));
  }, [keyword, listQuery.data]);

  const exportFile = async () => {
    // Ngoại lệ hợp lệ duy nhất được phép gọi axiosClient trực tiếp: download blob cần responseType và trigger tải file.
    const response = await axiosClient.get(`${apiEndpoint}/export`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `danh-muc-${Date.now()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const tableColumns: ColumnsType<T> = [
    ...columns,
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Sửa">
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setEditing(record);
                setDrawerOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: 'Bạn có chắc muốn xóa?',
                  okText: 'Xóa',
                  cancelText: 'Hủy',
                  okButtonProps: { danger: true },
                  onOk: async () => {
                    try {
                      await deleteMutation.mutateAsync(record);
                    } catch (error) {
                      if ((error as AxiosError).response?.status === 409) {
                        Modal.error({
                          title: 'Không thể xóa danh mục',
                          content:
                            'Không thể xóa danh mục đang có dữ liệu liên kết. Bạn có thể chuyển sang trạng thái Ngừng hoạt động thay thế.',
                          okText: 'Chuyển trạng thái',
                          onOk: () =>
                            updateMutation.mutateAsync({
                              id: String(record[idField]),
                              payload: { trangThai: 0 } as unknown as Partial<T>,
                            }),
                        });
                        return;
                      }
                      message.error(getBackendMessage(error));
                    }
                  },
                });
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="m-0 text-2xl font-bold text-hicas-text">{title}</h1>
          <p className="m-0 mt-1 text-hicas-muted">Quản lý danh mục dùng chung trong hệ thống</p>
        </div>
        <Space wrap>
          <Input.Search allowClear placeholder="Tìm kiếm" className="w-[260px]" onSearch={setKeyword} onChange={(event) => setKeyword(event.target.value)} />
          <Button icon={<UploadOutlined />} onClick={() => setImportOpen(true)}>
            Import
          </Button>
          <Button icon={<DownloadOutlined />} onClick={() => void exportFile()}>
            Export
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditing(null);
              setDrawerOpen(true);
            }}
          >
            Thêm mới
          </Button>
        </Space>
      </div>

      <div className="hicas-card p-4">
        <Table
          rowKey={(record) => String(record[idField])}
          columns={tableColumns}
          dataSource={data}
          loading={listQuery.isLoading}
          locale={{
            // Thiết kế chưa có cho trạng thái này — dùng AntD default.
            emptyText: <Empty description="Không có dữ liệu" />,
          }}
          pagination={{
            current: page,
            pageSize,
            total: data.length < pageSize ? (page - 1) * pageSize + data.length : page * pageSize + 1,
            showSizeChanger: false,
            onChange: setPage,
          }}
        />
      </div>

      <DanhMucDrawer<T>
        open={drawerOpen}
        title={editing ? 'Sửa danh mục' : 'Thêm mới danh mục'}
        fields={formFields}
        initialValues={editing ?? undefined}
        lockedFields={lockedFields.map(String)}
        loading={createMutation.isPending || updateMutation.isPending}
        onClose={() => {
          setDrawerOpen(false);
          setEditing(null);
        }}
        onSubmit={async (values) => {
          if (editing) {
            await updateMutation.mutateAsync({ id: String(editing[idField]), payload: values });
            return;
          }
          await createMutation.mutateAsync(values);
        }}
      />

      <ImportModal
        open={importOpen}
        loading={importMutation.isPending}
        result={importResult}
        onClose={() => {
          setImportOpen(false);
          setImportResult(undefined);
        }}
        onImport={(file) => importMutation.mutateAsync(file).then(() => undefined)}
      />
    </div>
  );
}
