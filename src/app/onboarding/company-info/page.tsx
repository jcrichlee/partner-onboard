import type { Metadata } from "next";
import { CompanyInfoForm } from "@/components/company-info-form";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Company Information | OnboardLink - IMTO Onboarding",
  description: "Step 1 of IMTO onboarding: Provide your company's incorporation details and official documents. Secure and automated progress saving.",
  openGraph: {
    title: "Company Information | OnboardLink - IMTO Onboarding",
    description: "Step 1 of IMTO onboarding: Provide your company's incorporation details and official documents.",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function CompanyInfoPage() {
  return (
    <Card className="max-w-4xl mx-auto rounded-xl shadow-md">
      <CardHeader>
        <CardTitle className="font-headline">
          Step 1: Company Information
        </CardTitle>
        <CardDescription>
          Please provide your company&apos;s incorporation details and official
 documents. Your progress is saved automatically.
        </CardDescription>
      </CardHeader>
      <CompanyInfoForm />
    </Card>
  );
}
