"use client";

import { use, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n-navigation";
import Image from "next/image";
import { Calendar, Eye, Share2, ArrowLeft, User, Newspaper } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PublicPageHeader } from "@/components/public/public-page-header";
import { Button } from "@/components/ui/button";
import { DetailSkeleton } from "@/components/page-skeleton";
import { publicService } from "@/services/public-service";
import { useLocaleFormat } from "@/lib/use-locale-format";
import type { News } from "@/types";

export default function PublicNewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const t = useTranslations("news");
  const tCommon = useTranslations("common");
  const { date } = useLocaleFormat();
  const { slug } = use(params);
  const [article, setArticle] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    publicService
      .newsDetail(slug)
      .then(setArticle)
      .catch(() => setArticle(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <DetailSkeleton />;

  if (!article)
    return (
      <div className="container py-24 text-center">
        <p className="text-muted-foreground text-lg">{tCommon("noResults")}</p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/news">{t("backToNews")}</Link>
        </Button>
      </div>
    );

  const categoryBadge = t(`categories.${article.category}` as Parameters<typeof t>[0]);

  return (
    <article className="container py-10 sm:py-14">
      <Link
        href="/news"
        className="text-muted-foreground hover:text-primary mx-auto mb-6 flex max-w-5xl items-center gap-2 text-sm font-semibold transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("backToNews")}
      </Link>

      <div className="mx-auto max-w-5xl">
        <PublicPageHeader
          eyebrow={categoryBadge}
          title={article.titleNepali || article.title}
          description={article.excerpt}
          icon={Newspaper}
        />
        <div className="border-border/70 bg-card text-muted-foreground shadow-soft mt-5 flex flex-wrap items-center gap-5 rounded-2xl border px-5 py-4 text-sm">
          {article.author?.name && (
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              <span className="text-foreground font-semibold">{article.author.name}</span>
            </span>
          )}
          {article.publishedAt && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {date(article.publishedAt)}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Eye className="h-4 w-4" />
            {t("views", { count: article.views })}
          </span>
        </div>
      </div>

      {article.coverImageUrl && (
        <div className="mb-12 w-full">
          <Image
            src={article.coverImageUrl}
            alt=""
            width={1280}
            height={720}
            className="shadow-card mx-auto aspect-video w-full max-w-5xl rounded-2xl object-cover"
          />
        </div>
      )}

      <div
        className="prose-editorial px-4 pb-16"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      <footer className="bg-muted/30 border-t py-12">
        <div className="mx-auto max-w-[720px] px-4">
          {article.tags && article.tags.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="rounded-full px-3">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {article.author && (
            <div className="bg-card shadow-soft mb-8 flex items-center gap-3 rounded-xl border p-4">
              <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">{article.author.name}</p>
                <p className="text-muted-foreground text-xs">Shram Jagaran Network</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigator.share?.({ url: window.location.href })}
            >
              <Share2 className="mr-1.5 h-4 w-4" />
              {t("share")}
            </Button>
          </div>
        </div>
      </footer>
    </article>
  );
}
