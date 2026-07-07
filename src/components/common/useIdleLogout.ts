import { message } from 'antd';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/stores/authStore';

const IDLE_TIMEOUT_MS = 30 * 60 * 1000;

export function useIdleLogout() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  useEffect(() => {
    let timerId: number;

    const resetTimer = () => {
      window.clearTimeout(timerId);
      timerId = window.setTimeout(() => {
        logout();
        message.warning('Phiên đăng nhập đã hết hạn do không hoạt động');
        navigate('/dang-nhap', { replace: true });
      }, IDLE_TIMEOUT_MS);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach((eventName) => window.addEventListener(eventName, resetTimer));
    resetTimer();

    return () => {
      window.clearTimeout(timerId);
      events.forEach((eventName) => window.removeEventListener(eventName, resetTimer));
    };
  }, [logout, navigate]);
}
