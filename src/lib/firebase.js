// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCQqOEFAX3FfPqqqYhdiRAHObOJ3_w3cN0",
  authDomain: "gigmate-9931b.firebaseapp.com",
  projectId: "gigmate-9931b",
  storageBucket: "gigmate-9931b.firebasestorage.app",
  messagingSenderId: "441436365582",
  appId: "1:441436365582:web:687c316e189e90d98bed5f",
  measurementId: "G-6BRTRRB7Y7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);