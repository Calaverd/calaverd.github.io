let datos_nuevos_diarios =   [ ];
let datos_acumulados = [ ]; 
let datos_fechas = [];

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

function startup_completadas(){
    if(datos_estado_cargados && datos_fechas_cargados && datos_list_mun_cargados){
         console.log('Estamos listos');
         datos_nuevos_diarios[0] = datos_fechas;
         datos_acumulados[0] = datos_fechas;
         chart_contagios.load({ columns:datos_nuevos_diarios });
         chart_defunciones.load({ columns:datos_acumulados });
       }
    else{
        console.log('Aun no estamos listos');
        }
    };


const promesa_por_estado = fetch(request_datos_estado).then(
    function(response) {
        return response.json();
    }).then(function(data) {
        datos_nuevos_diarios[1] =
        ['Contagios Nuevos'].concat(data['CNH'].slice(1));
        datos_nuevos_diarios[2] =
        ['Defunciones Nuevas'].concat(data['DNH'].slice(1));            
        
        datos_acumulados[1] = ['Contagios'].concat(data['CTC'].slice(1));
        datos_acumulados[2] = ['Defunciones'].concat(data['DTC'].slice(1));
        
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
        datos_fechas = ['x'].concat(data.Fechas.slice(1));
        console.log('¡¡Fechas cargadas!!')
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

const chart_contagios = c3.generate({
    bindto: '#contagios',
    data: {
      x: 'x',
      xFormat: '%Y-%m-%d',
      columns: [],
      type: 'area',
      empty: { label: { text: "Esperando datos..." } }
     },
     legend: { position: 'inset' },
     axis: { 
            x: { 
                type: 'timeseries', tick: { format: fechaAEspL, count: 8, centered: true },
                localtime: true,                
                label: 
                  { text:'Fecha', position: 'outer-center'}
                },
            y: { label: 
                 { text:'Numero de Casos', position: 'outer-middle'}
                }
        },
     grid: { 
          x: { show: true },
          y: { show: true }
         },
    tooltip: { format: { title: fechaAEsp  } },
    color: { pattern: ['#FF0000','#020202'] },
    point: { focus: { expand: { r: 6} } }
 });


const chart_defunciones = c3.generate({
    bindto: '#defunciones',
    data: {
      x: 'x',
      xFormat: '%Y-%m-%d',
      columns: [],
      type: 'area',
      empty: { label: { text: "Esperando datos..." } }
     },            
     legend: { position: 'inset' },
     axis: { 
            x: { 
                type: 'timeseries', tick: { format: '%Y-%m-%d' },
                label: 
                  { text:'Fecha', position: 'outer-center'}
                },
            y: { label: 
                 { text:'Numero de Defunciones', position: 'outer-middle'}
                }
        },
     grid: { 
          x: { show: true },
          y: { show: true }
         },
    tooltip: { format: { title: fechaAEsp  } },
    color: { pattern: ['#FF0000','#020202']  },
    point: { focus: { expand: { r: 6} } }
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
    if(clv_num != '000'){
        const mun_name = event.target.innerHTML;
        info_text = `Mostrando los datos de ${mun_name}.`;
        } 
    document.getElementById("mostrando_ahora").innerHTML = info_text;
    document.getElementById("buscaMun").value = '';
    filterFunction();
    
    datos_nuevos_diarios[1] = ['Contagios Nuevos'].concat(new Array(datos_fechas.length-1).fill(0));
    datos_nuevos_diarios[2] = ['Defunciones Nuevas'].concat(new Array(datos_fechas.length-1).fill(0));
    datos_acumulados[1] = ['Contagios'].concat(new Array(datos_fechas.length-1).fill(0));
    datos_acumulados[2] = ['Defunciones'].concat(new Array(datos_fechas.length-1).fill(0));
    chart_contagios.load({columns:datos_nuevos_diarios });
    chart_defunciones.load({ columns:datos_acumulados });
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
        datos_nuevos_diarios[1] =
        ['Contagios Nuevos'].concat(data['CNH'].slice(1));
        datos_nuevos_diarios[2] =
        ['Defunciones Nuevas'].concat(data['DNH'].slice(1));            
        
        datos_acumulados[1] = ['Contagios'].concat(data['CTC'].slice(1));
        datos_acumulados[2] = ['Defunciones'].concat(data['DTC'].slice(1));
        
        chart_contagios.load({ columns:datos_nuevos_diarios });
        chart_defunciones.load({ columns:datos_acumulados });
    });

}





/* DOM modificaciones */





/*
d3.json('static/reporte_covid.json').then(data => {
    // convertir los casos y defunciones a enteros
    
    datos_nuevos_diarios[0] = datos_fechas;
    datos_nuevos_diarios[1] =
    ['Contagios Nuevos Diarios'].concat(data['000CNH'].slice(1));
    datos_defunciones[0] = datos_fechas;
    datos_nuevos_diarios[2] =
    ['Defunciones Nuevas Diarias'].concat(data['000DNH'].slice(1));

    chart_contagios.load({ columns:datos_nuevos_diarios });    
    //chart_defunciones.load({ columns:datos_defunciones });
    
    });
*/
/*
d3.csv('static/reporte_covid.csv').then(data => {
    // convertir los casos y defunciones a enteros
    let count = false;
    data.forEach( fila => {
        if(count){  
            datos_nuevos_diarios[0].push(fila.Fecha);
            datos_nuevos_diarios[1].push(+fila['000CNH']);
            datos_defunciones[0].push(fila.Fecha);
            datos_defunciones[1].push(+fila['000DNH']);
            }
        count = true;
        });
    console.log('Datos procesados, cargando a graficas...')
    chart_contagios.load({ columns:datos_nuevos_diarios });    
    chart_defunciones.load({ columns:datos_defunciones });
    });
*/

