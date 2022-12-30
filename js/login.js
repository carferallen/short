import { signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js"
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js"
import { auth } from "./firebase.js";

export var currentUser;

const signInForm = document.querySelector("#login-form");

signInForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = signInForm["login-email"].value;
  const password = signInForm["login-password"].value;

  try {
    const userCredentials = await signInWithEmailAndPassword(auth, email, password)
    const modal = bootstrap.Modal.getInstance(signInForm.closest('.modal'));
    modal.hide();
    signInForm.reset();
    $('#logged_email').html(`Bienvenido,&nbsp;${userCredentials.user.email}`);
  }
  catch (error) {
    if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
      alert("Usuario o contraseña incorrectos")
    } else {
      alert("Algo salió mal...", "error")
    }
  }
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    $('#logged_email').html(`Bienvenido, ${user.email}`);
  } else {
    $('#signinModal').modal('show');
  }
});

$('#logout').on("click", async (e) => {
  e.preventDefault();
  try {
    await signOut(auth)
    $('#logged_email').html("");
  } catch (error) {
    console.log(error)
  }
});