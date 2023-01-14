import { onAuthStateChanged} from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js"
import { auth } from "./firebase.js";
import { } from "./login.js";
import { Autocomplete } from "./autocomplete.js";
import { put_log, get_campaigns } from "./firestore.js";
import { inicializa, init_events, alert } from "./init.js";

var currentUser;

const validar = function(){
    if(/^[a-zA-Z0-9-,-,ñ,á,é,í,ó,ú]*$/.test($('#nombre').val()) == false){
        alert("El nombre de campaña no puede contener espacios ni caracteres especiales, excepto '-'","warning");
        return false;
    }
    if ($('#nombre').val().length+$('#area-negocio').val().length+$('#segmento').val().length > 38) {
        alert("El nombre de campaña, junto con el negocio y la fecha, no pueden contener más de 40 caracteres", "warning");
        return false;
    }
    return true
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
      if (user.displayName) {
        $('#logged_name').html(`Hola, ${user.displayName}`);
        if ($('#formulario #nombre')) {
          set_autocomplete();
        }
      }
    } else {
      $('#logged_name').html("");
      $('#signinModal').modal('show');
    }
    currentUser = user;
});

window.enviar = function(){
    generar_url()
;}

window.search = async function(){
    let campanas = await get_campaigns();
    let tabla = $('table>tbody','#searchModal');

    let html;
    tabla.empty();
    $.each(campanas, function(id, campana) {
        html += `<tr><td class="col-xs-4">${campana.nombre}</td><td class="col-xs-8">${campana.descripcion?campana.descripcion:''}</td></tr>`;
    });
    tabla.html(html);
    $('#searchModal').modal('show');
}

const generar_url = function(){
    if (!currentUser){
        return
    }
    if (!validar()){
        return
    }
    let url = $('#url').val();
    let fecha = $('#fecha').val();
    let fecha_split = fecha.split('-');
    let nombre = $('#nombre').val().toLowerCase();
    let description = $('#nombre_descriptivo').val();
    let utm_campaign = $('#agencia').val().toLowerCase() + '_' + nombre + '_' + fecha_split[0].slice(-2) + fecha_split[1] + '_' + $('#area-negocio option:selected').val() + '-' + $('#segmento option:selected').val();
    let utm_source = $('#fuente option:selected').val() + '-' + $('#seccion option:selected').val();
    let utm_medium = $('#medio option:selected').val();

    let urls = [];

    url += url.indexOf('?') == -1 ? '?' : '&'

    if ($.inArray($('#tipo-de-campana').val(),['promocional','comercial'])==-1) {
        url += 'utm_source=' + utm_source + '&utm_medium=' + utm_medium + '&utm_campaign=' + utm_campaign;
        urls.push({'fecha':fecha,'nombre':nombre,'descripcion':description,'utm_source':utm_source,'utm_medium':utm_medium,'utm_campaign':utm_campaign,'utm_content':'','url':url})
    }
    else {
        $.each($.merge(['all'],$('#formato').val()), function(formatoId, formato) {
            $.each($.merge(['all'],$('#adsize').val()), function(adsizeId, adsize) {
                
                let utm_content = formato+'-'+adsize;

                urls.push({'fecha':fecha,'nombre':nombre,'descripcion':description,'utm_source':utm_source,'utm_medium':utm_medium,'utm_campaign':utm_campaign,'utm_content':utm_content,
                'url':url + 'utm_source=' + utm_source + '&utm_medium=' + utm_medium + '&utm_campaign=' + utm_campaign + '&utm_content=' + utm_content});
            });
        });
    };

    if (urls.length > 1){
        url = ''
        $.each(urls, function(i,u) {
            url+=u['url']+'\n'
        })
        $('#qr').removeAttr('src');
        $('#codigo_qr').hide();
    }
    else{
        url = urls[0]['url']
        if ($('#acortar').is(":checked")){
            url = get_shortURL(url)
        }
        $('#qr').attr("src","https://chart.googleapis.com/chart?cht=qr&chs=250x250&chl="+url);
        $('#codigo_qr').show();
    }

    $('#url-final').val(url)

    $('#resultado').modal('show');

    $.each(urls, function(id_url,url){
        const linea = {
            userid: currentUser.uid,
            user: currentUser.displayName,
            email: currentUser.email,
            fecha: url.fecha,
            nombre: url.nombre,
            descripcion: url.descripcion,
            utm_source: url.utm_source,
            utm_medium: url.utm_medium,
            utm_campaign: url.utm_campaign,
            utm_content: url.utm_content,
            url:url.url,
        };
        put_log(linea);
    });
    set_autocomplete();
};

window.copiar = function() {
    $('#url-final').select();
    document.execCommand("copy");
};

const get_shortURL = function(url){
    let enc_url = encodeURIComponent(url);
    var shortURL = $.ajax({
        url: 'https://herramientas.repsol.com/cgi-bin/short/short.py?destino=' + enc_url,
        cache: false,
        async: false,
        dataType: 'text',
    }).responseText;
    return shortURL
};

const ac = new Autocomplete(document.getElementById('nombre'), {
    data: null,
    showValue: true,
    onSelectItem: ({label, value}) => {
        $('#nombre_descriptivo').val('');
        if (value) {
            $('#nombre_descriptivo').val(value.replace(' (','').replace(')',''));
        }
    }
});

export const set_autocomplete = async function(){
    let campanas = await get_campaigns();
    let listado = [];
    $.each(campanas, function(id, campana){
        
        listado.push({label:campana.nombre, value:campana.descripcion?' ('+campana.descripcion+')':''});
    })
    ac.setData(listado)
}

const autocompletar = async function(){
    $('#tipo-de-campana').val('corporativa');
    await $('#medio_1').prop('checked', true).trigger("change");
    $('#fuente').val('rrss');
    $('#medio').val('cpc');
    $('#nombre').val('promodisney');
    $('#nombre_descriptivo').val('Promoción tazas Disney');
    $('#fecha').val('2022-12-13');
    $('#agencia').val('hav');
    $('#url').val('https://repsol.com');
    $('#area-negocio').val('eess').trigger("change");
}

$(document).ready(function() {
    inicializa();
    init_events();
    if (GetURLParameter('a')==1) {
        autocompletar();
    };
});


function GetURLParameter(sParam)
{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) 
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) 
        {
            return sParameterName[1];
        }
    }
}