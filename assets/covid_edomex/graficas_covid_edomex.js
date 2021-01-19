const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto",
"Septiembre","Octubre","Noviembre","Diciembre"];
const DIAS_S = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"]
const base_date_obj = new Date();

let lista_de_municipios = [];
let diccionario_municipios = {};
let HistoricoDefunciones = undefined;
let HistoricoContagios = undefined;
let MaximosContagiosMunicipio = 0;
let MaximosDefuncionesMunicipio;

const file_directory = '/assets/covid_edomex/data/';

/* Start Up data... */
const request_fechas = new Request(file_directory+'Fechas.json');
const request_municipios = new Request(file_directory+'Municipios.json');
const request_datos_estado = new Request(file_directory+'000.json');
const request_historial_defunciones = new Request(file_directory+'ultimas_defunciones_confirmadas.json');
const request_historial_contagios = new Request(file_directory+'ultimos_contagios_confirmados.json');

let datos_list_mun_cargados = false;
let datos_fechas_cargados = false;
let datos_estado_cargados = false;
let dato_hisdef_cargado = false;
let dato_hiscon_cargado = false;
let chart_one_is_ready = false;
let chart_two_is_ready = false;


let base_title = 'Evolución de los Contagios y Defunciones';
let base_title_geo = ' '
let time_frame = '\nUltimos 15 días';
let interval_start_date = new Date();
let interval_end_date = new Date();
let last_date = undefined;

var myChart = echarts.init(document.getElementById('chart'));
//var myChartGeo = echarts.init(document.getElementById('geo_test'));
//var myChartTimeLine = echarts.init(document.getElementById('timeline'));
var myChartEdoMexMap = echarts.init(document.getElementById('edomex_map'));
var myChartEdoMexContPie = echarts.init(document.getElementById('pie_conta'));
var myChartEdoMexDescPie = echarts.init(document.getElementById('pie_deces'));
myChart.showLoading();
myChartEdoMexDescPie.showLoading();
myChartEdoMexContPie.showLoading();
myChartEdoMexMap.showLoading();
//myChartGeo.showLoading();

var OptionChart1 = {
    tooltip: {
        backgroundColor : 'rgba(50,50,50,0.8)',
        allowDecimals: false,
        trigger: 'axis',
        axisPointer: {
            type: 'cross',
            snap: true,
            label: {
                formatter: function(x){ 
                        if(x.axisDimension == "x"){
                            return fechaAEspL(x.value);
                         };
                         return Math.floor(x.value);
                         },
                color:'#fcfcfc',
                fontSize :16,
                fontFamily: 'Atkinson'
            }
        },
        textStyle:{
            color:'#fff',
            fontSize : 16,
            fontStyle : 'bold',
            fontFamily: 'Atkinson'
        }
    },
    xAxis: {
        type: 'category',
        boundaryGap: true,
        axisLabel: {
            color:'#0f0f0f',
            fontSize :16,
            fontFamily: 'Atkinson'
            },
        data: []
    },
    yAxis: {
        //name: 'Personas',
        allowDecimals: false,
        type: 'value',
        axisLabel: {
            color:'#0f0f0f',
            fontSize :16,
            fontFamily: 'Atkinson'
            },
        boundaryGap: false
    },
    legend: {
        data: ['Contagios', 'Defunciones','Promedio Contagios Semanales', 'Promedio Defunciones Semanales'],
        //left: '10',
        //bottom: '5%'
        //orient: 'vertical'
        textStyle:{
            fontSize : 17,
            fontStyle : 'bold',
            fontFamily: 'Atkinson'
        }
    },
    dataZoom: [{
        type: 'inside',
        filterMode: 'weakFilter',
        index: 'zoom_control',
        },
        {
        start: 14,
        end: 15,
        handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
        handleSize: '80%',
      }],
    series: [
        {
            name: 'Contagios',
            type: 'bar',
            large: true,
            smooth: false,
            symbol: 'none',
            barCategoryGap: '0%',
            //sampling: 'average',
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0.3,
                    color: 'rgb(117, 15, 5)' 
                }, {
                    offset: 0.9,
                    color: 'rgb(173, 45, 45)'
                }])
            },
            data: []
        },
        {
            name: 'Defunciones',
            type: 'bar',
            large: true,
            //stack: 'one',
            barGap: '-100%',
            barCategoryGap: '0%', // this changed
            smooth: false,
            symbol: 'none',
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0.3,
                    color: 'rgb(23, 24, 26)' 
                }, {
                    offset: 0.9,
                    color: 'rgb(4, 33, 36)'
                }])
            },
            data: []
        },
        {
            name: 'Promedio Contagios Semanales',
            type: 'line',
            symbol: 'none',
            smooth: true,
            sampling: 'averange',
            lineStyle: {
                color: '#ff4545',
                shadowColor: '#7d2f2f',
                shadowOffsetY:2,
                shadowOffsetX:2,
                width: 4,
            },
            data: []
        },
        {
            name: 'Promedio Defunciones Semanales',
            type: 'line',
            symbol: 'none',
            smooth: true,
            sampling: 'averange',
            lineStyle: {
                color: '#224473',
                shadowColor: '#111c2b',
                shadowOffsetY:2,
                shadowOffsetX:2,
                width: 4,
            },
            data: []
        }
    ]
};

