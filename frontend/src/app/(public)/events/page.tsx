import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Events" };

const SAMPLE_EVENTS = [
  {
    id: "1",
    title: "National Workers Convention 2026",
    date: "2026-06-21",
    location: "Bhrikutimandap, Kathmandu",
    type: "CONFERENCE",
  },
  {
    id: "2",
    title: "OSH Awareness Workshop",
    date: "2026-06-28",
    location: "Birgunj, Province 2",
    type: "WORKSHOP",
  },
  {
    id: "3",
    title: "Migrant Workers Rights Rally",
    date: "2026-07-05",
    location: "Maitighar, Kathmandu",
    type: "RALLY",
  },
];

export default function PublicEventsPage() {
  return (
    <div className="container py-12">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upcoming Events</h1>
          <p className="mt-2 text-muted-foreground">
            Workshops, rallies and conventions across Nepal.
          </p>
        </div>
        <Button asChild>
          <Link href="/register">Register to Attend</Link>
        </Button>
      </header>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SAMPLE_EVENTS.map((e) => (
          <Card key={e.id} className="overflow-hidden">
            <div className="h-32 gradient-union" aria-hidden />
            <CardHeader>
              <Badge variant="govt" className="w-fit">
                {e.type}
              </Badge>
              <CardTitle className="mt-2 line-clamp-2">{e.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(e.date).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {e.location}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
