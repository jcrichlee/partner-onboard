
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { FileUpload } from "@/components/file-upload";
import { useSubmission } from "@/hooks/use-submission-client";
import { useToast } from "@/hooks/use-toast";

import { Form } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";


const formSchema = z.object({
  "third-party-ra": z.array(z.instanceof(File)).optional(),
  "attestation-letter": z.array(z.instanceof(File)).optional(),
});

type FormData = z.infer<typeof formSchema>;

export function AttestationsForm() {
  const router = useRouter();
  const { submission, loading, updateSubmissionData } = useSubmission();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const handleSave = async (): Promise<boolean> => {
    if (!submission) return false;
    try {
      // Files are handled by the FileUpload components
      const updateData = { status: 'submitted' as const };
      await updateSubmissionData(updateData);
      toast({
        title: "Application Submitted",
        description: "Your onboarding application has been submitted successfully."
      });
      return true;

    } catch (e) {
        console.error("Failed to save and submit", e);
        toast({
            variant: "destructive",
            title: "Submission Failed",
            description: "Your application could not be saved for submission. Please try again."
        });
        return false;
    }
  }

  const handleBack = async () => {
    setIsSaving(true);
    const success = await handleSave();
    if (success) {
      router.push("/onboarding/security");
    } else {
      setIsSaving(false);
    }
  };

  const handleReview = async () => {
    setIsSaving(true);
    const success = await handleSave();
    if (success) {
      router.push("/confirmation");
    } else {
      setIsSaving(false);
    }
  }

  if (loading || !submission) {
     return (
        <CardContent className="space-y-8 pt-6">
            <div className="space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-32 w-full" />
            </div>
        </CardContent>
    );
  }

  return (
    <FormProvider {...form}>

      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()}>
          <CardContent className="space-y-8">
            <FileUpload
              id="third-party-ra"
              label="Third-Party Risk Assessment & DD Checklist"
              description="Please download the template, fill it out, and upload the signed copy."
              templateUrl="/templates/Third-Party-RA-DD-Checklist.docx"
              category="Attestations"
              multiple
              existingFiles={submission.files?.filter(f => 
                ('fieldName' in f && f.fieldName === 'third-party-ra') || 
                ('fieldId' in f && (f as any).fieldId === 'third-party-ra')
              ) as any[] || []}
            />
            <FileUpload
              id="attestation-letter"
              label="Attestation Letter"
              description="Please download the attestation letter, sign it, and upload the completed version."
              templateUrl="/templates/Attestation-Letter.docx"
              category="Attestations"
              multiple
              existingFiles={submission.files?.filter(f => 
                ('fieldName' in f && f.fieldName === 'attestation-letter') || 
                ('fieldId' in f && (f as any).fieldId === 'attestation-letter')
              ) as any[] || []}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleBack} className="rounded-xl shadow-md" disabled={isSaving}>
              Back
            </Button>
            <Button onClick={handleReview} className="rounded-xl shadow-md" disabled={isSaving}>
              Review & Submit
            </Button>
          </CardFooter>
        </form>
      </Form>
    </FormProvider>
  );
}
