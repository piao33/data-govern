module.exports = {
  transpileDependencies: true,
  devServer: {
    port: 8080,
    allowedHosts: 'all',
    proxy: {
      '/dict': {
        target: 'http://192.168.1.22:9001',
        changeOrigin: true,
      },
      '/plan': {
        target: 'http://192.168.1.22:9001',
        changeOrigin: true,
      },
      '/upload': {
        target: 'http://192.168.1.16:8000',
        changeOrigin: true,
      },
      '/govern': {
        target: 'http://192.168.1.22:9001',
        changeOrigin: true,
      }
    }
  }
}
