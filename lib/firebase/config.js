import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA0V8VbtBSoBu2Ya2ypQiGNtk1cDpzp70U",
  authDomain: "polytechnic-hub-82685.firebaseapp.com",
  projectId: "polytechnic-hub-82685",
  storageBucket: "polytechnic-hub-82685.firebasestorage.app",
  messagingSenderId: "609741840575",
  appId: "1:609741840575:web:9e748312f8509ebdad660a",
  measurementId: "G-JWTYJFJFLH",
};

// Initialize Firebase safely for SSR/Client
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, firebaseConfig };
