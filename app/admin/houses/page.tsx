import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Plus } from "lucide-react";
import { HouseActions } from "./house-actions";

export default async function HousesPage() {
  const houses = await prisma.house.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { results: true, predictions: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Houses</h2>
        <Link href="/admin/houses/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add House
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Houses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Results</TableHead>
                <TableHead>Predictions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {houses.map((house) => (
                <TableRow key={house.id}>
                  <TableCell className="font-medium">{house.name}</TableCell>
                  <TableCell>{house.description || "-"}</TableCell>
                  <TableCell>{house._count.results}</TableCell>
                  <TableCell>{house._count.predictions}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        house.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {house.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <HouseActions house={house} />
                  </TableCell>
                </TableRow>
              ))}
              {houses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No houses found. Create your first house to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
