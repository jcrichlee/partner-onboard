
'use client';

import { useState, useEffect, useCallback } from 'react';
import { SubmissionContext, SubmissionContextType, useSubmission } from './use-submission';
import { OnboardingSubmission, getOrCreateSubmissionForUser, updateSubmission, OnboardingFile } from '@/lib/firestore';
import { useToast } from './use-toast';
import { useAuth } from './use-auth-client';
import { deleteUserFile } from '@/lib/storage';

export function SubmissionProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [submission, setSubmission] = useState<OnboardingSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsLoading(false);
      // Optionally redirect to login here
      return;
    }

    const fetchSubmission = async () => {
      try {
        setIsLoading(true);
        const sub = await getOrCreateSubmissionForUser();
        setSubmission(sub);
      } catch (error) {
        console.error("Failed to fetch or create submission", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load submission data.' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmission();
  }, [user, authLoading, toast]);
  
  const updateLocalSubmission = (data: Partial<OnboardingSubmission>) => {
    setSubmission(prev => prev ? { ...prev, ...data } : null);
  };

  const handleUpdate = useCallback(async (data: Partial<OnboardingSubmission>) => {
    if (!submission) return;
    updateLocalSubmission(data); // Optimistic update
    try {
      await updateSubmission(submission.id, data);
    } catch (error) {
      console.error("Failed to update submission", error);
      toast({ variant: "destructive", title: "Save Failed", description: "Your changes could not be saved. Please try again." });
      // Revert optimistic update might be needed here
    }
  }, [submission, toast]);

  const handleAddFile = useCallback(async (file: OnboardingFile) => {
    if (!submission) return;
    const newFiles = [...submission.files, file];
    updateLocalSubmission({ files: newFiles }); // Optimistic
    try {
        await updateSubmission(submission.id, { files: newFiles });
    } catch (error) {
        console.error("Failed to add file", error);
        toast({ variant: "destructive", title: "Save Failed", description: "Could not save uploaded file. Please try again." });
    }
  }, [submission, toast]);
  
  const handleRemoveFile = useCallback(async (storagePath: string) => {
    if (!submission) return;
    
    const newFiles = submission.files.filter(f => f.storagePath !== storagePath);
    updateLocalSubmission({ files: newFiles }); // Optimistic UI update

     try {
        // Delete from storage first
        await deleteUserFile(storagePath);
        // Then update Firestore
        await updateSubmission(submission.id, { files: newFiles });
        toast({ title: "File Removed", description: "The file has been successfully deleted."});
    } catch (error) {
        console.error("Failed to remove file", error);
        toast({ variant: "destructive", title: "Deletion Failed", description: "Could not remove file. Please try again." });
        // Revert UI change on failure
        updateLocalSubmission({ files: submission.files });
    }
  }, [submission, toast]);

  const value: SubmissionContextType = {
    submission,
    setSubmission,
    update: handleUpdate,
    addFile: handleAddFile,
    removeFile: handleRemoveFile,
    isLoading
  };

  return (
    <SubmissionContext.Provider value={value}>
      {children}
    </SubmissionContext.Provider>
  );
}

export { useSubmission };
