// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "imto-onboarding-portal",
  "appId": "1:151368865533:web:a14c0ead94061237d15094",
  "storageBucket": "imto-onboarding-portal.firebasestorage.app",
  "apiKey": "AIzaSyASEiAQiq7uHyD-DaDrdV0jTmlTZ57Xd28",
  "authDomain": "imto-onboarding-portal.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "151368865533"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
