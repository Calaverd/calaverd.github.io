import * as echarts from 'echarts';

// Si estamos en linea, en lugar de usar los datos guardados
// para test, utilizamos los datos vivos en el github
let dataurl = new URL('./data.plain', import.meta.url);
if(window.location.origin === 'https://calaverd.github.io/'){
  dataurl = "https://raw.githubusercontent.com/indi-es/juegos/main/data.json";
}
// const dataurl = 

async function getData() {
  try {
    const response = await fetch(new Request(dataurl));
    const text = await response.text();
    let data = JSON.parse(text);
    return data;
  } catch (error) {
    return null;
  }
}

const baseGraphEstado = { type: 'bar', stack: 'total', emphasis: { focus: 'series' } };

function JuegosPorAnnus(data) {
  const graficaJuegosAnnus = echarts.init(document.getElementById('devs-by-year'));

  const anosJuego = data.games.reduce(
    (anosJuego, juego) => {
      // revisar si no se lanzo, o la fecha es futura...
      if ( !juego["date-launch"] ||
          new Date(Date.parse(juego["date-launch"])) > new Date().getTime()){
          return anosJuego;
      }
      let date_launch = juego["date-launch"].split('-')[0];
      if ( !anosJuego[ date_launch ] ){
        anosJuego[ date_launch ] = 0;
      }
      anosJuego[ date_launch ] += 1;
      return anosJuego;
    },{});

    const axis = Object.entries(anosJuego).reduce(
      (axis, [ano,num_juegos])=>{
         axis[0].push(ano);
         axis[1].push(num_juegos);
        return axis
      }, [ [], [] ])

  const option = {
    title: {
      text: 'Juegos De Mexico Por Año (Publicados)'
    },
    tooltip: { trigger:'axis' },
    xAxis: {
      type: 'category',
      axisTick: {
        alignWithLabel: true
      },
      axisLabel: {
        rotate: 30
      },
      data: axis[0]
    },
    yAxis: {},
    series: [
      {
        type: 'bar',
        data: axis[1]
      }
    ]
  }

  graficaJuegosAnnus.setOption(option);
}

function getInfoPorAnnus(data, propiedad_de_interes) {
  let propiedades_posibles = {}
  const porAnnus = data.games.reduce(
    (anosJuego, juego) => {
      // revisar si no se lanzo, o la fecha es futura...
      if ( !juego["date-launch"] ||
          new Date(Date.parse(juego["date-launch"])) > new Date().getTime()){
          return anosJuego;
      }
      let date_launch = juego["date-launch"].split('-')[0];
      if ( !anosJuego[ date_launch ] ){
        anosJuego[ date_launch ] = {};
      }
      let prop_list = [];
      if (juego[propiedad_de_interes]) {
        if(Array.isArray(juego[propiedad_de_interes])){
          prop_list = juego[propiedad_de_interes]
        }
        else{ // metela propiedad en un array
          prop_list = [ juego[propiedad_de_interes] ];
        }
      }
      prop_list.forEach(prop => {
        if ( prop ){
          propiedades_posibles[prop] = true;
          if ( !anosJuego[ date_launch ][prop] ){
            anosJuego[ date_launch ][prop] = 0
          }
          anosJuego[ date_launch ][prop] += 1;
        }
      });
      
      return anosJuego;
    },{});
    const lista_estados_posibles = Object.keys(propiedades_posibles).sort();
    return {'year':porAnnus, posibles:lista_estados_posibles };
}

function agregaPropiedades(lista_estados, nombre, num_juegos) {
  const estadoEnLista = lista_estados.find(x=> x.name===nombre );
  if ( !estadoEnLista ){
    lista_estados.push( { name:nombre, data:[num_juegos] } );
    return;
  }
  estadoEnLista.data.push(num_juegos);
}

function getYearGraphData(data, propiedad) {
  const {year,posibles} = getInfoPorAnnus(data, propiedad);
  return Object.entries(year).reduce(
    (graphData, [fecha, tablaEstados])=>{
      graphData.annus.push(fecha);
      posibles.forEach(
        (nombre_estado)=>{
          const num_juegos = tablaEstados[nombre_estado]; // puede ser null
          agregaPropiedades(graphData.estados, nombre_estado, num_juegos);
        }
      );
      return graphData
    }, {annus:[], estados:[] });
}


function generosPorAnnus(data) {
  const graficaJuegosAnnus = echarts.init(document.getElementById('estado'));

  const graph_data = getYearGraphData(data,'genre');
  const use_data = [
    ['Año', ...graph_data.annus],
    ...graph_data.estados.map( (estado)=>[estado.name, ...estado.data] )
  ];
  const option = {
    title: [{ text: 'Generos Por Año' }, {text:'Año 2020', left: '70%', }],
    dataset: {
      source: use_data
    },
    tooltip: { trigger:'axis', showContent:false },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      left: 10,
      top: 25,
      bottom: 25,
    },
    grid: {
      left: '150px',
      right: '50%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      axisTick: {
        alignWithLabel: true
      },
      axisLabel: {
        rotate: 30
      },
    },
    yAxis: { type:'value', gridIndex:0 },
    series: [
      ...graph_data.estados.map( ()=>({
        type: 'bar',
        smooth: true,
        stack: 'total',
        seriesLayoutBy: 'row',
        emphasis: { focus: 'series' }
      }) ),
      ...[{
        type: 'pie',
        id: 'pie',
        radius: '30%',
        center: ['75%', '50%'],
        emphasis: {
          focus: 'self'
        },
        title: {
          text: 'Año 2020'
        },
        label: {
          formatter: '{b}: {@2012} ({d}%)'
        },
        encode: {
          itemName: 'Año',
          value: '2020',
          tooltip: '2020'
        }
       }]
      ]
  }

  graficaJuegosAnnus.on('updateAxisPointer', function (event) {
    const xAxisInfo = event.axesInfo[0];
    if (xAxisInfo) {
      const dimension = xAxisInfo.value + 1;
      const year = use_data[0][dimension];
      graficaJuegosAnnus.setOption({
        title: [{ text: 'Generos Por Año' }, {text:`Año ${year}`, left: '70%', }],
        series: {
          id: 'pie',
          label: {
            formatter: '{b}: {@[' + dimension + ']}'
          },
          encode: {
            value: dimension,
            tooltip: dimension
          }
        }
      });
    }
  });

  graficaJuegosAnnus.setOption(option);
}

async function main() {
  const data = await getData();
  if (!data){
    console.log('No se pudieron cargar los datos.');
    return;
  }
  // Initialize the echarts instance based on the prepared dom

    generosPorAnnus(data)
    //JuegosPorAnnus(data);
}


main();
