import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/dashboard/page-header";
import { getInitials } from "@/lib/utils";

export default function MemberDetailPage({ params }: { params: { id: string } }) {
  const name = "Ram Bahadur Shrestha";
  return (
    <div className="space-y-6">
      <PageHeader
        title="Member Profile"
        description={`Detailed view for ${params.id}`}
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/members">
              <ArrowLeft className="h-4 w-4" /> Back to members
            </Link>
          </Button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="space-y-4 p-6 text-center">
            <Avatar className="mx-auto h-20 w-20">
              <AvatarFallback className="text-lg">{getInitials(name)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">{name}</h2>
              <p className="text-sm text-muted-foreground">SJ-10240</p>
            </div>
            <div className="flex justify-center gap-2">
              <Badge variant="success">Active</Badge>
              <Badge variant="outline">Lifetime</Badge>
            </div>
            <div className="space-y-2 pt-2 text-left text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> +977 98XXXXXXXX
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Kathmandu Central Branch
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Joined Jan 15, 2022
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="complaints">Complaints</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Member Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <Info label="Citizenship #" value="12-34-56-78901" />
                  <Info label="Date of Birth" value="1985-03-12" />
                  <Info label="Occupation" value="Garment Worker" />
                  <Info label="Employer" value="Himalayan Apparel" />
                  <Info label="Email" value="ram@example.com" />
                  <Info label="Province" value="Bagmati" />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="payments">
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  No payment records yet.
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="complaints">
              <Card>
                <CardHeader>
                  <CardTitle>Filed Complaints</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  This member has not filed any complaints.
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  No documents uploaded yet.
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}
