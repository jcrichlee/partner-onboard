
'use client';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Edit, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { SubmissionProvider } from "@/hooks/use-submission-provider";
import { useSubmission } from "@/hooks/use-submission-provider";
import { Skeleton } from "@/components/ui/skeleton";

const sectionRequirements = [
  {
    name: "Company Information",
    category: "Company Information",
    requiredFields: 4, // cert-incorporation, cac-report, m-and-a, imto-license
    href: "/onboarding/company-info",
  },
  {
    name: "Ownership & Compliance",
    category: "Compliance",
    requiredFields: 3, // aml-policy, kyc-policy, control-structure
    href: "/onboarding/compliance",
  },
  {
    name: "Security & Governance",
    category: "Security",
    requiredFields: 3, // infosec-policy, dr-plan, iso-27001 (optional, but let's count it)
    href: "/onboarding/security",
  },
  {
    name: "Attestations",
    category: "Attestations",
    requiredFields: 2, // third-party-ra, attestation-letter
    href: "/onboarding/attestations",
  },
];

function ConfirmationView() {
  const router = useRouter();
  const { submission, isLoading } = useSubmission();

  const handleSubmit = () => {
    // Here you would typically handle the final submission logic,
    // like updating the user's status in Firestore to 'Submitted'.
    alert('Application submitted successfully!');
    // After submission, the user will be redirected to their dashboard on next login.
    router.push('/partner/dashboard');
  }

  const getUploadedCount = (category: string) => {
    if (!submission?.files) return 0;
    // Count the number of unique fieldNames that have been uploaded for a given category.
    // This correctly handles fields that allow multiple files (they only count as one field completed).
    const distinctFieldNames = new Set(
      submission.files
        .filter(file => file.category === category)
        .map(file => file.fieldName)
    );
    return distinctFieldNames.size;
  };

  if (isLoading || !submission) {
    return (
        <CardContent className="space-y-4">
          {[...Array(4)].map((_, i) => (
             <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                </div>
                <Skeleton className="h-8 w-8" />
             </div>
          ))}
        </CardContent>
    )
  }

  return (
    <>
        <CardContent>
        <div className="space-y-4">
            {sectionRequirements.map((section) => {
            const uploadedCount = getUploadedCount(section.category);
            const isComplete = uploadedCount >= section.requiredFields;
            
            return (
                <div
                key={section.name}
                className="flex items-center justify-between p-4 border rounded-lg"
                >
                <div className="flex items-center gap-3">
                    {isComplete ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                    ): (
                        <AlertCircle className="h-6 w-6 text-yellow-500" />
                    )}
                    <div>
                    <p className="font-medium">{section.name}</p>
                    <p className="text-sm text-muted-foreground">
                        {uploadedCount} of {section.requiredFields} documents uploaded
                    </p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" asChild>
                    <Link href={section.href}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit {section.name}</span>
                    </Link>
                </Button>
                </div>
            )
            })}
        </div>
        </CardContent>
        <Separator />
        <CardContent className="py-6">
        <p className="text-sm text-muted-foreground">
            By submitting this application, you attest that all information
            provided is true and accurate to the best of your knowledge.
        </p>
        </CardContent>
        <div className="flex justify-end p-6 bg-secondary rounded-b-xl">
        <Button size="lg" className="rounded-xl shadow-md" onClick={handleSubmit}>
            Finalize &amp; Submit Application
        </Button>
        </div>
    </>
  );
}


export default function ConfirmationPage() {
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
            <div className="container max-w-4xl">
            <Card className="rounded-xl shadow-md">
                <CardHeader>
                <CardTitle className="font-headline text-2xl">
                    Review Your Application
                </CardTitle>
                <CardDescription>
                    Please review all the information you have provided before final
                    submission. You can edit any section if needed.
                </CardDescription>
                </CardHeader>
                <ConfirmationView />
            </Card>
            </div>
        </main>
        </div>
    </SubmissionProvider>
  );
}
