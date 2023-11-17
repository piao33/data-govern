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
        timeout: 60 * 30 * 1000,
        onUploadProgress,
        headers: {'Content-Type': 'multipart/form-data'}
    })
}

// 校验数据
function checkDataApi(tableId, planId) {
    return requests({
        method: 'post',
        url: `/govern/checkData`,
        timeout: 60 * 30 * 1000,
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
        timeout: 60 * 30 * 1000,
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
        timeout: 60 * 30 * 1000,
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
        timeout: 60 * 30 * 1000,
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
        timeout: 60 * 30 * 1000,
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
        timeout: 60 * 30 * 1000,
        responseType: 'blob',
        data: {
            planId,
        }
    })
}

// 获取治理结果
function getCheckResultApi(planId) {
    return requests({
        method: 'post',
        url: `/govern/governReportList`,
        data: {
            planId
        }
    })
}

// 获取治理异常分析
function getErrorCountApi(planId) {
    return requests({
        method: 'post',
        url: `/govern/errorCountStat`,
        data: {
            planId
        }
    })
}

// 获取异常筛选项
function getAnomalieTypeApi(planId, errorId) {
    return requests({
        method: 'post',
        url: `/govern/getTableSelect`,
        data: {
            planId,
            errorId
        }
    })
}

// 获取异常详情
function getAnomalieDetailApi(planId, errorId, pageSize, pageNo, tableId=0, errorType='', handleType='') {
    return requests({
        method: 'post',
        url: `/govern/errorDetails`,
        data: {
            planId,
            errorId,
            'page.pageSize': pageSize,
            'page.pageNum': pageNo,
            'page.currentIndex': (pageNo - 1) * pageSize,
            tableId: tableId || 0,
            errorType,
            handleType,
        },
    })
}

// 获取检验情况总览
function getCheckOverviewApi(planId) {
    return requests({
        method: 'post',
        url: `/govern/getCheckResult`,
        data: {planId},
    })
}

// 获取雷达图数据
function getRadarChartApi(planId) {
    return requests({
        method: 'post',
        url: `/govern/errorCountStatEcharts`,
        data: {planId},
    })
}

// 获取散点图数据
function getScatterChartApi(planId) {
    return requests({
        method: 'post',
        url: `/govern/tableStatEcharts`,
        data: {planId},
    })
}

// 获取折线图数据
function getLineChartApi(planId, startDate, endDate, cycleType, tableId=0) {
    return requests({
        method: 'post',
        url: `/govern/computingCycleStatEcharts`,
        data: {
            planId,
            startDate,
            endDate,
            cycleType,
            tableId,
        },
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
    getErrorCountApi,
    getAnomalieTypeApi,
    getAnomalieDetailApi,
    getCheckOverviewApi,
    getRadarChartApi,
    getScatterChartApi,
    getLineChartApi,
}