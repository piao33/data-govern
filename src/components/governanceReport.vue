<template>
    <div class="content">
        <el-dialog class="dialog-report" title="数据治理报告" :visible.sync="showDialog" @closed="destory" :close-on-press-escape="false" :close-on-click-modal="false"
            width="90%">
                <div class="header-action">
                    <el-button type="text" @click="showDetail">详情</el-button>
                    <div class="vertical-line"></div>
                    <el-button type="text">已治理数据批量下载</el-button>
                </div>
                <el-table :data="governReport" border multipleTable>
                    <el-table-column type="selection" width="50" align="center"></el-table-column>
                    <el-table-column property="name" label="数据项" align="center"></el-table-column>
                    <el-table-column property="rowNum" label="数据行数" align="center"></el-table-column>
                    <el-table-column property="period" label="计算周期" align="center"></el-table-column>
                    <el-table-column property="validityPeriod" label="有效计算期" align="center"></el-table-column>
                    <el-table-column label="空值占比" align="center">
                        <template slot-scope="scope">
                            <span>{{ scope.row.nullProportion + '%'}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="异常占比" align="center">
                        <template slot-scope="scope">
                            <span>{{ scope.row.anomalieProportion + '%'}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column property="executionTime" label="执行时间" align="center"></el-table-column>
                    <el-table-column align="center" label="操作" width="100">
                        <template slot-scope="scope">
                            <el-button @click="handleClick(scope.$index, scope.row)" type="text">下载</el-button>
                            <el-button type="text" disabled>修改</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="line"></div>
                <div class="anomalie">
                    <div class="anomalie-item" v-for="item in anomalieList" :key="item.id">
                        <img :src="item.imgurl" alt="">
                        <div class="info">
                            <p>{{ item.type }}</p>
                            <span>{{ item.count }}项</span>
                        </div>
                        <el-button class="detail-btn" type="text" @click="showItemDetail(item.id)">详情</el-button>
                    </div>
                </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="confirmVisible = true" type="primary" :plain="true" :round="true">数据确认</el-button>
            </span>
        </el-dialog>

        <governance-detail :checkId="checkId" :visible="detailVisible" @updateVisible="updateDetailVisible"></governance-detail>

        <governance-item-detail :checkId="checkId" :visible="itemDetailVisible" @updateVisible="updateItemDetailVisible"></governance-item-detail>
        
        <el-dialog title="提 示" :visible.sync="confirmVisible" width="30%" center>
            <h2 style="text-align: center">是否确认使用该治理数据？</h2>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="confirmVisible = false">确 认</el-button>
                <el-button @click="confirmVisible = false">取 消</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { getCheckResultApi } from '../api/index.js'
import governanceDetail from '/src/components/governanceDetail'
import governanceItemDetail from '/src/components/governanceItemDetail'

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
        checkId: {
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
            confirmVisible: false,
            anomalieList: [],
            governReport: [],
        }
    },
    methods: {
        async init() {
            let loadingInstance = this.$loading({
                target: document.querySelector('.dialog-report .el-dialog'),
            })
            let {checkList, anomalieList} = await getCheckResultApi(this.checkId);
            this.governReport = checkList;
            this.anomalieList = anomalieList;
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
        showItemDetail(itemId) {
            // 显示数据异常子项详情
            this.itemDetailVisible = true;
        },
        updateDetailVisible(val) {
            this.detailVisible = val;
        },
        updateItemDetailVisible(val) {
            this.itemDetailVisible = val;
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
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

.content /deep/.el-dialog__body {
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
</style>
