import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | OnboardLink - Sterling Bank IMTO Portal",
  description: "Access your IMTO onboarding account. Login to continue your compliance documentation and track your application status with Sterling Bank.",
  openGraph: {
    title: "Login | OnboardLink - Sterling Bank IMTO Portal",
    description: "Access your IMTO onboarding account. Login to continue your compliance documentation and track your application status.",
  },
  twitter: {
    title: "Login | OnboardLink - Sterling Bank IMTO Portal",
    description: "Access your IMTO onboarding account. Login to continue your compliance documentation and track your application status.",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}