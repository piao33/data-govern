import requests from './axios';

function getCalcModelApi() {
    return requests({
        method: 'get',
        url: '/model'
    })
}

function getTemplateApi() {
    return requests({
        method: 'post',
        url: `/template`,
    })
}



export {
    getCalcModelApi,
    getTemplateApi,
}