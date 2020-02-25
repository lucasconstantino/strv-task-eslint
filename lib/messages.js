const kleur = require("kleur");

const noTSConfig = kleur.yellow(
  "No tsconfig.json was found. We'll run `tsc --init` to ensure a default one is available, but you should probably configure it later."
);

const createTSConfig = kleur.green("Create tsconfig.json");

module.exports = { noTSConfig, createTSConfig };
