const blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice

export default class BigUpload {
    md5 = '';
    chunkSize = 1 * 1024 * 1024; // 分割文件大小为3MB
    maxConnect = 4; // 请求并发数量
    connectCount = 0;// 已经连接的请求数量
    uploadResult = []; // 记录上传结果
    maxRetry = 3;// 请求失败最大重试数
    completed_count = 0; // 已完成的请求数
    generate = null;

    
    constructor(file, request, callback) {
        if(!(file instanceof File)){
            throw new Error('BigUpload class accept File type Object')
        }
        this.file = file;
        this.request = request;
        this.generate = this.loadNext();
        this.callback = callback;
        this.filechunks = this.makeFileChunks();
    }

    makeFileChunks () {
        let chunks = Math.ceil(this.file.size / this.chunkSize);
        let filechunks = [];

        for(let i = 0; i < chunks; i++) {
            let start = i * this.chunkSize,
            end = ((start + this.chunkSize) >= this.file.size) ? this.file.size : start + this.chunkSize

            let slicefile = blobSlice.call(this.file, start, end)
            filechunks.push(slicefile)
        }

        return filechunks;
    }

    makeFileMD5() {
        return new Promise((resolve)=>{
            const myworker = new Worker('hash.js')
        
            myworker.postMessage(this.file)
            
            myworker.onmessage = (e) =>{

                if(e.data?.percent === 100 && e.data?.md5) {
                    this.md5 = e.data.md5;
                    resolve(this.md5)
                }
            }
        })
    }


    async startUpload(res) {
        this.generate.next();
        if(res) {
            this.completed_count++;
            res.percent = (this.completed_count / this.filechunks.length).toFixed(2) * 100
        }
        this.callback(res)
    }
    handleApi(index) {
        this.request({index})
            .then(res=>{
                this.connectCount--;
                if(this.uploadResult[index]) {
                    this.uploadResult[index].type = res.msg;
                    this.uploadResult[index].data = res;
                }else{
                    this.uploadResult[index] = {
                        type: 'success',
                        retryNum: 0,
                        data: res
                    }
                }
                this.startUpload(res)
            })
            .catch(err =>{
                if(this.uploadResult?.[index]?.retryNum >= this.maxRetry) {
                    this.connectCount--;
                    return this.startUpload(err);
                }

                if(this.uploadResult[index]){
                    this.uploadResult[index].retryNum += 1
                }else{
                    this.uploadResult[index] = {
                        type: 'error',
                        retryNum: 1,
                        data: err
                    }
                }
                this.handleApi(index)
            })
            .finally(()=>{
                
            })
    }
    /**
     * 同时上传 maxConnect 数量的文件，任意 api 有返回结果，（失败重试，成功则开始下一个上传任务）。
     */
    * loadNext() {
        this.connectCount = 0;
        for(var i = 0; i < this.filechunks.length; i++) {
            this.connectCount++
            if(this.connectCount > this.maxConnect) {
                yield;
            }
            this.handleApi(i);
        }
        yield * new Array(this.maxConnect)
        console.log('connectCount:', this.connectCount)
        console.log('uploadresult:', this.uploadResult)
    }
}


// 调用示例：

// function mockApi(data) {
//     return new Promise((resolve, reject)=>{
//         setTimeout(() => {
//             if(Math.random() < 0.2) {
//                 reject({code: 500, msg: 'error', index: data.index})
//             }else{
//                 resolve({code: 200, msg: 'success', index: data.index})
//             }
//         }, (Math.random()* 2 + 1) * 1000);
//     })
// }
// function callback(res) {
//     console.log('callback', res)
// }
// let bupload = new BigUpload(this.testFile, mockApi, callback);
// bupload.startUpload();
