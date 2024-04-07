const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: './',
  devServer: {
    host: 'localhost',
    allowedHosts: 'all',
    open: true
  },
})