myChart.on('dataZoom', function (evt) {
 updateCharTitle();
});
/*
// si estamos en la ultima fecha, salta a la primera y comienza la animación desde el principio...
myChartTimeLine.on('timelineplaychanged', function(evt){
    if( evt.playState && 
        (myChartTimeLine.getModel().option.timeline[0].currentIndex 
                == myChart.getModel().option.xAxis[0].data.length-1) 
     ){
        myChartTimeLine.setOption({ timeline: { currentIndex: 0} });
        myChartEdoMexMap.setOption({ timeline: { currentIndex: 0} });
        myChartEdoMexContPie.setOption({ timeline: { currentIndex: 0} });
        }
});
// my chart Tymeline controls and conects the other 2 charts 
myChartTimeLine.on('timelinechanged', function(evt){
    let date = myChart.getModel().option.xAxis[0].data[evt.currentIndex]
   // myChartEdoMexMap.setOption({ timeline: { currentIndex: evt.currentIndex} });
   // myChartEdoMexContPie.setOption({ timeline: { currentIndex: evt.currentIndex} });
    //document.getElementById("date_covid").innerHTML = fechaAEsp(date);
    //document.getElementById("con_acumulados").innerHTML = base_title_geo+HistoricoContagios[evt.currentIndex].totales;
});
*/

function updateCharTitle(){
  var axis = myChart.getModel().option.xAxis[0];
  var starttime = axis.data[axis.rangeStart];
  var endtime = axis.data[axis.rangeEnd];
  if(starttime == undefined){ starttime = axis.data[0]; };
  if(endtime == undefined){ endtime = axis.data[axis.data.length-1]; };
  interval_start_date.setTime(Date.parse(starttime));
  interval_end_date.setTime(Date.parse(endtime));
  //console.log(starttime,endtime);
  var diff_date = (interval_end_date-interval_start_date) / (1000 * 3600 * 24); 
  time_frame = '';
  if(diff_date+1 > 30 || endtime != last_date ){
     time_frame = `<br>${fechaAEsp(starttime)} al ${fechaAEsp(endtime)}`;
     };
  if(endtime == last_date){
    time_frame = time_frame+`<br>(Ultimos ${diff_date+1} días)`;
    }
  else{
    time_frame = time_frame+`<br>(${diff_date+1} días)`;
    };
   document.getElementById("evol").innerHTML = base_title+time_frame;
};

function updateChartData(){
    myChart.setOption(OptionChart1);
    };
    
function fechaAEspL(dateString){
    base_date_obj.setTime(Date.parse(dateString));
    return `${DIAS_S[base_date_obj.getUTCDay()]} ${base_date_obj.getUTCDate()} de ${MESES[base_date_obj.getUTCMonth()]} ${base_date_obj.getFullYear()}`;
    };

function fechaAEsp(dateString){
    base_date_obj.setTime(Date.parse(dateString));
    return `${base_date_obj.getUTCDate()} de ${MESES[base_date_obj.getUTCMonth()]} ${base_date_obj.getFullYear()}`;
    };
    

