const fs = require("fs");
const path = require("path");
const pkgUp = require("pkg-up");

const root = path.dirname(pkgUp.sync());

const paths = {
  root,
  package: path.resolve(root, "./package.json"),
  gitignore: path.resolve(root, "./.gitignore"),
  yarnLock: path.resolve(root, "./yarn.lock"),
  packageLock: path.resolve(root, "./package-lock.json")
};

module.exports.packageManager = fs.existsSync(paths.yarnLock)
  ? "yarn"
  : fs.existsSync(paths.packageLock)
  ? "npm"
  : null;
