import { get_campaigns } from "./firestore.js";

let config;

export const inicializa = function() {
    config = $.ajax({
        url: 'data/config.json',
        cache: false,
        async: false,
        dataType: 'json',
    }).responseText;
    config =  $.parseJSON(config);
    get_tiposCampanas();
    get_agencias();
    get_secciones();
    get_medios();
    get_negocios();
    get_formatos();
    get_adsizes();
    init_events();
    init_multiple('#formato','Ad formats');
    init_multiple('#adsize','Ad sizes');
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });
};

export const alert = (message, type, placement='#AlertasPrincipales') => {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = [
    `<div class="alert alert-${type} alert-dismissible" role="alert">`,
    `   <div>${message}</div>`,
    '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
    '</div>'
    ].join('');
    $(placement).append(wrapper)
};

const init_events = function(){
    $('#tipo-de-campana').on('change', function() {
        let opt = $(this).val()
        if ($.inArray(opt,['promocional','comercial'])!=-1) {
            $('#otros-detalles').show();
            $('#acortar').prop('checked',false);
            $('#acortar').prop('disabled', true)
        }
        else {
            $('#otros-detalles').hide()
            $('#acortar').prop('disabled', false)
        }
    });
    $('#tipo-medio').on('change', function() {
        get_fuentes($('input[name=medio]:checked', this).val());
    });
    $('#area-negocio').on('change', function() {
        get_segmentos($(this).val());
    });
    $('#campanas-anteriores').on('change', function() {
        $('#nombre').val($(this).val());
    });
    $('#logo').on("click", (e) => {
        if (e.ctrlKey) {
            e.preventDefault();
            try {
                $('#logo img').addClass('spinhov3D');
                var response = $.ajax({
                    url: 'https://herramientas.repsol.com/cgi-bin/short/sync.py',
                    cache: false,
                    async: false,
                    dataType: 'text',
                }).responseText;
                $('#logo img').on('animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd', function(e) {
                    $(this).removeClass('spinhov3D');
                    alert(response,'success');
                    inicializa();
                });
            }
            catch(error) {
                $('#logo img').removeClass('spinhov3D');
                alert('Algo fue mal en la sincronización...\n'+error, 'danger');
            }
        }
    });
};

const get_segmentos = function(area_negocio) {
    $('#segmento').empty()
    if (Object.keys(config["areas-negocios"][area_negocio]["segmentos"]).length==0){
        $('#segmento').append('<option selected value="all">Genérico</option>')
    }
    $('#segmento').append(new Option("Genérico", "all"));
    $.each(ordena(config["areas-negocios"][area_negocio]["segmentos"]), function(value, text) {
        if (value!='all'){
            $('#segmento').append(new Option(text, value));
        }
    })
    $('#segmento').removeAttr("disabled")
}

const get_fuentes = function(tipo_medio) {
    $('#fuente').empty().append('<option selected disabled value="">Fuente '+ tipo_medio +' *</option>')
    $.each(ordena(config["fuentes-"+tipo_medio]), function(value, text) {
        $('#fuente').append(new Option(text, value));
    });
    $('#fuente').removeAttr("disabled")
}

const get_tiposCampanas = function() {
    $('#tipo-de-campana').empty().append('<option selected disabled value="">Tipo de campaña *</option>');
    $.each(ordena(config['tipos-de-campanas']), function(value, text) {
        $('#tipo-de-campana').append(new Option(text, value));
    });
}

const get_agencias = function() {
    $('#agencia').empty().append('<option selected disabled value="">Agencia *</option>');
    $.each(ordena(config['agencias']), function(value, text) {
        $('#agencia').append(new Option(text, value));
    });
}

const get_secciones = function() {
    $('#seccion').empty().append('<option selected disabled value="all">Sección (all)</option>');
    $.each(ordena(config['secciones']), function(value, text) {
        $('#seccion').append(new Option(text, value));
    });
}

const get_medios = function() {
    $('#medio').empty().append('<option selected disabled value="">Medio *</option>');
    $.each(ordena(config['medios']), function(value, text) {
        $('#medio').append(new Option(text, value));
    });
}

const get_negocios = function() {
    $('#area-negocio').empty().append('<option selected disabled value="">Área / Negocio *</option>');
    let list_areas = {};
    $.each(config["areas-negocios"], function(value, text) {
        list_areas[value]=text["nombre"];
    });
    $.each(ordena(list_areas), function(value, text) {
        $('#area-negocio').append(new Option(text, value));
    });
}

const get_formatos = function() {
    $('#formato').empty()
    $.each(ordena(config['formatos']), function(value, text) {
        $('#formato').append(new Option(text, value));
    });
}

const get_adsizes = function() {
    $('#adsize').empty()
    $.each(ordena(config['adsizes']), function(value, text) {
        $('#adsize').append(new Option(text, value));
    });
}

const ordena = function(obj) {
    let items = Object.keys(obj).map(function(key) {
        return [key, obj[key]];
    });
    items.sort(function(first, second) {
        return (second[1].toLowerCase()>first[1].toLowerCase()?-1:second[1].toLowerCase()<first[1].toLowerCase()?1:0);
    });
    let sorted_obj={}
    $.each(items, function(k, v) {
        let use_key = v[0]
        let use_value = v[1]
        sorted_obj[use_key] = use_value
    })
    return(sorted_obj)
}

const init_multiple = function(id,label){
    $(id).multiselect({
        buttonWidth: '100%',
        buttonTextAlignment: 'left',
        includeSelectAllOption: true,
        nonSelectedText: label,
        dropRight: true,
        includeSelectAllDivider: true,
        selectAllText: 'Seleccionar todo',
        allSelectedText: 'Todo',
        maxHeight: 400,
    });
};