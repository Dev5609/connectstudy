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
    // We ensure that we don't pass undefined values to initializeApp if we can help it,
    // although the error usually comes from getAuth failing on invalid keys.
    const config = {
      apiKey: firebaseConfig.apiKey || "missing-api-key",
      authDomain: firebaseConfig.authDomain || "",
      projectId: firebaseConfig.projectId || "missing-project-id",
      storageBucket: firebaseConfig.storageBucket || "",
      messagingSenderId: firebaseConfig.messagingSenderId || "",
      appId: firebaseConfig.appId || "",
    };
    firebaseApp = initializeApp(config);
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
