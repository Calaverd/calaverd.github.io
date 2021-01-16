const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto",
"Septiembre","Octubre","Noviembre","Diciembre"];
const DIAS_S = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"]
const base_date_obj = new Date();

let lista_de_municipios = [];
let diccionario_municipios = {};
let HistoricoDefunciones = {};
let HistoricoContagios = {};

const file_directory = '/assets/covid_edomex/data/';

/* Start Up data... */
const request_fechas = new Request(file_directory+'Fechas.json');
const request_municipios = new Request(file_directory+'Municipios.json');
const request_datos_estado = new Request(file_directory+'000.json');
const request_historial_defunciones = new Request(file_directory+'historial_defunciones.json');
const request_historial_contagios = new Request(file_directory+'historial_contagios.json');

let datos_list_mun_cargados = false;
let datos_fechas_cargados = false;
let datos_estado_cargados = false;
let dato_hisdef_cargado = false;
let dato_hiscon_cargado = false;
let chart_one_is_ready = false;
let chart_two_is_ready = false;


let base_title = 'Evolución del Covid-19 en el Estado de México';
let base_title_geo = 'Numero de Contagios Confirmados\n'
let time_frame = '\nUltimos 15 días';
let interval_start_date = new Date();
let interval_end_date = new Date();
let last_date = undefined;

var myChart = echarts.init(document.getElementById('chart'));
var myChartGeo = echarts.init(document.getElementById('geo_test'));
myChart.showLoading();
myChartGeo.showLoading();

var OptionChart1 = {
    tooltip: {
        allowDecimals: false,
        trigger: 'axis',

        axisPointer: {
            type: 'cross',
            snap: true,
            label: {
                backgroundColor: '#6a7985',
                precision: 0,
                formatter: function(x){ 
                        if(x.axisDimension == "x"){
                            return fechaAEspL(x.value);
                         };
                         return Math.floor(x.value);
                         },
            }
        }
    },
    title: {
        left: 'center',
        text: base_title+time_frame,
    },
    toolbox: {
        feature: {
            // magicType: { type: ['line', 'bar'] },
            restore: {
             title:'Reiniciar'
             },
            saveAsImage: {
             title:'Guardar Como Imágen'
             }
        }
    },
    xAxis: {
        type: 'category',
        boundaryGap: true,
        data: []
    },
    yAxis: {
        //name: 'Personas',
        allowDecimals: false,
        type: 'value',
        boundaryGap: false
    },
    legend: {
        data: ['Contagios', 'Defunciones'],
        left: '10',
        orient: 'vertical'
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
        handleStyle: {
            color: '#fff',
            shadowBlur: 3,
            shadowColor: 'rgba(0, 0, 0, 0.6)',
            shadowOffsetX: 2,
            shadowOffsetY: 2
        }
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
                color: 'rgb(199, 18, 0)'
            },
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0.3,
                    color: 'rgb(199, 18, 0)' 
                }, {
                    offset: 0.9,
                    color: 'rgb(173, 45, 45)'
                }])
            },
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0.3,
                    color: 'rgb(199, 18, 0)' 
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
            //sampling: 'average',
            itemStyle: {
                color: 'rgb(23, 24, 26)'
            },
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0.3,
                    color: 'rgb(23, 24, 26)' 
                }, {
                    offset: 0.9,
                    color: 'rgb(4, 33, 36)'
                }])
            },
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0.3,
                    color: 'rgb(23, 24, 26)' 
                }, {
                    offset: 0.9,
                    color: 'rgb(4, 33, 36)'
                }])
            },
            data: []
        }
    ]
};

myChart.on('dataZoom', function (evt) {
 updateCharTitle();
});

myChartGeo.on('timelinechanged', function (evt) {
    let date = myChart.getModel().option.xAxis[0].data[evt.currentIndex]
    //console.log('entra: ', current_option.title[0].text);
    console.log();
    
        
    myChartGeo.setOption({
        title:[
            {text: fechaAEsp(date)},
            { 
             text: base_title_geo+HistoricoContagios.date_list[evt.currentIndex].totales,
            }
            ]
        });
    //console.log('sale: ',current_option.title[0].text); 
});



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
     time_frame = `\n${fechaAEsp(starttime)} al ${fechaAEsp(endtime)}`;
     };
  if(endtime == last_date){
    time_frame = time_frame+`\n(Ultimos ${diff_date+1} días)`;
    }
  else{
    time_frame = time_frame+`\n(${diff_date+1} días)`;
    };
  myChart.setOption({
    title:{
        text: base_title + time_frame}
    });
};

function updateChartData(){
    myChart.setOption(OptionChart1);
    }
    
