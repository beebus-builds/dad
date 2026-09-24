import { api } from "@/lib/api-client";
import { notFound } from "next/navigation";
import { DhakaPattern } from "@/components/decorative-pattern";
import { PublicPageHeader } from "@/components/public/public-page-header";
import { FileText } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const { data } = await api.get(`/public/pages/${slug}`);
    return {
      title: `${data.title} · श्रम जागरण`,
      description: data.content.slice(0, 160).replace(/<[^>]*>/g, ""),
    };
  } catch {
    return { title: "पृष्ठ उपलब्ध छैन" };
  }
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/public/pages/${slug}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) notFound();

  const json = await res.json();
  const page = json.data;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <DhakaPattern className="text-union-red/5 pointer-events-none absolute inset-0" />
      <div className="relative z-10 container py-12 sm:py-16">
        <article className="mx-auto max-w-3xl space-y-8">
          <PublicPageHeader eyebrow="पृष्ठ" title={page.title} icon={FileText} />
          <div className="border-border/70 bg-card shadow-soft rounded-3xl border p-6 sm:p-10">
            <div
              className="prose prose-lg dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </div>
        </article>
      </div>
    </div>
  );
}
