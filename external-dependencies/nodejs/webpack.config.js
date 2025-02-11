const path = require("path")
const CopyPlugin = require("copy-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")

module.exports = {
	context: path.resolve("../../opt/nodejs"),
	entry: {
		index: "./src/index.tsx", // Ensure this is correct based on your new folder structure
	},
	mode: "production",
	target: "web",
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
		extensions: [".tsx", ".ts", ".js"],
		modules: [path.resolve("../../opt/nodejs/node_modules"), "node_modules"],
	},
	output: {
		path: path.join(__dirname, "dist"),
		filename: "[name].js",
	},
}
