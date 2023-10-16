<template>
    <div class="content">
        <el-button class="govern-btn" @click="show = true" icon="el-icon-s-cooperation" circle></el-button>

        <el-dialog 
            title="评估方案编辑" 
            :visible.sync="show" 
            :close-on-press-escape="false"	
            :close-on-click-modal="false"	
            width="90%"
        >
            <!-- <el-button type="primary" @click="show2 = true">显示弹窗</el-button> -->
            <el-form :model="form" label-position="right">
                <el-row>
                    <el-col :span="8">
                        <el-form-item label="方案名称:" label-width="100px">
                            <el-input v-model="form.name" autocomplete="off"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="计算模式:" label-width="160px">
                            <el-select style="width: 100%" v-model="form.model" placeholder="请选择计算模式">
                                <el-option label="区域一" value="shanghai"></el-option>
                                <el-option label="区域二" value="beijing"></el-option>
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
                <el-button class="btn" type="primary" @click="show = false">保存</el-button>
                <el-button class="btn" type="primary" @click="show = false">评估</el-button>
            </div>
            <div class="line"></div>
            <div class="tablebtn-box">
                <el-button class="btn" type="primary" @click="show = false">批量校验</el-button>
                <el-button class="btn" type="primary" @click="show = false">批量导出</el-button>
                <el-button class="btn" type="primary" @click="show = false">批量删除</el-button>
            </div>
            <el-table :data="calcModel" border multipleTable>
                <el-table-column type="selection" width="50" align="center"></el-table-column>
                <el-table-column type="index" label="序号" width="50" align="center"></el-table-column>
                <el-table-column property="dataItem" label="数据项" width="280" align="center"></el-table-column>
                <el-table-column property="period" label="计算周期" align="center"></el-table-column>
                <el-table-column property="importTime" label="导入时间" align="center"></el-table-column>
                <el-table-column property="checkTime" label="校验时间" align="center"></el-table-column>
                <el-table-column property="status" label="状态" width="100" align="center"></el-table-column>
                <el-table-column
                    align="center"
                    label="操作"
                    width="200">
                    <template slot-scope="scope">
                        <el-button @click="handleClick(scope.$index, scope.row)" type="text">导入</el-button>
                        <el-button type="text" @click="show2=true">校验</el-button>
                        <el-button type="text">导出</el-button>
                        <el-button type="text">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-dialog>

        <governance-report :visible="show2" @updateVisible="updateVisible"></governance-report>
    </div>
</template>

<script>
import governanceReport from  './governanceReport.vue'
export default {
    name: 'dataGovern',
    components: {
        governanceReport,
    },
    data() {
        return {
            show: true,
            show2: false,
            calcModel: [{
                dataItem: '当季光伏典型出力',
                period: '2016-05-02至 2016-08-02',
                importTime: '2016-10-02 12',
                checkTime: '2016-10-02',
                status: '已导入'
            }, {
                dataItem: '110kV 和 35kV 集中式发电厂(站)向单台或并列 220kV 主变送电关系',
                period: '2016-05-02至 2016-08-02',
                importTime: '2016-10-02 12',
                checkTime: '2016-10-02',
                status: '未导入'
            }],
            form: {
                name: '',
                model: '',
                powerFactor: '',
                period: '',
                maxPower: ''
            },
        }
    },
    methods: {
        handleClick(i, row) {
            console.log(i, row)
        },
        updateVisible(val) {
            this.show2 = val;
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.content {
    width: 100vw;
    height: 100vh;
    background: linear-gradient(#fff, #000);
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
.govern-btn {
    position: fixed;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
}
</style>
