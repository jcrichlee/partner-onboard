// Firebase Admin SDK for server-side operations
import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

// Initialize Firebase Admin SDK
let adminApp: App;

if (getApps().length === 0) {
  // In production, use service account key from environment
  // In development, you can use the service account file
  let serviceAccount;
  
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  } else {
    // Fallback for development - you should add your service account file
    serviceAccount = {
      projectId: "imto-onboarding-portal",
      // Add other required fields or use application default credentials
    };
  }

  adminApp = initializeApp({
    credential: cert(serviceAccount),
    projectId: "imto-onboarding-portal",
    storageBucket: "imto-onboarding-portal.firebasestorage.app"
  });
} else {
  adminApp = getApps()[0] as App;
}

// Export admin services
export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
export const adminStorage = getStorage(adminApp);
export { adminApp };

// Helper function to verify admin access
export async function verifyAdminAccess(uid: string): Promise<boolean> {
  try {
    const userDoc = await adminDb.collection('users').doc(uid).get();
    const userData = userDoc.data();
    return userData?.role === 'admin' || userData?.role === 'superadmin';
  } catch (error) {
    console.error('Error verifying admin access:', error);
    return false;
  }
}