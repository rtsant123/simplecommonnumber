import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatCurrency } from "@/lib/utils";
import { PaymentActions } from "./payment-actions";
import Image from "next/image";

export default async function PaymentsPage() {
  const payments = await prisma.payment.findMany({
    include: {
      user: { select: { name: true, email: true } },
      subscription: { include: { package: true } },
      paymentMethod: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const pending = payments.filter((p) => p.status === "PENDING");
  const approved = payments.filter((p) => p.status === "APPROVED");
  const rejected = payments.filter((p) => p.status === "REJECTED");

  function PaymentTable({ payments }: { payments: typeof pending }) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Package</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Proof</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{payment.user.name}</p>
                  <p className="text-sm text-muted-foreground">{payment.user.email}</p>
                </div>
              </TableCell>
              <TableCell>{payment.subscription.package.name}</TableCell>
              <TableCell>{formatCurrency(payment.amount)}</TableCell>
              <TableCell>{payment.paymentMethod.name}</TableCell>
              <TableCell>{formatDate(payment.createdAt)}</TableCell>
              <TableCell>
                <a
                  href={payment.proofImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  View Proof
                </a>
              </TableCell>
              <TableCell>
                <PaymentActions payment={payment} />
              </TableCell>
            </TableRow>
          ))}
          {payments.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No payments found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Payments</h2>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approved.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejected.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentTable payments={pending} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>Approved Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentTable payments={approved} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected">
          <Card>
            <CardHeader>
              <CardTitle>Rejected Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentTable payments={rejected} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
