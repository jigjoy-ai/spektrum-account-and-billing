const path = require("path")
const CopyPlugin = require("copy-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const TerserPlugin = require("terser-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

module.exports = {
	context: path.resolve("../../opt/nodejs"),
	entry: {
		index: path.resolve(__dirname, "src/index.tsx"),
	},
	mode: "production",
	module: {
		rules: [
			{
				test: /\.(tsx|ts|js)$/,
				use: {
					loader: "babel-loader",
					options: {
						presets: ["@babel/preset-env", ["@babel/preset-react", { runtime: "automatic" }], "@babel/preset-typescript"],
					},
				},
				exclude: /node_modules/,
			},        
			{
				test: /\.css$/,
				use: ["style-loader", "css-loader", "postcss-loader"],
			  },
		],
	},
	plugins: [
		new CopyPlugin({
			patterns: [
				{
					from: path.resolve(__dirname, "public/favicon.ico"),
					to: path.resolve(__dirname, "dist/favicon.ico"),
				},
			],
		}),
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, "public/index.html"),
			filename: "index.html",
		}),
	],
	resolve: {
		extensions: [".js", ".jsx", ".ts", ".tsx", ".css"],
	},
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				extractComments: false,
				terserOptions: {
					format: {
						comments: false,
					},
				},
			}),
		],
	},
	output: {
		path: path.join(__dirname, "dist"),
		filename: "[name].js",
	},
}
