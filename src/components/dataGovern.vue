<template>
    <div class="content">
        <el-button class="govern-btn" @click="visible = true" icon="el-icon-s-cooperation" circle></el-button>
        <calc-model :visible="visible" @updateVisible="updateVisible"></calc-model>
    </div>
</template>

<script>
import calcModel from  './calcModel.vue'
export default {
    name: 'dataGovern',
    components: {
        calcModel,
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
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
