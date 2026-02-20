// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/setup#config-object
const firebaseConfig = {
  apiKey: "AIzaSyDZeUeNgQPuSqAu6flOMjTJrwQ9WaZl9hg",
  authDomain: "gear4rent-a735f.firebaseapp.com",
  projectId: "gear4rent-a735f",
  storageBucket: "gear4rent-a735f.firebasestorage.app",
  messagingSenderId: "600136039578",
  appId: "1:600136039578:web:ccfb783f9bf0e7ea313323",
  measurementId: "G-V3CY9CYCSW"
};

// Initialize Firebase
let app, auth, db, storage, analytics;

try {
  app = initializeApp(firebaseConfig);
  // analytics = getAnalytics(app); // Optional
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.warn("Firebase initialization failed (likely due to missing config). Using mock mode.", error);
}

export { auth, db, storage };
