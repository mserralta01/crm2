// Import the functions you need from the Firebase SDKs
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA84mJDOKyZI3UTvbitAlyh00Feuj1vn6U",
  authDomain: "crm2-599eb.firebaseapp.com",
  projectId: "crm2-599eb",
  storageBucket: "crm2-599eb.firebasestorage.app",
  messagingSenderId: "731447884898",
  appId: "1:731447884898:web:3be3694ddca6bc51a9e53b",
  measurementId: "G-PEXDYDNSG3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Analytics - only on client side
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, auth, db, storage, analytics }; 