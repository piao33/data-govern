<template>
    <div class="content">
        <el-dialog title="检测详情" top="5vh" :append-to-body="true" :visible.sync="showDialog" @closed="destory" :close-on-press-escape="false" :close-on-click-modal="false"
            width="80%">
            <div class="desc">
                {{errorDesc}}
            </div>

            <div style="margin: 16px 0 0;" >
                <el-form ref="filterForm" :model="filterForm" label-position="right" size="medium">
                    <el-row>
                        <el-col :span="6">
                            <el-form-item label="数据表:" label-width="60px" prop="tableId">
                                <el-select style="width: 100%" v-model="filterForm.tableId">
                                    <el-option :label="item.tableName" :value="item.tableId" v-for="item in tableSelect" :key="item.tableId"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="异常类型:" label-width="90px" prop="type">
                                <el-select style="width: 100%" v-model="filterForm.type">
                                    <el-option label="单点数据异常" value="1" key="1"></el-option>
                                    <el-option label="连续数据异常" value="2" key="2"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="处理状态:" label-width="90px" prop="status">
                                <el-select style="width: 100%" v-model="filterForm.status">
                                    <el-option label="填充" value="1" key="1"></el-option>
                                    <el-option label="删除" value="2" key="2"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item>
                                <el-button style="margin-left: 40px;" type="primary" @click="getGovernanceDetail">查询</el-button>
                                <el-button style="margin-left: 20px;" @click="reset">重置</el-button>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
            </div>

            <el-table :data="anomalieDetailList" border v-loading="loading">
                <el-table-column label="序号" width="80" align="center">
                    <template slot-scope="scope">
                        <span>{{ scope.$index+1 + (currentPage-1) * pageSize }}</span>
                    </template>
                </el-table-column>
                <el-table-column property="tableName" label="数据表" align="center"></el-table-column>
                <el-table-column label="数据信息" align="center">
                    <template slot-scope="scope">
                        <span>{{ '设备id：'+ scope.row.devId  }}</span>
                        <br/>
                        <span>{{ '日期：'+ scope.row.gatherDate }}</span>
                    </template>
                </el-table-column>
                <el-table-column property="errorFields" label="异常字段" align="center"></el-table-column>
                <el-table-column label="异常类型" align="center">
                    <template slot-scope="scope">
                        <span>{{ scope.row.errorType == '2' ? '连续数据异常' : '单点数据异常' }}</span>
                    </template>
                </el-table-column>
                <el-table-column property="testDate" label="检测时间" align="center"></el-table-column>
                <el-table-column label="处理状态" align="center" width="80">
                    <template slot-scope="scope">
                        <span v-if="scope.row.handleType == '2'" style="color: #f34242;">已删除</span>
                        <span v-else-if="scope.row.handleType == '1'" style="color: #0071B7;">已填充</span>
                    </template>
                </el-table-column>
            </el-table>

            <el-pagination class="pagination" 
                @current-change="handleCurrentChange"
                @size-change="handleSizeChange"
                :current-page="currentPage" 
                :page-size="pageSize" 
                :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>
        </el-dialog>
    </div>
</template>

<script>
import { getRuntimeTableApi, getAnomalieDetailApi } from '../api/index.js'
import { ERROR_TYPE } from '../const'

export default {
    name: 'governanceItemDetail',
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        planId: {
            type: [Number, String],
            default: ''
        },
        id: {
            type: [Number, String],
            default: ''
        },
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
        errorDesc() {
            return ERROR_TYPE.find(item => item.id == this.id)?.desc || ''
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
            loading: false,
            filterForm: {
                tableId: '',
                type: '',
                status: '',
            },
            tableSelect: [],
            anomalieDetailList: [],
            currentPage: 1,
            pageSize: 10,
            total: 0,
        }
    },
    methods: {
        async init() {
            this.getGovernanceDetail()
            this.getTableList()
        },
        destory() {
            this.anomalieDetailList = [];
            this.$refs['filterForm'].resetFields()
            this.total = 0;
            this.currentPage = 1;
            this.pageSize = 10;
        },
        handleClick(i, row) {
            console.log(i, row)
        },
        async getTableList() {
            let arr = await getRuntimeTableApi(this.planId);
            this.tableSelect = arr || []
        },
        async getGovernanceDetail() {
            this.loading = true;
            let {list=[], total=0} = await getAnomalieDetailApi(
                        this.planId, this.id, 
                        this.pageSize, this.currentPage, 
                        this.filterForm.tableId, this.filterForm.type, this.filterForm.status
            )
            this.anomalieDetailList = list || []
            this.total = total;
            this.loading = false;
        },
        handleCurrentChange(val) {
            this.currentPage = val;
            this.getGovernanceDetail()
        },
        handleSizeChange(val) {
            this.pageSize = val;
            this.getGovernanceDetail()
        },
        reset() {
            this.$refs['filterForm'].resetFields()
            this.pageSize = 10;
            this.currentPage = 1;
            this.getGovernanceDetail()
        }
    }
}
</script>

<style scoped>
div /deep/ .el-dialog__body{
    padding-top: 0;
}
.input-with-select{
    width: 500px;
}
.input-with-select /deep/ .el-input-group__prepend{
    background-color: #fff;
    width: 100px;
}

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