function startup_completadas(){
    if(datos_estado_cargados && datos_fechas_cargados && datos_list_mun_cargados && !chart_one_is_ready){
         console.log('Estamos listos');
         updateChartData();
         updateCharTitle();
         myChart.hideLoading();
         chart_one_is_ready = true;
       }
    else{
        console.log('Aun no estamos listos');
        if(!chart_one_is_ready){
            myChart.showLoading();
            }
        };
    if (dato_hiscon_cargado && datos_fechas_cargados && !chart_two_is_ready){
        chart_two_is_ready = true;
        const test_geo = fetch(file_directory+'edomex_geojson.json').then(
        function(response) {
            return response.json();
        }).then(function(map_data) {
            
            
            echarts.registerMap('edomex', map_data);

            let timelineChartOptions = {
                timeline: {
                    axisType: 'category',
                    show: true,
                    rewind: false,
                    autoPlay: false,
                    symbol : 'none',
                    playInterval: 500,
                    loop :  false,
                    data: OptionChart1.xAxis.data,
                    currentIndex: OptionChart1.xAxis.data.length-1,
                    label: { show: false },
                    }
                };

            let edomexChartOptions = {
                tooltip: {
                    backgroundColor : 'rgba(50,50,50,0.8)',
                    trigger: 'item',
                    showDelay: 0,
                    transitionDuration: 0.2,
                    textStyle:{
                        color:'#fff',
                        fontSize : 16,
                        fontStyle : 'bold',
                        fontFamily: 'Atkinson'
                        }
                    },
                visualMap: {
                    orient: 'horizontal',
                    left:'42%',
                    itemWidth:  15,
                    itemHeight: 200,
                    min: 0,
                    max: MaximosContagiosMunicipio,
                    calculable: true,
                    inRange: {
                        color: ['#baab95','#caa07b','#fdae61',
                                '#f8a052','#f29244','#ed8336',
                                '#e77429','#e2641b','#dc530e',
                                '#d64000','#a50026','#811c24',
                                '#5f2322','#3d2321']
                        },
                    textStyle:{
                        fontSize : 14,
                        fontStyle : 'bold',
                        fontFamily: 'Atkinson'
                        }
                    },
                series: [{
                        name: 'Contagios',
                        type: 'map',
                        map: 'edomex',
                        zoom:1.25,
                        emphasis: { 
                            label: { show:false}, 
                            itemStyle: { areaColor:'#87b5ff'}
                            },
                        data : HistoricoContagios.series.data
                    }],
                };
            
            let edomexChartPieContOptions = {
                tooltip: {
                    backgroundColor : 'rgba(50,50,50,0.8)',
                    trigger: 'item',
                    showDelay: 0,
                    transitionDuration: 0.2,
                    textStyle:{
                        color:'#fff',
                        fontSize : 16,
                        fontStyle : 'bold',
                        fontFamily: 'Atkinson'
                        }
                    },
                visualMap: {
                    show: false,
                    min: 0,
                    max: MaximosContagiosMunicipio,
                    inRange: {
                        color: ['#918573','#caa07b','#fdae61',
                                '#f8a052','#f29244','#ed8336',
                                '#e77429','#e2641b','#dc530e',
                                '#d64000','#a50026','#811c24',
                                '#5f2322','#3d2321']
                        }
                    },
                series: [{
                        name: 'Contagios',
                        type: 'pie',
                        radius: 85,
                        animationEasing : 'linear',
                        animationDurationUpdate: 75,
                        minShowLabelAngle: 5,
                        top: '-15%',
                        label: {
                            color:'#0f0f0f',
                            fontSize :16,
                            fontFamily: 'Atkinson',
                            fontWeight : 'bold',
                            alignTo: 'labelLine'
                            },
                        labelLine: { lineStyle: { color:'#0f0f0f' } },
                        data : HistoricoContagios.series.data,
                    }]
                };

            let edomexChartPieDeceOptions = {
                    tooltip: {
                        backgroundColor : 'rgba(50,50,50,0.8)',
                        trigger: 'item',
                        showDelay: 0,
                        transitionDuration: 0.2,
                        textStyle:{
                            color:'#fff',
                            fontSize : 16,
                            fontStyle : 'bold',
                            fontFamily: 'Atkinson'
                            }
                        },
                    visualMap: {
                        show: false,
                        min: 0,
                        max: MaximosDefuncionesMunicipio,
                        inRange: {
                            color: ['#918573','#caa07b','#fdae61',
                                    '#f8a052','#f29244','#ed8336',
                                    '#e77429','#e2641b','#dc530e',
                                    '#d64000','#a50026','#811c24',
                                    '#5f2322','#3d2321']
                            }
                        },
                    series: [{
                            name: 'Defunciones',
                            type: 'pie',
                            radius: 85,
                            animationEasing : 'linear',
                            animationDurationUpdate: 75,
                            minShowLabelAngle: 5,
                            top: '-15%',
                            label: {
                                color:'#0f0f0f',
                                fontSize :16,
                                fontFamily: 'Atkinson',
                                fontWeight : 'bold',
                                alignTo: 'labelLine'
                                },
                            labelLine: { lineStyle: { color:'#0f0f0f' } },
                            data : HistoricoDefunciones.series.data,
                        }]
                    };
            
            //document.getElementById("date_covid").innerHTML = fechaAEsp(OptionChart1.xAxis.data[0]);
            myChartEdoMexMap.setOption(edomexChartOptions);
            myChartEdoMexContPie.setOption(edomexChartPieContOptions);
            myChartEdoMexDescPie.setOption(edomexChartPieDeceOptions);

            myChartEdoMexDescPie.hideLoading();
            myChartEdoMexContPie.hideLoading();
            myChartEdoMexMap.hideLoading();

            document.getElementById("con_acumulados").innerHTML = HistoricoContagios.totales;
            document.getElementById("dece_acumulados").innerHTML = HistoricoDefunciones.totales;
            //myChartTimeLine.setOption(timelineChartOptions);
            // myChartGeo.hideLoading();
        });
         
       }
        
    };


