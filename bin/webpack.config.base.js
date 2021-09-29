const { config: { base, dev, prod }, htmlLinks, htmlMetas } = require('./config');
const { resolve } = require('./util');
const { join } = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackTagsPlugin = require('html-webpack-tags-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const globImporter = require('node-sass-glob-importer');

module.exports = mode => ({
	stats: {
		all: false,
		colors: true,
		modules: false,
		entrypoints: false,
		nestedModulesSpace: 15,
		assets: true,
		errors: true,
		performance: true
		// preset: 'verbose'
	},
	mode,
	devtool: mode === 'production' ? false : 'inline-source-map',
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env']
					}
				}
			},
			{
				test: /\.s[ac]ss$/i,
				use: [
					{
						loader: MiniCssExtractPlugin.loader
					},
					{
						loader: 'css-loader',
						options: {
							sourceMap: mode === 'production'
						}
					},
					{
						loader: 'postcss-loader',
						options: {
							postcssOptions: {
								config: resolve('build', 'postcss.config.js')
							}
						}
					},
					{
						loader: 'sass-loader',
						options: {
							sassOptions: {
								importer: globImporter()
							},
							additionalData: `
                  @import "@/assets/sass/utilities/index.scss";
                `
						}
					}
				]
			},
			{
				test: /\.css$/i,
				use: [
					'style-loader',
					'css-loader',
					{
						loader: 'postcss-loader',
						options: {
							postcssOptions: {
								config: resolve('build', 'postcss.config.js')
							}
						}
					}
				]
			},
			{
				test: /\.(png|jpe?g|gif|svg|webp)(\?.*)?$/i,
				use: [
					{
						loader: 'url-loader',
						options: {
							limit: 1024,
							name: '[name].[ext]',
							outputPath: 'images'
						}
					}
				]
			}
		]
	},
	resolve: {
		extensions: base.resolveExtensions,
		alias: {
			'@': resolve('src')
		}
	},
	plugins: [
		// new CopyWebpackPlugin({
		// patterns: [
		// static assets 如果不想被 webpack 壓縮，可以在這裡設定，在 build 的時候會將資料直接搬移至 endpoint
		// { from: ./path, to: ./path }
		// ]
		// }),
		new ImageMinimizerPlugin({
			minimizerOptions: {
				plugins: [
					['gifsicle', { interlaced: true, optimizationLevel: 3 }],
					['jpegtran', { progressive: true }],
					['pngquant', { quality: [0.7, 0.95] }],
					[
						'svgo',
						{
							plugins: [
								{
									name: 'preset-default',
									params: {
										overrides: {
											removeViewBox: {
												active: false,
											},
											addAttributesToSVGElement: {
												attributes: [{ xmlns: 'http://www.w3.org/2000/svg' }]
											}
										},
									},
								}
							]
						}
					]
				]
			}
		}),
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: resolve('public', 'index.html'),
			templateParameters: {
				documentTitle: base.documentTitle
			},
			inject: false,
			minify: mode === 'production'
		}),
		new MiniCssExtractPlugin({
			filename: `css/style${mode === 'production' ? '' : '.[contenthash]'}.css`
		}),
		new HtmlWebpackTagsPlugin({
			links: htmlLinks,
			metas: htmlMetas
		}),
		new CleanWebpackPlugin({
			cleanOnceBeforeBuildPatterns: [mode === 'production' ? join(prod.outputPath, '**') : join(dev.outputPath, '**')]
		})
	]
});
