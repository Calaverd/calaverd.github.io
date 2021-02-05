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
        let grupo_1_scat_insul = []
        let grupo_1_kmeans = [];
        let grupo_1_g120 = [];
        let grupo_1_tag = [];
        let grupo_1_insul = [];
        
        let grupo_2_peso = [];
        let grupo_2_scat_insul = [];
        let grupo_2_kmeans = [];
        let grupo_2_g120 = [];
        let grupo_2_tag = [];
        let grupo_2_insul = [];
        
        


        grupo_1.forEach(element => {
            grupo_1_peso.push(element['S20']);
            grupo_1_kmeans.push(element['kmeans']);
            grupo_1_g120.push(element['G120']);
            grupo_1_tag.push(element['TAG']);
            grupo_1_insul.push(element['INS']);
            grupo_1_scat_insul.push([0,element['INS']]);
        });

        grupo_2.forEach(element => {
            grupo_2_peso.push(element['S20']);
            grupo_2_kmeans.push(element['kmeans']);
            grupo_2_g120.push(element['G120']);
            grupo_2_tag.push(element['TAG']);
            grupo_2_insul.push(element['INS']);
            grupo_2_scat_insul.push([1,element['INS']]);
        });
        
        let OptionChart1 = {
            title:[
                {
                    text: 'Comparación del Peso',
                    left: 'center'
                },
                /* // leyenda
                {
                    text: 'upper: Q3 + 1.5 * IRQ lower: Q1 - 1.5 * IRQ',
                    borderColor: '#999',
                    borderWidth: 1,
                    textStyle: {
                        fontSize: 14
                    },
                    left: '10%',
                    top: '93%'
                }
                */
                ],
            tooltip: {
                backgroundColor : 'rgba(50,50,50,0.8)',
                trigger: 'item',
                axisPointer: {
                    type: 'cross',
                    snap: true
                    }
                },
            xAxis: {
                type: 'category',
                data: ['Kmeans 1','Kmeans 2'],
                splitArea: {
                    show: false
                },
                splitLine: {
                    show: false
                },
                axisLabel: {
                    color:'#0f0f0f',
                    fontSize :14,
                    }
            },
            yAxis: {
                type: 'value',
                name: 'Gramos',
                min: 400,
                max: 700,
                type: 'value',
                nameTextStyle: {
                    color:'#0f0f0f',
                    fontSize :16,
                    },
                axisLabel: {
                    color:'#0f0f0f',
                    fontSize :14,
                    },
                boundaryGap: false
            },
            series: [{
                type: 'boxplot',
                data: [
                    {   name: 'Kmeans 1',
                        value: grupo_1_peso,
                        itemStyle: {
                            color:'#006e3c',
                            borderColor: '#000000'
                        }
                    },
                    {   name: 'Kmeans 2',
                        value: grupo_2_peso,
                        itemStyle: {
                            color:'#004d66',
                            borderColor: '#000000'
                        }
                    },
                    ]
                }
            ]
        };

        let OptionChart2 = {
            title: {
                text: 'G120',
                left: 'center'
            },
            tooltip: {
                backgroundColor : 'rgba(50,50,50,0.8)',
                trigger: 'item',
                axisPointer: {
                    type: 'cross',
                    snap: true
                    }
                },
            xAxis: {
                type: 'category',
                data: ['Kmeans 1','Kmeans 2'],
                splitArea: {
                    show: false
                },
                splitLine: {
                    show: false
                },
                axisLabel: {
                    color:'#0f0f0f',
                    fontSize :14,
                    }
            },
            yAxis: {
                name: 'Glucosa',
                min: 70,
                max: 260,
                type: 'value',
                nameTextStyle: {
                    color:'#0f0f0f',
                    fontSize :16,
                    },
                axisLabel: {
                    color:'#0f0f0f',
                    fontSize :14,
                    },
                boundaryGap: false
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
                text: 'TAG',
                left: 'center'
            },
            tooltip: {
                backgroundColor : 'rgba(50,50,50,0.8)',
                trigger: 'item',
                axisPointer: {
                    type: 'cross',
                    snap: true
                    }
                },
            xAxis: {
                type: 'category',
                data: ['Kmeans 1','Kmeans 2'],
                splitArea: {
                    show: false
                },
                splitLine: {
                    show: false
                },
                axisLabel: {
                    color:'#0f0f0f',
                    fontSize :14,
                    }
            },
            yAxis: {
                name: 'Triglicéridos',
                type: 'value',
                nameTextStyle: {
                    color:'#0f0f0f',
                    fontSize :16,
                    },
                axisLabel: {
                    color:'#0f0f0f',
                    fontSize :14,
                    },
                boundaryGap: false
            },
            series: [{
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
            title: {
                text: 'Insulina',
                left: 'center'
            },
            tooltip: {
                backgroundColor : 'rgba(50,50,50,0.8)',
                trigger: 'item',
                axisPointer: {
                    type: 'cross',
                    snap: true
                    }
                },
            xAxis: {
                type: 'category',
                data: ['Kmeans 1','Kmeans 2'],
                splitArea: {
                    show: false
                },
                splitLine: {
                    show: false
                },
                axisLabel: {
                    color:'#0f0f0f',
                    fontSize :14,
                    }
            },
            yAxis: {
                name: 'Insulina',
                type: 'value',
                nameTextStyle: {
                    color:'#0f0f0f',
                    fontSize :16,
                    },
                axisLabel: {
                    color:'#0f0f0f',
                    fontSize :14,
                    },
                boundaryGap: false
            },
            series: [{
                type: 'boxplot',
                scale: 'log',
                data: [
                    {   value: grupo_1_insul,
                        itemStyle: {
                            color:'#006e3c',
                            borderColor: '#000000'
                        }
                    },
                    {   value: grupo_2_insul,
                        itemStyle: {
                            color:'#004d66',
                            borderColor: '#000000'
                        }
                    }
                    ]
                },
                {
                type: 'scatter',
                data: grupo_1_scat_insul
                },
                {
                type: 'scatter',
                data: grupo_2_scat_insul
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