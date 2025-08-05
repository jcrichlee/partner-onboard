
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FileUpload } from "@/components/file-upload";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useSubmission } from "@/hooks/use-submission-client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { uploadUserFile } from "@/lib/storage";
import { Loader } from "@/components/ui/loader";

const formSchema = z.object({
  hasComplianceOfficer: z.boolean().default(false),
  hasSecurityAudits: z.boolean().default(false),
  "infosec-policy": z.any(),
  "dr-plan": z.any(),
  "iso-27001": z.any(),
});

type FormData = z.infer<typeof formSchema>;

export function SecurityForm() {
  const router = useRouter();
  const { submission, updateSubmission: update, loading: isLoading } = useSubmission();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hasComplianceOfficer: false,
      hasSecurityAudits: false,
    },
  });

  useEffect(() => {
    if (submission) {
      form.reset({
        hasComplianceOfficer: submission.hasComplianceOfficer || false,
        hasSecurityAudits: submission.hasSecurityAudits || false,
      });
    }
  }, [submission, form]);
  
  const handleSave = async (values: FormData): Promise<boolean> => {
    if (!submission) return false;

    try {
        let allFiles: any[] = submission.files || [];
        
        const fileFields: { id: keyof FormData, category: string, multiple?: boolean }[] = [
            { id: "infosec-policy", category: "Security", multiple: true },
            { id: "dr-plan", category: "Security", multiple: true },
            { id: "iso-27001", category: "Security", multiple: true },
        ];

        for (const field of fileFields) {
            const filesToUpload = values[field.id] as File[] | undefined;
            if (filesToUpload && filesToUpload.length > 0) {
                 for (const file of filesToUpload) {
                    if (!(file instanceof File)) continue;
                    const newFile = await uploadUserFile(file, submission as any, field.category, field.id);
                    if (field.multiple) {
                        allFiles = [...(allFiles.filter(f => f.category !== field.category || !filesToUpload.some(fu => fu.name === f.name))), newFile];
                    } else {
                        allFiles = [...(allFiles.filter(f => f.fieldName !== field.id)), newFile];
                    }
                }
            }
        }
        
        const updateData = {
            hasComplianceOfficer: values.hasComplianceOfficer,
            hasSecurityAudits: values.hasSecurityAudits,
            files: allFiles,
        };

        await update(updateData);
        toast({
            title: "Progress Saved",
            description: "Your security information has been saved.",
        });
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
        router.push("/onboarding/attestations");
      } else {
        setIsSaving(false);
      }
    }
  };
  
  const handleBack = async () => {
    setIsSaving(true);
    const success = await handleSave(form.getValues());
    if(success) {
        router.push('/onboarding/compliance');
    } else {
        setIsSaving(false);
    }
  }

  if (isLoading || !submission) {
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
             <div className="space-y-6">
                 <Skeleton className="h-20 w-full" />
                 <Skeleton className="h-20 w-full" />
            </div>
        </CardContent>
    );
  }


  return (
    <FormProvider {...form}>
       {isSaving && <Loader />}
       <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()}>
          <CardContent className="space-y-8">
            <FileUpload
              id="infosec-policy"
              label="Information Security Policy"
              description="Upload your company's main information security policy document."
              category="Security"
              multiple
              existingFiles={submission.files?.filter(f => 
                ('fieldName' in f && f.fieldName === 'infosec-policy') ||
                ('fieldId' in f && f.fieldId === 'infosec-policy')
              ) || []}
            />
            <FileUpload
              id="dr-plan"
              label="Business Continuity / Disaster Recovery Plan"
              description="Upload your BCDR plan."
              category="Security"
              multiple
              existingFiles={submission.files?.filter(f => 
                ('fieldName' in f && f.fieldName === 'dr-plan') ||
                ('fieldId' in f && f.fieldId === 'dr-plan')
              ) || []}
            />
            <FileUpload
              id="iso-27001"
              label="ISO 27001 Certificate (Optional)"
              description="If applicable, upload your ISO 27001 certification."
              category="Security"
              multiple
              existingFiles={submission.files?.filter(f => 
                ('fieldName' in f && f.fieldName === 'iso-27001') ||
                ('fieldId' in f && f.fieldId === 'iso-27001')
              ) || []}
            />
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="hasComplianceOfficer"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">Dedicated Compliance Officer</Label>
                      <p className="text-sm text-muted-foreground">Do you have a dedicated compliance officer or department?</p>
                    </div>
                    <FormControl>
                       <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hasSecurityAudits"
                render={({ field }) => (
                   <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label className="text-base font-medium">Regular Security Audits</Label>
                        <p className="text-sm text-muted-foreground">Does your organization undergo regular third-party security audits?</p>
                    </div>
                     <FormControl>
                        <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                     </FormControl>
                   </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleBack} className="rounded-xl shadow-md" disabled={isSaving}>
              Back
            </Button>
            <Button onClick={handleContinue} className="rounded-xl shadow-md" disabled={isSaving}>
              Save & Continue
            </Button>
          </CardFooter>
        </form>
      </Form>
    </FormProvider>
  );
}
