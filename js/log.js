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
    $('#listado table').dataTable({
        aaData: listado,
        destroy: true,
        order: [[0, 'desc']],
        language: {
            url: 'js/datatables.es.json'
        },
        columnDefs: [
            {
                target: 3,
                visible: false,
                searchable: false,
            }
        ],
        dom: "<'row'<'col-md-6'l><'col-md-6'Bf>>" +
                "<'row'<'col-md-12'rt>>" +
                "<'row'<'col-md-6'i><'col-md-6'p>>",
        buttons: [
            {
                extend: 'excelHtml5',
                text: '<i class="bi bi-file-earmark-excel-fill"></i>',
                title: 'Exportación_GestordeCampañas',
                download: 'open',
                orientation:'landscape',    
                className: 'btn btn-primary btn-excel', 
            }],
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