<template>
    <div class="content">
        <el-dialog title="" :visible.sync="showDialog" @closed="destory" :close-on-press-escape="false"
            :close-on-click-modal="false" :append-to-body="true" top="5vh" width="90%">
            <div id="dom2image">
                <div class="header">
                    <h2>数据治理报告</h2>
                    <span>创建时间：{{ dataOverview.checkTime }}</span>
                    <el-button type="text" style="padding:0;marginLeft:12px;" v-show="!isCreating || !loading" @click="createReportImage">报告下载</el-button>
                    <el-button type="text" @click="showDialog = false" v-if="!isCreating" style="padding:0;float: left;">
                        返回
                        <i class="el-icon-d-arrow-left" style="color: #0071B7;fontWeight: bolder;"></i>
                    </el-button>
                </div>
                <div class="line line-total"></div>

                <ul class="overview">
                    <li class="overview-item">
                        <img :src="base64Icon" alt="">
                        <div class="info">
                            <p>数据表总数</p>
                            <span>{{ dataOverview.tablesCount}}项</span>
                        </div>
                    </li>
                    <li class="overview-item">
                        <img :src="base64Icon" alt="">

                        <div class="info">
                            <p>数据异常表数</p>
                            <span>{{ dataOverview.tablesErrorCount }}项</span>
                        </div>
                    </li>
                    <li class="overview-item">
                        <img :src="base64Icon" alt="">

                        <div class="info">
                            <p>数据项数</p>
                            <span>{{ dataOverview.dataCount }}项</span>
                        </div>
                    </li>
                    <li class="overview-item">
                        <img :src="base64Icon" alt="">

                        <div class="info">
                            <p>数据异常项数</p>
                            <span>{{ dataOverview.dataErrorCount}}项</span>
                        </div>
                    </li>
                    <li class="overview-item">
                        <img :src="base64Icon" alt="">

                        <div class="info">
                            <p>数据缺失项数</p>
                            <span>{{ dataOverview.dataMissingCount }}项</span>
                        </div>
                    </li>
                </ul>

                <div class="line line-detail"></div>

                <div class="detail">
                    <div class="desc-box">
                        <p class="sub-title">数据异常情况说明</p>
                        <div v-for="(item, index) in anomalieDesc" :key="index" class="desc-item">
                            <i class="el-icon-caret-right" style="color: #0071B7"></i>
                            {{ item.desc }}
                        </div>
                    </div>
                    <div class="radar-box">
                        <p class="sub-title">各类型数据校验异常情况</p>
                        <div id="radar"></div>
                    </div>
                </div>
                <div class="scatter-box">
                    <p class="sub-title">异常问题按各数据表分布</p>
                    <div id="scatter"></div>
                </div>
                <div class="line-box" v-loading="loading">
                    <p class="sub-title">各表异常问题按计算周期分布</p>
                    <div class="chart-action">
                        <el-select size="mini" style="width: 100px" @change="changeUnit" v-model="form.unit" placeholder="日，周，月">
                            <el-option :label="item.label" :value="item.value" v-for="item in unitOptions" :key="item.value"></el-option>
                        </el-select>
                        <el-date-picker
                            size="mini"
                            style="width: 240px;margin: 0 12px;"
                            v-model="form.period"
                            type="daterange"
                            @change="changeDate"
                            range-separator="至"
                            start-placeholder="开始日期"
                            end-placeholder="结束日期"
                            value-format="yyyy-MM-dd"
                            :picker-options="pickerOptions"
                        >
                        </el-date-picker>
                        <el-select style="width: 300px" size="mini" v-model="form.tableId" @change="changeTable" placeholder="选择表">
                            <el-option label="全部" value=""></el-option>
                            <el-option :label="item.tableName" :value="item.tableId" v-for="item in tableSelect" :key="item.tableId"></el-option>
                        </el-select>
                    </div>
                    <div id="line"></div>
                </div>
                <div class="line line-result"></div>
                <div class="result">{{ dataOverview.checkConclusion }}</div>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { getCheckOverviewApi, getRuntimeTableApi, getRadarChartApi, getScatterChartApi, getLineChartApi} from '../api/index.js'
import domtoimage from 'dom-to-image'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { ERROR_TYPE } from '../const'

