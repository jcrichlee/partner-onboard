import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCheck2, ShieldCheck, Clock, Users } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <svg
              width="32"
              height="32"
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M50 0L95.11 25V75L50 100L4.89 75V25L50 0Z" fill="#A6192E" />
              <path d="M50 10L86.6 30V70L50 90L13.4 70V30L50 10Z" fill="white" />
              <path d="M50 20L77.94 35V65L50 80L22.06 65V35L50 20Z" fill="#A6192E" />
            </svg>
            OnboardLink
          </Link>
          <nav className="ml-auto flex items-center gap-4">
            <Button className="rounded-xl shadow-md" asChild>
              <Link href="/login">Login</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="container py-12 md:py-20 lg:py-28">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col justify-center space-y-6">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                Seamless Onboarding for IMTO Partners
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Our secure portal streamlines the due diligence and compliance
                process for International Money Transfer Operators. Submit your
                documentation efficiently and securely.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button size="lg" className="rounded-xl shadow-md" asChild>
                  <Link href="/onboarding/company-info">Start Application</Link>
                </Button>
              </div>
            </div>
            <div className="grid gap-6">
              <Card className="rounded-xl shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Compliance Documents
                  </CardTitle>
                  <FileCheck2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3 of 7 Uploaded</div>
                  <p className="text-xs text-muted-foreground">
                    Last updated 2 days ago
                  </p>
                </CardContent>
              </Card>
              <Card className="rounded-xl shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Security Documents
                  </CardTitle>
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1 of 5 Uploaded</div>
                  <p className="text-xs text-muted-foreground">
                    Last updated 5 days ago
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section className="bg-card py-12 md:py-20 lg:py-28">
          <div className="container grid gap-8 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">
              Why Use The Portal?
            </h2>
            <p className="max-w-3xl mx-auto text-muted-foreground md:text-xl">
              A centralized, secure, and efficient way to manage your onboarding
              process with Sterling Bank.
            </p>
            <div className="grid gap-8 md:grid-cols-3 mt-8">
              <div className="flex flex-col items-center gap-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-bold text-xl">Secure Submissions</h3>
                <p className="text-muted-foreground">
                  End-to-end encryption ensures your sensitive documents are
                  always protected.
                </p>
              </div>
              <div className="flex flex-col items-center gap-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-bold text-xl">Time Efficient</h3>
                <p className="text-muted-foreground">
                  Save your progress and return anytime. No more lengthy,
                  single-session applications.
                </p>
              </div>
              <div className="flex flex-col items-center gap-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-bold text-xl">Transparent Process</h3>
                <p className="text-muted-foreground">
                  Track your application status and see all requirements at a
                  glance.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 bg-card">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Sterling Bank Plc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
