importScripts('spark-md5.js')

function createFileMd5 (file) {
    const blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice
    if(!blobSlice) {
        // 浏览器不兼容处理
         return ''
    }
    let chunkSize = 3 * 1024 * 1024, // 分割文件大小为3MB
        chunks = Math.ceil(file.size / chunkSize),
        currentChunk = 0,
        spark = new SparkMD5.ArrayBuffer(),
        fileReader = new FileReader()
    // return new Promise((resolve)=> {
        const now = new Date()
        fileReader.onload = function (e) {
            spark.append(e.target.result)
            currentChunk++
            if (currentChunk < chunks) {
                self.postMessage({
                    percent: currentChunk / chunks * 100,
                    time: `${(new Date().getTime() - now) / 1000}s`,
                })
                loadNext()
            } else {
                // const r = {
                //     md5: spark.end(),
                //     percent: currentChunk / chunks * 100,
                //     time: `${(new Date().getTime() - now) / 1000}s`,
                // }
                // resolve(r)
                self.postMessage({
                    md5: spark.end(),
                    percent: currentChunk / chunks * 100,
                    time: `${(new Date().getTime() - now) / 1000}s`,
                })
                self.close()
            }
        }
        fileReader.onerror = function (err) {
            self.postMessage({
                error: err || 'error',
                time: `${(new Date().getTime() - now) / 1000}s`,
            })
        }
        function loadNext () {
            let start = currentChunk * chunkSize,
                end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize
            fileReader.readAsArrayBuffer(blobSlice.call(file, start, end))
        }
        loadNext()
    // })
}

onmessage = async function (e) {
    const data = e.data
    createFileMd5(data)
}