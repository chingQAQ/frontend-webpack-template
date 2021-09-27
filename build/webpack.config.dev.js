const path = require('path');
const { config: { base, dev } } = require('./config');
const webpackBaseConfig = require('./webpack.config.base');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const MODE = 'development';
const webpackDevServer = {
	devServer: {
		contentBase: dev.outputPath,
		port: dev.port,
		publicPath: '/',
		writeToDisk: true,
		watchOptions: {
			ignored: [dev.outputPath]
		},
		stats: {
			excludeModules: [() => ['/sass/']]
		}
	}
};
const webpackDevConfig = {
	entry: {
		index: path.join(base.entryPath, 'index.js')
	},
	output: {
		path: dev.outputPath,
		publicPath: base.publicPath,
		filename: pathData => `${pathData.contentHashType === 'javascript' ? 'js' : ''}/[name].[contenthash].js`
	},
	plugins: [new webpack.HotModuleReplacementPlugin()]
};

module.exports = merge(webpackBaseConfig(MODE), webpackDevServer, webpackDevConfig);
