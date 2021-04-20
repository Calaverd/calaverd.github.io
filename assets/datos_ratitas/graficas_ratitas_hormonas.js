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
const request_data = new Request(file_directory+'ratitas_hormonas.json');


function prepro(list){
    let new_list = [];
    list.forEach(element => {
        // Id is 0, val is 1
        new_list.push(element[1]);
    });
    return new_list;
};

// returns only the elements that exist on the two list
function preproCombined(list_a, list_b){
    let new_list = [];
    let max = 0;

    list_a.forEach(element_a => {
        // Id is 0, val is 1
        let id = element_a[0];
        let val_a = element_a[1];

        list_b.some(element_b => {
            if( id == element_b[0]){
                max = Math.max(max, element_b[1] );
                new_list.push([ val_a, element_b[1] ]);
                return true;
            }
        })

    });
    console.log('Max',max);
    console.log('list size', new_list.length )
    return new_list;
};

const promesa = fetch(request_data).then(
    function(response) {
        return response.json();
    }).then(function(data) {

        // echarts.registerTransform(ecStat.transform.regression);
        

        let SM_grup = data['SM'];
        let control = data['Control']; 
        

        let sm_glucagon = prepro(SM_grup['Glucagon']);
        let control_glucagon = prepro(control['Glucagon']);

        let sm_insulina = prepro(SM_grup['Ins']);
        let control_insulina = prepro(control['Ins']);

        let sm_corticosterone = prepro(SM_grup['Corticosterone']);
        let control_corticosterone = prepro(control['Corticosterone']);

        let sm_g_zero = prepro(SM_grup['G0']);
        let control_g_zero = prepro(control['G0']);

        let control_ins_vs_g0 = preproCombined(control['G0'],control['Ins']);
        let sm_ins_vs_g0 = preproCombined(SM_grup['G0'],SM_grup['Ins']);
        let regres_control_ins_vs_g0 = ecStat.regression('linear', control_ins_vs_g0).points;
        let regres_sm_ins_vs_g0 = ecStat.regression('linear', sm_ins_vs_g0).points;

        let control_glucagon_vs_g0 = preproCombined(control['Glucagon'],control['Ins']);
        let sm_glucagon_vs_g0 = preproCombined(SM_grup['Glucagon'],SM_grup['Ins']);
        let regres_control_glucagon_vs_g0 = ecStat.regression('linear', control_glucagon_vs_g0).points;
        let regres_sm_glucagon_vs_g0  = ecStat.regression('linear', sm_glucagon_vs_g0).points;

        let control_coli_vs_g0 = preproCombined(control['Corticosterone'],control['Ins']);
        let sm_coli_vs_g0 = preproCombined(SM_grup['Corticosterone'],SM_grup['Ins']);
        let regres_control_coli_vs_g0 = ecStat.regression('linear', control_coli_vs_g0).points;
        let regres_sm_coli_vs_g0 = ecStat.regression('linear',sm_coli_vs_g0).points;

        let OptionChart1 = {
            title:{
                    text: 'Glucagon',
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
                data: ['Control','Síndrome metabólico'],
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
                //name: 'Gramos',
                min: 50,
                max: 350,
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
                    {   name: 'Control',
                        value: control_glucagon,
                        itemStyle: {
                            color:'#a0a0a0',
                            borderColor: '#000000'
                        }
                    },
                    {   name: 'Síndrome metabólico',
                        value: sm_glucagon,
                        itemStyle: {
                            color:'#006e3c',
                            borderColor: '#000000'
                        }
                    }
                    ]
                }
            ]
        };

        let OptionChart2 = {
            title:{
                    text: 'Insulina',
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
                data: ['Control','Síndrome metabólico'],
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
                //name: 'Gramos',
                // min: 50,
                // max: 350,
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
                    {   name: 'Control',
                        value: control_insulina,
                        itemStyle: {
                            color:'#a0a0a0',
                            borderColor: '#000000'
                        }
                    },
                    {   name: 'Síndrome metabólico',
                        value: sm_insulina,
                        itemStyle: {
                            color:'#006e3c',
                            borderColor: '#000000'
                        }
                    }
                    ]
                }
            ]
        };

        let OptionChart3 = {
            title:{
                    text: 'Corticosterone',
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
                data: ['Control','Síndrome metabólico'],
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
                //name: 'Gramos',
                min: 100,
                max: 125,
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
                    {   name: 'Control',
                        value: control_corticosterone,
                        itemStyle: {
                            color:'#a0a0a0',
                            borderColor: '#000000'
                        }
                    },
                    {   name: 'Síndrome metabólico',
                        value: sm_corticosterone,
                        itemStyle: {
                            color:'#006e3c',
                            borderColor: '#000000'
                        }
                    }
                    ]
                }
            ]
        };

        let OptionChart4 = {
            title:{
                    text: 'Glucosa en ayuno',
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
                data: ['Control','Síndrome metabólico'],
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
                //name: 'Gramos',
                min: 60,
                max: 160,
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
                    {   name: 'Control',
                        value: control_g_zero,
                        itemStyle: {
                            color:'#a0a0a0',
                            borderColor: '#000000'
                        }
                    },
                    {   name: 'Síndrome metabólico',
                        value: sm_g_zero,
                        itemStyle: {
                            color:'#006e3c',
                            borderColor: '#000000'
                        }
                    }
                    ],
                },
            ]
        };
        
        let OptionChart5 = {
            title:{
                    text: 'Insulina vs Glucosa en ayuno',
                    left: 'center',
                    textStyle: {
                        color:'#0f0f0f',
                        fontSize :20,
                        fontFamily: 'Atkinson'
                        },
                },
            tooltip: {
                 axisPointer: {
                    type: 'cross',
                    snap: true
                    }
                },
            legend: {
                    bottom: '0%',
                    data: ['Control','Síndrome metabólico'],
                    textStyle:{
                        fontSize : 17,
                        fontStyle : 'bold',
                        fontFamily: 'Atkinson'
                    }
                },
            xAxis: {
                name: 'Glucosa en ayuno',
                min: 60,
                max: 160,
                type: 'value',
                splitArea: {
                    show: false
                },
                splitLine: {
                    show: false
                },
                nameGap:20,
                nameLocation: 'center',
                nameTextStyle: {
                    color:'#0f0f0f',
                    fontSize :16,
                    fontFamily: 'Atkinson',
                    fontWeight:'bold'
                    },
                axisLabel: {
                    color:'#0f0f0f',
                    fontSize :12,
                    fontFamily: 'Atkinson'
                    }
            },
            yAxis: {
                name: 'Insulina',
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
                    fontSize :12,
                    rotate: 65,
                    },
                boundaryGap: false
            },
            series: [{
                type: 'scatter',
                name: 'Control',
                data: control_ins_vs_g0,
                    itemStyle: {
                        color:'#a0a0a0',
                        borderColor: '#000000'
                    }
                },
                {   
                type: 'scatter',
                name: 'Síndrome metabólico',
                data: sm_ins_vs_g0,
                    itemStyle: {
                        color:'#006e3c',
                        borderColor: '#000000'
                    }
                },
                // linear regressions
                {
                type: 'line',
                data: regres_sm_ins_vs_g0,
                    itemStyle: {
                        color:'#006e3c',
                        borderColor: '#000000'
                    }
                },
                {
                type: 'line',
                data: regres_control_ins_vs_g0,
                    itemStyle: {
                        color:'#a0a0a0',
                        borderColor: '#000000'
                    }
                }
            ]
        };
        
        let OptionChart6 = {
            title:{
                    text: 'Glucagon vs Glucosa en ayuno',
                    left: 'center',
                    textStyle: {
                        color:'#0f0f0f',
                        fontSize :20,
                        fontFamily: 'Atkinson'
                        },
                },
            tooltip: {
                 axisPointer: {
                    type: 'cross',
                    snap: true
                    }
                },
            legend: {
                    bottom: '0%',
                    data: ['Control','Síndrome metabólico'],
                    textStyle:{
                        fontSize : 17,
                        fontStyle : 'bold',
                        fontFamily: 'Atkinson'
                    }
                },
            xAxis: {
                name: 'Glucosa en ayuno',
                min: 100,
                max: 400,
                type: 'value',
                splitArea: {
                    show: false
                },
                splitLine: {
                    show: false
                },
                nameGap:20,
                nameLocation: 'center',
                nameTextStyle: {
                    color:'#0f0f0f',
                    fontSize :16,
                    fontFamily: 'Atkinson',
                    fontWeight:'bold'
                    },
                axisLabel: {
                    color:'#0f0f0f',
                    fontSize :12,
                    fontFamily: 'Atkinson'
                    }
            },
            yAxis: {
                name: 'Glucagon',
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
                    fontSize :12,
                    rotate: 65,
                    },
                boundaryGap: false
            },
            series: [{
                type: 'scatter',
                name: 'Control',
                data: control_glucagon_vs_g0,
                    itemStyle: {
                        color:'#a0a0a0',
                        borderColor: '#000000'
                    }
                },
                {   
                type: 'scatter',
                name: 'Síndrome metabólico',
                data: sm_glucagon_vs_g0,
                    itemStyle: {
                        color:'#006e3c',
                        borderColor: '#000000'
                    }
                },
                // linear regressions
                {
                type: 'line',
                data: regres_sm_glucagon_vs_g0,
                    itemStyle: {
                        color:'#006e3c',
                        borderColor: '#000000'
                    }
                },
                {
                type: 'line',
                data: regres_control_glucagon_vs_g0,
                    itemStyle: {
                        color:'#a0a0a0',
                        borderColor: '#000000'
                    }
                }
            ]
        };

        let OptionChart7 = {
            title:{
                    text: 'Corticosterone vs Glucosa en ayuno',
                    left: 'center',
                    textStyle: {
                        color:'#0f0f0f',
                        fontSize :20,
                        fontFamily: 'Atkinson'
                        },
                },
            tooltip: {
                 axisPointer: {
                    type: 'cross',
                    snap: true
                    }
                },
            legend: {
                    bottom: '0%',
                    data: ['Control','Síndrome metabólico'],
                    textStyle:{
                        fontSize : 17,
                        fontStyle : 'bold',
                        fontFamily: 'Atkinson'
                    }
                },
            xAxis: {
                name: 'Glucosa en ayuno',
                min: 100,
                max: 125,
                type: 'value',
                splitArea: {
                    show: false
                },
                splitLine: {
                    show: false
                },
                nameGap:20,
                nameLocation: 'center',
                nameTextStyle: {
                    color:'#0f0f0f',
                    fontSize :16,
                    fontFamily: 'Atkinson',
                    fontWeight:'bold'
                    },
                axisLabel: {
                    color:'#0f0f0f',
                    fontSize :12,
                    fontFamily: 'Atkinson'
                    }
            },
            yAxis: {
                name: 'Corticosterone',
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
                    fontSize :12,
                    rotate: 65,
                    },
                boundaryGap: false
            },
            series: [{
                type: 'scatter',
                name: 'Control',
                data: control_coli_vs_g0,
                    itemStyle: {
                        color:'#a0a0a0',
                        borderColor: '#000000'
                    }
                },
                {   
                type: 'scatter',
                name: 'Síndrome metabólico',
                data: sm_coli_vs_g0,
                    itemStyle: {
                        color:'#006e3c',
                        borderColor: '#000000'
                    }
                },
                // linear regressions
                {
                type: 'line',
                data: regres_sm_coli_vs_g0,
                    itemStyle: {
                        color:'#006e3c',
                        borderColor: '#000000'
                    }
                },
                {
                type: 'line',
                data: regres_control_coli_vs_g0,
                    itemStyle: {
                        color:'#a0a0a0',
                        borderColor: '#000000'
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

        var myChart5 = echarts.init(document.getElementById('chart_7'));
        myChart5.setOption(OptionChart5);

        var myChart6 = echarts.init(document.getElementById('chart_6'));
        myChart6.setOption(OptionChart6);

        var myChart7 = echarts.init(document.getElementById('chart_5'));
        myChart7.setOption(OptionChart7);

    });


//myChartGeo.showLoading();