const promesa_por_estado = fetch(request_datos_estado).then(
    function(response) {
        return response.json();
    }).then(function(data) {
        OptionChart1.series[0].data = data['CNH'].slice(1);
        OptionChart1.series[1].data = data['DNH'].slice(1);
        OptionChart1.series[2].data = data['CPS'].slice(1);
        OptionChart1.series[3].data = data['DPS'].slice(1);
        datos_estado_cargados = true;
        startup_completadas();
    });

const promesa_por_municipios = fetch(request_municipios).then(
    function(response) {
        return response.arrayBuffer();
    }).then(function(buffer) {
        let my_data = new Uint8Array(buffer);
        diccionario_municipios = JSON.parse(pako.inflate(my_data, { to: 'string' }));
        console.log('¡¡Municipios cargados!!');
        
        for (var key in diccionario_municipios) {        
            lista_de_municipios[lista_de_municipios.length] = key
            //console.log(key);
        }
        let top = lista_de_municipios[0];
        lista_de_municipios = [top].concat(lista_de_municipios.slice(1).sort());
        
        /* MODIFICA EL DOM PARA AGREGAR LA LISTA DE MUNICIPIOS */
        const div = document.getElementById("listMun");
        lista_de_municipios.forEach( 
            x => { 
        
            const li_municipio = document.createElement('a');
            const label_mun = document.createTextNode(x);
            li_municipio.setAttribute('inegi_id', diccionario_municipios[x]);
            li_municipio.setAttribute('href','#top');
            li_municipio.appendChild(label_mun);
            li_municipio.addEventListener('click',SolicitaDatosMunicipio);
            div.appendChild(li_municipio);

        });
        datos_list_mun_cargados = true;
        startup_completadas();
    });
    

const promesa_por_fechas = fetch(request_fechas).then(
    function(response) {
        return response.arrayBuffer();
    }).then(function(buffer) {
        let my_data = new Uint8Array(buffer);
        let data = JSON.parse(pako.inflate(my_data, { to: 'string' }));
        OptionChart1.xAxis.data = data.Fechas.slice(1)/*
         .map(
            function(x){
                return fechaAEsp(new Date(x));
                }
            )*/;
        last_date = OptionChart1.xAxis.data[OptionChart1.xAxis.data.length-1];
        OptionChart1.dataZoom[0].endValue = OptionChart1.xAxis.data.length 
        OptionChart1.dataZoom[0].startValue = OptionChart1.xAxis.data.length-14
        console.log(data);
        
        console.log('¡¡Fechas cargadas!!');
        console.log('last date',last_date)
        datos_fechas_cargados = true;
        startup_completadas();
    });


