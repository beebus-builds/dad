"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/lib/i18n-navigation";
import { Search, Loader2, ArrowRight, FileText, Calendar, Newspaper } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicPageHeader } from "@/components/public/public-page-header";
import { Badge } from "@/components/ui/badge";
import { publicService } from "@/services/public-service";
import { useRouter } from "@/lib/i18n-navigation";

type SearchResult = {
  type: "news" | "event" | "document";
  id: string;
  title: string;
  excerpt: string;
  slug?: string;
  createdAt: string;
};

const TYPE_ICON = { news: Newspaper, event: Calendar, document: FileText };
const TYPE_BADGE = { news: "union", event: "govt", document: "secondary" } as const;

export default function SearchPage() {
  const t = useTranslations("common");
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get("q") || "";
  const [query, setQuery] = useState(q);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) {
      setResults([]);
      return;
    }
    setLoading(true);
    publicService
      .search(q)
      .then(setResults)
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [q]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="container space-y-8 py-12 sm:py-16">
      <PublicPageHeader eyebrow="खोज" title={t("search")} icon={Search} />
      <form
        onSubmit={handleSearch}
        className="border-border/70 bg-card shadow-soft flex max-w-2xl flex-col gap-2 rounded-2xl border p-2 sm:flex-row"
      >
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search")}
          className="bg-muted/60 focus-visible:border-primary/40 focus-visible:bg-card h-11 border-transparent shadow-none"
        />
        <Button type="submit" className="h-11 sm:px-6" disabled={!query.trim()}>
          <Search className="mr-2 h-4 w-4" />
          {t("search")}
        </Button>
      </form>
      {loading ? (
        <div className="text-muted-foreground flex items-center justify-center py-12">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("loading")}
        </div>
      ) : !q ? (
        <p className="text-muted-foreground py-12 text-center">{t("search")}</p>
      ) : results.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center">{t("noResults")}</p>
      ) : (
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            {t("total")}: {results.length}
          </p>
          {results.map((r) => {
            const Icon = TYPE_ICON[r.type];
            const href =
              r.type === "news" ? `/news/${r.slug}` : r.type === "event" ? `/events` : `/documents`;
            return (
              <Link key={`${r.type}-${r.id}`} href={href}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Icon className="text-muted-foreground h-4 w-4" />
                      <Badge variant={TYPE_BADGE[r.type]} className="capitalize">
                        {r.type}
                      </Badge>
                    </div>
                    <CardTitle className="mt-2 text-lg">{r.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-2 text-sm">{r.excerpt}</p>
                    <div className="text-muted-foreground mt-2 flex items-center gap-2 text-xs">
                      {r.createdAt && <span>{new Date(r.createdAt).toLocaleDateString()}</span>}
                      <ArrowRight className="ml-auto h-3 w-3" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
