import { ToolOutlined } from '@ant-design/icons';

type ComingSoonPageProps = {
  moduleName: string;
};

export default function ComingSoonPage({ moduleName }: ComingSoonPageProps) {
  return (
    <div className="flex min-h-[calc(100vh-144px)] flex-col items-center justify-center gap-4 text-hicas-muted">
      <ToolOutlined className="text-6xl text-hicas-primary" />
      <h2 className="m-0 text-xl font-semibold text-hicas-text">{moduleName}</h2>
      <p className="m-0 text-sm">Module này đang được phát triển</p>
    </div>
  );
}
