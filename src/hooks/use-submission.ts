
'use client';

import { createContext, useContext } from 'react';
import { type OnboardingSubmission, type OnboardingFile } from '@/lib/firestore';

export interface SubmissionContextType {
  submission: OnboardingSubmission | null;
  setSubmission: (submission: OnboardingSubmission | null) => void;
  update: (data: Partial<OnboardingSubmission>) => Promise<void>;
  addFile: (file: OnboardingFile) => Promise<void>;
  removeFile: (storagePath: string) => Promise<void>;
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
