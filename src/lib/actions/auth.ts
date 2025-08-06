"use server";

import { adminAuth, adminDb, verifyAdminAccess } from "../firebase/admin";
import { CreateUserSchema } from "../schemas";
import { revalidatePath } from "next/cache";

// Server action for creating users (admin only)
export async function createUser(formData: FormData) {
  try {
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      role: formData.get("role") as string,
      canManageUsers: formData.get("canManageUsers") === "true",
    };

    // Validate input
    const validatedData = CreateUserSchema.parse(data);

    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email: validatedData.email,
      password: validatedData.password,
    });

    // Set custom claims for Firebase Auth
    await adminAuth.setCustomUserClaims(userRecord.uid, {
      role: validatedData.role,
    });

    // Create user profile in Firestore
    await adminDb.collection("users").doc(userRecord.uid).set({
      email: validatedData.email,
      role: validatedData.role,
      canManageUsers: validatedData.canManageUsers || false,
      disabled: false,
      notifications: [],
      createdAt: new Date().toISOString(),
    });

    revalidatePath("/admin");
    return { success: true, message: "User created successfully" };
  } catch (error) {
    console.error("Error creating user:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to create user" 
    };
  }
}

// Server action for updating user permissions
export async function updateUserPermissions(
  userId: string,
  permissions: Record<string, string[]>,
  currentUserUid: string
) {
  try {
    // Verify admin access
    const isAdmin = await verifyAdminAccess(currentUserUid);
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    await adminDb.collection("users").doc(userId).update({
      stagePermissions: permissions,
      updatedAt: new Date().toISOString(),
    });

    revalidatePath(`/admin/users/${userId}`);
    return { success: true, message: "Permissions updated successfully" };
  } catch (error) {
    console.error("Error updating permissions:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to update permissions" 
    };
  }
}

// Server action for disabling/enabling users
export async function toggleUserStatus(
  userId: string,
  disabled: boolean,
  currentUserUid: string
) {
  try {
    // Verify admin access
    const isAdmin = await verifyAdminAccess(currentUserUid);
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Update in Firebase Auth
    await adminAuth.updateUser(userId, { disabled });

    // Update in Firestore
    await adminDb.collection("users").doc(userId).update({
      disabled,
      updatedAt: new Date().toISOString(),
    });

    revalidatePath("/admin");
    return { 
      success: true, 
      message: `User ${disabled ? 'disabled' : 'enabled'} successfully` 
    };
  } catch (error) {
    console.error("Error toggling user status:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to update user status" 
    };
  }
}

// Server action for creating partner users
export async function createPartner(email: string, password: string) {
  try {
    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email: email,
      password: password,
    });

    // Set custom claims for Firebase Auth
    await adminAuth.setCustomUserClaims(userRecord.uid, {
      role: 'partner',
    });

    // Create user profile in Firestore
    await adminDb.collection("users").doc(userRecord.uid).set({
      email: email,
      role: 'partner',
      stagePermissions: {},
      canManageUsers: false,
      disabled: false,
      notifications: [],
      createdAt: new Date().toISOString(),
    });

    revalidatePath("/admin");
    return { success: true, message: "Partner created successfully", uid: userRecord.uid };
  } catch (error) {
    console.error("Error creating partner:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to create partner" 
    };
  }
}

// Server action for creating superadmin users (initial setup)
export async function createSuperAdmin(email: string, password: string) {
  try {
    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email: email,
      password: password,
    });

    // Set custom claims for Firebase Auth
    await adminAuth.setCustomUserClaims(userRecord.uid, {
      role: 'superadmin',
    });

    // Create user profile in Firestore
    await adminDb.collection("users").doc(userRecord.uid).set({
      email: email,
      role: 'superadmin',
      stagePermissions: {},
      canManageUsers: true,
      disabled: false,
      notifications: [],
      createdAt: new Date().toISOString(),
    });

    return { success: true, message: "Super admin created successfully", uid: userRecord.uid };
  } catch (error) {
    console.error("Error creating super admin:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to create super admin" 
    };
  }
}

// Server action for creating admin users with stage permissions
export async function createAdmin(
  email: string, 
  password: string, 
  role: string, 
  stagePermissions: Record<string, string[]>, 
  canManageUsers: boolean
) {
  try {
    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email: email,
      password: password,
    });

    // Set custom claims for Firebase Auth
    await adminAuth.setCustomUserClaims(userRecord.uid, {
      role: role,
    });

    // Create user profile in Firestore
    await adminDb.collection("users").doc(userRecord.uid).set({
      email: email,
      role: role,
      stagePermissions: stagePermissions,
      canManageUsers: canManageUsers,
      disabled: false,
      notifications: [],
      createdAt: new Date().toISOString(),
    });

    revalidatePath("/admin");
    return { success: true, message: "Admin created successfully", uid: userRecord.uid };
  } catch (error) {
    console.error("Error creating admin:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to create admin" 
    };
  }
}

// Server action for getting user profile
export async function getUserProfile(uid: string) {
  try {
    const userDoc = await adminDb.collection("users").doc(uid).get();
    
    if (!userDoc.exists) {
      return null;
    }

    const userData = userDoc.data();
    return {
      id: userDoc.id,
      ...userData,
    };
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
}