"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useSubmission } from "@/hooks/use-submission-client";
import {
  ONBOARDING_STEPS,
  type OnboardingStepData
} from '@/lib/schemas/onboarding-steps';
import { type OnboardingSubmission } from '@/lib/firestore';

export type OnboardingStatus = 'not-started' | 'in-progress' | 'completed' | 'submitted';

export type StepStatus = {
  id: string;
  title: string;
  status: 'pending' | 'current' | 'completed' | 'error';
  hasData: boolean;
  isAccessible: boolean;
  route: string;
};

export type OnboardingProgress = {
  currentStepIndex: number;
  totalSteps: number;
  completedSteps: number;
  progressPercentage: number;
  status: OnboardingStatus;
  steps: StepStatus[];
};

/**
 * Centralized Onboarding Manager Hook
 * Implements the globally accepted approach from ONBOARDSTEPS.md:
 * - Manages step navigation and progress tracking
 * - Handles data persistence across steps
 * - Provides validation and error handling
 * - Ensures proper step sequencing
 * - Integrates with Firebase for real-time updates
 */
export function useOnboardingManager() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const { submission, updateSubmission, refreshSubmission } = useSubmission();

  /**
   * Calculates the current onboarding progress
   */
  const calculateProgress = useCallback((): OnboardingProgress => {
    if (!submission) {
      return {
        currentStepIndex: 0,
        totalSteps: ONBOARDING_STEPS.length,
        completedSteps: 0,
        progressPercentage: 0,
        status: 'not-started',
        steps: ONBOARDING_STEPS.map((step, index) => ({
          id: step.id,
          title: step.title,
          status: index === 0 ? 'current' : 'pending',
          hasData: false,
          isAccessible: index === 0,
          route: step.route
        }))
      };
    }

    const submissionSteps = submission.steps || {};
    const currentStepId = submission.currentStep;
    const currentStepIndex = currentStepId 
      ? ONBOARDING_STEPS.findIndex(step => step.id === currentStepId)
      : 0;
    
    const completedSteps = ONBOARDING_STEPS.filter(step => 
      submissionSteps[step.id] && Object.keys(submissionSteps[step.id]).length > 0
    ).length;

    const progressPercentage = (completedSteps / ONBOARDING_STEPS.length) * 100;
    
    // Determine overall status
    let status: OnboardingStatus = 'not-started';
    if (submission.status === 'completed') {
      status = 'completed';
    } else if (submission.status === 'submitted') {
      status = 'submitted';
    } else if (completedSteps > 0 || currentStepIndex > 0) {
      status = 'in-progress';
    }

    // Calculate step statuses
    const steps: StepStatus[] = ONBOARDING_STEPS.map((step, index) => {
      const hasData = submissionSteps[step.id] && Object.keys(submissionSteps[step.id]).length > 0;
      const isCompleted = hasData;
      const isCurrent = index === currentStepIndex;
      const isAccessible = index <= currentStepIndex || isCompleted;
      
      let stepStatus: StepStatus['status'] = 'pending';
      if (isCompleted) {
        stepStatus = 'completed';
      } else if (isCurrent) {
        stepStatus = 'current';
      }

      return {
        id: step.id,
        title: step.title,
        status: stepStatus,
        hasData,
        isAccessible,
        route: step.route
      };
    });

    return {
      currentStepIndex: Math.max(0, currentStepIndex),
      totalSteps: ONBOARDING_STEPS.length,
      completedSteps,
      progressPercentage,
      status,
      steps
    };
  }, [submission]);

  const progress = calculateProgress();

  /**
   * Navigates to a specific step
   */
  const goToStep = useCallback(async (stepId: string, force = false) => {
    const step = ONBOARDING_STEPS.find(s => s.id === stepId);
    if (!step) {
      setError(`Step not found: ${stepId}`);
      return false;
    }

    const stepIndex = ONBOARDING_STEPS.findIndex(s => s.id === stepId);
    const stepStatus = progress.steps[stepIndex];

    // Check if step is accessible (unless forced)
    if (!stepStatus || (!force && !stepStatus.isAccessible)) {
      toast({
        variant: 'destructive',
        title: 'Step Not Accessible',
        description: 'Please complete the previous steps first.'
      });
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Update current step in submission
      await updateSubmission({
        currentStep: stepId,
        lastUpdated: new Date().toISOString()
      });

      // Navigate to step
      router.push(step.route);
      return true;
    } catch (error) {
      console.error('Failed to navigate to step:', error);
      setError('Failed to navigate to step');
      toast({
        variant: 'destructive',
        title: 'Navigation Failed',
        description: 'Failed to navigate to the requested step.'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [progress.steps, updateSubmission, router, toast]);

  /**
   * Navigates to the next step
   */
  const goToNextStep = useCallback(async () => {
    const nextStepIndex = progress.currentStepIndex + 1;
    if (nextStepIndex >= ONBOARDING_STEPS.length) {
      // All steps completed
      return completeOnboarding();
    }

    const nextStep = ONBOARDING_STEPS[nextStepIndex];
    if (!nextStep) {
      return false;
    }
    return goToStep(nextStep.id);
  }, [progress.currentStepIndex, goToStep]);

  /**
   * Navigates to the previous step
   */
  const goToPreviousStep = useCallback(async () => {
    const previousStepIndex = progress.currentStepIndex - 1;
    if (previousStepIndex < 0) {
      return false;
    }

    const previousStep = ONBOARDING_STEPS[previousStepIndex];
    if (!previousStep) {
      return false;
    }
    return goToStep(previousStep.id, true);
  }, [progress.currentStepIndex, goToStep]);

  /**
   * Saves data for a specific step
   */
  const saveStepData = useCallback(async (stepId: string, data: OnboardingStepData) => {
    try {
      setIsLoading(true);
      setError(null);

      const updatedSteps = {
        ...submission?.steps,
        [stepId]: data
      };

      await updateSubmission({
        steps: updatedSteps,
        currentStep: stepId,
        lastUpdated: new Date().toISOString()
      });

      toast({
        title: 'Progress Saved',
        description: 'Your progress has been saved successfully.'
      });

      return true;
    } catch (error) {
      console.error('Failed to save step data:', error);
      setError('Failed to save step data');
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Failed to save your progress. Please try again.'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [submission?.steps, updateSubmission, toast]);

  /**
   * Gets data for a specific step
   */
  const getStepData = useCallback((stepId: string): OnboardingStepData | null => {
    return submission?.steps?.[stepId] || null;
  }, [submission?.steps]);

  /**
   * Validates if a step can be accessed
   */
  const canAccessStep = useCallback((stepId: string): boolean => {
    const stepIndex = ONBOARDING_STEPS.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return false;
    
    const stepStatus = progress.steps[stepIndex];
    return stepStatus ? stepStatus.isAccessible : false;
  }, [progress.steps]);

  /**
   * Completes the onboarding process
   */
  const completeOnboarding = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      await updateSubmission({
        status: 'completed',
        completedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });

      toast({
        title: 'Onboarding Complete!',
        description: 'Congratulations! You have completed the onboarding process.'
      });

      // Navigate to completion page
      router.push('/onboarding/complete');
      return true;
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      setError('Failed to complete onboarding');
      toast({
        variant: 'destructive',
        title: 'Completion Failed',
        description: 'Failed to complete onboarding. Please try again.'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [updateSubmission, router, toast]);

  /**
   * Resets the onboarding process
   */
  const resetOnboarding = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const updateData: Partial<OnboardingSubmission> = {
        steps: {},
        currentStep: ONBOARDING_STEPS[0].id,
        status: 'draft',
        lastUpdated: new Date().toISOString()
      };
      
      await updateSubmission(updateData);

      toast({
        title: 'Onboarding Reset',
        description: 'Your onboarding progress has been reset.'
      });

      // Navigate to first step
      router.push(ONBOARDING_STEPS[0].route);
      return true;
    } catch (error) {
      console.error('Failed to reset onboarding:', error);
      setError('Failed to reset onboarding');
      toast({
        variant: 'destructive',
        title: 'Reset Failed',
        description: 'Failed to reset onboarding. Please try again.'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [updateSubmission, router, toast]);

  /**
   * Refreshes the onboarding data
   */
  const refreshOnboarding = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await refreshSubmission();
    } catch (error) {
      console.error('Failed to refresh onboarding:', error);
      setError('Failed to refresh onboarding data');
    } finally {
      setIsLoading(false);
    }
  }, [refreshSubmission]);

  // Auto-refresh on submission changes
  useEffect(() => {
    if (submission) {
      setError(null);
    }
  }, [submission]);

  return {
    // State
    progress,
    isLoading,
    error,
    submission,
    
    // Navigation
    goToStep,
    goToNextStep,
    goToPreviousStep,
    canAccessStep,
    
    // Data management
    saveStepData,
    getStepData,
    
    // Lifecycle
    completeOnboarding,
    resetOnboarding,
    refreshOnboarding,
    
    // Utilities
    steps: ONBOARDING_STEPS,
    currentStep: ONBOARDING_STEPS[progress.currentStepIndex],
    isFirstStep: progress.currentStepIndex === 0,
    isLastStep: progress.currentStepIndex === ONBOARDING_STEPS.length - 1,
    isCompleted: progress.status === 'completed'
  };
}