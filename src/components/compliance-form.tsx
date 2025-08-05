
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/file-upload";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useSubmission } from "@/hooks/use-submission-client";

import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ComplianceSchema } from "@/lib/schemas";


type FormData = z.infer<typeof ComplianceSchema>;


export function ComplianceForm() {
  const router = useRouter();
  const { submission, updateSubmissionData, loading } = useSubmission();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const form = useForm<FormData>({
    resolver: zodResolver(ComplianceSchema),
    defaultValues: {
      pepDisclosure: "no",
      pepDetails: "",
    },
  });

  useEffect(() => {
    if (submission) {
      form.reset({
        pepDisclosure: submission.pepDisclosure || "no",
        pepDetails: submission.pepDetails || "",
      });
    }
  }, [submission, form]);
  
  const handleSave = async (values: FormData): Promise<boolean> => {
    if (!submission) return false;

    try {
        // Files are handled by the FileUpload components
        const updateData = {
            pepDisclosure: values.pepDisclosure,
            pepDetails: values.pepDetails,
        };

        await updateSubmissionData(updateData);
        toast({
            title: "Progress Saved",
            description: "Your compliance information has been saved.",
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
        router.push("/onboarding/security");
      } else {
        setIsSaving(false);
      }
    }
  };
  
  const handleBack = async () => {
    setIsSaving(true);
    const success = await handleSave(form.getValues());
    if (success) {
        router.push('/onboarding/company-info');
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
            <div className="space-y-4">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-1/2" />
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
              id="aml-policy"
              label="AML/CFT Policy"
              description="Upload your Anti-Money Laundering and Counter-Financing of Terrorism policy."
              category="Compliance"
              multiple
              existingFiles={submission.files?.filter(f => 
                ('fieldName' in f && f.fieldName === 'aml-policy') || 
                ('fieldId' in f && (f as any).fieldId === 'aml-policy')
              ) as any[] || []}
            />
            <FileUpload
              id="kyc-policy"
              label="KYC/Customer Onboarding Policies"
              description="Upload your Know Your Customer and customer onboarding procedures."
              category="Compliance"
              multiple
              existingFiles={submission.files?.filter(f => 
                ('fieldName' in f && f.fieldName === 'kyc-policy') || 
                ('fieldId' in f && (f as any).fieldId === 'kyc-policy')
              ) as any[] || []}
            />
            <FileUpload
              id="control-structure"
              label="Beneficial Ownership & Control Structure"
              description="Upload a chart or document detailing your company's ownership structure."
              category="Compliance"
              multiple
              existingFiles={submission.files?.filter(f => 
                ('fieldName' in f && f.fieldName === 'control-structure') || 
                ('fieldId' in f && (f as any).fieldId === 'control-structure')
              ) as any[] || []}
            />
            
            <FormField
              control={form.control}
              name="pepDisclosure"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Politically Exposed Person (PEP) Disclosure</Label>
                    <p className="text-sm text-muted-foreground">
                      Is any director, shareholder, or beneficial owner of the company a Politically Exposed Person (PEP)?
                    </p>
                  </div>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="yes" id="pep-yes" />
                        </FormControl>
                        <Label htmlFor="pep-yes">Yes</Label>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                         <FormControl>
                          <RadioGroupItem value="no" id="pep-no" />
                         </FormControl>
                        <Label htmlFor="pep-no">No</Label>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="pepDetails"
              render={({ field }) => (
                 <FormItem>
                  <Label htmlFor="pep-details">
                    If yes, please provide details of the PEP relationship.
                  </Label>
                  <FormControl>
                    <Textarea
                        id="pep-details"
                        placeholder="Provide the name of the individual, their position, and their relationship to your company..."
                        className="mt-2"
                        {...field}
                        disabled={form.watch('pepDisclosure') === 'no'}
                    />
                  </FormControl>
                  <FormMessage/>
                 </FormItem>
              )}
            />

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
