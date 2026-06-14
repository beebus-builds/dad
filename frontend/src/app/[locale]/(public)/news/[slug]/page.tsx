"use client";

import { use, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n-navigation";
import Image from "next/image";
import { Calendar, Eye, Share2, ArrowLeft, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
    publicService.newsDetail(slug).then(setArticle).catch(() => setArticle(null)).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <DetailSkeleton />;

  if (!article) return (
    <div className="container py-24 text-center">
      <p className="text-muted-foreground text-lg">{tCommon("noResults")}</p>
      <Button asChild variant="link" className="mt-4"><Link href="/news">{t("backToNews")}</Link></Button>
    </div>
  );

  const categoryBadge = t(`categories.${article.category}` as Parameters<typeof t>[0]);

  return (
    <article>
      <Link href="/news" className="mx-auto mt-8 mb-6 flex max-w-[720px] items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />{t("backToNews")}
      </Link>

      <header className="mx-auto mb-10 max-w-[720px] px-4 text-center">
        <Badge variant="union" className="mb-4 w-fit mx-auto">{categoryBadge}</Badge>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl md:leading-tight">{article.titleNepali || article.title}</h1>
        {article.excerpt && (
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed">{article.excerpt}</p>
        )}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-sm text-muted-foreground">
          {article.author?.name && (
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              <span className="font-medium text-foreground">{article.author.name}</span>
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
      </header>

      {article.coverImageUrl && (
        <div className="mb-12 w-full">
          <Image
            src={article.coverImageUrl}
            alt=""
            width={1280}
            height={720}
            className="mx-auto aspect-video w-full max-w-5xl rounded-2xl object-cover shadow-card"
          />
        </div>
      )}

      <div
        className="prose-editorial px-4 pb-16"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      <footer className="border-t bg-muted/30 py-12">
        <div className="mx-auto max-w-[720px] px-4">
          {article.tags && article.tags.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-2">
              {article.tags.map((tag) => <Badge key={tag} variant="secondary" className="rounded-full px-3">{tag}</Badge>)}
            </div>
          )}

          {article.author && (
            <div className="mb-8 flex items-center gap-3 rounded-xl border bg-card p-4 shadow-soft">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">{article.author.name}</p>
                <p className="text-xs text-muted-foreground">Shram Jagaran Network</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigator.share?.({ url: window.location.href })}>
              <Share2 className="mr-1.5 h-4 w-4" />{t("share")}
            </Button>
          </div>
        </div>
      </footer>
    </article>
  );
}
