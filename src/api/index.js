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

// 导入数据
function uploadFileApi({file, planId=1, tableId=1, onUploadProgress}) {
    return requests({
        method: 'post',
        url: `/govern/importData`,
        // url: `/upload`,
        data: {
            file, planId, tableId
        },
        timeout: 60 * 10 * 1000,
        onUploadProgress,
        headers: {'Content-Type': 'multipart/form-data'}
    })
}

// 校验数据
function checkDataApi(tableId, planId) {
    return requests({
        method: 'post',
        url: `/govern/checkData`,
        timeout: 60 * 10 * 1000,
        data: {
            tableId,
            planId,
        }
    })
}

// 批量校验数据
function checkAllDataApi(planId) {
    return requests({
        method: 'post',
        url: `/govern/checkAllData`,
        timeout: 60 * 10 * 1000,
        data: {
            planId,
        }
    })
}

// 删除数据
function deleteDataApi(tableId, planId) {
    return requests({
        method: 'post',
        url: `/govern/delData`,
        timeout: 20 * 1000,
        data: {
            tableId,
            planId,
        }
    })
}

// 批量删除数据
function deleteAllDataApi(planId) {
    return requests({
        method: 'post',
        url: `/govern/delAllData`,
        timeout: 20 * 1000,
        data: {
            planId,
        }
    })
}

// 导出数据
function downloadDataApi(tableId, planId) {
    return requests({
        method: 'post',
        url: `/govern/export`,
        timeout: 60 * 10 * 10000,
        responseType: 'blob',
        data: {
            tableId,
            planId,
        }
    })
}

// 批量导出数据
function downloadAllDataApi(planId) {
    return requests({
        method: 'post',
        url: `/govern/exportAll`,
        timeout: 60 * 10 * 10000,
        responseType: 'blob',
        data: {
            planId,
        }
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
    uploadFileApi,
    checkDataApi,
    checkAllDataApi,
    deleteDataApi,
    deleteAllDataApi,
    downloadDataApi,
    downloadAllDataApi,

    getCheckResultApi,
    getAnomalieTypeApi,
    getAnomalieDetailApi,
    getReportOverviewApi,
}