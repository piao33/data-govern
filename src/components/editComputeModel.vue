<template>
    <div class="editcompute">
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
                            <el-select style="width: 100%" :disabled="disableChange" v-model="form.modelId" placeholder="请选择计算模式" @change="onChangeModel">
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
                                    :disabled="disableChange" 
                                    style="width: 100%"
                                    v-model="form.year"
                                    type="year"
                                    placeholder="年份">
                                </el-date-picker>
                            </el-col>
                            <el-col :span="11" :offset="1">
                                <el-select v-model="form.season" placeholder="季节" :disabled="disableChange" >
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
                <el-button class="large-btn-120 right20" :disabled="disableSave" type="primary" @click="showSaveDialog">保存</el-button>
                <el-button class="large-btn-120 right20" :disabled="hasChecking" type="primary" @click="close">评估</el-button>
            </div>
            <div class="line"></div>
            <div class="tablebtn-box">
                <el-button class="large-btn-120 right20" type="primary" :disabled="!canAllCheck" @click="checkAllData">批量校验</el-button>
                <el-button class="large-btn-120 right20" type="primary" :disabled="hasChecking || !hasChecked" @click="close">批量导出</el-button>
                <el-button class="large-btn-120 right20" type="primary" :disabled="hasChecking || !canDelete" @click="showDeleteDialog()">批量删除</el-button>
                <!-- <el-button class="large-btn-120 right20" @click="testClick">测试按钮</el-button> -->
                <el-button class="large-btn-140" :disabled="!hasChecking && !hasChecked" type="primary" @click="showReport">
                    <i v-if="hasChecking" class="el-icon-loading"></i>
                    {{ hasChecking ? '数据治理中...' : '治理结果查看' }}
                </el-button>
            </div>
            <el-table :data="templateTable" border multipleTable v-loading="loading_table">
                <el-table-column type="index" label="序号" width="50" align="center"></el-table-column>
                <el-table-column property="tableName" label="数据项" width="280" align="center"></el-table-column>
                <el-table-column property="computingCycle" label="计算周期" align="center" min-width="180"></el-table-column>
                <el-table-column property="impTime" label="导入时间" align="center"></el-table-column>
                <el-table-column property="verifiesTime" label="校验时间" align="center"></el-table-column>
                <el-table-column label="状态" width="100" align="center">
                    <template slot-scope="scope">
                        <i v-if="scope.row.isUploading || scope.row.isChecking" class="el-icon-loading"></i>
                        <span>{{ scope.row.isUploading ? '导入中' : scope.row.isChecking ? '校验中' : scope.row.status }}</span>
                    </template>
                </el-table-column>
                <el-table-column
                    align="center"
                    label="操作"
                    width="200">
                    <template slot-scope="scope">
                        <el-button :disabled="hasChecking || !scope.row.canUpload || hasCheckStatus" @click="showUploadDialog(scope.$index)" type="text">导入</el-button>
                        <el-button v-if="scope.row.isRuntimeTable" :disabled="!hasAllUpload || !scope.row.canCheck || scope.row.isChecking" type="text" @click="checkData(scope.row)">校验</el-button>
                        <el-button v-if="scope.row.isRuntimeTable" :disabled="!scope.row.canDownload" type="text">导出</el-button>
                        <el-button :disabled="hasChecking || !scope.row.canDelete || scope.row.isUploading" type="text" @click="showDeleteDialog(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-dialog>

        <upload-dialog 
            v-for="(item, index) in templateTable" 
            :key="item.cmooId" 
            :planId="planId" 
            :data="item" 
            :index="index" 
            :visible="item.uploadVisible"
            @uploading="uploading"
            @uploadError="uploadError"
            @uploadSucess="uploadSucess"
            @updateUploadVisible="updateUploadVisible"
        >
        </upload-dialog>

        <governance-report :modelId="form.modelId" :visible="reportVisible" @updateVisible="updateVisible"></governance-report>

        <el-dialog title="提 示" :append-to-body="true" :visible.sync="deleteVisible" width="500px" center>
            <h2 style="text-align: center">是否确认删除{{deleteObject.tableName || '所有记录'}}？删除后需重新校验！</h2>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="deleteData">确 认</el-button>
                <el-button @click="deleteVisible = false">取 消</el-button>
            </span>
        </el-dialog>

        <el-dialog title="提 示" :append-to-body="true" :visible.sync="changeModelVisible" width="500px" center>
            <h2 style="text-align: center">该操作会覆盖之前的计算模式，是否继续？</h2>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="savePlan">确 认</el-button>
                <el-button @click="changeModelVisible = false">取 消</el-button>
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
import uploadDialog from './uploadDialog.vue'
import { getCalcModelApi, getSeasonApi, getTemplateApi, savePlanApi, 
    getPlanApi, checkDataApi, checkAllDataApi, deleteDataApi, deleteAllDataApi } from '../api/index.js'
