"use server";

import { adminDb, verifyAdminAccess } from "../firebase/admin";
import { CompanyInfoSchema, ComplianceSchema, SecuritySchema } from "../schemas";
import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";

// Server action for getting submissions (admin only)
export async function getSubmissions(currentUserUid: string) {
  try {
    // Verify admin access
    const isAdmin = await verifyAdminAccess(currentUserUid);
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const submissionsSnapshot = await adminDb
      .collection("onboardingSubmissions")
      .orderBy("lastUpdated", "desc")
      .get();

    const submissions = submissionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: submissions };
  } catch (error) {
    console.error("Error getting submissions:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to get submissions" 
    };
  }
}

// Server action for getting a specific submission
export async function getSubmissionById(submissionId: string, currentUserUid: string) {
  try {
    const submissionDoc = await adminDb
      .collection("onboardingSubmissions")
      .doc(submissionId)
      .get();

    if (!submissionDoc.exists) {
      return { success: false, message: "Submission not found" };
    }

    const submissionData = submissionDoc.data();
    
    // Check if user has access to this submission
    const isAdmin = await verifyAdminAccess(currentUserUid);
    if (!isAdmin && submissionData?.partnerId !== currentUserUid) {
      throw new Error("Unauthorized: Access denied");
    }

    return {
      success: true,
      data: {
        id: submissionDoc.id,
        ...submissionData,
      }
    };
  } catch (error) {
    console.error("Error getting submission:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to get submission" 
    };
  }
}

// Server action for updating company info
export async function updateCompanyInfo(
  submissionId: string,
  data: any,
  currentUserUid: string
) {
  try {
    // Validate input
    const validatedData = CompanyInfoSchema.parse(data);

    // Get submission to verify ownership
    const submissionDoc = await adminDb
      .collection("onboardingSubmissions")
      .doc(submissionId)
      .get();

    if (!submissionDoc.exists) {
      throw new Error("Submission not found");
    }

    const submissionData = submissionDoc.data();
    const isAdmin = await verifyAdminAccess(currentUserUid);
    
    if (!isAdmin && submissionData?.partnerId !== currentUserUid) {
      throw new Error("Unauthorized: Access denied");
    }

    // Update submission
    await adminDb.collection("onboardingSubmissions").doc(submissionId).update({
      ...validatedData,
      lastUpdated: new Date().toISOString(),
      timeline: FieldValue.arrayUnion({
        icon: "📝",
        title: "Company Information Updated",
        actor: isAdmin ? "Admin" : "Partner",
        date: new Date().toISOString(),
        content: "Company information has been updated",
        category: "company-info",
      }),
    });

    revalidatePath(`/onboarding`);
    revalidatePath(`/admin/submission/${submissionId}`);
    
    return { success: true, message: "Company information updated successfully" };
  } catch (error) {
    console.error("Error updating company info:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to update company information" 
    };
  }
}

// Server action for updating compliance info
export async function updateComplianceInfo(
  submissionId: string,
  data: any,
  currentUserUid: string
) {
  try {
    // Validate input
    const validatedData = ComplianceSchema.parse(data);

    // Get submission to verify ownership
    const submissionDoc = await adminDb
      .collection("onboardingSubmissions")
      .doc(submissionId)
      .get();

    if (!submissionDoc.exists) {
      throw new Error("Submission not found");
    }

    const submissionData = submissionDoc.data();
    const isAdmin = await verifyAdminAccess(currentUserUid);
    
    if (!isAdmin && submissionData?.partnerId !== currentUserUid) {
      throw new Error("Unauthorized: Access denied");
    }

    // Update submission
    await adminDb.collection("onboardingSubmissions").doc(submissionId).update({
      ...validatedData,
      lastUpdated: new Date().toISOString(),
      timeline: FieldValue.arrayUnion({
        icon: "✅",
        title: "Compliance Information Updated",
        actor: isAdmin ? "Admin" : "Partner",
        date: new Date().toISOString(),
        content: "Compliance information has been updated",
        category: "compliance",
      }),
    });

    revalidatePath(`/onboarding`);
    revalidatePath(`/admin/submission/${submissionId}`);
    
    return { success: true, message: "Compliance information updated successfully" };
  } catch (error) {
    console.error("Error updating compliance info:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to update compliance information" 
    };
  }
}

