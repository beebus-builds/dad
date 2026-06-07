import Link from "next/link";
import { ArrowLeft, MessageSquare, Paperclip, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/dashboard/page-header";
import { getInitials } from "@/lib/utils";

export default function ComplaintDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="CMP-2104"
        description="Wage withheld for 3 months · Filed by Ram Bahadur Shrestha"
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/complaints">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
          </Button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              The employer has not paid wages for the last three months despite multiple verbal
              requests. The total amount owed is approximately NPR 75,000. The worker has provided
              salary slips and timesheets as evidence.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="warning">High Priority</Badge>
              <Badge variant="outline">WAGES</Badge>
              <Badge variant="secondary">In Review</Badge>
            </div>
            <Separator />
            <h3 className="font-semibold">Timeline</h3>
            <ul className="space-y-3">
              {[
                { who: "Branch Admin", what: "Assigned to legal advisor", when: "2 hours ago" },
                { who: "System", what: "Auto-escalated to district level", when: "5 hours ago" },
                { who: "Ram Shrestha", what: "Filed complaint", when: "Yesterday" },
              ].map((t, idx) => (
                <li key={idx} className="flex gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary" aria-hidden />
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">{t.who}</span> · {t.what}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.when}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Separator />
            <div className="space-y-3">
              <h3 className="font-semibold">Add update</h3>
              <Textarea rows={4} placeholder="Add a comment, request info or mark resolved…" />
              <div className="flex gap-2">
                <Button>
                  <MessageSquare className="h-4 w-4" /> Post update
                </Button>
                <Button variant="outline">
                  <Paperclip className="h-4 w-4" /> Attach file
                </Button>
                <Button variant="success" className="ml-auto">
                  Mark Resolved
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assigned To</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{getInitials("Hari Thapa")}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">Hari Thapa</p>
                <p className="text-xs text-muted-foreground">District Legal Advisor</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Member</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" /> Ram Bahadur Shrestha
              </div>
              <div className="text-xs text-muted-foreground">SJ-10240 · Kathmandu Central</div>
              <Button variant="outline" size="sm" className="mt-2 w-full" asChild>
                <Link href="/dashboard/members/mem-1">View profile</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
