let config;

export const inicializa = function() {
    config = $.ajax({
        url: ' data/config.json',
        cache: false,
        async: false,
        dataType: 'json',
    }).responseText;
    config =  $.parseJSON(config);
    get_fuentes('online');
    get_secciones('online');
    get_medios('online');
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
    $('#otros-detalles').on('change', function(){
        if (is_multi()) {
            $('#acortar').prop('checked',false);
            $('#acortar').prop('disabled', true)
        }
        else {
            $('#acortar').prop('disabled', false)
        }
    });
    $('#etiquetado').on('change', function() {
        if ($(this).is(":checked")) {
            $('#otros-detalles').show();
        }
        else {
            $('#otros-detalles').hide()
        }
    });
    $('#tipo-medio').on('change', function() {
        let valor = $(this).is(":checked")?$(this).attr("data-yes"):$(this).attr("data-no")
        get_fuentes(valor);
        get_secciones(valor);
        get_medios(valor);
    });
    $('#medio').on('change', function() {
        if ($(this).val()=='email'){
            $('#sfmc').removeClass('collapse');
            $('#sfmc').val('normal');
        }
        else {
            $('#sfmc').addClass('collapse');
            $('#sfmc').prop("selectedIndex", 0).val();
            $('#fuente').prop("disabled", false);
        }
        if ($(this).val()=='900'){
            $('#seccion-canal-900').removeClass('collapse');
            $('#canal900').eq(0).prop('selected', true);
            $('#codigoCC').eq(0).prop('selected', true);
        }
        else {
            $('#seccion-canal-900').addClass('collapse')
        }
    });
    $('#sfmc').on('change', function() {
        if ($(this).val()=='sfmc_repsol'){
            $('#fuente').val('sfmc');
            $('#fuente').prop("disabled", true);
        }
        else {
            $('#fuente').prop("disabled", false);
            $("#fuente").prop("selectedIndex", 0);
        }
    });
    $('#area-negocio').on('change', function() {
        get_productos($(this).val());
        get_origenes($(this).val());
        let neg = $(this).val().split('-')[0];
        if ($.inArray(neg,Object.keys(config['origenes-suborigenes']))!=-1){
            $('#check_eyg').removeClass('collapse')
            $('#sf_reyg').prop('checked',true);
            $('#seccion-sf_reyg').show();
        }
        else {
            $('#check_eyg').addClass('collapse');
            $('#sf_reyg').prop('checked',false);
            $('#seccion-sf_reyg').hide();
        }
    });
    $('#origen').on('change', function() {
        get_suborigenes(config['origenes-suborigenes'][$('#area-negocio').val()][$(this).val()]);
    });
    $('#sf_reyg').on('change', function() {
        if ($(this).is(":checked")) {
            $('#seccion-sf_reyg').show();
            $('#origen').prop('required',true);
            $('#suborigen').prop('required',true);
        }
        else {
            let tipo_medio = $('#tipo-medio').is(":checked")?$('#tipo-medio').attr("data-yes"):$('#tipo-medio').attr("data-no")
            $('#seccion-sf_reyg').hide();
            $('#origen').prop("selectedIndex", 0).val();
            $('#suborigen').prop("selectedIndex", 0).val();
            $('#suborigen').prop("disabled", true);
            $('#origen').prop('required',false);
            $('#suborigen').prop('required',false);
        }
    });
    $('#url').on('change', function() {
        if (url.validity.valid) {
            let id_landing = Object.keys(config['landings']).find(key => config['landings'][key] === $(this).val())
            if (id_landing) {
                $('#landing').val(id_landing)
            }
            else {
                $('#landing').prop("selectedIndex", 0)
            }
          }
    });
    /*$('#landing').on('change', function() {
        let land = $("#landing option:selected").text().slice(0,-6);
        if ($(this).val()!='all') {
            $('#url').val(land);
            $('#url').prop("disabled", true);
        }
        else {
            $('#url').prop("disabled", false);
        }
    });*/
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
    $('.header__title').on('click', 'i', function() {
        $('#ayudaModal').modal('show')
    });
    $('#nombre_descriptivo').on('keydown', (e) => {
        var regex = new RegExp("[^()]+");
        if (!regex.test(e.key)) {
          e.preventDefault();
          return;
        }
    });
    $('#nombre,#parametro,#term').on('keydown', (e) => {
        var regex = new RegExp("^[a-zA-Z0-9ñáéíóú]*$");
        if (!regex.test(e.key)) {
          e.preventDefault();
          return;
        }
    });
    $('#accion,#subaccion,#creatividad,#subaudiencia,#segmentacion').on('keydown', (e) => {
        var regex = new RegExp("^[a-zA-Z0-9,ñáéíóú]*$");
        if (!regex.test(e.key)) {
          e.preventDefault();
          return;
        }
    })
};

