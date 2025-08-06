"use client";

import { DynamicOnboardingForm } from "@/components/dynamic-onboarding-form";
import { ONBOARDING_STEPS } from "@/lib/schemas/onboarding-steps";

export default function SecurityCompliancePage() {
  const step = ONBOARDING_STEPS.find(s => s.id === 'security-compliance');
  
  if (!step) {
    return <div>Step not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <DynamicOnboardingForm step={step} />
    </div>
  );
}