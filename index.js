const {
  json,
  packageJson,
  lines,
  install,
  uninstall,
  getExtsFromCommand
} = require("mrm-core");

const { description } = require("./package.json");

/**
 * Task definition.
 */
const task = config => {
  const { presets } = config.values();
};

task.description = description;
task.parameters = require("./parameters");

module.exports = task;
