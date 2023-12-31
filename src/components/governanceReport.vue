<template>
    <div class="content">
        <el-dialog class="dialog-report" top="5vh" :append-to-body="true" title="数据治理报告" :visible.sync="showDialog" @closed="destory" :close-on-press-escape="false" :close-on-click-modal="false"
            width="90%">
                <div class="header-action">
                    <el-button type="text" @click="showDialog = false">
                        返回
                        <i class="el-icon-d-arrow-left" style="color: #0071B7;fontWeight: bolder;"></i>
                    </el-button>
                    <div class="vertical-line"></div>
                    <el-button type="text" @click="download(null)">已治理数据批量下载</el-button>
                </div>
                <el-table :data="governReport" border>
                    <el-table-column property="tableName" label="数据项" align="center"></el-table-column>
                    <el-table-column property="rowNums" label="数据行数" align="center"></el-table-column>
                    <el-table-column property="dayNums" label="计算周期" align="center"></el-table-column>
                    <el-table-column property="realDayNums" label="有效计算期" align="center"></el-table-column>
                    <el-table-column label="空值占比" align="center">
                        <template slot-scope="scope">
                            <span>{{ scope.row.nullValueProportion}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="异常占比" align="center">
                        <template slot-scope="scope">
                            <span>{{ scope.row.errorValueProportion}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column property="creatTime" label="执行时间" align="center"></el-table-column>
                    <el-table-column align="center" label="操作" width="100">
                        <template slot-scope="scope">
                            <el-button @click="download(scope.row.tableId)" type="text">下载</el-button>
                            <el-button type="text" disabled>修改</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="line"></div>
                <el-tooltip :open-delay="300" class="desc-tooltip" effect="light" :hide-after="0" placement="right">
                    <div slot="content">
                        <div v-for="(item,index) in anomalieDesc" :key="index" class="tooltip-item">
                            <i class="el-icon-caret-right" style="color: #0071B7"></i>
                            {{ item.desc }}
                        </div>
                    </div>
                    <el-button type="text">数据异常情况说明<i class="el-icon-warning-outline"></i></el-button>
                </el-tooltip>
                <div class="anomalie">
                    <div class="anomalie-item" v-for="item in anomalieList" :key="item.dataId">
                        <img src="../assets/data.svg" alt="">
                        <div class="info">
                            <p>{{ item.item }}</p>
                            <span>{{ item.cnt }}项</span>
                        </div>
                        <el-button class="detail-btn" type="text" @click="showItemDetail(item.dataId)">详情</el-button>
                    </div>
                </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="showDetail" type="primary" :plain="true" :round="true">报告生成</el-button>
            </span>
        </el-dialog>

        <governance-detail :planId="planId" :visible="detailVisible" @updateVisible="updateDetailVisible"></governance-detail>

        <governance-item-detail :planId="planId" :id="errorId" :visible="itemDetailVisible" @updateVisible="updateItemDetailVisible"></governance-item-detail>
        
    </div>
</template>

<script>
import { getCheckResultApi, getErrorCountApi, downloadDataApi, downloadAllDataApi } from '../api/index.js'
import governanceDetail from '/src/components/governanceDetail'
import governanceItemDetail from '/src/components/governanceItemDetail'
import { ERROR_TYPE } from '../const'
export default {
    name: 'governanceReport',
    components: {
        governanceDetail,
        governanceItemDetail
    },
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        planId: {
            type: [Number, String],
            default: '',
        }
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
    data() {
        return {
            loading: false,
            detailVisible: false,
            itemDetailVisible: false,
            errorId: '',
            governReport: [],
            anomalieList: [],
            anomalieDesc: ERROR_TYPE
        }
    },
    methods: {
        async init() {
            let loadingInstance = this.$loading({
                target: document.querySelector('.dialog-report .el-dialog'),
                lock: true,
                text: '加载中...',
                spinner: 'el-icon-loading',
                background: 'rgba(255, 255, 255, 1)',
            })
            let [{value:checkList}, {value: anomalieList}] = await Promise.allSettled([
                getCheckResultApi(this.planId), 
                getErrorCountApi(this.planId)
            ])
            this.governReport = checkList;
            this.anomalieList = anomalieList.sort((a,b)=> {
                return b.cnt - a.cnt
            });
            loadingInstance.close();
        },
        destory() {
            this.governReport = [];
            this.anomalieList = [];
        },
        handleClick(i, row) {
            console.log(i, row)
        },
        showDetail() {
            // 跳转详情
            this.detailVisible = true;
        },
        showItemDetail(errorId) {
            // 显示数据异常子项详情
            this.itemDetailVisible = true;
            this.errorId = errorId
        },
        updateDetailVisible(val) {
            this.detailVisible = val;
        },
        updateItemDetailVisible(val) {
            this.itemDetailVisible = val;
        },
        async download(tableId) {
            let requests = null
            if(tableId){
                requests = downloadDataApi.bind(this, tableId, this.planId)
            }else{
                requests = downloadAllDataApi.bind(this, this.planId)
            }
            this.$message.success('下载操作已提交')

            let {file: blobFile, filename} = await requests()
            if(blobFile && filename) {
                let mergeBlob = new Blob([blobFile]);
    
                let downloadUrl = window.URL.createObjectURL(mergeBlob)
                
                let link = document.createElement('a')
                link.href = downloadUrl
                link.setAttribute('download', filename)
                link.click();
            }else {
                this.$message.error('导出失败！')
            }
        }
    }
}
</script>

<style scoped>
.header-action {
    display: flex;
    align-items: center;
}

.vertical-line {
    border-right: 3px solid #0071B7;
    transform: scale(.5, 1);
    margin: 0 8px;
    height: 14px;
}
div /deep/.el-dialog__body {
    padding-top: 0;
}

.anomalie {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: wrap;
}

.anomalie-item {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    position: relative;
    width: 200px;
    height: 100px;
    border: 1px solid #5f5f60;
    margin: 12px;
}

.anomalie-item img {
    width: 48px;
    height: 48px;
    object-fit: cover;
    vertical-align: top;
    margin: 0 20px;
}

.anomalie-item .info p {
    font-size: 14px;
    font-weight: 400;
    margin-bottom: 12px;
}

.anomalie-item .info span {
    font-size: 16px;
    font-weight: 600;
}

.detail-btn {
    position: absolute;
    right: 0;
    bottom: 0;
    padding: 5px;
}
.line {
    border-top: 1px solid #E7E8E8;
    margin: 30px 0;
    position: relative;
}

.line::after {
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

.desc-tooltip{
    padding: 0 0 0 40px;
    transform: translateY(-10px);
}
.tooltip-item{
    margin: 8px 0;
    font-size: 14px;
    color: #5f5f60;
}
</style>

