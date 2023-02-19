let config;

export const inicializa = function() {
    config = $.ajax({
        url: ' data/config.json',
        cache: false,
        async: false,
        dataType: 'json',
    }).responseText;
    config =  $.parseJSON(config);
    get_tiposCampanas();
    get_agencias();
    get_negocios();
    get_detalles();
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });
};

export const alert = (message, type, placement='#AlertasPrincipales') => {
    let html = 
    `<div id="alerta" class="alert alert-${type} alert-dismissible" role="alert">
       <div>${message}</div>
       <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`
    $(placement).html(html);
};

export const init_events = function(){
    $('.multiple').on('change', function(){       
        if (is_multi()) {
            $('#acortar').prop('checked',false);
            $('#acortar').prop('disabled', true)
        }
        else {
            $('#acortar').prop('disabled', false)
        }
    });
    $('#tipo-de-campana').on('change', function() {
        let opt = $(this).val()
        if ($.inArray(opt,['promocional','comercial'])!=-1) {
            $('#otros-detalles').show();
        }
        else {
            $('#otros-detalles').hide()
        }
    });
    $('#tipo-medio').on('change', function() {
        get_fuentes($('input[name=medio]:checked', this).val());
        get_secciones($('input[name=medio]:checked', this).val());
        get_medios($('input[name=medio]:checked', this).val());
    });
    $('#medio').on('change', function() {
        if ($(this).val()=='email'){
            $('#sfmc').removeClass('collapse');
            $('#sfmc').val('normal');
        }
        else {
            $('#sfmc').addClass('collapse')
        }
    });
    $('#area-negocio').on('change', function() {
        get_productos($(this).val());
        let neg = $(this).val().split('-')[0];
        if ($.inArray(neg,['reyg','solify','solmatch'])!=-1){
            $('#check_eyg').removeClass('collapse')
        }
        else {
            $('#check_eyg').addClass('collapse');
            $('#sf_eyg').prop('checked',false);
            $('#seccion-sf_eyg').hide();
        }
    });
    $('#sf_eyg').on('change', function() {
        if ($(this).is(":checked")) {
            $('#seccion-sf_eyg').show();
        }
        else {
            $('#seccion-sf_eyg').hide();
            $('#origen').prop("selectedIndex", 0).val();
            $('#sub-origen').prop("selectedIndex", 0).val();
        }
    });
    $('#campanas-anteriores').on('change', function() {
        $('#nombre').val($(this).val());
    });
    $('.header__logo').on("click", (e) => {
        if (e.ctrlKey) {
            try {
                $('.header__logo img').addClass('spinhov3D');
                $('.header__logo img').on('animationstart webkitAnimationStart MSAnimationStart oAnimationStart', function(e) {
                    var response = $.ajax({
                        url: 'https://herramientas.repsol.com/cgi-bin/short/sync.py',
                        cache: false,
                        async: false,
                        dataType: 'text',
                    }).responseText;
                    $('.header__logo img').on('animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd', function(e) {
                        $(this).removeClass('spinhov3D');
                        inicializa();
                        alert(response,'success');
                    });
                });
            }
            catch(error) {
                $('.header__logo img').removeClass('spinhov3D');
                alert('Algo fue mal en la sincronización...\n'+error, 'danger');
            }
        }
    });
    $('#listadoCampañas').on('click', 'tr', function() {
        $('#nombre').val($(this).children('td:nth(0)').html());
        $('#nombre_descriptivo').val($(this).children('td:nth(1)').html());
        $('#searchModal').modal('hide')
    });
};

const is_multi = function() {
    let multi = false;
    $('.multiple').each( function(){
        if ($(this).val().length > 1) {
            multi = true;
            return multi;
        }
    });
    return multi;
};

const get_productos = function(area_negocio) {
    $('#producto').empty();
    if (Object.keys(config["areas-negocios"][area_negocio]["segmentos"]).length==0){
        $('#producto').append('<option selected value="all">Genérico</option>')
    };
    $('#producto').append(new Option("Genérico", "all"));
    $.each(ordena(config["areas-negocios"][area_negocio]["segmentos"]), function(value, text) {
        if (value!='all'){
            $('#producto').append(new Option(text, value));
        }
    });
    $('#producto').removeAttr("disabled");
}

const get_fuentes = function(tipo_medio) {
    $('#fuente').empty().append('<option selected disabled value="">Fuente '+ tipo_medio +' *</option>')
    $.each(ordena(config["fuentes-"+tipo_medio]), function(value, text) {
        $('#fuente').append(new Option(text, value));
    });
    $('#fuente').removeAttr("disabled")
}

const get_medios = function(tipo_medio) {
    $('#medio').empty().append('<option selected disabled value="">Medio '+ tipo_medio +' *</option>');
    $.each(ordena(config['medios-'+tipo_medio]), function(value, text) {
        $('#medio').append(new Option(text, value));
    });
    $('#medio').removeAttr("disabled")
}

const get_secciones = function(tipo_medio) {
    $('#seccion').empty().append('<option selected value="all">Sección '+ tipo_medio +' (all)</option>');
    $.each(ordena(config['secciones-'+tipo_medio]), function(value, text) {
        $('#seccion').append(new Option(text, value));
    });
    $('#seccion').removeAttr("disabled")
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

const get_detalles = function() {
    get_datos('formatos','#formato','Ad formats');
    get_datos('adsizes','#adsize', 'Ad sizes');
    get_datos('segmentos','#segmentacion','Segmentación');
    get_datos('audiencias','#audiencia','Audiencia');
    get_datos('devices','#device','Dispositivo');
    get_datos('objetivos','#objetivo','Objetivo');
    get_datos('modelos','#modelo','Modelo de compra');
    get_datos('canal900','#canal900','Abreviatura canal 900');
    get_datos('codigoCC','#codigoCC','Código CC');
    get_datos('trafico','#trafico','Tráfico');

}

const get_datos = function(data, element, label) {
    $(element).empty()
    $.each(ordena(config[data]), function(value, text) {
        $(element).append(new Option(text, value));
    });
    init_multiple(element,label);
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
        numberDisplayed: 1,
        nSelectedText: 'seleccionadas',
        maxHeight: 400,
    });
};