import requests from './axios';

function getCalcModelApi() {
    return requests({
        method: 'get',
        url: '/model'
    })
}

function getTemplateApi(data) {
    return requests({
        method: 'post',
        url: `/template`,
        data,
    })
}

function getCheckResultApi(mid) {
    return requests({
        method: 'get',
        url: `/model/${mid}`,
    })
}

function getAnomalieTypeApi(mid) {
    return requests({
        method: 'get',
        url: `/anomalie`,
        data: {mid}
    })
}

function getAnomalieDetailApi(mid) {
    return requests({
        method: 'post',
        url: `/anomalieTable`,
        data: {mid},
    })
}

function getReportOverviewApi(id) {
    return requests({
        method: 'post',
        url: `/report_overview`,
        data: {id},
    })
}



export {
    getCalcModelApi,
    getTemplateApi,
    getCheckResultApi,
    getAnomalieTypeApi,
    getAnomalieDetailApi,
    getReportOverviewApi,
}