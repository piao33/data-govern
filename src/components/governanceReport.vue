<template>
    <div class="content">
        <el-dialog 
            title="数据治理报告" 
            :visible.sync="showDialog"
            :close-on-press-escape="false"	
            :close-on-click-modal="false"
            width="90%"
        >
            <div class="header-action">
                <el-button type="text">详情</el-button>
                <div class="vertical-line"></div>
                <el-button type="text">已治理数据批量下载</el-button>
            </div>
            <el-table :data="governReport" border multipleTable>
                <el-table-column type="selection" width="50" align="center"></el-table-column>
                <el-table-column property="rowNum" label="数据行数" width="280" align="center"></el-table-column>
                <el-table-column property="period" label="计算周期" align="center"></el-table-column>
                <el-table-column property="validityPeriod" label="有效计算期" align="center"></el-table-column>
                <el-table-column property="nullProportion" label="空值占比" align="center"></el-table-column>
                <el-table-column property="anomalieProportion" label="异常占比" align="center"></el-table-column>
                <el-table-column property="executionTime" label="执行时间" align="center"></el-table-column>
                <el-table-column
                    align="center"
                    label="操作"
                    width="200">
                    <template slot-scope="scope">
                        <el-button @click="handleClick(scope.$index, scope.row)" type="text">下载</el-button>
                        <el-button type="text">修改</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="line"></div>
            <div class="anomalie">
                <div class="anomalie-item" v-for="item in anomalieList" :key="item.id">
                    <img :src="item.img" alt="">
                    <div class="info">
                        <p>{{item.name}}</p>
                        <span>{{item.count}}项</span>
                    </div>
                    <el-button class="detail-btn" type="text" @click="goDetail(item.id)">详情</el-button>
                </div>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="showDialog = false" type="primary" :plain="true" :round="true">数据确认</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import anomalieImg from '/src/assets/data.png'
export default {
    name: 'dataGovern',
    props: {
        visible: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        // showDialog(){
        //     return this.visible
        // }
        showDialog:  {
            get() {
                return this.visible
            },
            set(val) {
                this.$emit('updateVisible', val)
            }
        }
    },
    data() {
        return {
            anomalieList: [
                {
                    id: 1,
                    name: '数据缺失',
                    img: anomalieImg,
                    count: 20,
                },
                {
                    id: 2,
                    name: '数据异常1',
                    img: anomalieImg,
                    count: 12,
                },
                {
                    id: 3,
                    name: '数据异常2',
                    img: anomalieImg,
                    count: 4,
                },
                {
                    id: 4,
                    name: '数据异常2',
                    img: anomalieImg,
                    count: 4,
                },
                {
                    id: 5,
                    name: '数据异常2',
                    img: anomalieImg,
                    count: 4,
                },
                {
                    id: 6,
                    name: '数据异常2',
                    img: anomalieImg,
                    count: 4,
                },
                {
                    id: 7,
                    name: '数据异常2',
                    img: anomalieImg,
                    count: 4,
                },
                {
                    id: 8,
                    name: '数据异常2',
                    img: anomalieImg,
                    count: 4,
                },
            ],
            governReport: [{
                rowNum: '当季光伏典型出力1',
                period: '120',
                validityPeriod: '110',
                nullProportion: '4%',
                anomalieProportion: '3%',
                executionTime: '2016-10-02 12:00:00'
            }, {
                rowNum: '当季光伏典型出力2',
                period: '120',
                validityPeriod: '110',
                nullProportion: '4%',
                anomalieProportion: '3%',
                executionTime: '2016-10-02 12:00:00'
            },{
                rowNum: '当季光伏典型出力3',
                period: '120',
                validityPeriod: '110',
                nullProportion: '4%',
                anomalieProportion: '3%',
                executionTime: '2016-10-02 12:00:00'
            }],
        }
    },
    methods: {
        handleClick(i, row) {
            console.log(i, row)
        },
        goDetail(id) {
            console.log(id)
            // 跳转详情
        },  
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.header-action{
    display: flex;
    align-items: center;
}
.vertical-line{
    border-right: 3px solid #0071B7;
    transform: scale(.5, 1);
    margin: 0 8px;
    height: 14px;
}
/deep/.el-dialog__body{
    padding-top: 0;
}

.anomalie{
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: wrap;
}
.anomalie-item{
    display: flex;
    justify-content: flex-start;
    align-items: center;
    position: relative;
    width: 200px;height: 100px;
    border: 1px solid #5f5f60;
    margin: 12px;
}
.anomalie-item img{
    width: 48px;
    vertical-align: top;
    margin: 0 20px;
}
.anomalie-item .info{
}
.anomalie-item .info p{
    font-size: 14px;
    font-weight: 400;
    margin-bottom: 12px;
}
.anomalie-item .info span{
    font-size: 16px;
    font-weight: 600;
}

.detail-btn{
    position: absolute;
    right: 0;
    bottom: 0;
    padding:5px;
}

.formbtn-box{
    text-align: right;
}
.tablebtn-box{
    margin: 0 0 20px 12px;
}
.btn{
    width: 120px;
    margin-right: 20px;
}
.line{
    border-top: 1px solid #5f5f60;
    margin: 30px 0;
    position: relative;
}
.line::after{
    content: '数据异常统计分析';
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
.govern-btn {
    position: fixed;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
}
</style>
