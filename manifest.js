const fs = require("fs");
const dotenv = require("dotenv");
const packageJson = require("./package.json");
dotenv.config();

const testMode = process.argv[2] === "development";

const icons = {
  16: testMode ? "/images/kondor-dev-16.png" : "/images/kondor-16.png",
  32: testMode ? "/images/kondor-dev-32.png" : "/images/kondor-32.png",
  48: testMode ? "/images/kondor-dev-48.png" : "/images/kondor-48.png",
  128: testMode ? "/images/kondor-dev-128.png" : "/images/kondor-128.png",
};

const manifest = {
  name: "Kondor",
  description: "Koinos Wallet in your browser",
  version: testMode ? "0.0.0" : packageJson.version,
  manifest_version: 3,
  permissions: ["storage", "system.display"],
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
    default_icon: icons,
  },
  sandbox: {
    pages: ["sandbox.html"],
  },
  icons,
  options_page: "options.html",
};

fs.writeFileSync("./public/manifest.json", JSON.stringify(manifest, null, 2));
