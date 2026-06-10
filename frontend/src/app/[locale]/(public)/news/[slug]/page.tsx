"use client";

import { use, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n-navigation";
import { Calendar, Eye, Share2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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

  if (loading) return <div className="container py-12"><Skeleton className="h-8 w-64 mb-4" /><Skeleton className="h-4 w-96 mb-8" /><Skeleton className="h-64 w-full" /></div>;

  if (!article) return (
    <div className="container py-16 text-center">
      <p className="text-muted-foreground">{tCommon("noResults")}</p>
      <Button asChild variant="link" className="mt-4"><Link href="/news">{t("backToNews")}</Link></Button>
    </div>
  );

  return (
    <article className="container py-12">
      <Link href="/news" className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">{t("backToNews")}</Link>
      <header className="mb-8">
        <Badge variant="union" className="mb-3 w-fit">{t(`categories.${article.category}` as Parameters<typeof t>[0])}</Badge>
        <h1 className="text-4xl font-bold tracking-tight">{article.titleNepali || article.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {article.publishedAt && <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{date(article.publishedAt)}</span>}
          {article.author?.name && <span>{article.author.name}</span>}
          <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{t("views", { count: article.views })}</span>
        </div>
      </header>
      {article.coverImageUrl && <img src={article.coverImageUrl} alt="" className="mb-8 aspect-video w-full rounded-lg object-cover" />}
      <div className="prose prose-neutral max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
      {article.tags && article.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2 border-t pt-6">
          {article.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
        </div>
      )}
      <div className="mt-8 flex items-center gap-4 border-t pt-6">
        <Button variant="outline" size="sm" onClick={() => navigator.share?.({ url: window.location.href })}>
          <Share2 className="mr-1 h-4 w-4" />{t("share")}
        </Button>
      </div>
    </article>
  );
}
