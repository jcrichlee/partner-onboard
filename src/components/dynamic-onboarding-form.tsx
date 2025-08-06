"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useSubmission } from "@/hooks/use-submission-client";
import { EnhancedFileUpload } from "./enhanced-file-upload";
import { 
  ONBOARDING_STEPS, 
  type OnboardingStepConfig, 
  type OnboardingStepData,
  type OnboardingFile
} from "@/lib/schemas/onboarding-steps";
import { cn } from "@/lib/utils";

type DynamicOnboardingFormProps = {
  step: OnboardingStepConfig;
  className?: string;
};

/**
 * Form Content Component - handles the actual form logic
 */
function FormContent({ 
  stepId, 
  currentStep, 
  currentStepIndex, 
  totalSteps, 
  progress,
  className 
}: {
  stepId: string;
  currentStep: OnboardingStepConfig;
  currentStepIndex: number;
  totalSteps: number;
  progress: number;
  className?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { submission, updateSubmission, refreshSubmission } = useSubmission();

  // Get existing data for this step from submission
  const existingData = submission?.steps?.[stepId] || {};
  const existingFiles = submission?.files?.filter(file => 
      currentStep.fields.some(field => 
        field.type === 'file' && (
          field.id === ('fieldName' in file ? file.fieldName : (file as any).fieldId)
        )
      )
    ) || [];

  // Initialize form with existing data
  const form = useForm<OnboardingStepData>({
    resolver: zodResolver(currentStep.schema),
    defaultValues: {
      ...existingData,
      // Initialize file fields with empty arrays if not present
      ...currentStep.fields
        .filter(field => field.type === 'file')
        .reduce((acc, field) => ({ ...acc, [field.id]: [] }), {})
    }
  });

  const { handleSubmit, watch, formState: { errors, isValid } } = form;

  /**
   * Checks if a field should be rendered based on its condition
   */
  const shouldRenderField = (field: OnboardingStepConfig['fields'][0]): boolean => {
    if (!field.condition) return true;
    
    const formData = watch();
    return field.condition(formData);
  };

  /**
   * Gets existing files for a specific field
   */
  const getExistingFilesForField = (fieldId: string): OnboardingFile[] => {
    return existingFiles.filter(file => 
      ('fieldName' in file && file.fieldName === fieldId) || 
      ('fieldId' in file && (file as any).fieldId === fieldId)
    ) as OnboardingFile[];
  };

  /**
   * Handles form submission
   */
  const onSubmit = async (data: OnboardingStepData) => {
    setIsLoading(true);
    
    try {
      // Update submission with step data
      await updateSubmission({
        steps: {
          ...submission?.steps,
          [stepId]: data
        },
        currentStep: stepId,
        lastUpdated: new Date().toISOString()
      });

      // Refresh submission data to update progress component
      await refreshSubmission();

      toast({
        title: "Progress Saved",
        description: `${currentStep.title} has been saved successfully.`,
      });

      // Navigate to next step or completion
      const nextStepIndex = currentStepIndex + 1;
      if (nextStepIndex < totalSteps) {
        const nextStep = ONBOARDING_STEPS[nextStepIndex];
        if (nextStep) {
          // Update current step before navigation
          await updateSubmission({
            currentStep: nextStep.id,
            lastUpdated: new Date().toISOString()
          });
          router.push(nextStep.route);
        }
      } else {
        // All steps completed
        await updateSubmission({
          status: 'completed',
          completedAt: new Date().toISOString()
        });
        router.push('/onboarding/complete');
      }
    } catch (error) {
      console.error('Failed to save step:', error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Failed to save your progress. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles going back to previous step
   */
  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      const previousStep = ONBOARDING_STEPS[currentStepIndex - 1];
      if (previousStep) {
        router.push(previousStep.route);
      }
    }
  };

  /**
   * Renders a form field based on its type
   */
  const renderField = (field: OnboardingStepConfig['fields'][0]) => {
    if (!shouldRenderField(field)) return null;

    const fieldError = errors[field.id];
    const hasError = !!fieldError;

    switch (field.type) {
      case 'text':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="text-base font-medium">
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
            {field.multiline ? (
              <Textarea
                id={field.id}
                placeholder={field.placeholder}
                className={cn(hasError && "border-destructive")}
                {...form.register(field.id)}
              />
            ) : (
              <Input
                id={field.id}
                type="text"
                placeholder={field.placeholder}
                className={cn(hasError && "border-destructive")}
                {...form.register(field.id)}
              />
            )}
            {hasError && (
              <p className="text-sm text-destructive">{String(fieldError?.message || 'Invalid input')}</p>
            )}
          </div>
        );

      case 'url':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="text-base font-medium">
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
            <Input
              id={field.id}
              type="url"
              placeholder={field.placeholder || "https://example.com"}
              className={cn(hasError && "border-destructive")}
              {...form.register(field.id)}
            />
            {hasError && (
              <p className="text-sm text-destructive">{String(fieldError?.message || 'Invalid input')}</p>
            )}
          </div>
        );

      case 'radio':
        return (
          <div key={field.id} className="space-y-3">
            <Label className="text-base font-medium">
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
            <RadioGroup
              value={watch(field.id) || ""}
              onValueChange={(value) => form.setValue(field.id, value, { shouldValidate: true })}
              className={cn(hasError && "border border-destructive rounded-md p-2")}
            >
              {field.options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} />
                  <Label htmlFor={`${field.id}-${option.value}`} className="font-normal">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {hasError && (
              <p className="text-sm text-destructive">{String(fieldError?.message || 'Invalid input')}</p>
            )}
          </div>
        );

      case 'file':
        return (
          <EnhancedFileUpload
            key={field.id}
            id={field.id}
            label={field.label}
            category={currentStep.title}
            description={field.description || ""}
            tooltip={field.tooltip || ""}
            templateUrl={field.templateUrl || ""}
            multiple={field.multiple || false}
            required={field.required || false}
            existingFiles={getExistingFilesForField(field.id)}
            accept={field.accept || ""}
            maxSizeMB={field.maxSizeMB || 10}
          />
        );

      default:
        return (
          <div key={field.id} className="p-4 border border-destructive rounded-md">
            <p className="text-destructive">Unsupported field type: {(field as any).type}</p>
          </div>
        );
    }
  };

  return (
    <FormProvider {...form}>
      <div className={cn("max-w-4xl mx-auto", className)}>
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold">{currentStep.title}</h1>
            <span className="text-sm text-muted-foreground">
              Step {currentStepIndex + 1} of {totalSteps}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentStep.title}
              {submission?.steps?.[stepId] && (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
            </CardTitle>
            {currentStep.description && (
              <CardDescription>{currentStep.description}</CardDescription>
            )}
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Render all fields for this step */}
              {currentStep.fields.map(renderField)}

              {/* Navigation buttons */}
              <div className="responsive-button-group pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goToPreviousStep}
                  disabled={currentStepIndex === 0 || isLoading}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto order-2 sm:order-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                
                <Button
                  type="submit"
                  disabled={!isValid || isLoading}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto order-1 sm:order-2 min-w-[120px]"
                >
                  {isLoading ? (
                    "Saving..."
                  ) : currentStepIndex === totalSteps - 1 ? (
                    "Complete"
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </FormProvider>
  );
}

/**
 * Dynamic Onboarding Form Component
 * Implements the globally accepted approach from ONBOARDSTEPS.md:
 * - Renders any onboarding step based on configuration
 * - Handles all field types: text, url, file, radio
 * - Supports conditional field rendering
 * - Integrates with Firebase for data persistence
 * - Provides consistent validation and error handling
 */
export function DynamicOnboardingForm({ step, className }: DynamicOnboardingFormProps) {
  // Find the current step configuration
  const currentStep = step;
  const currentStepIndex = ONBOARDING_STEPS.findIndex(s => s.id === step.id);
  const totalSteps = ONBOARDING_STEPS.length;
  const progress = ((currentStepIndex + 1) / totalSteps) * 100;
  
  return (
    <FormContent
      stepId={step.id}
      currentStep={currentStep}
      currentStepIndex={currentStepIndex}
      totalSteps={totalSteps}
      progress={progress}
      className={className || ""}
    />
  );
}