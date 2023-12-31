import Vue from 'vue'
import App from './App.vue'
import '../element/elementComponent.js'
import echarts from './echarts'

Vue.config.productionTip = false
Vue.prototype.$echarts = echarts

new Vue({
  render: h => h(App),
}).$mount('#app')
