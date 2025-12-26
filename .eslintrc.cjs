module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module"
  },
  extends: ["eslint:recommended"],
  ignorePatterns: [
    "assets/js/dist/**",
    "assets/js/ui-react/**",
    "node_modules/**",
    "ui-react/**",
    "src/**/*.ts",
    "usage-logs/**"
  ],
  overrides: [
    {
      files: ["service-worker.js"],
      env: { serviceworker: true }
    }
  ]
};
