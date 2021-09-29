const path = require('path');
const { config: { base, dev } } = require('./config');
const webpackBaseConfig = require('./webpack.config.base');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const MODE = 'development';
const webpackDevServer = MODE === 'development' ? {
	devServer: {
		'static': {
			directory: dev.outputPath,
			publicPath: '/'
		},
		'port': dev.port,
		'devMiddleware': {
			headers: {
				'Cache-Control': 'no-store'
			},
			writeToDisk: true,
			publicPath: '/'
		},
		'watchFiles': {
			paths: ['src/**/*', 'public/**/*'],
			options: {
				usePolling: false,
			}
		},
		'onListening': function (devServer) {
			if (!devServer) {
				throw new Error('webpack-dev-server is not defined');
			}

			const port = devServer.server.address().port;
			console.log('Listening on port:', port);
		},
	}
} : {};
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
