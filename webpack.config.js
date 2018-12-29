/**
 * @file 打包配置
 */

const webpack = require('webpack');
const path = require('path');

const devConfig = {
    entry: {
        app: './index.js'
    },
    output: {
        path: path.join(__dirname, 'dist'),
        // filename: 'fec.min.[chunkhash:8].js',
        filename: 'fec.min.js',
    },
    module: {
        rules: [{
            exclude: /node_modules/,
            test: /\.js$/,
            loader: 'babel-loader'
        }]
    } 
}

module.exports = devConfig;