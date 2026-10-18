import { HoldingEditView } from '@/features/holdings/components/holding-edit-view';

export default async function HoldingEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <HoldingEditView id={id} />;
}
