"use strict";

const kleur = require("kleur");
const packageJson = require("../package.json");

module.exports = {
  onlyInteractive: kleur.red(
    `${packageJson.name} task can only run in interactive mode`
  )
};
