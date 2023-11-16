<template>
    <div class="content">
        <el-dialog title="检测详情" top="5vh" :append-to-body="true" :visible.sync="showDialog" @closed="destory" :close-on-press-escape="false" :close-on-click-modal="false"
            width="80%">
            <div class="desc">
                说明：数据缺失是指数据存在一个时间点或者连续时间点的数据缺失情况
            </div>

            <div style="margin: 16px 0 0;" >
                <el-form :model="form" label-position="right" size="medium">
                    <el-row>
                        <el-col :span="6">
                            <el-form-item label="数据表:" label-width="60px">
                                <el-input v-model="form.name" autocomplete="off"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="异常类型:" label-width="90px">
                                <el-select style="width: 100%" v-model="form.type">
                                    <!-- <el-option :label="item.dictLabel" :value="item.dictValue" v-for="item in modelList" :key="item.id"></el-option> -->
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="处理状态:" label-width="90px">
                                <el-select style="width: 100%" v-model="form.status">
                                    <!-- <el-option :label="item.dictLabel" :value="item.dictValue" v-for="item in modelList" :key="item.id"></el-option> -->
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item>
                                <el-button style="margin-left: 40px;" type="primary" @click="getGovernanceDetail">查询</el-button>
                                <el-button style="margin-left: 20px;" @click="getGovernanceDetail">重置</el-button>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
            </div>

            <el-table :data="tableList" border v-loading="loading">
                <el-table-column label="序号" width="50" align="center">
                    <template slot-scope="scope">
                        <span>{{ scope.$index+1 + (currentPage-1) * pageSize }}</span>
                    </template>
                </el-table-column>
                <el-table-column property="name" label="数据表" align="center"></el-table-column>
                <el-table-column property="info" label="数据信息" align="center"></el-table-column>
                <el-table-column property="parameter" label="异常字段" align="center"></el-table-column>
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
            loading: false,
            form: {
                name: '',
                type: '',
                status: '',
            },
            anomalieDetailList: [],
            currentPage: 1,
            pageSize: 10,
            total: 0,
        }
    },
    methods: {
        async init() {
            this.loading = true;
            let {anomalieType, parameters} = await getAnomalieTypeApi(this.checkId);

            await this.getGovernanceDetail()
            this.loading = false;
        },
        destory() {
            this.anomalieDetailList = [];
            this.total = 0;
            this.currentPage = 1;
            this.pageSize = 10;
        },
        handleClick(i, row) {
            console.log(i, row)
        },
        async getGovernanceDetail() {
            this.loading = true;
            this.anomalieDetailList = await getAnomalieDetailApi()
            this.total = this.anomalieDetailList.length;
            this.loading = false;
        },
        handleCurrentChange(val) {
            this.currentPage = val;
        },
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
