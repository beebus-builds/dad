import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Membership" };

const TIERS = [
  {
    name: "Standard",
    price: "NPR 500 / year",
    features: ["Voting rights", "Event access", "Newsletter", "Branch participation"],
  },
  {
    name: "Lifetime",
    price: "NPR 5,000 once",
    features: ["All Standard benefits", "Lifetime membership card", "Priority legal aid"],
    featured: true,
  },
  {
    name: "Honorary",
    price: "By nomination",
    features: ["Advisory role", "Recognition certificate", "Event keynote opportunities"],
  },
];

export default function MembershipPage() {
  return (
    <div className="container py-16">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight">Membership</h1>
        <p className="mt-3 text-muted-foreground">
          Stand united with Nepal's workforce. Choose the membership tier that fits you.
        </p>
      </header>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {TIERS.map((t) => (
          <Card
            key={t.name}
            className={t.featured ? "border-primary shadow-md ring-1 ring-primary" : ""}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {t.name}
                {t.featured && (
                  <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
                    Popular
                  </span>
                )}
              </CardTitle>
              <p className="text-2xl font-bold">{t.price}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {t.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-primary">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
