/**
 * This webpack config is used apart from Vue to create
 * another set of files that don't have an UI
 */
const path = require("path");

module.exports = {
  entry: {
    background: "./src/ts/background.ts",
    content: "./src/ts/content.ts",
    kondorSigner: "./src/ts/kondorSigner.ts",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "public/js"),
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
};
