import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="container py-16">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-balance text-4xl font-bold tracking-tight">About Shram Jagaran</h1>
        <p className="text-lg text-muted-foreground">
          Shram Jagaran is a non-partisan platform born to serve Nepalese trade unions, workers and
          their advocates. We bring transparency, accountability and modern tooling to a movement
          that has shaped Nepal's social and economic story for generations.
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Deliver a digital backbone enabling every worker — from Kathmandu factories to Gulf
              workplaces — to access representation, justice and opportunity.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Our Vision</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              A Nepal where labour rights are upheld through unity, data and technology — and
              every worker's voice is heard.
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Stakeholders</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid list-disc gap-1 pl-5 text-sm text-muted-foreground sm:grid-cols-2">
              <li>National Union Leadership</li>
              <li>Province Committees</li>
              <li>District Branches</li>
              <li>Members and Workers</li>
              <li>Legal Advisors</li>
              <li>Public and Donors</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
