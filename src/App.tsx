import { App as AntdApp, ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import type { ReactNode } from 'react';

import { antdTheme } from '@/theme/tokens';

type AppProps = {
  children: ReactNode;
};

export default function App({ children }: AppProps) {
  return (
    <ConfigProvider locale={viVN} theme={antdTheme}>
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  );
}
