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
                            <el-col :span="12">
                                <el-date-picker
                                    style="width: 100%"
                                    v-model="form.year"
                                    type="year"
                                    placeholder="年份">
                                </el-date-picker>
                            </el-col>
                            <el-col :span="11" :offset="1">
                                <el-select v-model="form.quarter" placeholder="季节">
                                    <el-option :label="item" :value="item" v-for="item in ['春季','夏季','秋季','冬季']" :key="item"></el-option>
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
                <el-button class="large-btn-120 right20" :disabled="isChecking" type="primary" @click="close">保存</el-button>
                <el-button class="large-btn-120 right20" :disabled="isChecking" type="primary" @click="close">评估</el-button>
            </div>
            <div class="line"></div>
            <div class="tablebtn-box">
                <el-button class="large-btn-120 right20" type="primary" :disabled="isChecking" @click="checkData">批量校验</el-button>
                <el-button class="large-btn-120 right20" type="primary" :disabled="isChecking" @click="close">批量导出</el-button>
                <el-button class="large-btn-120 right20" type="primary" :disabled="isChecking" @click="showDeleteDialog()">批量删除</el-button>
                <el-button class="large-btn-140" type="primary" @click="showReport">
                    <i v-if="isChecking" class="el-icon-loading"></i>
                    {{ isChecking ? '数据治理中...' : '治理结果查看' }}
                </el-button>
            </div>
            <el-table :data="templateTable" border multipleTable v-loading="loading_table">
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
                        <el-button :disabled="isChecking" @click="showImprtDialog(scope.$index, scope.row)" type="text">导入</el-button>
                        <el-button :disabled="isChecking" type="text" @click="checkData">校验</el-button>
                        <el-button :disabled="isChecking" type="text">导出</el-button>
                        <el-button :disabled="isChecking" type="text" @click="showDeleteDialog(scope.row.id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-dialog>

        <el-dialog
            title="检验文件导入" 
            :visible.sync="importVisible" 
            :close-on-press-escape="false"	
            :close-on-click-modal="false"	
            @closed="handleRemove"
            top="30vh"
            width="500px"
        >   
            <el-tooltip :open-delay="300" effect="dark" content="数据生成模板提示语" placement="top">
                <el-button type="text">
                    数据生成模板
                    <i class="el-icon-question" style="color: #0071B7"></i>
                </el-button>
            </el-tooltip>

                <!-- <span>请选择导入文件：</span>
                <div class="pathbox">
                    <el-tooltip :open-delay="300" :disabled="!filePath" effect="dark" :content="filePath" placement="top">
                        <p>{{ filePath }}</p>
                    </el-tooltip>
                    <i @click="handleRemove" class="el-icon-circle-close" style="color: #0071B7" v-show="filePath"></i>
                </div> -->
                <el-upload
                    class="elupload"
                    ref="upload"
                    action="https://jsonplaceholder.typicode.com/posts/"
                    :multiple="false"
                    :on-change="handleChange"
                    :on-error="handleError"
                    :on-success="handleSuccess"
                    :limit="1"
                    :on-exceed="handleExceed"
                    :auto-upload="false"
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
            isChecking: false,
            checkingVisible: false,
            loading_form: false,
            loading_table: false,
            reportVisible: false,
            importVisible: false,
            deleteVisible: false,
            deleteAll:false,
            modelList: [],
            templateTable: [],
            filePath: '',
            form: {
                name: '',
                modelId: '',
                powerFactor: '',
                year: '',
                quarter: '',
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
            this.isChecking = false;
            this.modelList = [];
            this.templateTable = [];
            this.filePath = '';
            this.form = {
                name: '',
                modelId: '',
                powerFactor: '',
                year: '',
                quarter: '',
                maxPower: ''
            };
        },
        close() {
            this.$emit('updateVisible', false)
        },
        showImprtDialog(i, row) {
            console.log(i, row)
            this.importVisible = true;
        },
        updateVisible(val) {
            this.reportVisible = val;
        },
        async getTemplate(id) {
            this.loading_table = true;
            this.templateTable = await getTemplateApi({id});
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
            this.filePath = file.name;
        },
        handleExceed(files) {
            this.$message.warning(`限制导入 1 个文件，请先清空选择的文件后再操作`);
        },
        handleRemove() {
            console.log('remove')
            this.$refs.upload.clearFiles();
            this.filePath = '';
        },
        handleError( err) {
            console.log(err)
            this.$message.error(`导入失败`);
        },
        handleSuccess() {
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
    content:'';
    position: absolute;
    left: 0px;
    box-shadow: 0px 0px 15px 8px #fff;
    top: -50%;
    width: 0px;
    height: 200%;
    transform-origin: center;
    transform: rotate(30deg);
    animation: progress-14137bf4 3s linear infinite;
}
@keyframes progress {
    0% {
        left: 0;
    }
    15%{
        left: 120%;
    }
    100%{
        left: 120%;
    }
}
/* .import span{
    color: #5f5f60;
    font-size: 16px;
    font-weight: bold;
} */
    
/* .pathbox{
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
} */
</style>