export default {
    name: 'governanceDetail',
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        planId: {
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
        },
    },
    beforeDestroy() {

    },
    watch: {
        visible: {
            handler(val) {
                if (val) {
                    this.init();
                }
            },
            immediate: true
        }
    },
    data() {
        return {
            loading: false,
            radarChart: null,
            scatterChart: null,
            lineChart: null,
            createTime: '',
            isCreating: false,
            dataOverview: {},
            base64Icon: 'data:image/png;base64,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',
            unitOptions: [
                {label: '日', value: 'day'},
                {label: '周', value: 'week'},
                {label: '月', value: 'month'},
            ],
            form: {
                unit: 'week',
                period: [],
                tableId: '',
            },
            tableSelect: [],
            pickerOptions: {
                disabledDate:(time)=> {
                    return time.getTime() > new Date(this.dataOverview.endDate).getTime() 
                           || time.getTime() < new Date(this.dataOverview.startDate).getTime()- 8 * 3600 * 1000
                },
            },
            anomalieDesc: ERROR_TYPE,
        }
    },
    methods: {
        async init() {
            this.getTableList();
            this.getRadarChart();
            this.getScatterChart();
            await this.getCheckOverview();
            this.getLineChart();
        },
        destory() {
            this.dataOverview = {};
            this.createTime = '';
            this.radarChart && this.$echarts.dispose(this.radarChart)
            this.scatterChart && this.$echarts.dispose(this.scatterChart)
            this.lineChart && this.$echarts.dispose(this.lineChart)
        },
        changeUnit(value) {
            this.getLineChart();
        },
        changeDate(value) {
            this.getLineChart();
        },
        changeTable(value) {
            this.getLineChart();
        },
        async getCheckOverview() {
            await this.$nextTick()
            let loadingInstance = this.$loading({
                target: document.querySelector('#dom2image'),
                lock: true,
                text: '加载中...',
                spinner: 'el-icon-loading',
                background: 'rgba(255, 255, 255, 0.9)',
                customClass: 'customLoading'
            })
            let data = await getCheckOverviewApi(this.planId)
            loadingInstance.close();
            this.dataOverview = data || {};
            this.form.period = [data.startDate || '', data.endDate || '']
        },
        async getTableList() {
            let arr = await getRuntimeTableApi(this.planId);
            this.tableSelect = arr || []
        },
        async getRadarChart() {
            let data = await getRadarChartApi(this.planId)
            data = data?.length ? data : []
            let valueArr = data.map(item=>{
                return item.cnt
            })
            let max = Math.max(...valueArr)
            let min = Math.min(...valueArr)
            let keyArr = data.map(item => {
                return {name: item.item, max: max * 1.2, min: -(max - min) / 4}
            })
            this.initRadar(keyArr, valueArr)
        },
        initRadar(keyArr, valueArr) {
            var chartDom = document.getElementById('radar');
            this.radarChart = this.$echarts.init(chartDom);
            var option;

            option = {
                grid: {
                    left: '5%',
                    right: '5%',
                },
                radar: {
                    indicator: keyArr,
                },
                axisTick: {
                    show: true,
                },
                axisLabel: {
                    show: true,
                },
                series: [
                    {
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
                                value: valueArr,
                            }
                        ]
                    }
                ]
            };

            option && this.radarChart.setOption(option);
        },
        async getScatterChart() {
            let data = await getScatterChartApi(this.planId)
            let xData = [], yData = [], valueData = [];

            (data?.length ? data : []).forEach((item, x) => {
                xData.push(item.item);
                item.list.forEach((listitem, y)=> {
                    valueData.push([x, y, listitem.cnt])
                    if(x == 0) {
                        yData.push(listitem.item)
                    }
                })
            })
            this.initScatter(xData, yData, valueData);
        },
        initScatter(xData, yData, valueData) {
            var chartDom = document.getElementById('scatter');
            this.scatterChart = this.$echarts.init(chartDom);

            let valueArr = valueData.map(x=> x[2])
            // 40是展示效果较好的散点最大值, 5则是最小值
            let maxScatter = 40, minScatter = 5;
            let max = Math.max(...valueArr)
            let min = Math.min(...valueArr)
            let scale = (max - min) / (maxScatter - minScatter); 

            var option;

            const color = ['#b5d8ef', '#a4e3b4', '#aeece0', '#f3e6b8', '#f4cdf0', '#d9ed7a', '#bab6d3'];
            option = {
                tooltip: {
                    position: 'top',
                    formatter: function (params) {
                        return (
                            `${xData[params.value[0]]}： ${yData[params.value[1]]} 的数量为 ${params.value[2]}`
                        );
                    }
                },
                grid: {
                    top: 10,
                    left: 10,
                    bottom: 10,
                    right: 30,
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: xData,
                    boundaryGap: true,
                    splitLine: {
                        show: true
                    },
                    axisTick:{
                        alignWithLabel: true
                    },
                    // axisLabel: {
                    //     rotate: -45,
                    // },
                    axisLine: {
                        show: true
                    }
                },
                yAxis: {
                    type: 'category',
                    data: yData,
                    axisLine: {
                        show: false
                    }
                },
                series: [
                    {
                        type: 'scatter',
                        symbolSize: function (val) {
                            if(val[2] == 0){
                                return 0
                            }
                            return val[2] / scale + minScatter;
                        },
                        itemStyle: {
                            color: ({ data }) => {
                                return color[data[0]]
                            }
                        },
                        data: valueData,
                        animationDelay: function (idx) {
                            return idx * 5;
                        }
                    }
                ]
            };

            option && this.scatterChart.setOption(option);
        },
        async getLineChart() {
            this.loading = true;
            let data = await getLineChartApi(this.planId, ...this.form.period, this.form.unit, this.form.tableId || 0)
            this.loading = false;
            let legend = [], xData = [], valueData = [], selectedLegend={};
            (data?.length ? data : []).forEach(item => {
                xData.push(item.item)
                item.list.forEach((listitem, index)=> {
                    let obj = valueData[index] || {
                        name: listitem.item,
                        type: 'line',
                        stack: 'Total',
                        showSymbol: false,
                        data: []
                    }
                    obj.data.push(listitem.cnt)
                    valueData[index] = obj;
                })
            })
            legend = valueData.map(item=> item.name)
            valueData.forEach(item=>{
                let hasData = item.data.some(dataitem=> dataitem != 0)
                selectedLegend[item.name] = hasData 
            })
            this.initLine(xData,legend,valueData, selectedLegend)
        },
        initLine(xData,legend,valueData, selectedLegend) {
            var chartDom = document.getElementById('line');
            this.lineChart = this.$echarts.init(chartDom);
            var option;

            option = {
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    bottom: 0,
                    itemGap: 10,
                    data: legend,
                    selected: selectedLegend
                },
                dataZoom: [{
                    filterMode: 'none',
                    left: 100,
                    right: 100,
                    bottom: 50,
                }],
                grid: {
                    top: 14,
                    left: 20,
                    right: 40,
                    bottom: 100,
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: xData
                },
                yAxis: {
                    type: 'value',
                    axisLine: {
                        show: true,
                    },
                    splitLine: {
                        show: false
                    },
                },
                series: valueData
            };

            option && this.lineChart.setOption(option);
        },
        createReportImage() {
            let ua = window.navigator.userAgent;
            let reg = /^((?!chrome|android).)*safari/i;
            let isSafari = reg.test(ua);
            if(isSafari) {
                this.html2image()
            }else {
                this.dom2image();
            }
        },
        dom2image() {
            this.isCreating = true;
            let dom = document.getElementById('dom2image');
            domtoimage.toPng(dom, {bgcolor: '#ffffff', quality: 0.8, cacheBust:true})
                .then((dataUrl)=>{

                    this.savePdf(dataUrl, dom.clientWidth, dom.clientHeight);
                })
                .catch((error)=>{
                    console.error('dom2image wrong', error);
                })
                .finally(()=>{
                    this.isCreating = false;
                })
        },
        async html2image() {
            this.isCreating = true;
            await this.$nextTick()
            let dom = document.querySelector("#dom2image")
            html2canvas(dom, {useCORS: true, dpi: 300, background: '#ffffff'})
                .then(canvas => {
                    const dataUrl = canvas.toDataURL("image/jpeg");

                    this.savePdf(dataUrl,  dom.clientWidth, dom.clientHeight);
                })
                .catch((error) => {
                    console.error('oops, something went wrong!', error)
                })
                .finally(()=>{
                    this.isCreating = false;
                })
        },
        savePdf(imageUrl, width, height) {
            var pdf = new jsPDF('p', 'pt', [width, height]);
            pdf.addImage(imageUrl, 'JPEG', 0, 0,  width, height);
            pdf.save('数据治理报告.pdf');
        },
    }
}
</script>

