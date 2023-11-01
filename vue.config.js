module.exports = {
  transpileDependencies: true,
  devServer: {
    port: 8080,
    allowedHosts: 'all',
    proxy: {
      '/dict': {
        target: 'http://192.168.1.43:9001',
        changeOrigin: true,
      },
      '/plan': {
        target: 'http://192.168.1.43:9001',
        changeOrigin: true,
      },
    }
  }
}
