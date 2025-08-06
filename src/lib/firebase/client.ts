// Firebase Web SDK for client-side operations
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyASEiAQiq7uHyD-DaDrdV0jTmlTZ57Xd28",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "imto-onboarding-portal.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "imto-onboarding-portal",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "imto-onboarding-portal.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "151368865533",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:151368865533:web:a14c0ead94061237d15094",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ""
};

// Initialize Firebase for client-side
const app = initializeApp(firebaseConfig);

// Initialize Firestore with improved settings
const db = getFirestore(app);

// Export client-side Firebase services
export const auth = getAuth(app);
export { db };
export const storage = getStorage(app);
export { app };