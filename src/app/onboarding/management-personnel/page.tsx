"use client";

import { DynamicOnboardingForm } from "@/components/dynamic-onboarding-form";
import { ONBOARDING_STEPS } from "@/lib/schemas/onboarding-steps";

export default function ManagementPersonnelPage() {
  const step = ONBOARDING_STEPS.find(s => s.id === 'management-personnel');
  
  if (!step) {
    return <div>Step not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <DynamicOnboardingForm step={step} />
    </div>
  );
}