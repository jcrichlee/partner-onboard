"use client";

import { Card, CardContent, CardDescription, CardHeader } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { CheckCircle, Circle, Clock, AlertCircle, ChevronRight } from "lucide-react";

import { useOnboardingManager, type StepStatus } from "@/hooks/use-onboarding-manager";
import { cn } from "@/lib/utils";

type OnboardingProgressProps = {
  className?: string;
  showNavigation?: boolean;
  compact?: boolean;
};

/**
 * Onboarding Progress Component
 * Implements the globally accepted approach from ONBOARDSTEPS.md:
 * - Visual progress indicator for all 7 onboarding steps
 * - Step status tracking (pending, current, completed, error)
 * - Navigation between accessible steps
 * - Progress percentage calculation
 * - Responsive design for different layouts
 */
export function OnboardingProgress({ 
  className, 
  showNavigation = true, 
  compact = false 
}: OnboardingProgressProps) {
  const { progress, goToStep, isLoading } = useOnboardingManager();
  const currentStep = progress.steps[progress.currentStepIndex];

  /**
   * Gets the appropriate icon for a step status
   */
  const getStepIcon = (step: StepStatus) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'current':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  /**
   * Gets the appropriate badge variant for a step status
   */
  const getStepBadgeVariant = (step: StepStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (step.status) {
      case 'completed':
        return 'default';
      case 'current':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  /**
   * Gets the status text for a step
   */
  const getStepStatusText = (step: StepStatus): string => {
    switch (step.status) {
      case 'completed':
        return 'Completed';
      case 'current':
        return 'In Progress';
      case 'error':
        return 'Needs Attention';
      default:
        return 'Pending';
    }
  };

  /**
   * Handles step navigation
   */
  const handleStepClick = async (step: StepStatus) => {
    if (!step.isAccessible || isLoading) return;
    await goToStep(step.id);
  };

  if (compact) {
    return (
      <div className={cn("space-y-4", className)}>
        {/* Compact progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Onboarding Progress</span>
            <span className="text-muted-foreground">
              {progress.completedSteps} of {progress.totalSteps} completed
            </span>
          </div>
          <Progress value={progress.progressPercentage} className="h-2" />
        </div>

        {/* Current step indicator */}
        {currentStep && (
          <div className="flex items-center gap-2 text-sm">
            {getStepIcon(currentStep)}
            <span className="font-medium">
              Step {progress.currentStepIndex + 1}: {currentStep.title}
            </span>
            <Badge variant={getStepBadgeVariant(currentStep)} className="text-xs">
              {getStepStatusText(currentStep)}
            </Badge>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold leading-none tracking-tight">Onboarding Progress</h3>
          <Badge variant="outline" className="text-xs shrink-0">
            {progress.completedSteps} of {progress.totalSteps} completed
          </Badge>
        </div>
        <CardDescription>
          Complete all steps to finish your partner onboarding process.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overall progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Overall Progress</span>
            <span className="text-muted-foreground">
              {Math.round(progress.progressPercentage)}%
            </span>
          </div>
          <Progress value={progress.progressPercentage} className="h-3" />
        </div>

        {/* Step list */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Onboarding Steps
          </h4>
          
          <div className="space-y-2">
            {progress.steps.map((step, index) => {
              const isClickable = step.isAccessible && showNavigation && !isLoading;
              
              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                    step.status === 'current' && "bg-blue-50 border-blue-200",
                    step.status === 'completed' && "bg-green-50 border-green-200",
                    step.status === 'error' && "bg-red-50 border-red-200",
                    isClickable && "cursor-pointer hover:bg-gray-50",
                    !step.isAccessible && "opacity-60"
                  )}
                  onClick={() => isClickable && handleStepClick(step)}
                >
                  {/* Step number and icon */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
                      step.status === 'completed' && "bg-green-600 text-white",
                      step.status === 'current' && "bg-blue-600 text-white",
                      step.status === 'error' && "bg-red-600 text-white",
                      step.status === 'pending' && "bg-gray-200 text-gray-600"
                    )}>
                      {step.status === 'completed' ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                  </div>

                  {/* Step details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className={cn(
                        "font-medium text-sm truncate",
                        step.status === 'current' && "text-blue-900",
                        step.status === 'completed' && "text-green-900",
                        step.status === 'error' && "text-red-900"
                      )}>
                        {step.title}
                      </h5>
                      <Badge 
                        variant={getStepBadgeVariant(step)} 
                        className="text-xs shrink-0"
                      >
                        {getStepStatusText(step)}
                      </Badge>
                    </div>
                    
                    {step.hasData && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Data saved
                      </p>
                    )}
                  </div>

                  {/* Navigation arrow */}
                  {isClickable && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Status summary */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {progress.completedSteps}
              </div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {progress.totalSteps - progress.completedSteps}
              </div>
              <div className="text-xs text-muted-foreground">Remaining</div>
            </div>
          </div>
        </div>



        {/* Completion message */}
        {progress.status === 'completed' && (
          <div className="pt-4 border-t">
            <div className="text-center space-y-2">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
              <p className="text-sm font-medium text-green-900">
                Onboarding Complete!
              </p>
              <p className="text-xs text-muted-foreground">
                Your submission is under review.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
