import { onAuthStateChanged} from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js"
import { auth } from "./firebase.js";
import { get_log } from "./firestore.js";
import { } from "./login.js";

window.abreURL = function(linea){
    let destino = linea.getAttribute("destino");
    window.open(destino);
}

const carga_log = async function() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    let lineas = urlParams.get('l') || '10';
    let listado = await get_log(lineas);
    $('#listado').hide();
    $('#listado table>tbody').empty();
    let html;
    listado.forEach(campana => {
        html += `
            <tr onclick="abreURL(this)" destino="${campana.data().url}" title="${campana.data().url}">
                <td>${campana.data().timestamp.toDate().toISOString()}</td>
                <td>${campana.data().fecha}</td>
                <td>${campana.data().nombre}</td>
                <td>${campana.data().utm_source}</td>
                <td>${campana.data().utm_medium}</td>
                <td>${campana.data().utm_campaign}</td>
                <td>${campana.data().utm_content}</td>
                <td>${campana.data().sf_eyg_source}</td>
                <td>${campana.data().user}</td>
            </tr>
        `
    });
    await $('#listado table>tbody').append(html);
    $('#listado table').dataTable({
        destroy: true,
        order: [[0, 'desc']],
        language: {
            url: 'js/datatables.es.json'
        },
        pagingType: "simple_numbers"
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