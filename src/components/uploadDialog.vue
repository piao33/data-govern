<template>
    <div class="content">
        <el-dialog
            :title="'校验文件导入（' + data.tableName + '）'" 
            :visible.sync="showDialog" 
            :close-on-press-escape="false"	
            :close-on-click-modal="false"	
            top="30vh"
            width="1000px"
        >   
            <el-steps :active="currentStep" align-center style="margin-bottom: 20px;">
                <el-step :status="currentStep < 1 ? 'wait' : currentStep == 1 ? 'process' : 'success'" title="选择文件" icon="el-icon-document"></el-step>
                <el-step :status="currentStep < 2 ? 'wait' : currentStep == 2 ? 'process' : 'success'" title="传输文件" :icon="uploadPercent ? 'el-icon-loading' : ''"></el-step>
                <el-step :status="currentStep < 3 ? 'wait' : currentStep == 3 ? 'process' : 'success'" title="检测文件有效性" :icon="currentStep == 3 ? 'el-icon-loading':''"></el-step>
            </el-steps>
            <div class="upload">
                <span>请选择导入文件：</span>
                <div class="pathbox">
                    <el-tooltip :open-delay="300" :disabled="!filePath" effect="dark" :content="filePath" placement="top">
                        <p>{{ filePath }}</p>
                    </el-tooltip>
                    <i @click="clearUpload" class="el-icon-circle-close" style="color: #0071B7;cursor: pointer;" v-show="filePath && !isUploading"></i>
                    <div class="uploadProgress" :style="{'width': uploadPercent+'%'}"></div>
                </div>
                <el-upload
                    class="elupload"
                    ref="upload"
                    :multiple="false"
                    action=""
                    :limit="1"
                    :show-file-list="false"
                    :on-change="handleChange"
                    :on-error="handleError"
                    :on-success="handleSuccess"
                    :on-progreess="onUploadProgress"
                    accept=".xls,.xlsx,.csv"
                    :on-exceed="handleExceed"
                    :auto-upload="false"
                    :http-request="uploadFile"
                >
                    <el-button :disabled="isUploading" slot="trigger" class="large-btn-120">浏览</el-button>
                    <el-button :disabled="isUploading" style="margin: 0 20px;" @click="submitUpload" class="large-btn-120" type="primary">导入</el-button>
                </el-upload>
                <el-tooltip :open-delay="300" effect="dark" :content="'点击下载 { '+data.tableName+' } 模板'" placement="top">
                    <el-button type="text">
                        <a download :href="'/excelTemplate/'+data.tableName+'.xlsx'">数据生成模板</a>
                        <i class="el-icon-question" style="color: #0071B7"></i>
                    </el-button>
                </el-tooltip>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { uploadFileApi } from '../api/index.js'

export default {
    name: 'uploadDialog',
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        planId: {
            type: [Number, String],
            default: 1
        },
        data: {
            type: Object,
            default:()=>{
                return {}
            }
        },
        index: {
            type: Number,
            required: true
        }
    },
    watch: {
        'data.isUploading': {
            handler(val) {
                // 不是 upload 组件触发的上传，而是根据后台接口返回的 status==导入中 判断的。
                // 返显上传中的ui
                if(val && !this.uploadBySelf) {
                    this.filePath = this.data.tableName+'.xlsx'
                    this.currentStep = 3
                    this.uploadPercent = 100
                    this.isUploading = true;
                }else if(!val && !this.uploadBySelf){
                    this.clearUpload()
                }
            },
            immediate: true,
            deep: true
        }
    },
    computed: {
        showDialog: {
            get() {
                return this.visible
            },
            set(val) {
                this.$emit('updateUploadVisible', this.index, val)
            }
        }
    },
    components: {
    },
    data() {
        return {
            filePath: '',
            currentStep: 0,
            uploadPercent: 0,
            isUploading: false,
            uploadBySelf: false,
        }
    },
    methods: {
        async uploadFile(fileData) {
            let file = fileData.file;
            let {code,msg} = await uploadFileApi({
                file, 
                planId: this.planId, 
                tableId: this.data.tableId,
                onUploadProgress:this.onUploadProgress,
            })
            let tableName = this.data.tableName;
            // 自定义上传时，根据return值触发 el-upload的 on-error和 on-success事件
            if(code == 200) {
                return tableName + '，' + (msg || '导入成功!')
            }else {
                throw new Error(tableName + '，' + (msg || '导入失败!'))
            }
        },
        onUploadProgress(event) {
            this.uploadPercent = (event.progress * 100).toFixed(2)
            if(event.progress == 1) {
                this.currentStep = 3;
            }
            return event
        },
        handleExceed(files) {
            this.$message.warning(`限制导入 1 个文件，请先清空选择的文件后再操作`);
        },
        clearUpload() {
            this.$refs.upload?.clearFiles();
            this.filePath = '';
            this.uploadPercent = 0;
            this.currentStep = 0;
            this.isUploading = false;
            this.uploadBySelf = false;
        },
        handleError(msg) {
            this.$emit('uploadError', this.index, msg)
        },
        handleSuccess(msg) {
            this.showDialog = false;
            this.$emit('uploadSucess', this.index, msg)
        },

        submitUpload() {
            if(this.filePath) {
                this.$refs.upload.submit();
                this.isUploading = true;
                this.uploadBySelf = true;
                this.$emit('uploading', this.index)
            }
        },
        handleChange(file, fileList) {
            if(file.status == 'success') {
                this.clearUpload();
            }else if(file.status == 'fail') {
                this.clearUpload();
            }else { // status == ready
                this.filePath = file.name
                this.uploadPercent = 0;
                this.currentStep = 2;
            }
        },
    },
}
</script>

<style scoped>
.large-btn-120{
    width: 120px;
}
.upload{
    display: flex;
    align-items: center;
}
.upload span{
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
}
.pathbox .uploadProgress{
    position: absolute;
    bottom: -1px;
    left:0;
    border-bottom: 2px solid #0071B7;
    transition: all 0.3s;
}
.pathbox p{
    padding: 0 16px;
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
