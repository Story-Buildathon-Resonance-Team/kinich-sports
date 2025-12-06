import { redirect } from "next/navigation";

export default function OldAssetPage({ params }: { params: { id: string } }) {
  redirect(`/dashboard/assets/${params.id}`);
}
