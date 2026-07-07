import type { ThemeConfig } from 'antd';

export const designTokens = {
  colorPrimary: '#3f2be8',
  colorPrimaryHover: '#5345f0',
  colorBgLayout: '#f7f6f3',
  colorBorder: '#c8c4dc',
  colorText: '#111827',
  colorTextSecondary: '#6b7280',
  borderRadius: 12,
  fontFamily: 'Inter, Arial, sans-serif',
};

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: designTokens.colorPrimary,
    colorInfo: designTokens.colorPrimary,
    colorText: designTokens.colorText,
    colorTextSecondary: designTokens.colorTextSecondary,
    colorBorder: designTokens.colorBorder,
    colorBgLayout: designTokens.colorBgLayout,
    borderRadius: designTokens.borderRadius,
    fontFamily: designTokens.fontFamily,
    controlHeight: 48,
  },
  components: {
    Button: {
      borderRadius: 10,
      controlHeight: 48,
      fontWeight: 600,
    },
    Input: {
      borderRadius: 10,
      controlHeight: 48,
    },
    Layout: {
      bodyBg: designTokens.colorBgLayout,
      headerBg: '#ffffff',
      siderBg: '#ffffff',
    },
    Menu: {
      itemBorderRadius: 10,
      itemSelectedBg: designTokens.colorPrimary,
      itemSelectedColor: '#ffffff',
    },
  },
};
