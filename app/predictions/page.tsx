import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Lock } from "lucide-react";

export default async function PredictionsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      userId: session.user.id,
      status: "ACTIVE",
      endDate: { gte: new Date() },
    },
  });

  if (!activeSubscription) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">Predictions</h2>
        <Card className="max-w-2xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Subscription Required</CardTitle>
            </div>
            <CardDescription>
              Access daily predictions based on advanced frequency analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Subscribe to unlock:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Common numbers (top 10 frequently appearing)</li>
              <li>Direct numbers (recent high-frequency matches)</li>
              <li>House numbers (consistent patterns)</li>
              <li>Ending numbers (last digit analysis)</li>
              <li>Hot numbers (trending recently)</li>
              <li>Cold numbers (due to appear)</li>
            </ul>
            <Link href="/subscription">
              <Button>Subscribe Now</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const predictions = await prisma.prediction.findMany({
    where: {
      date: { gte: today },
    },
    include: {
      house: { select: { name: true } },
    },
    orderBy: { house: { name: "asc" } },
  });

  function NumberBadge({ number }: { number: number }) {
    return (
      <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-blue-100 text-blue-800 font-semibold text-sm">
        {number}
      </span>
    );
  }

  function PredictionSection({ title, numbers }: { title: string; numbers: number[] }) {
    return (
      <div className="space-y-2">
        <h4 className="font-medium text-sm text-muted-foreground">{title}</h4>
        <div className="flex flex-wrap gap-2">
          {numbers.map((num, idx) => (
            <NumberBadge key={idx} number={num} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Today's Predictions</h2>
        <p className="text-muted-foreground">Based on 30-day frequency analysis</p>
      </div>

      {predictions.map((prediction) => (
        <Card key={prediction.id}>
          <CardHeader>
            <CardTitle>{prediction.house.name}</CardTitle>
            <CardDescription>
              Generated on {prediction.generatedAt.toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="first">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="first">First Round</TabsTrigger>
                <TabsTrigger value="second">Second Round</TabsTrigger>
              </TabsList>
              <TabsContent value="first" className="space-y-4">
                <PredictionSection
                  title="Common Numbers (Top 10)"
                  numbers={JSON.parse(prediction.commonFirst)}
                />
                <PredictionSection
                  title="Direct Numbers"
                  numbers={JSON.parse(prediction.directFirst)}
                />
                <PredictionSection
                  title="House Numbers"
                  numbers={JSON.parse(prediction.houseFirst)}
                />
                <PredictionSection
                  title="Ending Numbers"
                  numbers={JSON.parse(prediction.endingFirst)}
                />
                <PredictionSection
                  title="Hot Numbers"
                  numbers={JSON.parse(prediction.hotFirst)}
                />
                <PredictionSection
                  title="Cold Numbers"
                  numbers={JSON.parse(prediction.coldFirst)}
                />
              </TabsContent>
              <TabsContent value="second" className="space-y-4">
                <PredictionSection
                  title="Common Numbers (Top 10)"
                  numbers={JSON.parse(prediction.commonSecond)}
                />
                <PredictionSection
                  title="Direct Numbers"
                  numbers={JSON.parse(prediction.directSecond)}
                />
                <PredictionSection
                  title="House Numbers"
                  numbers={JSON.parse(prediction.houseSecond)}
                />
                <PredictionSection
                  title="Ending Numbers"
                  numbers={JSON.parse(prediction.endingSecond)}
                />
                <PredictionSection
                  title="Hot Numbers"
                  numbers={JSON.parse(prediction.hotSecond)}
                />
                <PredictionSection
                  title="Cold Numbers"
                  numbers={JSON.parse(prediction.coldSecond)}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ))}

      {predictions.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No predictions available yet. Check back later.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
