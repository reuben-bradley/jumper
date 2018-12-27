const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: 'development',
    entry: {
        game: path.resolve(__dirname, 'src/js/index.js')
    },
    output: {
        path: path.resolve(__dirname, 'static/js'),
        filename: 'bundle.js'
    },
    devServer: {
        contentBase: path.resolve(__dirname, 'static'),
        publicPath: '/js/',
        host: '0.0.0.0',
        port: 5656
    },
    plugins: [
        new webpack.DefinePlugin({
            'CANVAS_RENDERER': JSON.stringify(true),
            'WEBGL_RENDERER': JSON.stringify(true)
        }),
    ],
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]phaser[\\/]/,
                    name: 'vendor',
                    chunks: 'all'
                }
            }
        }
    }
};
