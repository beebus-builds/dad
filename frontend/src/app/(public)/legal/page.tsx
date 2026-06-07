import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Legal Aid" };

export default function LegalPage() {
  return (
    <div className="container py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight">Labour Legal Aid</h1>
        <p className="mt-3 text-muted-foreground">
          Our network of advocates assists members with foreign employment grievances, workplace
          disputes, occupational safety claims, and collective bargaining.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {["Foreign Employment", "Labour Disputes", "OSH Incidents", "Collective Bargaining"].map(
            (k) => (
              <Card key={k}>
                <CardHeader>
                  <CardTitle>{k}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Submit your case and a vetted labour advocate will follow up within 48 hours.
                </CardContent>
              </Card>
            ),
          )}
        </div>
        <div className="mt-10 rounded-xl border bg-muted/30 p-8 text-center">
          <h2 className="text-2xl font-semibold">Need help now?</h2>
          <p className="mt-2 text-muted-foreground">
            Members can file complaints from their dashboard. New here? Create your free account.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Button asChild>
              <a href="/register">Create account</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/contact">Talk to us</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
