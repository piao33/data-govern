<template>
    <div class="content">
        <el-dialog title="" :visible.sync="showDialog" @closed="destory" :close-on-press-escape="false" :close-on-click-modal="false"
            width="90%">
            <div class="header">
                <h2>数据治理报告</h2>
                <span>创建时间：{{createTime}}</span>
            </div>
            <div class="line line-total"></div>

            <ul class="overview">
                <li class="overview-item" v-for="item in dataOverview" :key="item.id">
                    <img :src="item.img" alt="">
                    <div class="info">
                        <p>{{ item.name }}</p>
                        <span>{{ item.count }}</span>
                    </div>
                </li>
            </ul>

            <div class="line line-detail"></div>

            <div class="detail">
                <div class="radar-box">
                    <p class="title">各类型数据异常情况</p>
                    <div id="radar"></div>
                </div>
                <div class="scatter-box">
                    <p class="title">各数据表异常校验分析</p>
                    <div id="scatter"></div>
                </div>
            </div>

        </el-dialog>
    </div>
</template>

<script>
import { getReportOverviewApi } from '../api/index.js'
import anomalieImg from '/src/assets/data.png'
export default {
    name: 'governanceDetail',
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        checkId: {
            type: [Number, String],
            default: ''
        }
    },
    computed: {
        showDialog: {
            get() {
                return this.visible
            },
            set(val) {
                this.$emit('updateVisible', val)
            }
        }
    },
    beforeDestroy() {
        
    },
    watch: {
        visible: {
            handler(val) {
                if(val) {
                    this.init();
                }
            },
            immediate: true
        }
    },
    data() {
        return {
            radarChart: null,
            scatterChart: null,
            createTime: '',
            dataOverview: [],
        }
    },
    methods: {
        async init() {
            let {overview, createTime} = await getReportOverviewApi(this.checkId);
            this.dataOverview = overview;
            this.createTime = createTime;
            await this.$nextTick()
            this.initRadar();
            this.initScatter();
        },
        destory() {
            this.dataOverview = [];
            this.createTime = '';
            this.radarChart && this.$echarts.dispose(this.radarChart)
            this.scatterChart && this.$echarts.dispose(this.scatterChart)
        },
        initRadar() {
            var chartDom = document.getElementById('radar');
            this.radarChart = this.$echarts.init(chartDom);
            var option;

            option = {
                grid: {
                    left: '5%',
                    right: '5%',
                },
                radar: {
                    indicator: [
                        { name: '数据缺失' },
                        { name: '数据异常1' },
                        { name: '数据异常2' },
                        { name: '数据异常3' },
                        { name: '数据异常4' },
                        { name: '数据异常5' },
                        { name: '数据异常6' },
                        { name: '数据异常7' },
                        { name: '数据异常8' },
                        { name: '数据异常9' },
                    ].slice(0,parseInt(Math.random() * 3) + 8)
                },
                axisTick: {
                    show: true,
                },
                axisLabel: {
                    show: true,
                },
                series: [
                    {
                        name: 'Budget vs spending',
                        type: 'radar',
                        label: {
                            show: true,
                        },
                        itemStyle: {
                            color: 'rgba(109, 210, 235, 1)'
                        },
                        lineStyle: {
                            color: 'transparent'
                        },
                        areaStyle: {
                            color: 'rgba(109, 199, 227, 0.7)'
                        },
                        data: [
                            {
                                value: [24, 3, 20, 35, 50, 18, 23, 23, 20, 35].slice(0,parseInt(Math.random() * 3) + 8),
                            }
                        ]
                    }
                ]
            };

            option && this.radarChart.setOption(option);
        },
        initScatter() {
            var chartDom = document.getElementById('scatter');
            this.scatterChart = this.$echarts.init(chartDom);
            var option;

            const xAxisData = [
                '边配电站1', '边配电站2', '边配电站3', '边配电站4', '边配电站5', '边配电站6', '边配电站7'
            ].slice(0, parseInt(Math.random() * 3) + 5);
            const yAxisData = [
                '数据缺失', '数据异常1', '数据异常2', '数据异常3', '数据异常4', '数据异常5'
            ].slice(0, parseInt(Math.random() * 3) + 4);
            const color = ['#b5d8ef', '#a4e3b4','#aeece0','#f3e6b8','#f4cdf0', '#d9ed7a', '#bab6d3'];
            let len = xAxisData.length * yAxisData.length;
            const data = [
                [0, 0, 5], [1, 0, 1], [2, 0, 7], [3 , 0, 3], [4, 0, 0], [5, 0, 4], [6, 0, 4],
                [0, 1, 4], [1, 1, 2], [2, 1, 12], [3 , 1, 2], [4, 1, 2], [5, 1, 6], [6, 1, 12],
                [0, 2, 5], [1, 2, 4], [2, 2, 4], [3 , 2, 0], [4, 2, 4], [5, 2, 8], [6, 2, 3],
                [0, 3, 7], [1, 3, 9], [2, 3, 0], [3 , 3, 2], [4, 3, 5], [5, 3, 2], [6, 3, 5],
                [0, 4, 2], [1, 4, 2], [2, 4, 6], [3 , 4, 4], [4, 4, 1], [5, 4, 4], [6, 4, 1],
                [0, 5, 8], [1, 5, 7], [2, 5, 8], [3 , 5, 6], [4, 5, 8], [5, 5, 9], [6, 5, 7],
            ].slice(0, len);
            option = {
                tooltip: {
                    position: 'top',
                    formatter: function (params) {
                        return (
                            `${xAxisData[params.value[0]]}： ${yAxisData[params.value[1]]} 的数量为 ${params.value[2]}`
                        );
                    }
                },
                grid: {
                    top: 10,
                    left: 10,
                    bottom: 10,
                    right: 20,
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: xAxisData,
                    boundaryGap: false,
                    splitLine: {
                        show: true
                    },
                    axisLine: {
                        show: false
                    }
                },
                yAxis: {
                    type: 'category',
                    data: yAxisData,
                    axisLine: {
                        show: false
                    }
                },
                series: [
                    {
                        type: 'scatter',
                        symbolSize: function (val) {
                            return val[2] * 3;
                        },
                        itemStyle:{
                            color: ({data})=>{
                                return color[data[0]]
                            }
                        },
                        data,
                        animationDelay: function (idx) {
                            return idx * 5;
                        }
                    }
                ]
            };

            option && this.scatterChart.setOption(option);
        },
    }
}
</script>

