import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DemoPageTemplate } from "@/components/DemoPageTemplate";
import { demoBySlug, demoCategories, siteUrl } from "@/data/site";

type DemoPageProps = Readonly<{
  params: Promise<{ slug: string }>;
}>;

export function generateStaticParams() {
  return demoCategories.map((demo) => ({ slug: demo.slug }));
}

export async function generateMetadata({ params }: DemoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const demo = demoBySlug[slug];

  if (!demo) return {};

  return {
    title: `Demo para ${demo.title}`,
    description: `${demo.description} TuAgendaWeb para ${demo.category} con turnos online, reservas desde celular y panel simple.`,
    alternates: {
      canonical: `${siteUrl}/demos/${demo.slug}`
    },
    openGraph: {
      title: `Demo para ${demo.title} | TuAgendaWeb`,
      description: demo.description,
      url: `${siteUrl}/demos/${demo.slug}`,
      images: [
        {
          url: demo.cover,
          width: 1200,
          height: 750,
          alt: `Demo TuAgendaWeb para ${demo.title}`
        }
      ]
    }
  };
}

export default async function DemoPage({ params }: DemoPageProps) {
  const { slug } = await params;
  const demo = demoBySlug[slug];

  if (!demo) {
    notFound();
  }

  return <DemoPageTemplate demo={demo} />;
}
