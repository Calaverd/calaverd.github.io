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
        let grupo_1_kmeans = [];
        let grupo_1_g120 = [];
        let grupo_1_tag = [];
        let grupo_1_insul = [];
        let grupo_1_insul_vs_tag = [];
        let grupo_1_bf = [];
        
        let grupo_2_peso = [];
        let grupo_2_kmeans = [];
        let grupo_2_g120 = [];
        let grupo_2_tag = [];
        let grupo_2_insul = [];
        let grupo_2_insul_vs_tag = [];
        let grupo_2_bf = [];
        
        
        let max_tag = []


        grupo_1.forEach(element => {
            grupo_1_peso.push(element['S20']);
            grupo_1_kmeans.push(element['kmeans']);
            grupo_1_g120.push(element['G120']);
            grupo_1_tag.push(element['TAG']);
            grupo_1_insul.push(element['INS']);
            grupo_1_insul_vs_tag.push([element['INS'],element['TAG']]);
            grupo_1_bf.push(element['BF']);
        });

        grupo_2.forEach(element => {
            grupo_2_peso.push(element['S20']);
            grupo_2_kmeans.push(element['kmeans']);
            grupo_2_g120.push(element['G120']);
            grupo_2_tag.push(element['TAG']);
            grupo_2_insul.push(element['INS']);
            grupo_2_insul_vs_tag.push([element['INS'],element['TAG']]);
            grupo_2_bf.push(element['BF']);
        });

        
        let OptionChart1 = {
            title:{
                    text: 'Comparación del Peso',
                    left: 'center',
                    textStyle: {
                        color:'#0f0f0f',
                        fontSize :20,
                        fontFamily: 'Atkinson'
                        },
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
                    fontFamily: 'Atkinson'
                    }
            },
            yAxis: {
                type: 'value',
                name: 'Gramos',
                min: 400,
                max: 700,
                type: 'value',
                nameGap:35,
                nameTextStyle: {
                    color:'#0f0f0f',
                    fontSize :16,
                    fontFamily: 'Atkinson',
                    fontWeight:'bold'
                    },
                nameLocation: 'center',
                axisLabel: {
                    color:'#0f0f0f',
                    fontSize :14,
                    rotate: 65,
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
                left: 'center',
                textStyle: {
                    color:'#0f0f0f',
                    fontSize :20,
                    fontFamily: 'Atkinson'
                    },
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
                    fontFamily: 'Atkinson'
                    }
            },
            yAxis: {
                name: 'Glucosa',
                min: 70,
                max: 260,
                type: 'value',
                nameGap:35,
                nameTextStyle: {
                    color:'#0f0f0f',
                    fontSize :16,
                    fontFamily: 'Atkinson',
                    fontWeight:'bold'
                    },
                nameLocation: 'center',
                axisLabel: {
                    color:'#0f0f0f',
                    fontSize :14,
                    rotate: 65,
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
                left: 'center',
                textStyle: {
                    color:'#0f0f0f',
                    fontSize :20,
                    fontFamily: 'Atkinson'
                    },
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
                    fontFamily: 'Atkinson'
                    }
            },
            yAxis: {
                name: 'Triglicéridos',
                type: 'value',
                nameGap:35,
                nameTextStyle: {
                    color:'#0f0f0f',
                    fontSize :16,
                    fontFamily: 'Atkinson',
                    fontWeight:'bold'
                    },
                nameLocation: 'center',
                axisLabel: {
                    color:'#0f0f0f',
                    fontSize :14,
                    rotate: 65,
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
                text: 'BF vs Kmeans',
                left: 'center',
                textStyle: {
                    color:'#0f0f0f',
                    fontSize :20,
                    fontFamily: 'Atkinson'
                    },
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
                    fontFamily: 'Atkinson'
                    }
            },
            yAxis: {
                min: 180,
                max: 350,
                name: 'BF',
                type: 'value',
                nameGap:35,
                nameTextStyle: {
                    color:'#0f0f0f',
                    fontSize :16,
                    fontFamily: 'Atkinson',
                    fontWeight:'bold'
                    },
                nameLocation: 'center',
                axisLabel: {
                    color:'#0f0f0f',
                    fontSize :14,
                    rotate: 65,
                    },
                boundaryGap: false
            },
            series: [{
                type: 'boxplot',
                scale: 'log',
                data: [
                    {   value: grupo_1_bf,
                        itemStyle: {
                            color:'#006e3c',
                            borderColor: '#000000'
                        }
                    },
                    {   value: grupo_2_bf,
                        itemStyle: {
                            color:'#004d66',
                            borderColor: '#000000'
                        }
                    }
                    ]
                }
            ]
        };

        /*
        let OptionChart4 = {
            title: {
                text: 'Triglicéridos contra Insulina',
                left: 'center',
                textStyle: {
                    color:'#0f0f0f',
                    fontSize :20,
                    fontFamily: 'Atkinson'
                    },
            },
            tooltip: {
                backgroundColor : 'rgba(50,50,50,0.8)',
                trigger: 'item',
                axisPointer: {
                    type: 'cross',
                    snap: true
                    }
                },
            grid: [{
                top: '50%',
                right: '50%'
            }, {
                bottom: '52%',
                right: '50%',
            }, {
                top: '50%',
                left: '52%'
            }],
            xAxis: [
                {
                name: 'Insulina',
                type: 'value',
                nameGap:30,
                nameLocation: 'center',
                nameTextStyle: {
                    color:'#0f0f0f',
                    fontSize :16,
                    fontFamily: 'Atkinson',
                    fontWeight:'bold'
                    },
                splitArea: {
                    show: false
                },
                splitLine: {
                    show: false
                },
                axisLabel: {
                    color:'#0f0f0f',
                    fontSize :14
                    },
                gridIndex: 0
                },
                {
                name:'Insulina',
                type: 'value',
                nameGap:-200,
                nameTextStyle: {
                    color:'#0f0f0f',
                    fontSize :16,
                    fontFamily: 'Atkinson',
                    fontWeight:'bold'
                    },
                nameLocation: 'center',
                axisLabel: {
                    color:'#0f0f0f',
                    fontSize :14,
                    },
                axisTick: { show: false },
                axisLabel: { show: false },
                axisLine: { show: false },
                boundaryGap: false,
                gridIndex: 1
                },
                {
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
                    fontFamily: 'Atkinson'
                    },
                gridIndex: 2
                }
            ],
            yAxis: [{
                name: 'Triglicéridos',
                type: 'value',
                nameGap:35,
                nameTextStyle: {
                    color:'#0f0f0f',
                    fontSize :16,
                    fontFamily: 'Atkinson',
                    fontWeight:'bold'
                    },
                nameLocation: 'center',
                axisLabel: {
                    color:'#0f0f0f',
                    fontSize :14,
                    rotate: 65,
                    },
                boundaryGap: false,
                gridIndex: 0
                },
                {
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
                    fontFamily: 'Atkinson',
                    rotate: 90
                    },
                gridIndex: 1
                },
                {
                type: 'value',
                name: 'Triglicéridos',
                type: 'value',
                nameGap:-280,
                nameTextStyle: {
                    color:'#0f0f0f',
                    fontSize :16,
                    fontFamily: 'Atkinson',
                    fontWeight:'bold'
                    },
                nameLocation: 'center',
                axisTick: { show: false },
                axisLabel: { show: false },
                axisLine: { show: false },
                boundaryGap: false,
                gridIndex: 2
                }
            ],
            series: [{
                name:'Kmeans 1',
                type: 'scatter',
                xAxisIndex: 0,
                yAxisIndex: 0,
                data: grupo_1_insul_vs_tag,
                itemStyle: {
                    color:'#006e3c'
                    },
                markArea: {
                    silent: true,
                    itemStyle: {
                        color: 'transparent',
                        borderWidth: 1,
                        borderType: 'dashed'
                    },
                    data: [[{
                        xAxis: 'min',
                        yAxis: 'min'
                    }, {
                        xAxis: 'max',
                        yAxis: 'max'
                    }]]
                },
                
                },
                {
                name:'Kmeans 2',
                type: 'scatter',
                xAxisIndex: 0,
                yAxisIndex: 0,
                data: grupo_2_insul_vs_tag,
                itemStyle: {
                    color:'#004d66'
                    },
                markArea: {
                    silent: true,
                    itemStyle: {
                        color: 'transparent',
                        borderWidth: 1,
                        borderType: 'dashed'
                    },
                    data: [[{
                        xAxis: 'min',
                        yAxis: 'min'
                    }, {
                        xAxis: 'max',
                        yAxis: 'max'
                    }]]
                },
                },
                {
                type: 'boxplot',
                scale: 'log',
                xAxisIndex: 1,
                yAxisIndex: 1,
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
                type: 'boxplot',
                scale: 'log',
                xAxisIndex: 2,
                yAxisIndex: 2,
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
        */

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