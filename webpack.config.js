const path = require("path");
const glob = require("glob");
var fs = require("fs");
// const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const webpackConfig = {
  entry: { "common.js": "./src/common.js" },
  output: {
    filename: "[name]",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [],
};

// cf. https://www.key-p.com/blog/staff/archives/107125
glob.sync("**/*(*.js|*.ts)", { cwd: "src" }).forEach((scriptName) => {
  const scriptBaseName = path.basename(path.basename(scriptName, ".js"), ".ts");
  const jsName = scriptBaseName + ".js";
  const htmlName = scriptBaseName + ".html";
  const htmlPath = path.resolve(__dirname, "src", htmlName);

  // htmlが存在するときのみ処理を行う
  if (fs.existsSync(htmlPath)) {
    // js
    webpackConfig.entry[jsName] = path.resolve("src", scriptName);
    // html
    webpackConfig.plugins.push(
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "src", htmlName),
        filename: htmlName,
        inject: "body",
        chunks: ["common.js", jsName],
      })
    );
  }
});

module.exports = webpackConfig;
