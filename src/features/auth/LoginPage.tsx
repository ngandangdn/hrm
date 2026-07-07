import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, Typography, message } from 'antd';
import type { AxiosError } from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/stores/authStore';
import { useForgotPassword, useLogin, useResetPassword, useVerifyOtp } from './api';

const { Text, Title } = Typography;

type LoginFormValues = {
  email: string;
  matKhau: string;
};

type ForgotFormValues = {
  email: string;
  otp: string;
  matKhauMoi: string;
};

function getBackendError(error: unknown) {
  const axiosError = error as AxiosError<{ detail?: string; message?: string }>;
  return axiosError.response?.data?.detail ?? axiosError.response?.data?.message ?? 'Có lỗi xảy ra, vui lòng thử lại';
}

export default function LoginPage() {
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotForm] = Form.useForm<ForgotFormValues>();
  const navigate = useNavigate();
  const loginStore = useAuthStore((state) => state.login);
  const loginMutation = useLogin();
  const forgotMutation = useForgotPassword();
  const verifyOtpMutation = useVerifyOtp();
  const resetPasswordMutation = useResetPassword();

  const onLogin = async (values: LoginFormValues) => {
    try {
      const response = await loginMutation.mutateAsync(values);
      loginStore({ ...response.data, email: values.email });
      message.success('Đăng nhập thành công');
      navigate('/', { replace: true });
    } catch (error) {
      message.error(getBackendError(error));
    }
  };

  const requestOtp = async () => {
    const { email } = await forgotForm.validateFields(['email']);
    try {
      await forgotMutation.mutateAsync({ email });
      setForgotEmail(email);
      setForgotStep(2);
      message.success('OTP đã được gửi');
    } catch (error) {
      message.error(getBackendError(error));
    }
  };

  const resetPassword = async () => {
    const values = await forgotForm.validateFields(['otp', 'matKhauMoi']);
    try {
      await verifyOtpMutation.mutateAsync({ email: forgotEmail, otp: values.otp });
      await resetPasswordMutation.mutateAsync({
        email: forgotEmail,
        otp: values.otp,
        matKhauMoi: values.matKhauMoi,
      });
      message.success('Đổi mật khẩu thành công');
      setForgotOpen(false);
      setForgotStep(1);
      forgotForm.resetFields();
    } catch (error) {
      message.error(getBackendError(error));
    }
  };

  return (
    <>
      <section className="w-full max-w-[560px] rounded-[20px] bg-white px-10 py-12 shadow-hicas md:px-14">
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="mb-6 grid h-[60px] w-[60px] place-items-center rounded-[16px] bg-hicas-primary text-white shadow-lg">
            <LockOutlined className="text-3xl" />
          </div>
          <Title level={1} className="!mb-2 !text-[30px] !font-bold">
            HiCAS HRM
          </Title>
          <Text className="!text-base !text-[#3d344c]">Hệ thống Quản trị Nhân sự</Text>
        </div>

        <Form layout="vertical" requiredMark={false} onFinish={onLogin}>
          <Form.Item
            label={<span className="text-base text-hicas-text">Email / Tên đăng nhập</span>}
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không đúng định dạng' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Nhập email hoặc tên đăng nhập" />
          </Form.Item>

          <Form.Item
            label={<span className="text-base text-hicas-text">Mật khẩu</span>}
            name="matKhau"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>

          <div className="mb-9 flex justify-end">
            <Button
              type="link"
              className="!px-0 !font-semibold"
              onClick={() => {
                setForgotOpen(true);
                setForgotStep(1);
              }}
            >
              Quên mật khẩu?
            </Button>
          </div>

          <Button type="primary" htmlType="submit" block loading={loginMutation.isPending}>
            Đăng nhập
          </Button>
        </Form>
      </section>

      <Modal
        title="Quên mật khẩu"
        open={forgotOpen}
        okText={forgotStep === 1 ? 'Gửi OTP' : 'Đổi mật khẩu'}
        cancelText="Hủy"
        confirmLoading={forgotMutation.isPending || verifyOtpMutation.isPending || resetPasswordMutation.isPending}
        onOk={forgotStep === 1 ? requestOtp : resetPassword}
        onCancel={() => setForgotOpen(false)}
      >
        {/* Thiết kế modal quên mật khẩu chưa có file riêng; dùng AntD tối giản và token theme chung. */}
        <Form form={forgotForm} layout="vertical" requiredMark={false}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không đúng định dạng' },
            ]}
          >
            <Input disabled={forgotStep === 2} placeholder="Nhập email nhận OTP" />
          </Form.Item>
          {forgotStep === 2 && (
            <>
              <Form.Item name="otp" label="OTP" rules={[{ required: true, message: 'Vui lòng nhập OTP' }]}>
                <Input placeholder="Nhập mã OTP" />
              </Form.Item>
              <Form.Item
                name="matKhauMoi"
                label="Mật khẩu mới"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                  {
                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/,
                    message: 'Mật khẩu cần ít nhất 8 ký tự, gồm hoa, thường, số và ký tự đặc biệt',
                  },
                ]}
              >
                <Input.Password placeholder="Nhập mật khẩu mới" />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </>
  );
}
