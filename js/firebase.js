import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js"
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js"

const firebaseConfig = {
  apiKey: "AIzaSyAyd1mkUo8O2OrT3OQEqi2M7DY6UHgFEpk",
  authDomain: "gestor-de-campanas.firebaseapp.com",
  projectId: "gestor-de-campanas",
  storageBucket: "gestor-de-campanas.appspot.com",
  messagingSenderId: "159977320087",
  appId: "1:159977320087:web:ab90aa5c21f95745dcc3d2"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const db = getFirestore(app)