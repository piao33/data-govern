import axios from "axios";
import qs from 'qs';

// 默认配置
const instance = axios.create({
    // baseURL: 'https://mock.apifox.cn/m1/3432133-0-default',
    timeout: 10000,
    headers: {"Content-type": 'application/x-www-form-urlencoded',},
});

// 请求拦截器
instance.interceptors.request.use(function(config) {
    // 在请求发出前做些操作
    if(config.headers['Content-Type'] != 'multipart/form-data') {
        config.data = qs.stringify(config.data)
    }
    return config;
},function(error){
    console.log(error)
    // 对请求错误做些操作
    return Promise.resolve(error);
})

// 响应拦截器
instance.interceptors.response.use(function(response){
    // 对响应数据做操作

    // 处理下载文件时，获取文件名操作
    const exportUrl = ['/govern/export', '/govern/exportAll']
    if(exportUrl.includes(response.config.url)) {
        let filename = response.headers['content-disposition']
        response.data = {
            file: response.data,
            filename: decodeURIComponent(filename).split('filename=')[1]
        }
    }
    
    return response
},function(error){
    console.log(error)
    // 对响应错误做些操作
    return Promise.resolve(error);
})

// 封装请求
async function requests(config) {
    let {status, data = {}, statusText, message} = await instance(config);
    // debugger
    if(200 <= status && status < 300) {// 请求成功
        // 
    }else if(status == 401){// 请求失败
         // 未登录
    }else{
        // statusText
        data.msg = statusText || message || 'request error';
    }
    return data;
}


export default requests;