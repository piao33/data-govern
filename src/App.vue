<template>
  <div id="app">
    <DataGovern msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
import DataGovern from './components/dataGovern.vue'

export default {
  name: 'App',
  components: {
    DataGovern
  }
}
</script>

<style>
body,p,ul,li,h1,h2,h3,h4,h5,h6{
  margin: 0;
  padding:0;
  list-style: none;
}
.el-loading-spinner{
  font-size: 48px;
}
.el-loading-spinner .el-loading-text{
  font-size: 18px;
  font-weight: 500;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #393a3a;
}

</style>
