import { onAuthStateChanged} from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js"
import { auth } from "./firebase.js";
import { } from "./login.js";
import { Autocomplete } from "./autocomplete.js";
import { put_log, get_campaigns } from "./firestore.js";
import { inicializa, init_events, alert } from "./init.js";

var currentUser;

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

const validar = function(){
    if(/^[a-zA-Z0-9-,-,ñ,á,é,í,ó,ú]*$/.test($('#nombre').val()) == false){
        alert("El nombre de campaña no puede contener espacios ni caracteres especiales, excepto '-'","warning");
        return false;
    }
    if ($('#nombre').val().length+$('#area-negocio').val().length+$('#producto').val().length > 38) {
        alert("El nombre de campaña, junto con el negocio y la fecha, no pueden contener más de 40 caracteres", "warning");
        return false;
    }
    return true
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
    let parametro = $('#parametro').val()!=""?$('#parametro').val().toLowerCase():'all';
    let description = $('#nombre_descriptivo').val();
    let area_negocio = $('#area-negocio option:selected').val() + ($('#producto option:selected').val()!=='all'?'-' + $('#producto option:selected').val():'');
    let utm_campaign = $('#agencia').val().toLowerCase() + '-' + nombre + '-' + parametro + '_' + fecha_split[0].slice(-2) + fecha_split[1] + '_' + area_negocio;
    let utm_source = $('#sfmc').val()=='sfmc_repsol'?'sfmc':$('#fuente option:selected').val() + '-' + $('#seccion option:selected').val();
    let utm_medium = $('#medio option:selected').val();
    let sf_reyg_source = $('#sf_reyg').is(":checked")?'SF_'+$('#origen').val()+'_'+$('#suborigen').val()+'_'+$('#suborigen option:selected').text().toLowerCase():'';
    if (sf_reyg_source!=''){
        utm_source = sf_reyg_source;
    };
    let urls = [];

    url += url.indexOf('?') == -1 ? '?' : '&'
    if (!$('#etiquetado').is(":checked")) {
        url += 'utm_source=' + utm_source + '&utm_medium=' + utm_medium + '&utm_campaign=' + utm_campaign + (sf_reyg_source!=''?'&sf_reyg_source='+sf_reyg_source:'');
        urls.push({'fecha':fecha,'nombre':nombre,'descripcion':description,'utm_source':utm_source,'utm_medium':utm_medium,'utm_campaign':utm_campaign,'utm_content':'','sf_reyg_source':sf_reyg_source,'url':url})
    }
    else {
        let m = [
            $('#device').val(),
            $('#formato').val(),
            $('#adsize').val(),
            comas2array($('#accion').val()),
            comas2array($('#subaccion').val()),
            comas2array($('#creatividad').val()),
            $('#landing').val(),
            comas2array($('#segmentacion').val()),
            $('#audiencia').val(),
            comas2array($('#subaudiencia').val()),
            $('#objetivo').val(),
            $('#modelo').val()
        ];

        if ($('#trafico').val().length>0){
            m = $.merge(m,[$('#trafico').val()])
        }
        if ($('#medio').val()=='900') {
            m = $.merge(m,[$('#canal900').val(),$('#codigoCC').val()])
        }
        let new_url = {};
        $.each(getCombn(m), function(id, utm_content){
            new_url = {
                'fecha':fecha,
                'nombre':nombre,
                'descripcion':description,
                'utm_source':utm_source,
                'utm_medium':utm_medium,
                'utm_campaign':utm_campaign,
                'utm_content':utm_content,
                'sf_reyg_source':sf_reyg_source,
                'url':url + 'utm_source=' + utm_source + '&utm_medium=' + utm_medium + '&utm_campaign=' + utm_campaign + '&utm_content=' + utm_content + (sf_reyg_source!=''?'&sf_reyg_source='+sf_reyg_source:'')};
            urls.push(new_url);
        });
    };

    if (urls.length > 1){
        let file_content = 'url,utm_source,utm_medium,utm_campaign,utm_content,sf_reyg_source\n';
        url = ''
        $.each(urls, function(i,u) {
            url += u['url']+'\n'
            file_content += [u['url'],u['utm_source'],u['utm_medium'],u['utm_campaign'],u['utm_content'],u['sf_reyg_source']].join(',')+'\n'
        });
        let blob = new Blob(["\uFEFF"+file_content], {type: "text/csv; charset=utf-8"});
        $('#CSV-link').attr('href', window.URL.createObjectURL(blob));
        $('#CSV-link').attr('download', utm_campaign+'.csv');
        $('#CSV').removeClass('collapse')
        $('#qr').removeAttr('src');
        $('#codigo_qr').hide();
    }
    else{
        $('#CSV').addClass('collapse')
        url = urls[0]['url']
        if ($('#acortar').is(":checked")){
            url = get_shortURL(url)
        }
        $.ajax({
            url: 'https://chart.googleapis.com/chart?cht=qr&chs=500x500&chl='+url,
            xhrFields:{
                responseType: 'blob'
            },
            success: function(data){
                var blobData = data;
                var url = window.URL || window.webkitURL;
                var src = url.createObjectURL(data);
                $('#qr').attr("src", src);
                $('#qr-link').attr("href", src);
                $('#qr-link').attr('download', utm_campaign+'.png');
                $('#codigo_qr').show();
            }
        });
    }

    $('#url-final').val(url);
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
            sf_reyg_source: url.sf_reyg_source,
            url:url.url,
        };
        put_log(linea);
    });
    set_autocomplete();
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

