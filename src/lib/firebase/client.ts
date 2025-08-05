// Firebase Web SDK for client-side operations
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  "projectId": "imto-onboarding-portal",
  "appId": "1:151368865533:web:a14c0ead94061237d15094",
  "storageBucket": "imto-onboarding-portal.firebasestorage.app",
  "apiKey": "AIzaSyASEiAQiq7uHyD-DaDrdV0jTmlTZ57Xd28",
  "authDomain": "imto-onboarding-portal.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "151368865533"
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