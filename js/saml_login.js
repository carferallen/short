import { getAuth, getRedirectResult, signInWithRedirect, SAMLAuthProvider, updatePassword, updateProfile, signOut, signInWithPopup} from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js"
import { auth, app } from "./firebase.js";
import { alert } from "./init.js";

var currentUser;

const cargaModal = function(id,formId,label,code) {
  let html = `
  <div class="modal fade" id="${id}" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
  <div class="modal-dialog">
      <div class="modal-content">
          <div class="modal-header">
          <h3>${label}</h3>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div id="Alertas"></div>
          <div class="modal-body">
          
          </div>
      </div>
  </div>
  </div>`
  $('body').append(html);
}

const inicializa = function() {
  
  cargaModal('signinModal','login-form','Identifícate');
  // cargaModal('updateModal','update-form', 'Actualiza tus datos');
  
  function onAuthStateChanged(user) {
    if (user) {
      $('#signinModal').modal('hide');
      $('#signinModal').trigger('reset');
      currentUser = user;
    } else {
      // The user is not logged in
      console.log("The user is not logged in");
      logIn();
    }
  }
  // Listen for changes in the user's authentication state
  auth.onAuthStateChanged(onAuthStateChanged);

}

const logIn = async () => {
  const provider = new SAMLAuthProvider('saml.respol');
  signInWithPopup(auth, provider)
  .catch((error) => {
      // Handle error.
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
          alert("Usuario o contraseña incorrectos", "danger", "#signinModal #Alertas")
          } else {
          alert("Algo salió mal...\n"+error, "danger","#signinModal #Alertas")
          }
  });
}; 
$('#update-form').on("submit", async (e) => {
  e.preventDefault();
  const nombre = $('#update-form #displayName').val();
  const newPassword = $('#update-form #newPassword').val();
  const NewPasswordCheck = $('#update-form #newPasswordCheck').val();

  if (NewPasswordCheck != newPassword) {
    alert("Las contraseñas no coinciden", "danger", "#updateModal #Alertas");
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
    alert("Algo salió mal... \n" + error, "danger", "#updateModal #Alertas")
    };
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
      e.preventDefault();
      $('#updateModal').modal('show')
    }
  });

  $('#signinModal').on('shown.bs.modal', function () {
    $('#login-email').focus();
  }) 

  $('#updateModal').on('shown.bs.modal', function () {
    $('#displayName').focus();
  })


inicializa();