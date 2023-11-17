<template>
    <div class="content">
        <el-dialog title="" :visible.sync="showDialog" @closed="destory" :close-on-press-escape="false"
            :close-on-click-modal="false" :append-to-body="true" top="5vh" width="90%">
            <div id="dom2image">
                <div class="header">
                    <h2>数据治理报告</h2>
                    <span>创建时间：{{ createTime }}</span>
                    <el-button type="text" style="padding:0;marginLeft:12px;" v-if="!isCreating" @click="createReportImage">报告下载</el-button>
                    <el-button type="text" @click="showDialog = false" v-if="!isCreating" style="padding:0;float: left;">
                        返回
                        <i class="el-icon-d-arrow-left" style="color: #0071B7;fontWeight: bolder;"></i>
                    </el-button>
                </div>
                <div class="line line-total"></div>

                <ul class="overview">
                    <li class="overview-item">
                        <!-- <img :src="item.img" alt=""> -->
                        <div class="info">
                            <p>数据表总数</p>
                            <span>{{ dataOverview.tablesCount}}项</span>
                        </div>
                    </li>
                    <li class="overview-item">
                        <div class="info">
                            <p>数据异常表数</p>
                            <span>{{ dataOverview.tablesErrorCount }}项</span>
                        </div>
                    </li>
                    <li class="overview-item">
                        <div class="info">
                            <p>数据项数</p>
                            <span>{{ dataOverview.dataCount }}项</span>
                        </div>
                    </li>
                    <li class="overview-item">
                        <div class="info">
                            <p>数据异常项数</p>
                            <span>{{ dataOverview.dataErrorCount}}项</span>
                        </div>
                    </li>
                    <li class="overview-item">
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
                        <el-select style="width: 300px" size="mini" v-model="form.tableId" placeholder="选择表">
                            <el-option label="" value=""></el-option>
                            <!-- <el-option :label="item" :value="item" v-for="item in ['表1','表2','表3','表4','表5']" :key="item"></el-option> -->
                        </el-select>
                    </div>
                    <div id="line"></div>
                </div>
                <div class="line line-result"></div>
                <div class="result">{{ result }}</div>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { getCheckOverviewApi, getRadarChartApi, getScatterChartApi, getLineChartApi} from '../api/index.js'
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
        }
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
            unitOptions: [
                {label: '日', value: 'day'},
                {label: '周', value: 'week'},
                {label: '月', value: 'month'},
            ],
            form: {
                unit: 'week',
                period: ['2023-03-01', '2023-06-01'],
                tableId: '',
            },
            pickerOptions: {
                disabledDate(time) {
                    return time.getTime() > Date.now();
                },
            },
            result: `本次数据校验治理任务共校验治理7张表xxxxx条数据，
            获得有效使用计算周期160天（原始计算周期180天）数据xxxx条，占比90%。
            其中，出现数据缺失的表有7张，出现数据范围异常的表有5张；
            校验缺失数据xx条，缺失占比xx%；校验异常范围数据xxx条，异常占比xx%。
            发现数据缺失项数xx项，占比xx%，做填充处理的有xx项，占比xx%，
            做删除的有xx项，占比xx%；发现数据范围异常项数xx项，占比xx%，做填充处理的有xx项，占比xx%，
            做删除的有xx项，占比xx%；各异常类型中出现问题占比较大的是
            数据缺失，数据异常4，数据异常6，分别占比xx%，xx%，xx%。`,
            anomalieDesc: ERROR_TYPE,
        }
    },
    methods: {
        async init() {
            this.getCheckOverview()
            this.getRadarChart();
            this.getScatterChart();
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
        async getCheckOverview() {
            let data = await getCheckOverviewApi(this.planId)

            let createTime = "2023-10-23 00:00:00";
            this.dataOverview = data || {};
            this.createTime = createTime;
        },
        async getRadarChart() {
            let data = await getRadarChartApi(this.planId)
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
                    indicator: keyArr
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
            data.forEach((item, x) => {
                xData.push(item.item);
                item.list.forEach((listitem, y)=> {
                    valueData.push([x, y, listitem.cnt || (Math.random()*182)])
                    // valueData.push([x, y, 30])
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
                            if(val[2] < 5){
                                return 5
                            }else if(val[2] > 25) {
                                return 25 + (val[2]-20) * 0.1
                            }
                            return val[2];
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
            let data = await getLineChartApi(this.planId, ...this.form.period, this.form.unit, 0)
            let legend = [], xData = [], valueData = [], selectedLegend={};
            data.forEach(item => {
                xData.push(item.item)
                item.list.forEach((listitem, index)=> {
                    let obj = valueData[index] || {
                        name: listitem.item,
                        type: 'line',
                        stack: 'Total',
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
            this.loading = false;
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
                grid: {
                    top: 14,
                    left: 20,
                    right: 20,
                    bottom: 40,
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
            domtoimage.toPng(dom, {bgcolor: '#ffffff'})
                .then((dataUrl)=>{
                    // let img = new Image();
                    // img.src = dataUrl;
                    // dom.appendChild(img);

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
                    // let img = new Image();
                    // img.src = dataUrl;
                    // dom.appendChild(img);

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
            // var pdf = new jsPDF();
            // pdf.addImage(imageUrl, 'JPEG', 0, 0);
            // pdf.save('test.pdf');

            var contentWidth = width;
            var contentHeight = height;
            //一页pdf显示html页面生成的canvas高度;
            var pageHeight = contentWidth / 592.28 * 841.89 ;
            //未生成pdf的html页面高度
            var leftHeight = contentHeight;
            //页面偏移
            var position = 0;
            //a4纸的尺寸[595.28,841.89]，html页面生成的canvas在pdf中图片的宽高
            var imgWidth = 595.28;
            var imgHeight = 592.28 / contentWidth * contentHeight;
            //注①
            var pdf = new jsPDF('', 'pt', 'a4');
            //有两个高度需要区分，一个是html页面的实际高度，和生成pdf的页面高度(841.89)
            //当内容未超过pdf一页显示的范围，无需分页
            if(leftHeight < pageHeight) {
                pdf.addImage(imageUrl, 'JPEG', 0, 0, imgWidth,imgHeight);
            } else {
                while(leftHeight > 0) {
                    //arg3-->距离左边距;arg4-->距离上边距;arg5-->宽度;arg6-->高度
                    pdf.addImage(imageUrl, 'JPEG', 0, position,imgWidth, imgHeight)
                    leftHeight -= pageHeight;
                    position -= 841.89;
                    //避免添加空白页
                    if(leftHeight > 0) {
                        //注②
                        pdf.addPage();
                    }
                }
            }
            pdf.save('test.pdf');
        }
    }
}
</script>

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
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
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
    content: '校验结论';
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
