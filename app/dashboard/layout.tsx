import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/actions/auth";
import { Home, ListChecks, Brain, CreditCard } from "lucide-react";

async function LogoutButton() {
  async function handleLogout() {
    "use server";
    await logoutAction();
    redirect("/auth/login");
  }

  return (
    <form action={handleLogout}>
      <Button variant="ghost" type="submit">
        Logout
      </Button>
    </form>
  );
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  if (session.user.role === "ADMIN") {
    redirect("/admin");
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Results", href: "/results", icon: ListChecks },
    { name: "Predictions", href: "/predictions", icon: Brain },
    { name: "Subscription", href: "/subscription", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-600">Teer Predictions</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {session.user.name}
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          <aside className="w-64 space-y-1">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            ))}
          </aside>

          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
