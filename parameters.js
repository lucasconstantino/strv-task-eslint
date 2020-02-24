const fs = require("fs");
const path = require("path");
const pkgUp = require("pkg-up");

const {
  dependencies = {},
  devDependencies = {},
  peerDependencies = {}
} = require("./package.json");

const root = path.dirname(pkgUp.sync());

const paths = {
  root,
  gitignore: path.resolve(root, "./.gitignore")
};

const hasDependency = name =>
  Boolean(
    dependencies[name] || devDependencies[name] || peerDependencies[name]
  );

const stack = {
  type: "checkbox",
  multiple: true,
  message: "Application stack. Select as many as fit.",
  // prettier-ignore
  choices: [
    { name: "Node", value: "node", checked: hasDependency("node") },
    { name: "React", value: "react", checked: hasDependency("react") },
    { name: "React Native", value: "react-native", checked: hasDependency("react-native") },
    { name: "TypeScript", value: "typescript", checked: hasDependency("typescript") }
  ]
};

const presets = {
  type: "checkbox",
  multiple: true,
  message: "ESLint presets",

  choices({ stack }) {
    const presets = [
      { name: "", value: "eslint-config-prettier", checked: true }
    ];

    const addPresetVariants = (base, variants) =>
      presets.push(
        ...variants
          .map(name => `${base}${name}`)
          .map(name => ({
            name,
            value: `${base}:${name}`,
            checked: name === base
          }))
      );

    if (stack.includes("node")) {
      addPresetVariants("@strv/eslint-config-node", [
        "",
        "/v10",
        "/v12",
        "/optional",
        "/style"
      ]);
    }

    if (stack.includes("react")) {
      addPresetVariants("@strv/eslint-config-react", [
        "",
        "/optional",
        "/style"
      ]);
    }

    if (stack.includes("react-native")) {
      addPresetVariants("@strv/eslint-config-react-native", [
        "",
        "/optional",
        "/style"
      ]);
    }

    if (stack.includes("typescript")) {
      addPresetVariants("@strv/eslint-config-typescript", [
        "",
        "/optional",
        "/style"
      ]);
    }

    return presets;
  }
};

const ignore = {
  type: "editor",
  message: "ESLint ignore content",
  default: fs.existsSync(paths.gitignore)
    ? "# copied from .gitignore:\n" + fs.readFileSync(paths.gitignore, "utf-8")
    : undefined
};

module.exports = { stack, presets, ignore };
