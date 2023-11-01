<template>
    <div class="content">
        <el-button class="govern-btn" @click="visible = true" icon="el-icon-s-cooperation" circle></el-button>
        <compute-model :visible="visible" @updateVisible="updateVisible"></compute-model>
    </div>
</template>

<script>
import ComputeModel from  './editComputeModel.vue'
export default {
    name: 'dataGovern',
    components: {
        ComputeModel,
    },
    data() {
        return {
            visible: true,
        }
    },
    methods: {
        updateVisible(val) {
            this.visible = val;
        }
    },
    async mounted() {
    }
}
</script>

<style scoped>
.content {
    width: 100vw;
    height: 100vh;
    background: linear-gradient(#fff, #000);
}
.govern-btn {
    position: fixed;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
}
</style>
