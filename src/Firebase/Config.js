import {initializeApp} from 'firebase/app';
import {getFirestore, initializeFirestore} from 'firebase/firestore';
import {getAuth} from 'firebase/auth';
import {getStorage} from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDKtgIdwhJwHkTg7o9fJBDx1p-s3vTEnPQ',
  authDomain: 'gift-food-3cc16.firebaseapp.com',
  projectId: 'gift-food-3cc16',
  storageBucket: 'gift-food-3cc16.appspot.com',
  messagingSenderId: '563390510911',
  appId: '1:563390510911:web:5dc4f1d9038da646bb858a',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

initializeFirestore(app, {experimentalAutoDetectLongPolling: true});

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