const fechaAEspL = function(dateString){
    base_date_obj.setTime(Date.parse(dateString));
    return `${DIAS_S[base_date_obj.getUTCDay()]} ${base_date_obj.getUTCDate()} de ${MESES[base_date_obj.getUTCMonth()]} ${base_date_obj.getFullYear()}`;
    }

const fechaAEsp = function(dateString){
    base_date_obj.setTime(Date.parse(dateString));
    return `${base_date_obj.getUTCDate()} de ${MESES[base_date_obj.getUTCMonth()]} ${base_date_obj.getFullYear()}`;
    }
    

function startup_completadas(){
    if(datos_estado_cargados && datos_fechas_cargados && datos_list_mun_cargados && !chart_one_is_ready){
         console.log('Estamos listos');
         updateChartData();
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
            
            
            let OptionChart12 = {
                baseOption: {
                    timeline: {
                        //loop: false,
                        top: '3%',
                        axisType: 'category',
                        show: true,
                        rewind: false,
                        autoPlay: false,
                        symbol : 'none',
                        playInterval: 150,
                        loop :  false,
                        data: OptionChart1.xAxis.data, 
                        label: { show: false } 
                    },
                title: [{
                    text:  fechaAEsp(OptionChart1.xAxis.data[0]),
                    left: 'center'
                },
                {
                text: base_title_geo+HistoricoContagios.date_list[0].totales,
                    textAlign: 'center',
                    left: '70%',
                    top: '25%',
                    textStyle: {
                        fontSize: 20,
                        color: 'rgba(10,10,10, 0.7)'
                }}
                ],
                tooltip: {
                    trigger: 'item',
                    showDelay: 0,
                    transitionDuration: 0.2,
                },
                visualMap: {
                    orient: 'horizontal',
                    left: 'center',
                    bottom: 'top',
                    itemWidth:  15,
                    itemHeight: 500,
                    min: 0,
                    max: HistoricoContagios.max_con,
                    inRange: {
                        color: ['#baab95','#caa07b','#fdae61',
                                '#f8a052','#f29244','#ed8336',
                                '#e77429','#e2641b','#dc530e',
                                '#d64000','#a50026','#811c24',
                                '#5f2322','#3d2321']
                       },
                    calculable: true
                },
            series: [
                {
                    name: 'Contagios',
                    type: 'map',
                    map: 'edomex',
                    left: '13%',
                    top: '13%',
                    label: {
                           color:"#0a0a0a"
                          }
                 },
                {
                    name: 'Contagios',
                    type: 'pie',
                    center: ['70%', '55%'],
                    radius: 75,
                    //map: 'edomex',
                    minShowLabelAngle: 5,
                    label: {
                           color:"#3d2321"
                          }
                 }
                 
                ] 
            },
            
            options: HistoricoContagios.date_list.slice(1),
            
            };
            
            myChartGeo.setOption(OptionChart12);
            myChartGeo.hideLoading();
        });
         
       }
        
    };


const promesa_por_estado = fetch(request_datos_estado).then(
    function(response) {
        return response.json();
    }).then(function(data) {
        OptionChart1.series[0].data = data['CNH'].slice(1);
        OptionChart1.series[1].data = data['DNH'].slice(1);
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
        let temp_data = [];
        data.date_list.forEach(
            element => {
                 let temp_array = {"series":[],"totales":0};
                 temp_array.totales = element.totales;
                 temp_array.series[0] = element.series;
                 temp_array.series[1] = element.series;
                 temp_data.push(temp_array);
            });
        HistoricoContagios = data;
        HistoricoContagios.date_list = temp_data;
        console.log('¡¡Hisotrico contagios cargado...!!');
        dato_hiscon_cargado = true;
        startup_completadas();
    });


const promesa_hisotrial_defuncines = fetch(request_historial_defunciones).then(
    function(response) {
        return response.arrayBuffer();
    }).then(function(buffer) {
        let my_data = new Uint8Array(buffer);
        let data = JSON.parse(pako.inflate(my_data, { to: 'string' }));
        HistoricoDefunciones = data.date_list.slice(1);
        console.log('¡¡Hisotrico defunciones cargado...!!');
        dato_hisdef_cargado = true;
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
    //document.getElementById("buscaMun").value = '';
    filterFunction();

    OptionChart1.series[0].data = [];
    OptionChart1.series[1].data = [];
    
    myChart.setOption( { 
           series: [
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
        
        myChart.setOption( { 
           series: [
                 { data: OptionChart1.series[0].data },
                 { data: OptionChart1.series[1].data }
                  ] 
                } );
        
        myChart.hideLoading();
        updateCharTitle()
    });

}


