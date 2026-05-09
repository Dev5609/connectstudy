'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

export function initializeFirebase() {
  let firebaseApp: FirebaseApp;

  if (getApps().length > 0) {
    firebaseApp = getApp();
  } else {
    // If apiKey is missing, it will throw a meaningful error or we can handle it
    if (!firebaseConfig.apiKey) {
      console.warn("Firebase configuration is missing. Please check your environment variables.");
    }
    firebaseApp = initializeApp(firebaseConfig);
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