<style scoped>
.header {
    text-align: center;
}

.header h2 {
    margin-bottom: 8px;
}

.overview {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: wrap;
    border: 1px solid #5f5f60;
    padding: 16px;
    width: 100%;
    box-sizing: border-box;
}

.overview-item {
    width: 20%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    box-sizing: border-box;
    border-right: 1px solid #5f5f60;
}

.overview-item:nth-last-child(1) {
    border: none;
}

.overview-item img {
    width: 64px;
    vertical-align: top;
    margin: 0 20px;
}

.overview-item .info p {
    font-size: 14px;
    font-weight: 400;
    margin-bottom: 12px;
}

.overview-item .info span {
    font-size: 16px;
    font-weight: 600;
}

.detail {
    display: flex;
}

#radar {
    width: 100%;
    height: 400px;
}
#scatter{
    width: 100%;
    height: 400px;
}

.radar-box {
    flex: 1;
    padding-right: 32px;
}

.scatter-box {
    width: 60%;
}

.detail .title {
    font-size: 16px;
    border-bottom: 1px solid #949498;
    padding: 0 0 8px 12px;
}

.line {
    border-top: 1px solid #E7E8E8;
    margin: 30px 0;
    position: relative;
}

.line-total::after {
    content: '校验情况总览';
    position: absolute;
    left: 30px;
    top: -30px;
    background-color: #fff;
    text-align: center;
    font-size: 16px;
    color: #5f5f60;
    font-weight: 500;
    height: 40px;
    padding: 10px;
    line-height: 40px;
}

.line-detail::after {
    content: '校验详情';
    position: absolute;
    left: 30px;
    top: -30px;
    background-color: #fff;
    text-align: center;
    font-size: 16px;
    color: #5f5f60;
    font-weight: 500;
    height: 40px;
    padding: 10px;
    line-height: 40px;
}</style>