<style>
.customLoading{
    color: red;
}
.customLoading .el-loading-spinner{
    top: 10%;
}
</style>
<style scoped>
div /deep/ .el-dialog__body {
    padding: 0;
}
#dom2image{
    padding: 0 20px 20px;
    box-sizing: border-box;
}
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
    border: 1px solid #E7E8E8;
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
    border-right: 1px solid #E7E8E8;
}

.overview-item:nth-last-child(1) {
    border: none;
}

.overview-item img {
    width: 56px;
    height: 56px;
    vertical-align: top;
    margin: 0 20px 0 0;
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
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    /* width: 90%;
    height: 90%;
    transform: translate(-50%,-50%);
    position: absolute;
    margin-top: 32px;
    left: 50%;
    top: 50%; */

}

.desc-box {
    flex: 1;
}

.line-box {
    margin-top: 30px;
}
.chart-action{
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-top: 16px;
}

.desc-item {
    margin: 14px 0;
    font-size: 16px;
    color: #848585;
    display: flex;
    align-items: center;
}

.desc-item i {
    font-size: 28px;
}

.radar-box {
    width: 40%;
    padding-left: 32px;
    position: relative;
}

.scatter-box {
    width: 100%;
}

#scatter {
    width: 100%;
    height: 500px;
}

.sub-title {
    font-size: 16px;
    border-bottom: 1px solid #E7E8E8;
    padding: 0 0 8px 12px;
}

.result {
    font-size: 16px;
    line-height: 36px;
    font-weight: 500;
    text-indent: 2em;
}
#line{
    height: 400px;
    margin-top: 16px;
}
.line {
    border-top: 1px solid #E7E8E8;
    margin: 30px 0;
    position: relative;
    font-size: 18px;
}

.line-total::after {
    content: '校验情况总览';
    position: absolute;
    left: 30px;
    top: -30px;
    background-color: #fff;
    text-align: center;
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
    color: #5f5f60;
    font-weight: 500;
    height: 40px;
    padding: 10px;
    line-height: 40px;
}

.line-result::after {
    content: ' 校验结论 ';
    position: absolute;
    left: 30px;
    top: -30px;
    background-color: #fff;
    text-align: center;
    color: #0071b7;
    font-weight: 500;
    height: 40px;
    padding: 10px;
    line-height: 40px;
}</style>
