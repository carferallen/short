import { get_campaigns, put_campaign } from "./firestore.js";
import { inicializa, alert } from "./init.js";
import { currentUser } from "./login.js";

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

window.enviar = function(){
    generar_url()
;}

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
        $.each($.merge(['all'],$('#formato').val()), function(f,v_f) {
            $.each($.merge(['all'],$('#adsize').val()), function(s,v_s) {
                let utm_content = v_f+'-'+v_s;
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
        put_campaign(linea);
    });
    get_campaigns();

};

window.copiar = function() {
    $('#url-final').select();
    document.execCommand("copy");
};

const get_shortURL = function(url){
    let enc_url = encodeURIComponent(url)
    var shortURL = $.ajax({
        url: 'https://herramientas.repsol.com/cgi-bin/short/short.py?destino=' + enc_url,
        cache: false,
        async: false,
        dataType: 'text',
    }).responseText;
    return shortURL
};

const autocompletar = function(){
    $('#tipo-de-campana').val('corporativa');
    $('#medio_1').prop('checked', true).trigger("change");
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
    //autocompletar();
});
