// Firebase Admin SDK for server-side operations
import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

// Initialize Firebase Admin SDK
let adminApp: App;

if (getApps().length === 0) {
  try {
    // Try to use service account key from environment first
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: "imto-onboarding-portal",
        storageBucket: "imto-onboarding-portal.firebasestorage.app"
      });
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH) {
      // Use service account key file path
      adminApp = initializeApp({
        credential: cert(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH),
        projectId: "imto-onboarding-portal",
        storageBucket: "imto-onboarding-portal.firebasestorage.app"
      });
    } else {
      // Use local service account file as fallback
      try {
        const path = require('path');
        const serviceAccountPath = path.join(process.cwd(), 'imto-onboarding-portal-service-account.json');
        adminApp = initializeApp({
          credential: cert(serviceAccountPath),
          projectId: "imto-onboarding-portal",
          storageBucket: "imto-onboarding-portal.firebasestorage.app"
        });
        console.log('Using local service account file for Firebase Admin SDK');
      } catch (localError) {
        // Final fallback to application default credentials for development
        console.warn('No service account key found, using application default credentials');
        adminApp = initializeApp({
          projectId: "imto-onboarding-portal",
          storageBucket: "imto-onboarding-portal.firebasestorage.app"
        });
      }
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
    // Initialize with minimal config for development
    adminApp = initializeApp({
      projectId: "imto-onboarding-portal",
      storageBucket: "imto-onboarding-portal.firebasestorage.app"
    });
  }
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