export default {
    name: 'editComputeModel',
    components: {
        governanceReport,
        uploadDialog
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        }
    },
    computed: {
        disableSave() {
            return this.hasChecking 
            || !this.form.modelId 
            || !this.form.year 
            || !this.form.season
            || this.templateTable.some(item => !!item.impTime || item.status == '导入中') 
            || !this.canChangeModel
        },
        disableChange(){
            return this.hasChecking 
            || this.templateTable.some(item => !!item.impTime || item.status == '导入中') 
            || !this.canChangeModel
        },
        hasChecked() {
            return this.templateTable.some(item => item.status == '已校验')
        },
        hasCheckStatus() {
            return this.templateTable.some(item => item.status == '已校验' || item.isChecking || item.status == '校验失败')
        },
        hasAllUpload() {
            let importList = ['已导入', '已校验', '校验失败']
            return this.templateTable.length && this.templateTable.every(item => importList.includes(item.status) || item.isChecking)
        },
        canAllCheck() {
            // 陷阱：every 函数在数组为空时总是返回true。
            let runTimeTable = this.templateTable.filter(item => item.isRuntimeTable)
            if(runTimeTable.some(item => item.status == '已导入' || item.status == '校验失败')) {
                return  true;
            }
            if(this.templateTable.length && this.templateTable.every(item => item.status == '已导入')){
                return  true;
            }
            return false;
            // return this.templateTable.length && this.templateTable.every(item => {
            //     if(item.isRuntimeTable) {
            //         return item.status == '校验失败'
            //     }else {
            //         return item.status == '已导入'
            //     }
            // })
        },
        hasUploading() {
            return this.templateTable.some(item => item.isUploading)
        },
        hasChecking() {
            return this.templateTable.some(item => item.isChecking)
        },
        canDelete() {
            return this.templateTable.some(item => item.canDelete)
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
        },
    },
    beforeDestroy() {
        clearTimeout(this.timer)
    },
    data() {
        return {
            planId: 519,
            checkingVisible: false,
            loading_form: false,
            loading_table: false,
            reportVisible: false,
            deleteVisible: false,
            changeModelVisible: false,
            canChangeModel: false,
            hasSaved: false,
            deleteObject: {},
            modelList: [],
            seasonList: [],
            templateTable: [],
            oldModelId: '',
            timer: null,
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
    created() {
        let search = new URLSearchParams(location.search)
        this.planId = search.get('planId')
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
            this.loading_table = true;
            await this.getPlan();
            this.loading_table = false;
            this.changeSaveStatus()
            this.hasSavedFn();
        },
        destory() {
            this.modelList = [];
            this.templateTable = [];
            this.oldModelId = '';
            clearTimeout(this.timer);
            this.canChangeModel = false;
            this.hasSaved = false;
            this.form = {
                name: '',
                modelId: '',
                powerFactor: '',
                year: new Date(),
                season: '',
                maxPower: ''
            };
        },
        // 方案下的计算模式更改，是否可以点击保存按钮。
        // 该方案下的任意计算模式下，只要有一个文件是已导入状态（有导入时间），就不可以点击保存，更改计算模式
        // 只在初始化进入时，文件导入后，文件删除后 这 3 个场景下调用该方法
        changeSaveStatus() {
            this.canChangeModel = !this.templateTable.some(item => !!item.impTime)
        },
        // 是否有计算周期。有的话表示该方案下保存过计算模式
        // 该字段用于在保存计算模式时，是否弹出覆盖之前的计算模式弹框
        // 如果为 true，弹出。为 false，不谈出
        // 该方法只在初始化时调用
        hasSavedFn() {
            this.hasSaved = this.templateTable.some(item => !!item.computingCycle)
        },
        close() {
            this.$emit('updateVisible', false)
        },
        async getPlan() {
            let data = await getPlanApi(this.planId)
            if(!data.length) return
            this.templateTable = this.handleData(data)

            /**
             * 正在导入的数据时，用户刷新页面，此时通过轮询查询导入结果
             * 导入的文件较大，时间较长，分两个阶段。
             * 阶段 1 从前端上传文件到后端，此时刷新页面，文件传输失败，只能重新导入（后续考虑做断点续传）
             * 阶段 2 后端文件接收完成后，需要读取文件数据，分析数据，此时刷新页面，可通过'导入中'状态实现 ui 返显，并提示结果
             */
            clearTimeout(this.timer)
            if(this.hasUploading) {
                this.timer = setTimeout(() => {
                    this.getPlan()
                }, 5000);
            }
            if(this.hasChecking) {
                this.timer = setTimeout(() => {
                    this.getPlan()
                }, 5000);
            }

            this.form.modelId = data[0].computeMode;
            this.oldModelId = data[0].computeMode;
            let [year, season] = this.handlePeriod(data[0].computingCycle)
            this.form.year = year;
            this.form.season = season;
        },
        
        handleData(data) {
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
            data.forEach((item,index)=>{
                item.canUpload = !!item.computingCycle // 判断是否有计算周期（有则表明数据已入库，可以导入数据表）
                item.canDownload = item.status == '已校验'
                item.canDelete = item.status == '已导入' || item.status == '校验失败' || item.status == '已校验'
                item.canCheck = item.status == '已导入' || item.status == '校验失败'
                item.isRuntimeTable = item.tableType == '2'  // 1是基本数据表，不需要校验， 2是运行数据表，需要校验
                item.isUploading = (item.status == '导入中')
                item.isChecking = (item.status == '校验中')
                item.uploadVisible = (this.templateTable?.[index]?.uploadVisible || false)
            })
            // 处理轮询时，导入结束和校验结束，提示相应信息
            this.templateTable.forEach((item,index)=>{
                if(item['status'] == '导入中'){
                    if(data[index]['status'] == '已导入'){
                        // 防止多个任务同时完成，提示框会重叠。包裹在 settimeout 中防止重叠
                        setTimeout(() => {
                            // 成功
                            this.templateTable[index].uploadVisible = false;
                            this.$message.success(item.tableName+'，导入成功！');
                        }, 0);
                    }else if(data[index]['status'] == '导入失败'){
                        setTimeout(() => {
                            // 失败
                            this.$message.error(item.tableName+'，导入失败！');
                        }, 0);
                    }
                }else if(item['status'] == '校验中') {
                    if(data[index]['status'] == '已校验'){
                        // 防止多个任务同时完成，提示框会重叠。包裹在 settimeout 中防止重叠
                        setTimeout(() => {
                            // 成功
                            this.$message.success(item.tableName+'，校验完成！');
                        }, 0);
                    }else if(data[index]['status'] == '校验失败'){
                        setTimeout(() => {
                            // 失败
                            this.$message.error(item.tableName+'，校验失败！');
                        }, 0);
                    }
                }
            })
            return data;
        },
        handlePeriod(str){
            /**
             * 在方案详情中，没有计算周期的字段，使用computingCycle字段拆解获取
             * 
             * 后端设置的春季 夏季 秋季 冬季 ID 参考
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
        showSaveDialog() {
            if(this.hasSaved) {
                this.changeModelVisible = true;
            }else {
                this.savePlan();
            }
        },
        async savePlan() {
            this.changeModelVisible = false;
            let year = this.form.year.getFullYear()
            let {code} = await savePlanApi(this.form.modelId, year, this.form.season, this.planId)
            if(code == 200) {
                await this.getPlan()
                this.hasSavedFn();
            }
        },
        testClick() {
            
        },
        updateVisible(val) {
            this.reportVisible = val;
        },
        showUploadDialog(i) {
            this.templateTable[i].uploadVisible = true;
        },
        updateUploadVisible(i, val) {
            this.templateTable[i].uploadVisible = val;
        },
        async uploadSucess(i, msg) {
            this.$message.success(msg);
            await this.getPlan();
            this.changeSaveStatus()
        },
        uploadError(i, msg) {
            this.$message.error(msg);
            this.getPlan();
        },
        uploading(i) {
            this.templateTable[i].isUploading = true;
        },
        async onChangeModel() {
            this.loading_table = true;
            if(this.oldModelId == this.form.modelId) {
                this.getPlan()
            } else{
                clearTimeout(this.timer)
                this.templateTable = await getTemplateApi(this.form.modelId);
            }
            this.loading_table = false;
        },
        // 
        showReport() {
            if(this.hasChecking) {
                this.checkingVisible = true;
            }else{
                this.modelId = this.form.modelId;
                this.reportVisible = true;
            }
        },
        async checkData(row) {
            // this.checkingVisible = true;
            row.isChecking = true;
            let {code , msg} = await checkDataApi(row.tableId, this.planId)
            if(code == 200) {
                this.$message.success(msg || row.tableName + '，校验完成！')
            }else{
                this.$message.error(msg || row.tableName + '，校验失败！')
            }
            this.getPlan()

        },
        async checkAllData() {
       
            for(let i= 0; i < this.templateTable.length; i++){
                let item = this.templateTable[i]
                if(item.isRuntimeTable && (item.status == '已导入' || item.status == '校验失败')){
                    // this.templateTable[i].status = '校验中'
                    this.templateTable[i].isChecking = true
                }
            }
            let resArr = await checkAllDataApi(this.planId)
            if(resArr.length) {
                resArr.forEach(item=>{
                    if(item.code == 200) {
                        setTimeout(() => {
                            this.$message.success( item.msg || '校验完成！')
                        }, 0);
                    }else {
                        setTimeout(() => {
                            this.$message.error(item.msg || '校验失败！')
                        }, 0);
                    }
                })
            }else {
                this.$message.error('批量校验失败！')
            }
            this.getPlan()

        },
        
        showDeleteDialog(row){
            this.deleteObject = row || {};
            this.deleteVisible = true;
        },
        async deleteData() {
            let requests = null
            console.log(this.deleteObject)
            if(this.deleteObject.tableId){
                requests = deleteDataApi.bind(this, this.deleteObject.tableId, this.planId)
            }else{
                requests = deleteAllDataApi.bind(this, this.planId)
            }
            console.log(requests)
            let {code, msg} = await requests()
            if(code == 200) {
                this.$message.success(msg || `${this.deleteObject.tableName || '批量数据'}，删除成功！`)
            }else {
                this.$message.error(msg || `${this.deleteObject.tableName || '批量数据'}，删除失败！`)

            }
            this.deleteObject = {}
            await this.getPlan()
            this.deleteVisible = false;
            this.changeSaveStatus()
        },
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.editcompute /deep/ .el-dialog__body{
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
    height: 100%;
}
.testprogress{
    transition: all 0.3s linear;
    background: green;
    height: 2px;
    margin: 10px 0;

}
.progressAni{
    position: absolute;
    left:0;top:0;
    height: 100%;
    width:100%;
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
    width:100%;
    border-radius: 100px;
    background-color: #fff;
    animation: progress 2.8s linear infinite;
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
</style>
