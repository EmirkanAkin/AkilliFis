import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// @ts-ignore: Firebase'in TypeScript tanımlarındaki hatayı (bug) susturmak için eklendi
import { getReactNativePersistence, initializeAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCO0ta9hTJHpEM1Ykd6-cIxh2lveLKxsu4",
  authDomain: "akillifis.firebaseapp.com",
  projectId: "akillifis",
  storageBucket: "akillifis.firebasestorage.app",
  messagingSenderId: "1062272519950",
  appId: "1:1062272519950:web:0e368ba186dd51d765d15f",
};

export const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