const promesa_hisotrial_contagios = fetch(request_historial_contagios).then(
    function(response) {
        return response.arrayBuffer();
    }).then(function(buffer) {
        let my_data = new Uint8Array(buffer);
        let data = JSON.parse(pako.inflate(my_data, { to: 'string' }));
        console.log(data.date_list);
        HistoricoContagios = data.date_list[0];
        MaximosContagiosMunicipio = data.maximo_hisotrico;
        console.log('¡¡Hisotrico contagios cargado...!!');
        dato_hiscon_cargado = true;
        startup_completadas();
    });


const promesa_hisotrial_defunciones = fetch(request_historial_defunciones).then(
    function(response) {
        return response.arrayBuffer();
    }).then(function(buffer) {
        let my_data = new Uint8Array(buffer);
        let data = JSON.parse(pako.inflate(my_data, { to: 'string' }));
        console.log(data.date_list);
        HistoricoDefunciones = data.date_list[0];
        MaximosDefuncionesMunicipio = data.maximo_hisotrico;
        console.log('¡¡Hisotrico contagios cargado...!!');
        dato_hiscon_cargado = true;
        startup_completadas();
    });


/* Logica de la pagina */

function muestraMenuMunicipios(){
   document.getElementById("menuMun").classList.toggle("show");
   document.getElementById("buscaMun").classList.toggle("show");
}


function filterFunction() {
  var input, filter, ul, li, a, i;
  input = document.getElementById("buscaMun");
  filter = input.value.toUpperCase();
  div = document.getElementById("menuMun");
  a = div.getElementsByTagName("a");
  for (i = 0; i < a.length; i++) {
    txtValue = a[i].textContent || a[i].innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      a[i].style.display = "";
    } else {
      a[i].style.display = "none";
    }
  }
} 


function SolicitaDatosMunicipio(event){
    document.getElementById("menuMun").classList.toggle("show");
    document.getElementById("buscaMun").classList.toggle("show");
    
    const clv_num = event.target.getAttribute('inegi_id');
    
    let info_text = 'Mostrando los datos de Todo el Estado de México';
    base_title = 'Evolución del Covid-19 en el Estado de México';
    if(clv_num != '000'){
        const mun_name = event.target.innerHTML;
        info_text = `Mostrando los datos de ${mun_name}.`;
        base_title = `Evolución del Covid-19 en ${mun_name}`;
        } 
    //document.getElementById("mostrando_ahora").innerHTML = info_text;
    document.getElementById("buscaMun").value = '';
    filterFunction();

    OptionChart1.series[0].data = [];
    OptionChart1.series[1].data = [];
    OptionChart1.series[2].data = [];
    OptionChart1.series[3].data = [];
    
    myChart.setOption( { 
           series: [
                 { data:[] },
                 { data:[] },
                 { data:[] },
                 { data:[] }
                  ] 
                } );
    myChart.setOption({
        title:{
            text: ''}
        });
        
    myChart.showLoading();
    
    const mun_request_datos = new Request(file_directory+`${clv_num}.json`);
    fetch(mun_request_datos).then(
    function(response) {
        return response.json();
    }).then(function(data) {
        OptionChart1.series[0].data = data['CNH'].slice(1); 
        OptionChart1.series[1].data = data['DNH'].slice(1);
        OptionChart1.series[2].data = data['CPS'].slice(1);
        OptionChart1.series[3].data = data['DPS'].slice(1);
        
        myChart.setOption( { 
           series: [
                 { data: OptionChart1.series[0].data },
                 { data: OptionChart1.series[1].data },
                 { data: OptionChart1.series[2].data },
                 { data: OptionChart1.series[3].data }
                  ] 
                } );
        
        myChart.hideLoading();
        updateCharTitle()
    });

}


