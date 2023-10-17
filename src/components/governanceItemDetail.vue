<template>
    <div class="content">
        <el-dialog title="检测详情" :visible.sync="showDialog" :close-on-press-escape="false" :close-on-click-modal="false"
            width="60%">
            <div class="desc">
                说明：数据缺失是指数据存在一个时间点或者连续时间点的数据缺失情况
            </div>

            <div style="margin: 12px 0;">
                <el-select v-model="anomalieType" size="mini" placeholder="异常类型">
                    <el-option label="数据缺失" :value="0"></el-option>
                    <el-option label="数据异常" :value="1"></el-option>
                </el-select>
                <el-button style="margin-left: 20px;" type="primary" size="mini" @click="getGovernanceDetail">查询</el-button>
            </div>

            <el-table :data="governanceDetailTable" border>
                <el-table-column type="index" label="序号" width="50" align="center"></el-table-column>
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

            <el-pagination class="pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="currentPage" :page-sizes="[10]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>

        </el-dialog>
    </div>
</template>

<script>
export default {
    name: 'governanceItemDetail',
    props: {
        visible: {
            type: Boolean,
            default: false
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
        this.$echarts.dispose(this.radarChart)
    },
    watch: {
        async visible(val) {
            if (val) {
                await this.$nextTick()
            }
        }
    },
    data() {
        return {
            anomalieType: '',
            governanceDetailTable: [],
            currentPage: 1,
            pageSize: 10,
            total: 0,
            governanceDetail: [{
                value: 0,
                name: '当季光伏典型出力',
                info: '{"有问题数据"}',
                type: '单数据点缺失',
                time: '2023-10-17 14:06:32',
                status: '已填充',
            }, {
                value: 0,
                name: '变配电站负荷',
                info: '{"有问题数据"}',
                type: '多数据点缺失',
                time: '2023-10-17 14:06:32',
                status: '已填充',
            }, {
                value: 1,
                name: '光伏典型出力',
                info: '{"有问题数据"}',
                type: '多数据点异常',
                time: '2023-10-17 14:06:32',
                status: '已删除',
            }, {
                value: 0,
                name: '变配电站负荷',
                info: '{"有问题数据"}',
                type: '单数据点缺失',
                time: '2023-10-17 14:06:32',
                status: '已填充',
            }, {
                value: 1,
                name: '当季光伏典型出力2',
                info: '{"有问题数据"}',
                type: '单数据点异常',
                time: '2023-10-17 14:06:32',
                status: '已填充',
            }],
        }
    },
    methods: {
        handleClick(i, row) {
            console.log(i, row)
        },
        getGovernanceDetail() {
            console.log(this.anomalieType)
            this.governanceDetailTable = this.governanceDetail.filter(item => item.value === this.anomalieType)
            this.total = this.governanceDetailTable.length;
        },
        handleSizeChange() {

        },
        handleCurrentChange() {

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

.overview-item .info {}

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

#scatter {
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
}
</style>
