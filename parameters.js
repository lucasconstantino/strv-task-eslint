const {
  dependencies = {},
  devDependencies = {},
  peerDependencies = {}
} = require("./package.json");

const hasDependency = name =>
  Boolean(
    dependencies[name] || devDependencies[name] || peerDependencies[name]
  );

const stack = {
  type: "select",
  multiple: true,
  message: "Application stack. Select as many as fit.",
  initial() {
    for (const choice of this.choices) {
      if (hasDependency(choice.value)) {
        choice.enabled = true;
      }
    }
  },
  choices: [
    { name: "Node", value: "node" },
    { name: "React", value: "react" },
    { name: "React Native", value: "react-native" },
    { name: "TypeScript", value: "typescript" }
  ],
  result() {
    return this.choices.reduce(
      (stack, { value, enabled }) => ({ ...stack, [value]: enabled }),
      {}
    );
  }
};

const presets = {
  type: "select",
  multiple: true,
  message: "ESLint presets",

  initial() {
    const bases = [
      "eslint-config-prettier",
      "@strv/eslint-config-node",
      "@strv/eslint-config-react",
      "@strv/eslint-config-react-native",
      "@strv/eslint-config-typescript"
    ];

    for (const choice of this.choices) {
      if (bases.includes(choice.name)) {
        choice.enabled = true;
      }
    }
  },

  choices() {
    const stack = this.state.answers.stack;
    const presets = [{ name: "", value: "eslint-config-prettier" }];

    const addPresetVariants = (base, variants) =>
      presets.push(
        ...variants
          .map(name => `${base}${name}`)
          .map(name => ({ name, value: `${base}:${name}` }))
      );

    if (stack.node) {
      addPresetVariants("@strv/eslint-config-node", [
        "",
        "/v10",
        "/v12",
        "/optional",
        "/style"
      ]);
    }

    if (stack.react) {
      addPresetVariants("@strv/eslint-config-react", [
        "",
        "/optional",
        "/style"
      ]);
    }

    if (stack["react-native"]) {
      addPresetVariants("@strv/eslint-config-react-native", [
        "",
        "/optional",
        "/style"
      ]);
    }

    if (stack.typescript) {
      addPresetVariants("@strv/eslint-config-typescript", [
        "",
        "/optional",
        "/style"
      ]);
    }

    return presets;
  },

  result() {
    return this.choices
      .filter(({ enabled }) => enabled)
      .map(({ value }) => value);
  }
};

module.exports = { stack, presets };
