const webpack = require("webpack");
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = env => {
  if (!env) env = { production: false, karma: false };

  let mode = env.production ? "production" : "development";
  let tsconfig = !env.karma ? "tsconfig.json" : "tsconfig.test.json";
  let output = env.production ? "dist" : "dist-test";
  let filename = env.karma ? "[name].[hash].js" : env.production ? "signals.min.js" : "signals.js";

  return {
    mode: mode,

    entry: {
      main: path.join(__dirname, "src/index.ts")
    },

    output: {
      path: path.join(__dirname, output),
      filename: filename,

      libraryTarget: "var",
      library: "SignalsJS"
    },

    devtool: env.production ? undefined : "inline-source-map",

    module: {
      rules: [
        {
          test: /\.ts$/,
          loader: "ts-loader?configFile=" + tsconfig
        },
        {
          test: env.production /* disable this loader for production builds */ ? /^$/ : /^.*(src).*\.ts$/,
          loader: "istanbul-instrumenter-loader",
          query: {
            embedSource: true
          },
          enforce: "post"
        }
      ]
    },

    plugins: env.production ? [] : [new webpack.SourceMapDevToolPlugin({ test: /\.ts$/i })],

    optimization: env.production
      ? {
          concatenateModules: true,
          minimize: true,
          minimizer: [
            new TerserPlugin({
              cache: true,
              parallel: 4,
              terserOptions: {
                output: {
                  comments: false
                }
              }
            })
          ]
        }
      : {},
    resolve: {
      extensions: [".ts", ".js", ".json"]
    }
  };
};