const is_multi = function() {
    let multi = false;
    $('.multiple').each( function(){
        if ($(this).val().length > 1) {
            multi = true;
            return multi;
        }
    });
    let multiText = [
        $('#accion').val(),
        $('#subaccion').val(),
        $('#creatividad').val(),
        $('#segmentacion').val(),
        $('#subaudiencia').val()
    ]
    multiText.forEach(e=>{if (comas2array(e).length>1) {multi = true; return multi} })

    return multi;
};

const comas2array = function(text){
    return text.split(',')
    .filter(function(e) { return e !== '' })
    .map(e => {if (e!='') {return e.toLowerCase()}})
}

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

const get_suborigenes = function(origenes) {
    $('#suborigen').empty().append('<option selected disabled value="">Suborigen *</option>');
    $.each(ordena(origenes["suborigenes"]), function(value, text) {
        if (value!='all'){
            $('#suborigen').append(new Option(text, value));
        }
    });
    $('#suborigen').removeAttr("disabled");
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
    $('#seccion').empty().append('<option selected value="all">Sección '+ tipo_medio +'</option>');
    $.each(ordena(config['secciones-'+tipo_medio]), function(value, text) {
        $('#seccion').append(new Option(text, value));
    });
    $('#seccion').removeAttr("disabled")
}

const get_agencias = function() {
    $('#agencia').empty().append('<option selected disabled value="">Agencia *</option>');
    $.each(ordena(config['agencias']), function(value, text) {
        $('#agencia').append(new Option(text, value));
    });
}

const get_negocios = function() {
    $('#area-negocio').empty().append('<option selected disabled value="">Área / Negocio *</option>');
    $('#segmentacion').empty().append('<option selected value="">Negocio origen</option>');
    let list_areas = {};
    $.each(config["areas-negocios"], function(value, text) {
        list_areas[value]=text["nombre"];
    });
    $.each(ordena(list_areas), function(value, text) {
        $('#area-negocio').append(new Option(text, value));
        $('#segmentacion').append(new Option(text, value));
    });
}

const get_origenes = function(area_negocio) {
    $('#origen').empty().append('<option selected disabled value="">Origen *</option>');
    let list_origenes = {};
    $.each(config["origenes-suborigenes"][area_negocio], function(value, text) {
        list_origenes[text.origen]=value;
    });
    let ordenada = Object.entries(list_origenes).sort((a,b) => b[0].toLowerCase()>a[0].toLowerCase()?-1:b[0].toLowerCase()<a[0].toLowerCase()?1:0);    
    list_origenes = Object.fromEntries(ordenada)
    $.each(list_origenes, function(key, value) {
        $('#origen').append(new Option(key, value));
    });
}

const get_landings = function() {
    let list_landings = Object.entries(config["landings"]).map(a => a.reverse()).sort((a,b) => b[0].toLowerCase()>a[0].toLowerCase()?-1:b[0].toLowerCase()<a[0].toLowerCase()?1:0);    
    list_landings = Object.fromEntries(list_landings)
    $('#landing').empty().append('<option selected value="all">Landing</option>');
    $.each(list_landings, function(key, value) {
        $('#landing').append(new Option(key + ' (' +value.padStart(3, '0')+')', value));
    });
}

const get_detalles = function() {
    get_datos('formatos','#formato','Ad formats');
    get_datos('adsizes','#adsize', 'Ad sizes');
    get_datos('audiencias','#audiencia','Audiencia');
    get_datos('devices','#device','Dispositivo');
    get_datos('objetivos','#objetivo','Objetivo');
    get_datos('modelos','#modelo','Modelo de compra');
    get_datos('canal900','#canal900','Abreviatura canal 900');
    get_datos('codigoCC','#codigoCC','Código CC');
    get_datos('trafico','#trafico','Tráfico');
    get_landings();
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
        enableCaseInsensitiveFiltering: true,
        filterPlaceholder: 'Buscar...'
    });
};
