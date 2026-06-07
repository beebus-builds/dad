import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HandHeart } from "lucide-react";

export const metadata: Metadata = { title: "Donate" };

const AMOUNTS = [500, 1000, 2500, 5000, 10000];

export default function DonatePage() {
  return (
    <div className="container py-16">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-union-red/10 p-3 text-union-red">
            <HandHeart className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Support the movement</h1>
        </div>
        <p className="mt-3 text-muted-foreground">
          Your donation funds legal aid, training and migrant worker support. Every rupee builds
          a stronger Nepalese labour movement.
        </p>
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Make a donation</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {AMOUNTS.map((a) => (
                  <Button key={a} variant="outline" type="button">
                    NPR {a.toLocaleString()}
                  </Button>
                ))}
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom">Custom amount (NPR)</Label>
                <Input id="custom" type="number" min={100} placeholder="500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="donor">Your name</Label>
                <Input id="donor" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="donor-email">Email</Label>
                <Input id="donor-email" type="email" required />
              </div>
              <Button type="submit" variant="union" className="w-full">
                Donate now
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
