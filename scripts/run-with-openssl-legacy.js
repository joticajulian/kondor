#!/usr/bin/env node

"use strict";

const { spawnSync } = require("child_process");

const [, , command, ...args] = process.argv;

if (!command) {
  console.error("Usage: node scripts/run-with-openssl-legacy.js <command> [args...]");
  process.exit(1);
}

const majorVersion = Number.parseInt(process.versions.node.split(".")[0], 10);
const existingNodeOptions = process.env.NODE_OPTIONS || "";
const shouldApplyLegacyProvider = majorVersion >= 17 && !existingNodeOptions.includes("--openssl-legacy-provider");

const env = {
  ...process.env,
  ...(shouldApplyLegacyProvider
    ? {
        NODE_OPTIONS: `${existingNodeOptions} --openssl-legacy-provider`.trim(),
      }
    : {}),
};

const result = spawnSync(command, args, {
  stdio: "inherit",
  shell: true,
  env,
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status === null ? 1 : result.status);
