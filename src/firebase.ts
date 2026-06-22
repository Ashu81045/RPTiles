import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAG78MmNwtvXpPqvUfsKvBLHeIcgHVBMBw",
  authDomain: "rptiles.firebaseapp.com",
  projectId: "rptiles",
  storageBucket: "rptiles.firebasestorage.app",
  messagingSenderId: "1090345023015",
  appId: "1:1090345023015:web:a1533a49d847587eee0002"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore with custom database ID
export const db = getFirestore(app, "ai-studio-a9c5be55-bdb4-4c2e-b82a-98857d86b9c7");

// Define a unified helper for synchronizing our whole app's store in a single or modular collections.
// Given that products, movements, invoices, customer_payments patterns are highly coupled, storing them under collections is best.

// Helper functions for easy document setting/getting
export async function saveDocument(collectionName: string, docId: string, data: any) {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    console.error(`Error saving document to collection ${collectionName}:`, error);
  }
}

export { app };
