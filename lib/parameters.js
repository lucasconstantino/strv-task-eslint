const fs = require("fs");
const path = require("path");
const pkgUp = require("pkg-up");
const { packageManager } = require("./manager");

const root = path.dirname(pkgUp.sync());

const paths = {
  root,
  package: path.resolve(root, "./package.json"),
  gitignore: path.resolve(root, "./.gitignore")
};

const {
  dependencies = {},
  devDependencies = {},
  peerDependencies = {}
} = require(paths.package);

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
  message: "Presets. Select as many as fit.",

  choices: ({ stack }) => {
    const presets = [
      { name: "prettier", value: "eslint-config-prettier", checked: true }
    ];

    const addPresetVariants = (base, variants) =>
      presets.push(
        ...variants
          .map(name => `${base}${name}`)
          .map(name => ({
            name: name.replace("eslint-config-", ""),
            value: `${base}:${name}`,
            checked: name === base
          }))
      );

    if (stack.includes("react")) {
      presets.push({
        name: "prettier/react",
        value: "eslint-config-prettier:eslint-config-prettier/react",
        checked: true
      });

      addPresetVariants("@strv/eslint-config-react", [
        "",
        "/optional",
        "/style"
      ]);
    }

    if (stack.includes("node")) {
      addPresetVariants("@strv/eslint-config-node", [
        "",
        "/v10",
        "/v12",
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

const extensions = {
  type: "checkbox",
  message: "Lint",
  choices: ({ stack }) => {
    const extensions = [".js"];
    const react = stack.includes("react");
    const typescript = stack.includes("typescript");

    if (react) extensions.push(".jsx");
    if (typescript) extensions.push(".ts");
    if (react && typescript) extensions.push(".tsx");

    return extensions.map(name => ({ name, checked: true }));
  }
};

const gitignore = fs.existsSync(paths.gitignore)
  ? fs.readFileSync(paths.gitignore, "utf-8")
  : "";

const ignores = ["node_modules"]
  .filter(pattern => !gitignore.includes(pattern))
  .join("\n");

const ignore = {
  type: "editor",
  message: "ESLint ignore content",
  default:
    ignores +
    (ignores && gitignore ? "\n\n" : "") +
    (gitignore ? `# copied from .gitignore:\n${gitignore}` : "")
};

const manager = {
  type: "list",
  message: "What package manager should we use?",
  choices: ["npm", "yarn"],
  default: packageManager,
  when: !packageManager
};

module.exports = { stack, presets, extensions, ignore, manager };
