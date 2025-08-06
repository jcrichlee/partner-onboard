'use client'
import { OnboardingProgress } from "@/components/onboarding-progress";
import { SubmissionProvider } from "../../hooks/use-submission-client";
import Link from "next/link";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SubmissionProvider>
      <div className="flex flex-col min-h-screen">
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
          </div>
        </header>
        <main className="flex-1 py-8 md:py-12">
          <div className="container">
            {/* Responsive layout: stacked on mobile, side-by-side on desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Progress component - full view to show all steps */}
              <div className="lg:col-span-4 xl:col-span-3">
                <div className="lg:sticky lg:top-24">
                  <OnboardingProgress className="lg:max-w-sm" />
                </div>
              </div>
              
              {/* Form content */}
              <div className="lg:col-span-8 xl:col-span-9">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </SubmissionProvider>
  );
}
