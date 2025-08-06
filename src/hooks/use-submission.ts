
'use client';

import { createContext, useContext } from 'react';
import { type OnboardingSubmission, type OnboardingFile } from '@/lib/firestore';

export interface SubmissionContextType {
  submission: OnboardingSubmission | null;
  setSubmission: (_submission: OnboardingSubmission | null) => void;
  update: (_data: Partial<OnboardingSubmission>) => Promise<void>;
  addFile: (_file: OnboardingFile) => Promise<void>;
  removeFile: (_storagePath: string) => Promise<void>;
  isLoading: boolean;
}

export const SubmissionContext = createContext<SubmissionContextType | undefined>(undefined);

export function useSubmission() {
  const context = useContext(SubmissionContext);
  if (context === undefined) {
    throw new Error('useSubmission must be used within a SubmissionProvider');
  }
  return context;
}