// Server action for updating security info
export async function updateSecurityInfo(
  submissionId: string,
  data: any,
  currentUserUid: string
) {
  try {
    // Validate input
    const validatedData = SecuritySchema.parse(data);

    // Get submission to verify ownership
    const submissionDoc = await adminDb
      .collection("onboardingSubmissions")
      .doc(submissionId)
      .get();

    if (!submissionDoc.exists) {
      throw new Error("Submission not found");
    }

    const submissionData = submissionDoc.data();
    const isAdmin = await verifyAdminAccess(currentUserUid);
    
    if (!isAdmin && submissionData?.partnerId !== currentUserUid) {
      throw new Error("Unauthorized: Access denied");
    }

    // Update submission
    await adminDb.collection("onboardingSubmissions").doc(submissionId).update({
      ...validatedData,
      lastUpdated: new Date().toISOString(),
      timeline: FieldValue.arrayUnion({
        icon: "🔒",
        title: "Security Information Updated",
        actor: isAdmin ? "Admin" : "Partner",
        date: new Date().toISOString(),
        content: "Security information has been updated",
        category: "security",
      }),
    });

    revalidatePath(`/onboarding`);
    revalidatePath(`/admin/submission/${submissionId}`);
    
    return { success: true, message: "Security information updated successfully" };
  } catch (error) {
    console.error("Error updating security info:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to update security information" 
    };
  }
}

// Server action for updating submission status
export async function updateSubmissionStatus(
  submissionId: string,
  status: string,
  currentUserUid: string
) {
  try {
    // Verify admin access
    const isAdmin = await verifyAdminAccess(currentUserUid);
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    await adminDb.collection("onboardingSubmissions").doc(submissionId).update({
      status,
      lastUpdated: new Date().toISOString(),
      timeline: FieldValue.arrayUnion({
        icon: status === "Approved" ? "✅" : status === "Rejected" ? "❌" : "📝",
        title: `Status Updated to ${status}`,
        actor: "Admin",
        date: new Date().toISOString(),
        content: `Submission status changed to ${status}`,
        category: "status",
      }),
    });

    revalidatePath(`/admin/submission/${submissionId}`);
    revalidatePath(`/admin`);
    
    return { success: true, message: "Status updated successfully" };
  } catch (error) {
    console.error("Error updating status:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to update status" 
    };
  }
}

// Server action for getting dashboard metrics
export async function getDashboardMetrics(currentUserUid: string) {
  try {
    // Verify admin access
    const isAdmin = await verifyAdminAccess(currentUserUid);
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const [submissionsSnapshot, usersSnapshot] = await Promise.all([
      adminDb.collection("onboardingSubmissions").get(),
      adminDb.collection("users").get(),
    ]);

    const submissions = submissionsSnapshot.docs.map(doc => doc.data());
    const users = usersSnapshot.docs.map(doc => doc.data());

    const totalPartners = users.filter(user => user.role === "partner").length;
    const completedOnboards = submissions.filter(sub => sub.status === "Approved").length;
    const totalAdmins = users.filter(user => user.role === "admin" || user.role === "superadmin").length;
    
    // Calculate total file size
    let totalFileSize = 0;
    submissions.forEach(submission => {
      if (submission.files) {
        submission.files.forEach((file: any) => {
          totalFileSize += file.size || 0;
        });
      }
    });

    return {
      success: true,
      data: {
        totalPartners,
        completedOnboards,
        totalAdmins,
        totalFileSize,
      }
    };
  } catch (error) {
    console.error("Error getting dashboard metrics:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to get dashboard metrics" 
    };
  }
}