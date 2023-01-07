import { onAuthStateChanged} from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js"
import { auth } from "./firebase.js";
import { get_log } from "./firestore.js";
import { } from "./login.js";

const carga_log = async function() {
    let listado = await get_log();
    $('#listado').hide()
    $('#listado table>tbody').empty();
    let html;
    listado.forEach(campana => {
        html += `
            <tr>
                <td>${campana.data().timestamp.toDate().toISOString()}</td>
                <td>${campana.data().fecha}</td>
                <td>${campana.data().nombre}</td>
                <td>${campana.data().descripcion}</td>
                <td>${campana.data().utm_source}</td>
                <td>${campana.data().utm_medium}</td>
                <td>${campana.data().utm_campaign}</td>
                <td>${campana.data().utm_content}</td>
                <td><a href="mailto:${campana.data().email}">${campana.data().user}</a></td>
            </tr>
        `
    });
    await $('#listado table>tbody').append(html);
    $('#listado table').dataTable({
        destroy: true,
        language: {
            url: 'js/datatables.es.json'
        }
    });
    $('#DataTables_Table_0_filter label>input').addClass('form-control');
    $('#listado').show()
};

onAuthStateChanged(auth, (user) => {
    if (user) {
      if (user.displayName) {
        $('#logged_name').html(`Hola, ${user.displayName}`);
        carga_log();
      }
    } else {
      $('#logged_name').html("");
      $('#signinModal').modal('show');
    }
});