import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// User specified Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDiVoG9FmFRC0VDTDmke-FIr5PMDQ0pCyA",
  authDomain: "sharansthan-student-management.firebaseapp.com",
  projectId: "sharansthan-student-management",
  storageBucket: "sharansthan-student-management.firebasestorage.app",
  messagingSenderId: "301574856280",
  appId: "1:301574856280:web:cf00c7497efbfeb922f42d",
  measurementId: "G-JERVJ2CPLJ"
};

// Initialize Firebase safely with proper TypeScript types
const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { auth, db };

