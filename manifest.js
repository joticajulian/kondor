const fs = require("fs");
const packageJson = require("./package.json");

const manifest = {
  name: "Kondor",
  description: "Koinos Wallet in your browser",
  version: packageJson.version,
  manifest_version: 3,
  permissions: ["storage"],
  background: {
    service_worker: "js/background.js",
  },
  content_scripts: [
    {
      matches: ["https://*/*", "http://*/*"],
      js: ["js/content.js"],
    },
  ],
  action: {
    default_popup: "index.html",
    default_icon: {
      16: "/images/kondor-16.png",
      32: "/images/kondor-32.png",
      48: "/images/kondor-48.png",
      128: "/images/kondor-128.png",
    },
  },
  sandbox: {
    pages: ["sandbox.html"],
  },
  icons: {
    16: "/images/kondor-16.png",
    32: "/images/kondor-32.png",
    48: "/images/kondor-48.png",
    128: "/images/kondor-128.png",
  },
  options_page: "options.html",
};

fs.writeFileSync("./public/manifest.json", JSON.stringify(manifest, null, 2));
