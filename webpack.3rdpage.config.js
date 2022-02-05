/**
 * This webpack config is used apart from Vue to create
 * another set of files that don't have an UI
 */
const path = require("path");

module.exports = {
  entry: {
    kondorIndex: "./src/ts/kondorIndex.ts",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "3rdpage/js"),
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [{ test: /\.ts$/, loader: "ts-loader" }],
  },
  optimization: {
    minimize: false,
  },
  externals: {
    "cross-fetch": "fetch",
  },
};
