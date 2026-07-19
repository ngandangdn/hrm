import { Drawer, Form, Input, InputNumber, Select, Tooltip } from 'antd';
import { useEffect } from 'react';

export type FormField = {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'textarea' | 'select';
  required?: boolean;
  options?: { label: string; value: string | number }[];
};

type DanhMucDrawerProps<T extends Record<string, unknown>> = {
  open: boolean;
  title: string;
  fields: FormField[];
  initialValues?: Partial<T>;
  lockedFields?: string[];
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: Partial<T>) => Promise<void>;
};

export default function DanhMucDrawer<T extends Record<string, unknown>>({
  open,
  title,
  fields,
  initialValues,
  lockedFields = [],
  loading,
  onClose,
  onSubmit,
}: DanhMucDrawerProps<T>) {
  const [form] = Form.useForm();
  const isEditing = Boolean(initialValues);

  useEffect(() => {
    if (open) {
      form.setFieldsValue(initialValues ?? {});
    } else {
      form.resetFields();
    }
  }, [form, initialValues, open]);

  return (
    <Drawer
      title={title}
      open={open}
      width={460}
      onClose={onClose}
      destroyOnClose
      extra={
        <button
          className="rounded-lg border border-hicas-primary bg-hicas-primary px-5 py-2 font-semibold text-white disabled:opacity-60"
          disabled={loading}
          onClick={() => form.submit()}
        >
          {loading ? 'Đang lưu...' : 'Lưu'}
        </button>
      }
    >
      <Form form={form} layout="vertical" requiredMark={false} disabled={loading} onFinish={(values) => onSubmit(values as Partial<T>)}>
        {fields.map((field) => {
          const locked = isEditing && lockedFields.includes(field.name);
          const rules = field.required ? [{ required: true, message: `Vui lòng nhập ${field.label.toLowerCase()}` }] : undefined;
          const control =
            field.type === 'number' ? (
              <InputNumber min={1} className="w-full" disabled={locked} />
            ) : field.type === 'textarea' ? (
              <Input.TextArea rows={4} disabled={locked} />
            ) : field.type === 'select' ? (
              <Select options={field.options} disabled={locked} />
            ) : (
              <Input disabled={locked} />
            );

          return (
            <Form.Item key={field.name} name={field.name} label={field.label} rules={rules}>
              {locked ? (
                <Tooltip title="Mã danh mục không thể thay đổi sau khi tạo">{control}</Tooltip>
              ) : (
                control
              )}
            </Form.Item>
          );
        })}
      </Form>
    </Drawer>
  );
}
