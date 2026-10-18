import { HoldingDetail } from '@/features/holdings/components/holding-detail';

export default async function HoldingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <HoldingDetail id={id} />;
}
