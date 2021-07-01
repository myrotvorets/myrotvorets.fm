module.exports = function(api) {
  api.cache(() => [process.env.NODE_ENV || 'development', process.env.BUILD_SSR || 'false'].join(':'));

  const config = {
    "presets": [
      "@babel/preset-typescript",
      [
        "@babel/env",
        {
          "modules": false,
          "loose": true,
          "exclude": ["transform-regenerator", "transform-async-to-generator"]
        }
      ],
    ],
    "plugins": [
      ["@babel/plugin-transform-react-jsx", {
        "pragma": "h",
        "pragmaFrag": "Fragment"
      }],
      process.env.BUILD_SSR ? ["babel-plugin-dynamic-import-node-sync"] : null,
      ["@babel/plugin-proposal-class-properties", { "loose": true }],
      ["@babel/plugin-proposal-optional-chaining", { "loose": true }],
      ["@babel/plugin-proposal-nullish-coalescing-operator", { "loose": true }],
      ["@babel/plugin-proposal-private-methods", { "loose": true }],
      ["module:fast-async"]
    ].filter(Boolean)
  };

  return config;
}
