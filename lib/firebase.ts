import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyARXqwmaKcUf5UVwtzzNd8vUb5ni1slQdo",
  authDomain: "usc-dining.firebaseapp.com",
  projectId: "usc-dining",
  storageBucket: "usc-dining.appspot.com",
  messagingSenderId: "591824839300",
  appId: "1:591824839300:web:a4465713d47faea897d8d1",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
