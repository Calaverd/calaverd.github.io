let lista_de_municipios = [];
let diccionario_municipios = {};

const file_directory = '/assets/covid_edomex/data/';

/* Start Up data... */
const request_fechas = new Request(file_directory+'Fechas.json');
const request_municipios = new Request(file_directory+'Municipios.json');
const request_datos_estado = new Request(file_directory+'000.json');

let datos_list_mun_cargados = false;
let datos_fechas_cargados = false;
let datos_estado_cargados = false;

var myChart = echarts.init(document.getElementById('chart'));
var option = {
    tooltip: {
        allowDecimals: false,
        trigger: 'axis',

        axisPointer: {
            type: 'cross',
            allowDecimals: false,
            label: {
                backgroundColor: '#6a7985'
            }
        }
    },
    title: {
        left: 'center',
        text: 'Evolución del Covid-19',
    },
    toolbox: {
        feature: {
             magicType: {
                type: ['line', 'bar']
            },
            restore: {
             title:'Restart'
             },
            saveAsImage: {
             title:'Save picture'
             }
        }
    },
    xAxis: {
        type: 'category',
        boundaryGap: true,
        data: []
    },
    yAxis: {
        allowDecimals: false,
        type: 'value',
        boundaryGap: false
    },
    dataZoom: [{
        type: 'inside',
        filterMode: 'weakFilter',
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
            sampling: 'average',
            itemStyle: {
                color: 'rgb(199, 18, 0)'
            },
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0.3,
                    color: 'rgb(199, 18, 0)' 
                }, {
                    offset: 0.9,
                    color: 'rgb(224, 167, 62)'
                }])
            },
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0.3,
                    color: 'rgb(199, 18, 0)' 
                }, {
                    offset: 0.9,
                    color: 'rgb(224, 167, 62)'
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
            sampling: 'average',
            itemStyle: {
                color: 'rgb(23, 24, 26)'
            },
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0.3,
                    color: 'rgb(23, 24, 26)' 
                }, {
                    offset: 0.9,
                    color: 'rgb(38, 46, 54)'
                }])
            },
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0.3,
                    color: 'rgb(23, 24, 26)' 
                }, {
                    offset: 0.9,
                    color: 'rgb(38, 46, 54)'
                }])
            },
            data: []
        }
    ]
};

function updateChartData(){
    myChart.setOption(option);
    }

function startup_completadas(){
    if(datos_estado_cargados && datos_fechas_cargados && datos_list_mun_cargados){
         console.log('Estamos listos');
         updateChartData()
       }
    else{
        console.log('Aun no estamos listos');
        }
    };


const promesa_por_estado = fetch(request_datos_estado).then(
    function(response) {
        return response.json();
    }).then(function(data) {
        option.series[0].data = data['CNH'].slice(1);
        option.series[1].data = data['DNH'].slice(1);
        datos_estado_cargados = true;
        startup_completadas();
    });


/* cuando solicitabamos los datos en un archivo binario comprimido...
const promesa_por_estado = fetch(request_datos_estado).then(
    function(response) {
        return response.arrayBuffer();
    }).then(function(buffer) {
        let my_data = new Uint8Array(buffer);
        let data = JSON.parse(pako.inflate(my_data, { to: 'string' }));
        datos_nuevos_diarios[1] =
        ['Contagios Nuevos'].concat(data['CNH'].slice(1));
        datos_nuevos_diarios[2] =
        ['Defunciones Nuevas'].concat(data['DNH'].slice(1));            
        
        datos_acumulados[1] = ['Contagios'].concat(data['CTC'].slice(1));
        datos_acumulados[2] = ['Defunciones'].concat(data['DTC'].slice(1));
        
        datos_estado_cargados = true;
        startup_completadas();
    });
*/

const promesa_por_municipios = fetch(request_municipios).then(
    function(response) {
        return response.arrayBuffer();
    }).then(function(buffer) {
        let my_data = new Uint8Array(buffer);
        diccionario_municipios = JSON.parse(pako.inflate(my_data, { to: 'string' }));
        console.log('¡¡Municipios cargados!!');
        
        for (var key in diccionario_municipios) {        
            lista_de_municipios[lista_de_municipios.length] = key
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
        option.xAxis.data = data.Fechas.slice(1);
        option.dataZoom[0].endValue = option.xAxis.data.length 
        option.dataZoom[0].startValue = option.xAxis.data.length-14
        console.log(data);
        
        console.log('¡¡Fechas cargadas!!');
        datos_fechas_cargados = true;
        startup_completadas();
    });


/* Dibujar las graficas */

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto",
"Septiembre","Octubre","Noviembre","Diciembre"];
const DIAS_S = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"]

const fechaAEsp = function (x, index){
    return `${DIAS_S[x.getDay()]} ${x.getDate()} de ${MESES[x.getMonth()]} del ${x.getFullYear()}`;
    }

const fechaAEspL = function(x){
    return `${MESES[x.getMonth()]}`;
    }

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
    if(clv_num != '000'){
        const mun_name = event.target.innerHTML;
        info_text = `Mostrando los datos de ${mun_name}.`;
        } 
    document.getElementById("mostrando_ahora").innerHTML = info_text;
    document.getElementById("buscaMun").value = '';
    filterFunction();

    option.series[0].data = [];
    option.series[1].data = [];
    
    updateChartData();
    
    /* cuando solicitabamos los datos en un archivo binario comprimido...
    const mun_request_datos = new Request(`./static/covid_edomex/${clv_num}.json.zlib`);
    fetch(mun_request_datos).then(
    function(response) {
        return response.arrayBuffer();
    }).then(function(buffer) {
        let my_data = new Uint8Array(buffer);
        let data = JSON.parse(pako.inflate(my_data, { to: 'string' }));
        datos_nuevos_diarios[1] =
        ['Contagios Nuevos'].concat(data['CNH'].slice(1));
        datos_nuevos_diarios[2] =
        ['Defunciones Nuevas'].concat(data['DNH'].slice(1));            
        
        datos_acumulados[1] = ['Contagios'].concat(data['CTC'].slice(1));
        datos_acumulados[2] = ['Defunciones'].concat(data['DTC'].slice(1));
        
        chart_contagios.load({ columns:datos_nuevos_diarios });
        chart_defunciones.load({ columns:datos_acumulados });
    });
    */
    
    const mun_request_datos = new Request(file_directory+`${clv_num}.json`);
    fetch(mun_request_datos).then(
    function(response) {
        return response.json();
    }).then(function(data) {
        option.series[0].data = data['CNH'].slice(1); 
        option.series[1].data = data['DNH'].slice(1);
        
        updateChartData();
    });

}
