import { currentUser } from "./login.js";
import { alert } from "./init.js";
import { get_campaigns_details } from "./firestore.js";

$(document).ready(async function(){
    const listado = await get_campaigns_details();       
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
    $('#listado').show()
});