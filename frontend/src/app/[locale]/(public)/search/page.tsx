"use client";

import { use, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/lib/i18n-navigation";
import { Search, Loader2, ArrowRight, FileText, Calendar, Newspaper } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    if (!q) { setResults([]); return; }
    setLoading(true);
    publicService.search(q).then(setResults).catch(() => setResults([])).finally(() => setLoading(false));
  }, [q]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="container py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t("search")}</h1>
      </header>
      <form onSubmit={handleSearch} className="mb-8 flex gap-2">
        <Input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("search")} className="max-w-md" />
        <Button type="submit" disabled={!query.trim()}>
          <Search className="mr-2 h-4 w-4" />
          {t("search")}
        </Button>
      </form>
      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("loading")}
        </div>
      ) : !q ? (
        <p className="py-12 text-center text-muted-foreground">{t("search")}</p>
      ) : results.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">{t("noResults")}</p>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{t("total")}: {results.length}</p>
          {results.map((r) => {
            const Icon = TYPE_ICON[r.type];
            const href = r.type === "news" ? `/news/${r.slug}` : r.type === "event" ? `/events` : `/documents`;
            return (
              <Link key={`${r.type}-${r.id}`} href={href}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <Badge variant={TYPE_BADGE[r.type]} className="capitalize">{r.type}</Badge>
                    </div>
                    <CardTitle className="mt-2 text-lg">{r.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{r.excerpt}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
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
