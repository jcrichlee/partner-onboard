import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "../hooks/use-auth-client";

export const metadata: Metadata = {
  title: "OnboardLink | Sterling Bank - IMTO Onboarding Portal",
  description: "Streamlined onboarding portal for Sterling Bank's IMTO (International Money Transfer Operator) partners. Complete your compliance documentation and get started quickly.",
  keywords: ["Sterling Bank", "IMTO", "onboarding", "compliance", "money transfer", "financial services"],
  authors: [{ name: "Sterling Bank" }],
  creator: "Sterling Bank",
  publisher: "Sterling Bank",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://imto-onboarding.netlify.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "OnboardLink | Sterling Bank - IMTO Onboarding Portal",
    description: "Streamlined onboarding portal for Sterling Bank's IMTO partners. Complete your compliance documentation and get started quickly.",
    url: 'https://imto-onboarding.netlify.app',
    siteName: 'OnboardLink',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'OnboardLink - Sterling Bank IMTO Onboarding Portal',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "OnboardLink | Sterling Bank - IMTO Onboarding Portal",
    description: "Streamlined onboarding portal for Sterling Bank's IMTO partners. Complete your compliance documentation and get started quickly.",
    images: ['/og-image.png'],
    creator: '@SterlingBankNG',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <meta name="theme-color" content="#10B981" />
        <meta name="msapplication-TileColor" content="#10B981" />

      </head>
      <body className="font-body antialiased h-full" suppressHydrationWarning>
        <AuthProvider>
            {children}
            <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
