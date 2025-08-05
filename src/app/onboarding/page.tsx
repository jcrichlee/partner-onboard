"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DynamicOnboardingForm } from "@/components/dynamic-onboarding-form";
import { OnboardingProgress } from "@/components/onboarding-progress";
import { useOnboardingManager } from "@/hooks/use-onboarding-manager";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

/**
 * Main Onboarding Page
 * Implements the globally accepted approach from ONBOARDSTEPS.md:
 * - Dynamic step rendering based on ONBOARDING_STEPS schema
 * - Centralized progress tracking and navigation
 * - Real-time data persistence with Firebase
 * - Responsive layout with progress sidebar
 * - Error handling and loading states
 */
export default function OnboardingPage() {
  const router = useRouter();
  const { 
    progress, 
    currentStep, 
    isLoading, 
    error, 
    refreshOnboarding 
  } = useOnboardingManager();

  // Initialize onboarding on component mount
  useEffect(() => {
    refreshOnboarding();
  }, [refreshOnboarding]);

  // Show loading state while initializing
  if (isLoading && !currentStep) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Progress sidebar skeleton */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-2 w-full" />
                  <div className="space-y-3">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 flex-1" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main content skeleton */}
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ))}
                  </div>
                  <Skeleton className="h-10 w-32" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if initialization failed
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load onboarding data: {error}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  // Show completion state if onboarding is finished
  if (progress?.status === 'completed') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Progress sidebar */}
            <div className="lg:col-span-1">
              <OnboardingProgress />
            </div>

            {/* Completion message */}
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="p-8 text-center space-y-6">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <svg
                        className="w-8 h-8 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    
                    <div className="space-y-2">
                      <h1 className="text-2xl font-bold text-gray-900">
                        Onboarding Complete!
                      </h1>
                      <p className="text-gray-600">
                        Thank you for completing the IMTO partner onboarding process.
                        Your submission is now under review.
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-2">
                      What happens next?
                    </h3>
                    <ul className="text-sm text-blue-800 space-y-1 text-left">
                      <li>• Our compliance team will review your submission</li>
                      <li>• You'll receive updates via email</li>
                      <li>• The review process typically takes 3-5 business days</li>
                      <li>• You may be contacted for additional information if needed</li>
                    </ul>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Go to Dashboard
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Print Summary
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main onboarding interface
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Progress sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <OnboardingProgress />
            </div>
          </div>

          {/* Main content area */}
          <div className="lg:col-span-3">
            {currentStep ? (
              <DynamicOnboardingForm 
                stepId={currentStep.id}
              />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-600">
                    No current step available. Please check your onboarding progress.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Note: Metadata cannot be exported from client components
// For SEO, consider using next/head or moving metadata to a parent server component