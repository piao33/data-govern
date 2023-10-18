<template>
    <div class="content">
        <el-dialog 
            title="评估方案编辑" 
            :visible.sync="showDialog" 
            :close-on-press-escape="false"	
            :close-on-click-modal="false"	
            @closed="destory"
            top="5vh"
            width="90%"
        >
            <el-form :model="form" label-position="right" v-loading="loading_form">
                <el-row>
                    <el-col :span="8">
                        <el-form-item label="方案名称:" label-width="100px">
                            <el-input v-model="form.name" autocomplete="off"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="计算模式:" label-width="160px">
                            <el-select style="width: 100%" v-model="form.modelId" placeholder="请选择计算模式" @change="getTemplate">
                                <el-option :label="item.name" :value="item.id" v-for="item in modelList" :key="item.id"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6" :offset="1">
                        <el-form-item label="电网功率因素:" label-width="100px">
                            <el-input v-model="form.powerFactor" autocomplete="off"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="8">
                        <el-form-item label="计算期:" label-width="100px">
                            <el-date-picker
                                style="width: 100%"
                                v-model="form.period"
                                type="monthrange"
                                range-separator="至"
                                start-placeholder="开始月份"
                                end-placeholder="结束月份">
                            </el-date-picker>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="反向负载率最大允许:" label-width="160px">
                            <el-input v-model="form.maxPower" autocomplete="off"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <div class="formbtn-box">
                <el-button class="btn" type="primary" @click="close">保存</el-button>
                <el-button class="btn" type="primary" @click="close">评估</el-button>
            </div>
            <div class="line"></div>
            <div class="tablebtn-box">
                <el-button class="btn" type="primary" @click="close">批量校验</el-button>
                <el-button class="btn" type="primary" @click="close">批量导出</el-button>
                <el-button class="btn" type="primary" @click="close">批量删除</el-button>
            </div>
            <el-table :data="templateTable" border multipleTable v-loading="loading_table">
                <el-table-column type="selection" width="50" align="center"></el-table-column>
                <el-table-column type="index" label="序号" width="50" align="center"></el-table-column>
                <el-table-column property="name" label="数据项" width="280" align="center"></el-table-column>
                <el-table-column property="period" label="计算周期" align="center" min-width="180"></el-table-column>
                <el-table-column property="import_time" label="导入时间" align="center"></el-table-column>
                <el-table-column property="check_time" label="校验时间" align="center"></el-table-column>
                <el-table-column property="status" label="状态" width="100" align="center"></el-table-column>
                <el-table-column
                    align="center"
                    label="操作"
                    width="200">
                    <template slot-scope="scope">
                        <el-button @click="handleClick(scope.$index, scope.row)" type="text">导入</el-button>
                        <el-button type="text" @click="checkData(scope.row.id)">校验</el-button>
                        <el-button type="text">导出</el-button>
                        <el-button type="text">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-dialog>

        <governance-report :checkId="checkId" :visible="reportVisible" @updateVisible="updateVisible"></governance-report>
    </div>
</template>

<script>
import governanceReport from  './governanceReport.vue'
import { getCalcModelApi, getTemplateApi } from '/src/api/index.js'
export default {
    name: 'calcModel',
    components: {
        governanceReport,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
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
            loading_form: false,
            loading_table: false,
            reportVisible: false,
            modelList: [],
            templateTable: [],
            checkId: '',
            form: {
                name: '',
                modelId: '',
                powerFactor: '',
                period: '',
                maxPower: ''
            },
        }
    },
    methods: {
        async init() {
            this.loading_form = true;
            this.loading_table = true;
            this.modelList = await getCalcModelApi()
            this.form.modelId = this.modelList[0].id;
            this.loading_form = false;
            this.getTemplate(this.modelList[0].id);
        },
        destory() {
            this.modelList = [];
            this.templateTable = [];
            this.checkId = '';
            this.form = {
                name: '',
                modelId: '',
                powerFactor: '',
                period: '',
                maxPower: ''
            };
        },
        close() {
            this.$emit('updateVisible', false)
        },
        handleClick(i, row) {
            console.log(i, row)
        },
        updateVisible(val) {
            this.reportVisible = val;
        },
        async getTemplate(id) {
            this.loading_table = true;
            this.templateTable = await getTemplateApi({id});
            this.loading_table = false;
        },
        checkData(id) {
            this.checkId = id;
            this.reportVisible = true;
        }
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.content /deep/ .el-dialog__body{
    padding-top: 10px;
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
    margin: 20px 0;
}
</style>
