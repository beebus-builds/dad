import { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { api } from "@/lib/api-client";
import { notFound } from "next/navigation";
import { DhakaPattern } from "@/components/decorative-pattern";

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
    next: { revalidate: 60 }
  });

  if (!res.ok) notFound();

  const json = await res.json();
  const page = json.data;

  return (
    <div className="relative min-h-screen">
      <DhakaPattern className="pointer-events-none absolute inset-0 text-union-red/5" />
      <div className="container relative z-10 py-16">
        <article className="mx-auto max-w-3xl space-y-8">
          <header className="space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              {page.title}
            </h1>
            <div className="mx-auto h-1 w-20 rounded-full bg-union-red" />
          </header>
          <div 
            className="prose prose-lg max-w-none dark:prose-invert" 
            dangerouslySetInnerHTML={{ __html: page.content }} 
          />
        </article>
      </div>
    </div>
  );
}
