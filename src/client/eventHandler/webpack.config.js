let path = require('path')
let webpack = require('webpack')

const MinifyPlugin = require('babel-minify-webpack-plugin');

module.exports = {
    entry: "./registrator.js",
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: "client.js",
        libraryTarget: 'var',
        library: 'registrator'
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            }
    }]},
    plugins: [ new MinifyPlugin() ]
}
