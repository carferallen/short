import { signInWithEmailAndPassword, updatePassword, updateProfile, signOut} from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js"
import { auth } from "./firebase.js";
import { alert } from "./init.js";

var currentUser;

const cargaModal = function(id,label,code) {
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
          <form id="login-form">
            ${code}    
          </form>
          </div>
      </div>
  </div>
  </div>`
  $('body').append(html);
}

let loginHTML = `
  <label for="email">Email</label>
  <input type="email" id="login-email" class="form-control mb-3" placeholder="email" required>
  <label for="password">Contraseña:</label>
  <input type="password" id="login-password" class="form-control mb-3" placeholder="Contraseña" required>
  <button type="submit" class="btn btn-primary w-100 mb-4">Login</button>`
let updateHTML = `
  <label for="displayName">Nombre completo:</label>
  <input type="text" id="displayName" class="form-control mb-3" placeholder="Nombre*" required>
  <label for="newPassword">Nueva contraseña:</label>
  <input type="password" id="newPassword" class="form-control mb-3" placeholder="Contraseña*" required>
  <label for="newPasswordCheck">Repite la nueva contraseña:</label>
  <input type="password" id="newPasswordCheck" class="form-control mb-3" placeholder="Contraseña*" required>
  <button type="submit" class="btn btn-primary w-100 mb-4">Enviar</button>`

cargaModal('signinModal','Identifícate',loginHTML)  
cargaModal('updateModal','Actualiza tus datos',updateHTML)

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
      alert("Usuario o contraseña incorrectos", "danger", "#signinModal #Alertas")
    } else {
      alert("Algo salió mal...\n"+error, "danger","#signinModal #Alertas")
    }
  }
});

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