
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/file-upload";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useSubmission } from "@/hooks/use-submission-client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

import { CompanyInfoSchema } from "@/lib/schemas";

type FormData = z.infer<typeof CompanyInfoSchema>;

export function CompanyInfoForm() {
  const router = useRouter();
  const { submission, updateSubmissionData, loading } = useSubmission();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(CompanyInfoSchema),
    defaultValues: {
      companyName: "",
      businessDescription: "",
      companyUrl: "",
    },
  });

  useEffect(() => {
    if (submission) {
      form.reset({
        companyName: submission.companyName || "",
        businessDescription: submission.businessDescription || "",
        companyUrl: submission.companyUrl || "",
      });
    }
  }, [submission, form]);

  const handleSave = async (values: FormData): Promise<boolean> => {
    if (!submission) return false;

    try {
      // Files are handled by the FileUpload components

      const updateData = {
        partnerName: values.companyName,
        companyName: values.companyName,
        businessDescription: values.businessDescription,
        companyUrl: values.companyUrl,
      };

      await updateSubmissionData(updateData);
      return true;

    } catch(e) {
      console.error("Failed to save", e);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Your changes could not be saved. Please try again."
      });
      return false;
    }
  };

  const handleContinue = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      setIsSaving(true);
      const success = await handleSave(form.getValues());
      if (success) {
        router.push("/onboarding/compliance");
      } else {
        setIsSaving(false);
      }
    }
  };

  if (loading || !submission) {
    return (
      <CardContent className="space-y-8 pt-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </CardContent>
    );
  }

  return (
    <FormProvider {...form}>
       <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()}>
          <CardContent className="space-y-8">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="companyName">Company Name</Label>
                  <FormControl>
                    <Input id="companyName" placeholder="Your Company Inc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="businessDescription"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="description">Brief Business Description</Label>
                  <FormControl>
                    <Textarea
                      id="description"
                      placeholder="Describe your company's primary business activities..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="companyUrl"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="url">Company URL</Label>
                   <FormControl>
                    <Input id="url" type="url" placeholder="https://www.yourcompany.com" {...field} />
                   </FormControl>
                   <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-6">
              <FileUpload
                id="cert-incorporation"
                label="Certificate of Incorporation"
                description="Upload the official certificate of incorporation."
                category="Company Information"
                existingFiles={submission.files?.filter(f => 
                  ('fieldName' in f && f.fieldName === 'cert-incorporation') || 
                  ('fieldId' in f && (f as any).fieldId === 'cert-incorporation')
                ) as any[] || []}
              />
              <FileUpload
                id="cac-report"
                label="CAC Status Report"
                description="Upload the latest Corporate Affairs Commission (CAC) status report."
                category="Company Information"
                existingFiles={submission.files?.filter(f => 
                  ('fieldName' in f && f.fieldName === 'cac-report') || 
                  ('fieldId' in f && (f as any).fieldId === 'cac-report')
                ) as any[] || []}
              />
              <FileUpload
                id="m-and-a"
                label="Memorandum & Articles of Association"
                description="Upload your company's M&A."
                category="Company Information"
                existingFiles={submission.files?.filter(f => 
                  ('fieldName' in f && f.fieldName === 'm-and-a') || 
                  ('fieldId' in f && (f as any).fieldId === 'm-and-a')
                ) as any[] || []}
              />
              <FileUpload
                id="imto-license"
                label="IMTO License (Original & Renewal)"
                description="Upload both the original and most recent renewal of your IMTO license."
                multiple
                category="Company Information"
                existingFiles={submission.files?.filter(f => 
                  ('fieldName' in f && f.fieldName === 'imto-license') || 
                  ('fieldId' in f && (f as any).fieldId === 'imto-license')
                ) as any[] || []}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleContinue} className="rounded-xl shadow-md" disabled={isSaving}>
              Save & Continue
            </Button>
          </CardFooter>
        </form>
      </Form>
    </FormProvider>
  );
}
