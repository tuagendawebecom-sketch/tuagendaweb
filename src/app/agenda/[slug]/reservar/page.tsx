import { notFound, redirect } from "next/navigation";
import { getBusinessBySlug } from "@/lib/firebase/business";
import { isValidSlug } from "@/lib/slug";

type ReservarPageProps = Readonly<{
  params: Promise<{ slug: string }>;
}>;

export const dynamic = "force-dynamic";

export default async function ReservarPage({ params }: ReservarPageProps) {
  const { slug } = await params;

  if (!isValidSlug(slug)) notFound();

  const business = await getBusinessBySlug(slug).catch(() => null);
  if (!business) notFound();

  redirect(`/${business.slug}`);
}
