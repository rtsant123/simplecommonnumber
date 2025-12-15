import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    if (session.user.role === "ADMIN") {
      redirect("/admin");
    } else {
      redirect("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">Teer Predictions</h1>
          <div className="flex gap-2">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4">
            Accurate Teer Predictions
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Get daily predictions based on advanced frequency analysis
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="text-lg px-8 py-6">
              Start Free Trial
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardHeader>
              <CardTitle>Latest Results</CardTitle>
              <CardDescription>Free access to latest results</CardDescription>
            </CardHeader>
            <CardContent>
              View the most recent Teer results for all houses for free
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Advanced Predictions</CardTitle>
              <CardDescription>AI-powered analysis</CardDescription>
            </CardHeader>
            <CardContent>
              Get predictions based on 30 days of historical data analysis
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Affordable Plans</CardTitle>
              <CardDescription>Starting from ₹29</CardDescription>
            </CardHeader>
            <CardContent>
              Flexible subscription plans from 1 day to 30 days
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Link href="/results">
            <Button variant="outline" size="lg">
              View Latest Results
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
