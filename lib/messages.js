const kleur = require("kleur");
const package = require("../package.json");

module.exports = {
  onlyInteractive: kleur.red(
    `${package.name} task can only run in interactive mode`
  ),

  noTSConfig: kleur.yellow(
    "No tsconfig.json was found. We'll run `tsc --init` to ensure a default one is available, but you should probably configure it later."
  ),

  createTSConfig: kleur.green("Create tsconfig.json")
};
