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
                            <el-select style="width: 100%" :disabled="hasChecked" v-model="form.modelId" placeholder="请选择计算模式" @change="onChangeModel">
                                <el-option :label="item.dictLabel" :value="item.dictValue" v-for="item in modelList" :key="item.id"></el-option>
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
                            <el-col :span="12">
                                <el-date-picker
                                    :disabled="hasChecked" 
                                    style="width: 100%"
                                    v-model="form.year"
                                    type="year"
                                    placeholder="年份">
                                </el-date-picker>
                            </el-col>
                            <el-col :span="11" :offset="1">
                                <el-select v-model="form.season" placeholder="季节" :disabled="hasChecked" >
                                    <el-option :label="item.dictLabel" :value="item.dictValue" v-for="item in seasonList" :key="item.dictValue"></el-option>
                                </el-select>
                            </el-col>
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
                <el-button class="large-btn-120 right20" :disabled="disableSave" type="primary" @click="savePlan">保存</el-button>
                <el-button class="large-btn-120 right20" :disabled="isChecking" type="primary" @click="close">评估</el-button>
            </div>
            <div class="line" v-if="templateTable.length"></div>
            <div class="tablebtn-box" v-if="templateTable.length">
                <el-button class="large-btn-120 right20" type="primary" :disabled="isChecking || !hasRuntimeImport" @click="checkData">批量校验</el-button>
                <el-button class="large-btn-120 right20" type="primary" :disabled="isChecking || !hasChecked" @click="close">批量导出</el-button>
                <el-button class="large-btn-120 right20" type="primary" :disabled="isChecking || !hasImport" @click="showDeleteDialog()">批量删除</el-button>
                <el-button class="large-btn-140" :disabled="!isChecking && !hasChecked" type="primary" @click="showReport">
                    <i v-if="isChecking" class="el-icon-loading"></i>
                    {{ isChecking ? '数据治理中...' : '治理结果查看' }}
                </el-button>
            </div>
            <el-table :data="templateTable" v-if="templateTable.length" border multipleTable v-loading="loading_table">
                <el-table-column type="index" label="序号" width="50" align="center"></el-table-column>
                <el-table-column property="tableName" label="数据项" width="280" align="center"></el-table-column>
                <el-table-column property="computingCycle" label="计算周期" align="center" min-width="180"></el-table-column>
                <el-table-column property="impTime" label="导入时间" align="center"></el-table-column>
                <el-table-column property="verifiesTime" label="校验时间" align="center"></el-table-column>
                <el-table-column property="status" label="状态" width="100" align="center"></el-table-column>
                <el-table-column
                    label="操作"
                    width="200">
                    <template slot-scope="scope">
                        <el-button :disabled="isChecking || !scope.row.canImport" @click="showImportDialog(scope.$index, scope.row)" type="text">导入</el-button>
                        <el-button v-if="scope.row.showCheck" :disabled="isChecking || !scope.row.canCheck" type="text" @click="checkData">校验</el-button>
                        <el-button :disabled="isChecking || !scope.row.canDownload" type="text">导出</el-button>
                        <el-button :disabled="isChecking || !scope.row.canDelete" type="text" @click="showDeleteDialog(scope.row.id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-dialog>

        <el-dialog
            title="检验文件导入" 
            :visible.sync="importVisible" 
            :close-on-press-escape="false"	
            :close-on-click-modal="false"	
            @closed="importClosed"
            top="30vh"
            width="500px"
        >   
            <el-tooltip :open-delay="300" effect="dark" content="点击下载表格模板" placement="top">
                <el-button type="text">
                    <a download :href="'/excelTemplate/'+currentRow.tableName+'.xlsx'">数据生成模板</a>
                    <i class="el-icon-question" style="color: #0071B7"></i>
                </el-button>
            </el-tooltip>

                <span>请选择导入文件：</span>
                <div class="pathbox">
                    <el-tooltip :open-delay="300" :disabled="!filePath" effect="dark" :content="filePath" placement="top">
                        <p>{{ filePath }}</p>
                    </el-tooltip>
                    <i @click="importClosed" class="el-icon-circle-close" style="color: #0071B7" v-show="filePath"></i>
                </div>

                <el-upload
                    class="elupload"
                    ref="upload"
                    :multiple="false"
                    action=""
                    :limit="1"
                    :on-change="handleChange"
                    :on-error="handleError"
                    :on-success="handleSuccess"
                    :on-progreess="onUploadProgress"
                    accept=".xls,.xlsx,.csv"
                    :on-exceed="handleExceed"
                    :auto-upload="false"
                    :http-request="importFile"
                >
                    <el-button slot="trigger" class="large-btn-120">浏览</el-button>
                    <el-button style="margin: 0 20px;" @click="submitUpload" class="large-btn-120" type="primary">导入</el-button>
                </el-upload>

        </el-dialog>

        <governance-report :modelId="form.modelId" :visible="reportVisible" @updateVisible="updateVisible"></governance-report>

        <el-dialog title="提 示" :append-to-body="true" :visible.sync="deleteVisible" width="500px" center>
            <h2 style="text-align: center">是否确认删除{{deleteAll ? '所有' : '该条'}}记录？删除后需重新校验！</h2>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="deleteData">确 认</el-button>
                <el-button @click="deleteData">取 消</el-button>
            </span>
        </el-dialog>

        <el-dialog title="数据治理校验中" center :append-to-body="true" :visible.sync="checkingVisible" width="500px">
            <div class="progress-box">
                <el-progress :text-inside="true" text-color="#fff" :stroke-width="26" :percentage="70"></el-progress>
                <div class="progressAni" :style="{width: 70+'%'}"></div>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import governanceReport from  './governanceReport.vue'
