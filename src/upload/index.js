const blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice

export default class BigUpload {
    md5 = '';
    chunkSize = 1 * 1024 * 1024; // 分割文件大小为3MB
    maxConnect = 4; // 请求并发数量
    currentChunk = 0;
    generate = null;
    
    constructor(file) {
        if(!(file instanceof File)){
            throw new Error('BigUpload class acept File type Object')
        }
        this.file = file;
        this.filechunks = this.makeFileChunks();
        console.log(this.filechunks)
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
                    console.log(this.md5)
                    resolve(this.md5)
                }
            }
        })
    }

    mockApi(data) {
        return new Promise(resolve=>{
            setTimeout(() => {
                console.log('mockapi', data.index)
                resolve({code: 200, msg: 'success', index: data.index})
            }, (Math.random()* 2 + 1) * 1000);
        })
    }

    async sliceUpload() {
        this.generate = this.loadNext();
        this.generate.next();
    }

    * loadNext() {
        let result = []
        let runtimeApi = 0;
        for(let i = 0; i < this.filechunks.length; i++) {
            runtimeApi++;
            console.log('index', i, runtimeApi)
            
            this.mockApi({index:i}).then(res=>{
                result.push(res)
                if(runtimeApi >= this.maxConnect){
                    this.generate.next()
                    this.runtimeApi --;
                }
            })
            if(runtimeApi >= this.maxConnect) {
                yield;
            }
        }
    }
}



// function computedMD5(file) {
//     return new Promise((resolve, reject) => {
//         const spark = new SparkMD5.ArrayBuffer()
//         const reader = new FileReader()
//         const chunks = getFileChuncks(file.size)
//         let current_chunk = 0
//         reader.onload = (e) => {
//             spark.append(e?.target?.result)
//             current_chunk++
//             if(current_chunk < chunks.length) {
//                 loadNext()
//             }else {
//                 resolve(spark.end())
//             }
//         }
//         reader.onerror = (error) => {
//             console.log(error)
//             reject('computed fail')
//         }
//         function loadNext() {
//             const start = (Math.ceil(chunks[current_chunk] / CHUNK_SIZE) - 1) * CHUNK_SIZE
//             const end = chunks[current_chunk]
//             reader.readAsArrayBuffer(slice.call(file, start, end))
//         }
//         loadNext()
//     })
// }


