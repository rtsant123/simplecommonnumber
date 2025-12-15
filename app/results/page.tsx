import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

export default async function ResultsPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const latestResults = await prisma.result.findMany({
    where: {
      date: { gte: today },
    },
    include: {
      house: { select: { name: true } },
    },
    orderBy: [{ date: "desc" }, { house: { name: "asc" } }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Latest Results</h2>
        <p className="text-muted-foreground">Free access to today's results</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Results</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>House</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>First Round (FR)</TableHead>
                <TableHead>Second Round (SR)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {latestResults.map((result) => (
                <TableRow key={result.id}>
                  <TableCell className="font-medium">{result.house.name}</TableCell>
                  <TableCell>{formatDate(result.date)}</TableCell>
                  <TableCell>
                    {result.firstRound !== null ? (
                      <span className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 text-blue-800 font-bold text-lg">
                        {result.firstRound}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Pending</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {result.secondRound !== null ? (
                      <span className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-green-100 text-green-800 font-bold text-lg">
                        {result.secondRound}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Pending</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {latestResults.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No results available for today yet
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
