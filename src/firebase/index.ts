'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

export function initializeFirebase() {
  let firebaseApp: FirebaseApp;

  // Check if all required config values are present
  const isConfigValid = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== 'undefined' && firebaseConfig.apiKey !== 'pending';

  if (getApps().length > 0) {
    firebaseApp = getApp();
  } else {
    // If config is missing or invalid, we still initialize but operations will fail gracefully 
    // rather than crashing the whole initialization sequence with mock strings.
    firebaseApp = initializeApp(isConfigValid ? firebaseConfig : {
      apiKey: "pending",
      authDomain: "pending",
      projectId: "pending",
      storageBucket: "pending",
      messagingSenderId: "pending",
      appId: "pending"
    });
  }

  const firestore: Firestore = getFirestore(firebaseApp);
  const auth: Auth = getAuth(firebaseApp);

  return { firebaseApp, firestore, auth };
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './hooks/use-memo-firebase';
