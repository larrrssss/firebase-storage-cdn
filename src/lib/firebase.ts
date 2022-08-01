
import firebase from 'firebase-admin';

firebase.initializeApp({
  credential: firebase.credential.cert(process.env.FIREBASE_CERT_PATH || '') ,
  storageBucket: process.env.FIREBASE_BUCKET_NAME || '',
});

export const storage = firebase.storage().bucket();