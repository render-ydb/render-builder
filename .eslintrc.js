const { getESLintConfig } = require("@x.render/render-lint");
module.exports = getESLintConfig("common-ts", {
  rules: {
    "@typescript-eslint/no-invalid-void-type": "off",
    "@typescript-eslint/no-require-imports": "off",
    "new-cap": "off",
    "import/no-cycle": "off",
    "@typescript-eslint/no-useless-constructor": "off",
    "comma-dangle": "off",
    "no-await-in-loop": "off",
  },
});
