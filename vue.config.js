module.exports = {
  transpileDependencies: ["@vue/reactivity"],
  pages: {
    index: {
      entry: "src/index/main.js",
      template: "public/index.html",
      filename: "index.html",
    },
    popup: {
      entry: "src/popup/main.js",
      template: "public/index.html",
      filename: "popup.html",
    },
    options: {
      entry: "src/options/main.js",
      template: "public/index.html",
      filename: "options.html",
    },
  },
};
