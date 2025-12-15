import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatCurrency, getDaysRemaining } from "@/lib/utils";
import { Calendar, TrendingUp, CheckCircle } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      userId: session.user.id,
      status: "ACTIVE",
      endDate: { gte: new Date() },
    },
    include: { package: true },
    orderBy: { endDate: "desc" },
  });

  const pendingPayments = await prisma.payment.count({
    where: {
      userId: session.user.id,
      status: "PENDING",
    },
  });

  const todayResults = await prisma.result.count({
    where: {
      date: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Welcome back, {session.user.name}!</h2>
        <p className="text-muted-foreground">Here's your account overview</p>
      </div>

      {activeSubscription ? (
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Active Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-lg font-semibold">{activeSubscription.package.name}</p>
            <p className="text-blue-100">
              {getDaysRemaining(activeSubscription.endDate)} days remaining
            </p>
            <p className="text-sm text-blue-100">
              Valid until {activeSubscription.endDate?.toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Active Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Subscribe now to access daily predictions and past results
            </p>
            <Link href="/subscription">
              <Button>View Subscription Plans</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's Results
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayResults}</div>
            <Link href="/results">
              <Button variant="link" className="px-0">
                View all results
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Predictions Available
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeSubscription ? "Yes" : "No"}
            </div>
            <Link href="/predictions">
              <Button variant="link" className="px-0">
                View predictions
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments}</div>
            {pendingPayments > 0 && (
              <p className="text-sm text-muted-foreground">
                Awaiting admin approval
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
