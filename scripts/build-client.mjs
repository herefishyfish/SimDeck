#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const clientDir = path.join(rootDir, "packages", "client");

if (!fs.existsSync(path.join(clientDir, "node_modules"))) {
  runNpm(["install", "--prefix", clientDir]);
}

runNpm(["run", "--prefix", clientDir, "build"]);

const devtoolsFrontend = path.join(
  rootDir,
  "node_modules",
  "@react-native",
  "debugger-frontend",
  "dist",
  "third-party",
  "front_end",
);
if (fs.existsSync(devtoolsFrontend)) {
  const destination = path.join(clientDir, "dist", "chrome-devtools-ui");
  fs.rmSync(destination, { force: true, recursive: true });
  fs.cpSync(devtoolsFrontend, destination, { recursive: true });
}

function runNpm(args) {
  const npmCli = process.env.npm_execpath;
  const result = npmCli
    ? spawnSync(process.execPath, [npmCli, ...args], {
        cwd: rootDir,
        stdio: "inherit",
      })
    : spawnSync(process.platform === "win32" ? "npm.cmd" : "npm", args, {
        cwd: rootDir,
        shell: process.platform === "win32",
        stdio: "inherit",
      });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
