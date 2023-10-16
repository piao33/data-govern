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
body{
  margin: 0;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
