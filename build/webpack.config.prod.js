const path = require('path');
const { config: { base, prod } } = require('./config');
const webpackBaseConfig = require('./webpack.config.base');
const { merge } = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');

const MODE = process.env.NODE_ENV || 'production';
const webpackProdConfig = {
	entry: {
		index: path.join(base.entryPath, 'index.js')
	},
	output: {
		path: prod.outputPath,
		filename: pathData => `${pathData.contentHashType === 'javascript' ? 'js' : ''}/[name].js`
	},
	optimization: {
		minimizer: [
			new TerserPlugin({
				extractComments: false
			})
		]
	}
};

module.exports = merge(webpackBaseConfig(MODE), webpackProdConfig);
