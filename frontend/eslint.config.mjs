import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "warn",
    },
  },
  {
    ignores: [".next/**", "node_modules/**", "out/**", "coverage/**", "playwright-report/**"],
  },
];

export default config;
