#!/usr/bin/env node

const path = require("path");
const { spawn } = require("child_process");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const argv = yargs(hideBin(process.argv))
  .option("path", {
    alias: "p",
    type: "string",
    description: "Path to save downloads",
    default: process.cwd(),
  })
  .help().argv;

// Path to the original mkbsd.js script
const scriptPath = path.join(__dirname, "mkbsd.js");

// Set the working directory to the specified path
process.chdir(argv.path);

// Run the original script
const child = spawn("node", [scriptPath], {
  stdio: "inherit",
  env: { ...process.env, DOWNLOAD_PATH: argv.path },
});

child.on("error", (error) => {
  console.error(`Error running script: ${error.message}`);
  process.exit(1);
});

child.on("close", (code) => {
  process.exit(code);
});
