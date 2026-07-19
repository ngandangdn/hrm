import { Tag } from 'antd';

import { lichHopStatusColor, lichHopStatusLabel } from './utils';

type Props = {
  status: number;
};

export default function TrangThaiLichHopTag({ status }: Props) {
  return <Tag color={lichHopStatusColor(status)}>{lichHopStatusLabel(status)}</Tag>;
}