import { getCalcModelApi, getSeasonApi, getTemplateApi, savePlanApi, getPlanApi, importFileApi } from '../api/index.js'
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
        disableSave() {
            return this.isChecking || !this.form.modelId || !this.form.year || !this.form.season || this.hasChecked
        },
        hasImport() {
            return this.templateTable.some(item => item.status && !(item.status == '未导入' || item.status == '导入中'))
        },
        hasRuntimeImport() {
            return this.templateTable.some(item => item.status && true && !(item.status == '未导入' || item.status == '导入中'))
        },
        hasChecked() {
            return this.templateTable.some(item => item.status && item.status == '已校验')
        },
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
            isChecking: false,
            checkingVisible: false,
            loading_form: false,
            loading_table: false,
            reportVisible: false,
            importVisible: false,
            deleteVisible: false,
            filePath: '',
            deleteAll:false,
            modelList: [],
            seasonList: [],
            templateTable: [],
            oldModelId: '',
            currentRow: {},
            // uploadUrl: 'http://192.168.1.17:9001/govern/importData',
            // uploadUrl: 'http://192.168.1.12:8000/upload',
            form: {
                name: '',
                modelId: '',
                powerFactor: '',
                year: new Date(),
                season: '',
                maxPower: ''
            },
        }
    },
    methods: {
        async init() {
            this.loading_form = true
            const [modelRows, seasonRows] = await Promise.all([getCalcModelApi(), getSeasonApi()])
            this.modelList = modelRows
            this.seasonList = seasonRows
            if(seasonRows.length) {
                this.form.season = seasonRows[0].dictValue
            }
            this.loading_form = false
            this.getPlan();
        },
        destory() {
            this.isChecking = false;
            this.modelList = [];
            this.templateTable = [];
            this.form = {
                name: '',
                modelId: '',
                powerFactor: '',
                year: new Date(),
                season: '',
                maxPower: ''
            };
        },
        close() {
            this.$emit('updateVisible', false)
        },
        async getPlan() {
            /**
             * 后端设置的状态 status 参考
             * 
             * 未导入
             * 导入中
             * 已导入
             * 校验中
             * 校验失败
             * 已校验
             */
            let data = await getPlanApi(519)
            if(!data.length) return
            data.forEach(item=>{
                item.canImport = !!item.computingCycle // 判断是否有计算周期（有则表明数据已入库，可以导入数据表）
                item.canCheck = item.status == '已导入'
                item.canDownload = item.status == '已校验'
                item.canDelete = item.status == '已导入' || item.status == '校验失败' || item.status == '已校验'
                item.showCheck = item.tableType == '2'  // 1是基本数据表，不需要校验， 2是运行数据表，需要校验
            })
            this.templateTable = data;

            this.form.modelId = data[0].computeMode;
            this.oldModelId = data[0].computeMode;
            let [year, season] = this.handlePeriod(data[0].computingCycle)
            this.form.year = year;
            this.form.season = season;
        },
        handlePeriod(str){
            /**
             * 在方案详情中，没有计算周期的字段，使用computingCycle字段拆解获取
             * 
             * 后端设置的春夏秋冬 ID 参考
             * 03-01;05-31
             * 06-01;08-31
             * 09-01;11-30
             * 12-01;02-28
             */
            let year = str.slice(0,4)
            let reg = new RegExp(''+year+'-','gi');
            let season = str.replace(reg, '').replace('至', ';');
            return [new Date(year), season]
        },
        async savePlan() {
            let year = this.form.year.getFullYear()
            let {code} = await savePlanApi(this.form.modelId, year, this.form.season, 519)
            if(code == 200) {
                this.getPlan()
            }
        },
        showImportDialog(i, row) {
            this.currentRow = row;
            this.importVisible = true;
        },
        updateVisible(val) {
            this.reportVisible = val;
        },
        async onChangeModel() {

            this.loading_table = true;
            if(this.oldModelId == this.form.modelId) {
                this.getPlan()
            } else{
                this.templateTable = await getTemplateApi(this.form.modelId);
            }
            this.loading_table = false;
        },
        // 
        showReport() {
            if(this.isChecking) {
                this.checkingVisible = true;
            }else{
                this.modelId = this.form.modelId;
                this.reportVisible = true;
            }
        },
        checkData() {
            this.checkingVisible = true;
            this.isChecking = true;
        },

        submitUpload() {
            this.$refs.upload.submit();
        },
        handleChange(file, fileList) {
            console.log(file)
            this.filePath = file.path
        },
        handleExceed(files) {
            this.$message.warning(`限制导入 1 个文件，请先清空选择的文件后再操作`);
        },
        importClosed() {
            this.$refs.upload.clearFiles();
        },
        handleError( err) {
            console.log(err)
            this.$message.error(`导入失败`);
        },
        handleSuccess(res, file, fileLs) {
            console.log(res,file,fileLs)
            this.$message.success(`导入成功`);
        },
        showDeleteDialog(id){
            if(id) {
                // 
            }
            this.deleteAll = !id;
            this.deleteVisible = true;
        },
        deleteData() {
            this.deleteVisible = false;
        },
        async importFile(fileData) {
            console.log(fileData)
            let file = fileData.file;
            let {code} = await importFileApi({
                file, 
                planId: 519, 
                tableId: this.currentRow.tableId,
                onUploadProgress:this.onUploadProgress,
            })
            if(code == 200) {
                this.importVisible = false;
                this.getPlan();
            }else {
                throw new Error(false)
            }
        },
        onUploadProgress(event) {
            console.log(event)
            return event
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
.large-btn-120{
    width: 120px;
}
.large-btn-140{
    width: 140px;
    float: right;
}
.right20{
    margin-right: 20px;
}
.line{
    border-top: 1px solid #E7E8E8;
    margin: 20px 0;
}
.progress-box{
    position: relative;
}
.progressAni{
    position: absolute;
    left:0;top:0;
    height: 100%;
    overflow: hidden;
    border-radius: 100px;
}
.progressAni::after{
    content: '';
    position: absolute;
    left: 0;
    top:0;
    width: 0px;
    height: 100%;
    border-radius: 100px;
    background-color: #fff;
    animation: progress-14137bf4 2.8s linear infinite;
}
@keyframes progress {
    0%{
        width: 0px;
        opacity: 0.3;
    }
    60%{
        width: 100%;
        opacity: 0.3;
    }
    100%{
        width: 100%;
        opacity: 0;
    }
}
.import span{
    color: #5f5f60;
    font-size: 16px;
    font-weight: bold;
}
    
.pathbox{
    border: 1px solid #DCDFE6;
    height: 40px;
    width: 40%;
    margin: 0 30px 0 24px;
    box-sizing: border-box;
    position: relative;
    padding: 0 16px;
}
.pathbox p{
    line-height: 40px;
    height: 100%;
    overflow: hidden;
    display: inline-block;
}

.pathbox i{
    color: rgb(0, 113, 183);
    position: absolute;
    right: 4px;
    top: 20px;
    transform: translateY(-50%);
}
</style>
