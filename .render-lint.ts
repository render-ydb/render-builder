import { LintConfig } from "@x.render/render-lint";

const lintConfig: LintConfig = {
  eslint: {
    type: "common-ts",
  },
  commitlint: {
    type: "common",
  },
};
export default lintConfig;
