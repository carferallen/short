import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js"
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js"

const firebaseConfig = {
  apiKey: "AIzaSyCMW_KJTbu75Wyys_EEv7jS2kNqE_4BDvY",
  authDomain: "to-do-e39c2.firebaseapp.com",
  projectId: "to-do-e39c2",
  storageBucket: "to-do-e39c2.appspot.com",
  messagingSenderId: "539552289828",
  appId: "1:539552289828:web:234d5c69b214809fec74b1"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const db = getFirestore(app)