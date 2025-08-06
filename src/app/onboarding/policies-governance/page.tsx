"use client";

import { DynamicOnboardingForm } from "@/components/dynamic-onboarding-form";
import { ONBOARDING_STEPS } from "@/lib/schemas/onboarding-steps";

export default function PoliciesGovernancePage() {
  const step = ONBOARDING_STEPS.find(s => s.id === 'policies-governance');
  
  if (!step) {
    return <div>Step not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <DynamicOnboardingForm step={step} />
    </div>
  );
}