import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD4Xc0zsRY1L1o7bDOojk5EcyCVdUm68a4",
  authDomain: "villanueva-waste-operations.firebaseapp.com",
  projectId: "villanueva-waste-operations",
  storageBucket: "villanueva-waste-operations.firebasestorage.app",
  messagingSenderId: "1014816241667",
  appId: "1:1014816241667:web:49bbfd45fa3e1b2f917636",
  measurementId: "G-EQJHHY926W"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);