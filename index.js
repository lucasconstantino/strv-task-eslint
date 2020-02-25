const fs = require("fs");
const path = require("path");
const pkgUp = require("pkg-up");
const { execSync } = require("child_process");
const parameters = require("./lib/parameters");
const { packageManager } = require("./lib/manager");
const messages = require("./lib/messages");

const {
  json,
  packageJson,
  file,
  lines,
  install,
  uninstall,
  getExtsFromCommand
} = require("mrm-core");

const execCommand = require("mrm-core/src/util/execCommand.js");

const root = path.dirname(pkgUp.sync());

const paths = {
  root,
  package: path.resolve(root, "./package.json"),
  src: path.resolve(root, "./src"),
  source: path.resolve(root, "./source"),
  tsconfig: path.resolve(root, "./tsconfig.json")
};

const { description } = require(paths.package);

const unique = (item, i, arr) => arr.indexOf(item) === i;

const getSourceDir = () =>
  `./${path.relative(
    root,
    [paths.src, paths.source].find(
      file => fs.existsSync(file) && fs.lstatSync(file).isDirectory()
    ) || ""
  )}`;

/**
 * Task definition.
 */
const task = (config, { interactive }) => {
  if (!interactive) {
    console.error(messages.onlyInteractive);
    return process.exit(1);
  }

  const {
    presets,
    ignore,
    extensions,
    manager = packageManager
  } = config.values();

  const pkg = packageJson();
  const eslintrc = json(".eslintrc.json");
  const eslintignore = file(".eslintignore");

  const dependencies = presets
    .map(preset => preset.split(":")[0])
    .filter(unique)
    .concat("eslint");

  const extend = presets.map(preset =>
    preset
      .split(":")
      .pop()
      .replace("eslint-config-", "")
  );

  const parser = extend.includes("@strv/typescript")
    ? "@typescript-eslint/parser"
    : extend.includes("@strv/react")
    ? "babel-eslint"
    : null;

  const useBabelParser = parser === "babel-eslint";
  const useTSparser = parser === "@typescript-eslint/parser";

  if (useBabelParser) {
    dependencies.push("babel-eslint");
  }

  if (useTSparser) {
    dependencies.push("typescript");
    eslintrc.set("parserOptions", { project: "./tsconfig.json" });
  }

  // create .eslintrc.json
  eslintrc.set("extends", extend).save();

  // create .eslintignore
  eslintignore.save(ignore);

  // configure scripts
  pkg
    .setScript(
      "eslint",
      `eslint ${extensions.map(ext => `--ext ${ext}`).join(" ")}`
    )
    .setScript("lint", `${manager} run eslint ${getSourceDir()}`)
    .prependScript("qa", `${manager} run lint`)
    .save();

  // install dependencies
  install(dependencies, { dev: true });

  if (useTSparser && !fs.existsSync(paths.tsconfig)) {
    console.log(messages.noTSConfig);
    // create minimal tsconfig.json
    execSync("npx tsc --init", { cwd: root });
    console.log(messages.createTSConfig);
  }
};

task.description = description;
task.parameters = parameters;

module.exports = task;
