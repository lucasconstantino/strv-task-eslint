const fs = require("fs");
const path = require("path");
const pkgUp = require("pkg-up");
const { execSync } = require("child_process");
const kleur = require("kleur");
const parameters = require("./lib/parameters");
const { packageManager } = require("./lib/manager");

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
const task = config => {
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

  // `@typescript-eslint/parser` is already a dependency on @strv/typescript,
  // meaning we don't have to manually install it.
  if (parser === "babel-eslint") {
    dependencies.push("babel-eslint");
  }

  if (parser === "@typescript-eslint/parser") {
    dependencies.push("typescript");
    eslintrc.set("parserOptions", { project: "./tsconfig.json" });

    // create minimal tsconfig.json
    if (!fs.existsSync(paths.tsconfig)) {
      console.log(
        kleur.yellow(
          "No tsconfig.json was found. We'll run `tsc --init` to ensure a default one is available, but you should probably configure it later."
        )
      );

      execSync("npx tsc --init", { cwd: root });

      console.log(kleur.green("Create tsconfig.json"));
    }
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
    .save();

  // install dependencies
  install(dependencies, { dev: true });
};

task.description = description;
task.parameters = parameters;

module.exports = task;
