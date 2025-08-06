"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../lib/firebase/client";
import { type OnboardingSubmission, type OnboardingFile } from "../lib/firestore";
import { type FileUpload } from "../lib/schemas";
import { useAuth } from "./use-auth-client";
import { toast } from "sonner";
import { generateId } from "../lib/utils";

interface SubmissionContextType {
  submission: OnboardingSubmission | null;
  loading: boolean;
  updateSubmission: (_data: Partial<OnboardingSubmission>) => Promise<void>;
  updateSubmissionData: (_data: Partial<OnboardingSubmission>) => Promise<void>;
  addFile: (_file: File, _category: string, _fieldId: string, _storagePath?: string) => Promise<void>;
  removeFile: (_fileToRemove: FileUpload | OnboardingFile) => Promise<void>;
  refreshSubmission: () => Promise<void>;
}

const SubmissionContext = createContext<SubmissionContextType | undefined>(undefined);

export function SubmissionProvider({ children }: { children: ReactNode }) {
  const [submission, setSubmission] = useState<OnboardingSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setSubmission(null);
      setLoading(false);
      return;
    }

    // Load submission data without real-time listener to avoid permission issues
    const loadSubmission = async () => {
      try {
        setLoading(true);
        
        // First try to get existing submission using the query approach
        const { getSubmissionForUser } = await import('../lib/firestore');
        const existingSubmission = await getSubmissionForUser(user.uid);
        
        if (existingSubmission) {
          setSubmission(existingSubmission);
        } else {
          // Create new submission if it doesn't exist
          await createNewSubmission();
        }
      } catch (error) {
        console.error("Error loading submission:", error);
        // Don't show error toast for permission issues during initial load
        if (!(error instanceof Error) || !error.message?.includes('Missing or insufficient permissions')) {
          toast.error("Failed to load submission data");
        }
      } finally {
        setLoading(false);
      }
    };

    loadSubmission();
  }, [user]);

  const createNewSubmission = async () => {
    if (!user) return;

    try {
      // Use the proper function from firestore.ts to create submission
      const { getOrCreateSubmissionForUser } = await import('../lib/firestore');
      const newSubmission = await getOrCreateSubmissionForUser();
      setSubmission(newSubmission);
    } catch (error) {
      console.error("Error creating submission:", error);
      toast.error("Failed to create submission");
    }
  };

  const updateSubmissionData = async (data: Partial<OnboardingSubmission>) => {
    if (!user || !submission) return;

    try {
      const submissionRef = doc(db, "onboardingSubmissions", submission.id);
      await updateDoc(submissionRef, {
        ...data,
        lastUpdated: new Date().toISOString(),
      });
      
      // Update local state optimistically
      setSubmission(prev => prev ? { ...prev, ...data, lastUpdated: new Date().toISOString() } : null);
      
      toast.success("Information saved successfully");
    } catch (error) {
      console.error("Error updating submission:", error);
      toast.error("Failed to save information");
      throw error;
    }
  };

  const addFile = async (file: File, category: string, fieldId: string, customStoragePath?: string) => {
    if (!user || !submission) return;

    try {
      // Generate storage path according to ONBOARDSTEPS.md format
      const fileId = generateId();
      const userEmail = user.email || 'unknown';
      const companyName = submission.companyName || 'unknown-company';
      const stepName = category.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const fieldName = fieldId.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const fileExtension = file.name.split('.').pop();
      const normalizedFileName = `${fieldName}_${Date.now()}.${fileExtension}`;
      
      const storagePath = customStoragePath || 
        `${userEmail}/${companyName}/${stepName}/${fieldName}/${normalizedFileName}`;
      
      const storageRef = ref(storage, storagePath);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      const newFile: OnboardingFile = {
        id: fileId,
        name: file.name,
        url: downloadURL,
        storagePath,
        category,
        fieldName: fieldId,
        uploadedAt: new Date().toISOString(),
        size: file.size,
      };

      // Update Firestore with new file
      const submissionRef = doc(db, "onboardingSubmissions", submission.id);
      await updateDoc(submissionRef, {
        files: arrayUnion(newFile),
        lastUpdated: new Date().toISOString(),
        timeline: arrayUnion({
          icon: "📎",
          title: "File Uploaded",
          actor: "Partner",
          date: new Date().toISOString(),
          content: `Uploaded ${file.name} for ${category}`,
          category,
        }),
      });

      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
      throw error;
    }
  };

  const removeFile = async (fileToRemove: FileUpload | OnboardingFile) => {
    if (!user || !submission) return;

    try {
      // Delete from Firebase Storage
      const storageRef = ref(storage, fileToRemove.storagePath);
      await deleteObject(storageRef);

      // Update Firestore
      const submissionRef = doc(db, "onboardingSubmissions", submission.id);
      await updateDoc(submissionRef, {
        files: arrayRemove(fileToRemove),
        lastUpdated: new Date().toISOString(),
        timeline: arrayUnion({
          icon: "🗑️",
          title: "File Removed",
          actor: "Partner",
          date: new Date().toISOString(),
          content: `Removed ${fileToRemove.name}`,
          category: fileToRemove.category,
        }),
      });

      toast.success("File removed successfully");
    } catch (error) {
      console.error("Error removing file:", error);
      toast.error("Failed to remove file");
      throw error;
    }
  };

  const refreshSubmission = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // Use the proper function from firestore.ts to get submission
      const { getSubmissionForUser } = await import('../lib/firestore');
      const refreshedSubmission = await getSubmissionForUser(user.uid);
      
      if (refreshedSubmission) {
        setSubmission(refreshedSubmission);
      }
    } catch (error) {
      console.error("Error refreshing submission:", error);
      toast.error("Failed to refresh submission");
    } finally {
      setLoading(false);
    }
  };

  // Alias for backward compatibility
  const updateSubmission = updateSubmissionData;

  const value = {
    submission,
    loading,
    updateSubmission,
    updateSubmissionData,
    addFile,
    removeFile,
    refreshSubmission,
  };

  return (
    <SubmissionContext.Provider value={value}>
      {children}
    </SubmissionContext.Provider>
  );
}

export function useSubmission() {
  const context = useContext(SubmissionContext);
  if (context === undefined) {
    throw new Error("useSubmission must be used within a SubmissionProvider");
  }
  return context;
}