import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, ListChecks, Users, Wallet } from "lucide-react";

export default async function AdminDashboard() {
  const [housesCount, resultsCount, usersCount, pendingPayments] = await Promise.all([
    prisma.house.count(),
    prisma.result.count(),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.payment.count({ where: { status: "PENDING" } }),
  ]);

  const stats = [
    { name: "Total Houses", value: housesCount, icon: Building2 },
    { name: "Total Results", value: resultsCount, icon: ListChecks },
    { name: "Total Users", value: usersCount, icon: Users },
    { name: "Pending Payments", value: pendingPayments, icon: Wallet },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Dashboard</h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.name}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
