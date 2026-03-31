import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB0yUuMsIuQzUQq2HVGZS6Fe9MyP-7O1s8",
  authDomain: "cct-fieldops.firebaseapp.com",
  projectId: "cct-fieldops",
  storageBucket: "cct-fieldops.firebasestorage.app",
  messagingSenderId: "893492128487",
  appId: "1:893492128487:web:121e9cf3affcec2e79d042",
};

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
