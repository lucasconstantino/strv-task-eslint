/* eslint-disable no-process-exit, no-sync */
"use strict";

const fs = require("fs");
const path = require("path");
const pkgUp = require("pkg-up");
const parameters = require("./lib/parameters");
const { packageManager } = require("./lib/manager");
const messages = require("./lib/messages");

const { json, packageJson, file, install } = require("mrm-core");

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
      filePath =>
        fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory()
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
    stack,
    presets,
    ignore,
    extensions,
    manager = packageManager
  } = config.values();

  const pkg = packageJson();
  const eslintrc = json(".eslintrc.json");
  const eslintignore = file(".eslintignore");
  const tsconfig = json("tsconfig.json");
  const source = getSourceDir();
  const sourceAbs = source.replace(/^\.\//u, "");

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
  eslintrc
    .set("root", true)
    .set("extends", extend)
    .save();

  // create .eslintignore
  eslintignore.save(ignore);

  // configure scripts
  pkg
    .setScript(
      "eslint",
      `eslint ${extensions.map(ext => `--ext ${ext}`).join(" ")}`
    )
    .setScript("lint", `${manager} run eslint ${source}`)
    .prependScript("qa", `${manager} run lint`)
    .save();

  // install dependencies
  install(dependencies, { dev: true });

  if (useTSparser && !fs.existsSync(paths.tsconfig)) {
    // create tsconfig.json
    tsconfig
      .merge({
        compilerOptions: {
          allowJs: extensions.includes(".js") || extensions.includes(".jsx"),
          jsx: "preserve",
          lib: ["es2017", "ESNext"].concat(
            // browser based
            stack.includes("react") ? ["dom"] : []
          ),
          module: "esnext",
          moduleResolution: "node",
          noEmit: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          preserveConstEnums: true,
          removeComments: false,
          skipLibCheck: true,
          sourceMap: true,
          strict: true,
          target: "esnext",
          noImplicitAny: true,
          noImplicitThis: true,
          suppressImplicitAnyIndexErrors: true,
          strictFunctionTypes: true,
          esModuleInterop: true,
          resolveJsonModule: true,
          pretty: true,
          forceConsistentCasingInFileNames: true
        },
        include: [sourceAbs]
      })
      .save();
  }
};

task.description = description;
task.parameters = parameters;

module.exports = task;
