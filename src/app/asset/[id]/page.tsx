import { redirect } from "next/navigation";

export default async function OldAssetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/dashboard/assets/${id}`);
}
