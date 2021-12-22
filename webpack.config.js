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
  plugins: [],
};

// cf. https://www.key-p.com/blog/staff/archives/107125
glob.sync("**/*.js", { cwd: "src" }).forEach((jsName) => {
  const htmlName = path.basename(jsName, ".js") + ".html";
  const htmlPath = path.resolve(__dirname, "src", htmlName);

  // htmlが存在するときのみ処理を行う
  if (fs.existsSync(htmlPath)) {
    // js
    webpackConfig.entry[jsName] = path.resolve("src", jsName);
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
