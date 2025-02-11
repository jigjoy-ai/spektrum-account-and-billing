import { createFsFromVolume, Volume } from "memfs";
import { webpack } from "webpack";
import { code } from "./source-code";
import * as fs from "fs";
import { ufs } from "unionfs";

const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const CopyPlugin = require("copy-webpack-plugin")

export const buildSourceCode = async () => {
  const files = code;

  const memoryVolume = Volume.fromJSON(files);

  const memfs = createFsFromVolume(memoryVolume);

  ufs.use(fs).use(memfs as any);

  console.log("📂 Virtual Filesystem Structure:", ufs.readdirSync(__dirname));


  const compiler = webpack({
    entry: {
      index: "./src/index.tsx",
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
              presets: [
                "@babel/preset-env",
                ["@babel/preset-react", { runtime: "automatic" }],
                "@babel/preset-typescript",
              ],
            },
          },
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader", "postcss-loader"],
        },
      ],
    },
    plugins: [
      new CopyPlugin({
        patterns: [{ from: "./public/favicon.ico" }],
      }),
      new HtmlWebpackPlugin({
        template: "./public/index.html", // Path to your HTML file
        filename: "index.html", // Output file name
      }),
    ],
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    output: {
      path: path.join(__dirname, "dist"),
      filename: "[name].js",
    },
  });

  compiler.inputFileSystem = ufs as any;

  compiler.run((err, stats) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(stats?.toString({ colors: true }));
  });

  // Close the compiler after the process
  compiler.close(() => {
    console.log("Compiler closed.");
  });

};