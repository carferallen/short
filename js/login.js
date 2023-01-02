import { signInWithEmailAndPassword, updatePassword, updateProfile, signOut, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js"
import { auth } from "./firebase.js";

export var currentUser;

$("#login-form").on("submit", async (e) => {
  e.preventDefault();
  const email = $("#login-form #login-email").val();
  const password = $("#login-form #login-password").val();

  try {
    const userCredentials = await signInWithEmailAndPassword(auth, email, password);
    $('#signinModal').modal('hide');
    $('#signinModal').trigger('reset');
    currentUser = userCredentials.user;
    if (!currentUser.displayName) {
      $('#updateModal').modal('show');
    }
  }
  catch (error) {
    if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
      alert("Usuario o contraseña incorrectos")
    } else {
      alert("Algo salió mal...\n", error)
    }
  }
});

$('#update-form').on("submit", async (e) => {
  e.preventDefault();
  const nombre = $('#update-form #displayName').val();
  const newPassword = $('#update-form #newPassword').val();
  const NewPasswordCheck = $('#update-form #newPasswordCheck').val();

  if (NewPasswordCheck != newPassword) {
    alert("las contraseñas no coinciden");
    return;
  }

  try {
    await updatePassword(currentUser, newPassword);
    await updateProfile(currentUser,{displayName: nombre});
    $('#logged_name').html(`Hola, ${currentUser.displayName}`);
    $('#updateModal').modal('hide');
    $('#updateModal').trigger('reset');
    }
  catch (error) {
    alert("Algo salió mal... \n" + error)
    };
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    if (user.displayName) {
      $('#logged_name').html(`Hola, ${user.displayName}`);
    }
  } else {
    $('#logged_name').html("");
    $('#signinModal').modal('show');
  }
  currentUser = user;
});

$('#logout').on("click", async (e) => {
  e.preventDefault();
  try {
    await signOut(auth)
  } catch (error) {
    console.log(error)
  }
});

$('#logged_name').on("click", (e) => {
  if (e.ctrlKey) {
    $('#updateModal').modal('show')
  }
});