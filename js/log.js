import { onAuthStateChanged} from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js"
import { auth } from "./firebase.js";
import { get_log } from "./firestore.js";
import { } from "./login.js";

const carga_log = async function() {
    let listado = await get_log();
    $('#listado').hide()
    $('#listado table>tbody').empty();
        listado.forEach(campana => {
            let html = `
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
        $('#listado table>tbody').append(html);
    });
    var currentPage = 0;
    var numPerPage = 10;
    var $table = $('#listado table');
    $table.bind('repaginate', function () {
        $table.find('tbody tr').hide().slice(currentPage * numPerPage, (currentPage + 1) * numPerPage).show();
    });
    $table.trigger('repaginate');
    var numRows = $table.find('tbody tr').length;
    var numPages = Math.ceil(numRows / numPerPage);
    var $pager = $('<div class="pager"></div>');
    for (var page = 0; page < numPages; page++) {
        $('<span class="page-number"></span>').text(page + 1).bind('click', {
            newPage: page
        }, function (event) {
            currentPage = event.data['newPage'];
            $table.trigger('repaginate');
            $(this).addClass('active').siblings().removeClass('active');
        }).appendTo($pager).addClass('clickable');
    }
    if (numRows > numPerPage) {
        $pager.insertAfter($table).find('span.page-number:first').addClass('active');
    }
    $('#listado').show()
};


/* TO BE DONE
$("#buscador").keyup(function () {
    var data = this.value.split(" ");
    var jo = $("#listado table").find("tr");
    if (this.value == "") {
        jo.show();
        return;
    }
    jo.hide();
    jo.filter(function (i, v) {
        var $t = $(this);
        for (var d = 0; d < data.length; ++d) {
            if ($t.is(":contains('" + data[d] + "')")) {
                return true;
            }
        }
        return false;
    })
    .show();
    })
    .focus(function () {
        this.value = "";
        $(this).css({
            "color": "black"
        });
        $(this).unbind('focus');
    })
    .css({
        "color": "#C0C0C0"
    });
*/

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