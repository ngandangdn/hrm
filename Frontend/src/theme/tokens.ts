import type { ThemeConfig } from 'antd';

export const designTokens = {
  colorPrimary: '#3454d1',
  colorPrimaryHover: '#2544b8',
  colorBgLayout: '#f3f6fb',
  colorBorder: '#d9e2ef',
  colorText: '#0f172a',
  colorTextSecondary: '#64748b',
  borderRadius: 8,
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
      borderRadius: 8,
      controlHeight: 48,
      fontWeight: 600,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 48,
    },
    Layout: {
      bodyBg: designTokens.colorBgLayout,
      headerBg: '#ffffff',
      siderBg: '#ffffff',
    },
    Menu: {
      itemBorderRadius: 8,
      itemSelectedBg: designTokens.colorPrimary,
      itemSelectedColor: '#ffffff',
      itemColor: '#334155',
      itemHoverBg: '#edf3ff',
      itemHoverColor: designTokens.colorPrimary,
    },
  },
};
