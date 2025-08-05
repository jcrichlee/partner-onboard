"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { doc, getDoc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../lib/firebase/client";
import { type OnboardingSubmission, type FileUpload } from "../lib/schemas";
import { type OnboardingFile } from "../lib/schemas/onboarding-steps";
import { useAuth } from "./use-auth-client";
import { toast } from "sonner";
import { generateId } from "../lib/utils";

interface SubmissionContextType {
  submission: OnboardingSubmission | null;
  loading: boolean;
  updateSubmission: (data: Partial<OnboardingSubmission>) => Promise<void>;
  updateSubmissionData: (data: Partial<OnboardingSubmission>) => Promise<void>;
  addFile: (file: File, category: string, fieldId: string, storagePath?: string) => Promise<void>;
  removeFile: (fileToRemove: FileUpload | OnboardingFile) => Promise<void>;
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

    // Set up real-time listener for the user's submission
    const submissionRef = doc(db, "onboardingSubmissions", user.uid);
    
    const unsubscribe = onSnapshot(
      submissionRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          if (data) {
            setSubmission({
              id: doc.id,
              partnerId: data.partnerId,
              partnerName: data.partnerName,
              partnerEmail: data.partnerEmail,
              status: data.status,
              lastUpdated: data.lastUpdated,
              createdAt: data.createdAt,
              timeline: data.timeline || [],
              files: data.files || [],
              chat: data.chat || [],
              sectionStatus: data.sectionStatus || {},
              steps: data.steps || {},
              currentStep: data.currentStep,
              completedAt: data.completedAt,
              companyName: data.companyName,
              businessDescription: data.businessDescription,
              companyUrl: data.companyUrl,
              pepDisclosure: data.pepDisclosure,
              pepDetails: data.pepDetails,
              hasComplianceOfficer: data.hasComplianceOfficer,
              hasSecurityAudits: data.hasSecurityAudits,
            });
          }
        } else {
          // Create new submission if it doesn't exist
          createNewSubmission();
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to submission:", error);
        toast.error("Failed to load submission data");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const createNewSubmission = async () => {
    if (!user) return;

    try {
      const newSubmission = {
        partnerId: user.uid,
        partnerName: user.displayName || user.email || "Unknown",
        partnerEmail: user.email,
        status: "draft" as const,
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        timeline: [
          {
            icon: "🚀",
            title: "Onboarding Started",
            actor: "System",
            date: new Date().toISOString(),
            content: "Partner onboarding process has been initiated",
            category: "system",
          },
        ],
        files: [],
        chat: [],
        sectionStatus: {},
      };

      const submissionRef = doc(db, "onboardingSubmissions", user.uid);
      await updateDoc(submissionRef, newSubmission);
    } catch (error) {
      console.error("Error creating submission:", error);
      toast.error("Failed to create submission");
    }
  };

  const updateSubmissionData = async (data: Partial<OnboardingSubmission>) => {
    if (!user || !submission) return;

    try {
      const submissionRef = doc(db, "onboardingSubmissions", user.uid);
      await updateDoc(submissionRef, {
        ...data,
        lastUpdated: new Date().toISOString(),
      });
      
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
      const submissionRef = doc(db, "onboardingSubmissions", user.uid);
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
      const submissionRef = doc(db, "onboardingSubmissions", user.uid);
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
      const submissionRef = doc(db, "onboardingSubmissions", user.uid);
      const submissionDoc = await getDoc(submissionRef);
      
      if (submissionDoc.exists()) {
        const data = submissionDoc.data();
        setSubmission({
          id: submissionDoc.id,
          ...data,
        } as OnboardingSubmission);
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