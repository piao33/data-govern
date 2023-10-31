import requests from './axios';

// 获取计算模式
function getCalcModelApi() {
    return requests({
        method: 'get',
        url: '/dict/getDictList/bus_compute_mode',
    })
}
// 获取计算周期的季节
function getSeasonApi() {
    return requests({
        method: 'get',
        url: '/dict/getDictList/bus_season',
    })
}

// 获取关联计算模式的原始表
function getTemplateApi(computeMode) {
    return requests({
        method: 'post',
        url: `/plan/computeModeOfTables/${computeMode}`,
    })
}

// 保存方案
function savePlanApi(computeMode, year, season, planId=1) {
    return requests({
        method: 'post',
        url: `/plan/addComputeModeOfOriginal`,
        data: {
            computeMode,
            planId,
            season,
            year,
        }
    })
}

// 获取方案
function getPlanApi(planId=1) {
    return requests({
        method: 'post',
        url: `/plan/selectComputeModeOfTables/${planId}`,
    })
}


function getCheckResultApi(mid) {
    return requests({
        method: 'get',
        url: `https://mock.apifox.cn/m1/3432133-0-default/model/${mid}`,
    })
}

function getAnomalieTypeApi(mid) {
    return requests({
        method: 'get',
        url: `https://mock.apifox.cn/m1/3432133-0-default/anomalie`,
        data: {mid}
    })
}

function getAnomalieDetailApi(mid) {
    return requests({
        method: 'post',
        url: `https://mock.apifox.cn/m1/3432133-0-default/anomalieTable`,
        data: {mid},
    })
}

function getReportOverviewApi(id) {
    return requests({
        method: 'post',
        url: `https://mock.apifox.cn/m1/3432133-0-default/report_overview`,
        data: {id},
    })
}



export {
    getCalcModelApi,
    getSeasonApi,
    getTemplateApi,
    savePlanApi,
    getPlanApi,
    
    getCheckResultApi,
    getAnomalieTypeApi,
    getAnomalieDetailApi,
    getReportOverviewApi,
}