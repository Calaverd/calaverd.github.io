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

const file_directory = '/assets/datos_ratitas/';

/* Start Up data... */
const request_data = new Request(file_directory+'ratitas.json');


const promesa = fetch(request_data).then(
    function(response) {
        return response.json();
    }).then(function(data) {


        let grupo_1 = data['grupo_1'];
        let grupo_2 = data['grupo_2'];

        let grupo_1_peso = [];
        let grupo_1_peso_scatter = []
        let grupo_1_kmeans = [];
        let grupo_1_g120 = [];
        let grupo_1_tag = [];
        let grupo_1_insul = [];
        
        let grupo_2_peso = [];
        let grupo_2_peso_scatter = [];
        let grupo_2_kmeans = [];
        let grupo_2_g120 = [];
        let grupo_2_tag = [];
        let grupo_2_insul = [];
        
        


        grupo_1.forEach(element => {
            grupo_1_peso.push(element['S20']);
            grupo_1_peso_scatter.push([0,element['S20']]);
            grupo_1_kmeans.push(element['kmeans']);
            grupo_1_g120.push(element['G120']);
            grupo_1_tag.push(element['TAG']);
            grupo_1_insul.push(element['INS']);
        });

        grupo_2.forEach(element => {
            grupo_2_peso.push(element['S20']);
            grupo_2_peso_scatter.push([1,element['S20']]);
            grupo_2_kmeans.push(element['kmeans']);
            grupo_2_g120.push(element['G120']);
            grupo_2_tag.push(element['TAG']);
            grupo_2_insul.push(element['INS']);
        });

        console.log(grupo_1_peso_scatter)
        
        let OptionChart1 = {
            title: {
                text: 'Peso vs Kmeans',
                left: 'center'
            },
            xAxis: {
                type: 'category',
                data: ['kmeans 1','kmeans 2'],
                splitArea: {
                    show: false
                },
                splitLine: {
                    show: false
                }
            },
            tooltip: {
                trigger: 'item',
                axisPointer: {
                    type: 'shadow'
                }
            },
            yAxis: {
                type: 'value',
                name: 'Gramos',
                min: 400,
                max: 770
            },
            series: [{
                type: 'boxplot',
                data: [
                    {   value: grupo_1_peso,
                        itemStyle: {
                            color:'#006e3c',
                            borderColor: '#000000'
                        }
                    },
                    {   value: grupo_2_peso,
                        itemStyle: {
                            color:'#004d66',
                            borderColor: '#000000'
                        }
                    },
                    ]
                },
                {
                type: 'scatter',
                data: grupo_1_peso_scatter,
                    itemStyle: {
                        color:'#0f0f0f'
                    },
                z: 4
                },
                {
                type: 'scatter',
                data: grupo_2_peso_scatter,
                    itemStyle: {
                        color:'#0f0f0f'
                    },
                z: 4
                }
            ]
        };

        let OptionChart2 = {
            title: {
                text: 'G120 vs Kmeans',
                left: 'center'
            },
            xAxis: {
                type: 'category',
                data: ['kmeans 1','kmeans 2']
            },
            tooltip: {
                trigger: 'item',
                axisPointer: {
                    type: 'shadow'
                }
            },
            yAxis: {
                type: 'value',
                name: 'Glucosa',
                min: 50,
            },
            series: [{
                type: 'boxplot',
                scale: 'log',
                data: [
                    {   value: grupo_1_g120,
                        itemStyle: {
                            color:'#006e3c',
                            borderColor: '#000000'
                        }
                    },
                    {   value: grupo_2_g120,
                        itemStyle: {
                            color:'#004d66',
                            borderColor: '#000000'
                        }
                    }
                    ]
                }
            ]
        };

        let OptionChart3 = {
            title: {
                text: 'TAG vs Kmeans',
                left: 'center'
            },
            xAxis: {
                type: 'category',
                data: ['kmeans 1','kmeans 2']
            },
            tooltip: {
                trigger: 'item',
                axisPointer: {
                    type: 'shadow'
                }
            },
            yAxis: {
                type: 'value',
                name: 'Triglicéridos',
            },
            series: [{
                name: 'TAG vs Kmeans',
                type: 'boxplot',
                scale: 'log',
                data: [
                    {   value: grupo_1_tag,
                        itemStyle: {
                            color:'#006e3c',
                            borderColor: '#000000'
                        }
                    },
                    {   value: grupo_2_tag,
                        itemStyle: {
                            color:'#004d66',
                            borderColor: '#000000'
                        }
                    }
                    ]
                }
            ]
        };

        let OptionChart4 = {
            legend: {
                data: ['Grupo 1', 'Grupo 2'],
                //left: '10',
                //bottom: '5%'
                //orient: 'vertical'
                textStyle:{
                    fontSize : 17,
                    fontStyle : 'bold',
                    fontFamily: 'Atkinson'
                    }
                },
            title: {
                text: 'TAG vs Insulina',
                left: 'center'
            },
            xAxis: {
                name:'Insulina',
                type: 'category',
                data: grupo_1_insul
            },
            tooltip: {
                trigger: 'item',
                axisPointer: {
                    type: 'shadow'
                }
            },
            yAxis: {
                type: 'value',
                name: 'Triglicéridos',
            },
            series: [{
                name: 'Grupo1',
                type: 'line',
                data:grupo_1_tag,
                lineStyle: {
                    color: '#006e3c'
                    }
                },
                {
                name: 'Grupo2',
                type: 'line',
                data:grupo_2_tag,
                lineStyle: {
                    color: '#004d66'
                    }
                }
            ]
        };

        var myChart = echarts.init(document.getElementById('chart_1'));
        myChart.setOption(OptionChart1);

        var myChart2 = echarts.init(document.getElementById('chart_2'));
        myChart2.setOption(OptionChart2);

        var myChart3 = echarts.init(document.getElementById('chart_3'));
        myChart3.setOption(OptionChart3);

        var myChart4 = echarts.init(document.getElementById('chart_4'));
        myChart4.setOption(OptionChart4);
    });


//myChartGeo.showLoading();