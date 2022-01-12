const path = require("path");

module.exports = {
  entry: {
    background: "./src/ts/background.ts",
    content: "./src/ts/content.ts",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist/js"),
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
