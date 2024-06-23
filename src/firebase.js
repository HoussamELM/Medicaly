// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDlHHuDI6mjOwtWV-5UwuMPOeuzC4Ve-c4",
    authDomain: "medicaly-e43d6.firebaseapp.com",
    projectId: "medicaly-e43d6",
    storageBucket: "medicaly-e43d6.appspot.com",
    messagingSenderId: "742265060770",
    appId: "1:742265060770:web:cc021c898427705655c6fb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Set auth persistence
setPersistence(auth, browserLocalPersistence)
    .then(() => {
        console.log("Persistence set to LOCAL");
    })
    .catch((error) => {
        console.error("Error setting persistence:", error);
    });

