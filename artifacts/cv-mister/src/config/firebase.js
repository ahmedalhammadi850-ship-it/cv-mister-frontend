import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// CV-Mister Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDoviZ3FsJ2IkKwKFMsbfvRfGOiuneCaDE",
  authDomain: "cv-mister.firebaseapp.com",
  projectId: "cv-mister",
  storageBucket: "cv-mister.firebasestorage.app",
  messagingSenderId: "888182728955",
  appId: "1:888182728955:web:07225d45d7b2c30a5ba85e",
  measurementId: "G-TDCHMTZL6D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

export default app;