const ac_nombredescripcion = new Autocomplete(document.getElementById('nombre'), {
    data: null,
    showValue: true,
    onSelectItem: ({label, value}) => {
        $('#nombre_descriptivo').val('');
        if (value) {
            $('#nombre_descriptivo').val(value.replace(' (','').replace(')',''));
        }
    }
});

const ac_descripcion = new Autocomplete(document.getElementById('nombre_descriptivo'), {
    data: null,
    showValue: false,
    onSelectItem: ({label, value}) => {
        $('#nombre').val(value);
    }
});

const set_autocomplete = async function(){
    let campanas = await get_campaigns();
    let nombres_descripcion = [];
    let descripciones = [];
    $.each(campanas, function(id, campana){
        nombres_descripcion.push({label:campana.nombre, value:' ('+campana.descripcion+')'});
        descripciones.push({label:campana.descripcion, value:campana.nombre})
    });
    ac_nombredescripcion.setData(nombres_descripcion);
    ac_descripcion.setData(descripciones);
    $('#url').focus();
}

//Valores por defecto para pruebas------ELIMINAR
const autocompletar = async function(){ 
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
//FIN: Valores por defecto para pruebas------ELIMINAR

$(document).ready(async function() {
    await inicializa();
    await init_events();
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    if (urlParams.get('a')==1) {
        autocompletar();
    };
    $('#url').val(urlParams.get('page')||'');
    
});

const getCombn = function(arr) {
    arr[0]=arr[0].length==0?['all']:arr[0];
    if (arr.length == 1) {
        return (arr[0]);
    } else {
        var ans = [];
        var otherCases = getCombn(arr.slice(1));
        for (var i = 0; i < otherCases.length; i++) {
            for (var j = 0; j < arr[0].length; j++) {
                ans.push(arr[0][j]+'_'+otherCases[i]);
            }
        }
        return ans;
    }
}

const comas2array = function(text){
    return text.split(',')
    .filter(function(e) { return e !== '' })
    .map(e => {if (e!='') {return e.toLowerCase()}})
}

window.search = async function(){
    let campanas = await get_campaigns();
    let tabla = $('table>tbody','#searchModal');
    let html;
    tabla.empty();
    $.each(campanas, function(id, campana) {
        html += `<tr><td class="w-25">${campana.nombre}</td><td>${campana.descripcion}</td></tr>`;
    });
    tabla.html(html);
    $('#searchModal').modal('show');
}

window.enviar = function(){
    generar_url()
;}

window.copiar = function() {
    $('#url-final').select();
    document.execCommand("copy");
};
