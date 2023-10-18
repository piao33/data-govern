<template>
    <div class="content">
        <el-dialog title="检测详情" :visible.sync="showDialog" @closed="destory" :close-on-press-escape="false" :close-on-click-modal="false"
            width="60%">
            <div class="desc">
                说明：数据缺失是指数据存在一个时间点或者连续时间点的数据缺失情况
            </div>

            <div style="margin: 12px 0;">
                <el-select v-model="anomalieId" size="mini" placeholder="异常类型">
                    <el-option :label="item.type" :value="item.id" v-for="item in anomalieTypeList" :key="item.id"></el-option>
                </el-select>
                <el-button style="margin-left: 20px;" type="primary" size="mini" @click="getGovernanceDetail">查询</el-button>
            </div>

            <el-table :data="tableList" border>
                <el-table-column label="序号" width="50" align="center">
                    <template slot-scope="scope">
                        <span>{{ scope.$index+1 + (currentPage-1) * pageSize }}</span>
                    </template>
                </el-table-column>
                <el-table-column property="name" label="数据表" align="center"></el-table-column>
                <el-table-column property="info" label="数据信息" align="center"></el-table-column>
                <el-table-column property="type" label="异常类型" align="center"></el-table-column>
                <el-table-column property="time" label="检测时间" align="center"></el-table-column>
                <el-table-column label="处理状态" align="center" width="80">
                    <template slot-scope="scope">
                        <span style="color: #0071B7;">{{ scope.row.status }}</span>
                    </template>
                </el-table-column>
            </el-table>

            <el-pagination class="pagination" @current-change="handleCurrentChange"
                :current-page="currentPage" :page-sizes="[10]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>

        </el-dialog>
    </div>
</template>

<script>
import { getAnomalieTypeApi, getAnomalieDetailApi } from '../api/index.js'
export default {
    name: 'governanceItemDetail',
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
        },
        tableList() {
            return this.anomalieDetailList.slice((this.currentPage - 1)* this.pageSize, this.currentPage * this.pageSize )
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
    data() {
        return {
            anomalieId: '',
            anomalieTypeList: [],
            anomalieDetailList: [],
            governanceDetail: [],
            currentPage: 1,
            pageSize: 10,
            total: 0,
        }
    },
    methods: {
        async init() {
            this.anomalieTypeList = await getAnomalieTypeApi(this.checkId);
            this.anomalieId = this.anomalieTypeList[0].id;
            this.getGovernanceDetail()
        },
        destory() {
            this.anomalieId = '';
            this.anomalieTypeList = [];
            this.anomalieDetailList = [];
            this.total = 0;
            this.currentPage = 1;
            this.pageSize = 10;
        },
        handleClick(i, row) {
            console.log(i, row)
        },
        async getGovernanceDetail() {
            this.anomalieDetailList = await getAnomalieDetailApi(this.anomalieId)
            this.total = this.anomalieDetailList.length;
        },
        handleCurrentChange(val) {
            this.currentPage = val;
        },
    }
}
</script>

<style scoped>
.pagination {
    text-align: center;
    margin-top: 16px;
}

.desc {
    color: #848585;
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
</style>
