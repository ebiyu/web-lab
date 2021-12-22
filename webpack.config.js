const path = require('path');
const glob = require('glob');
var fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const webpackConfig = {
  entry: { 'common.js': './src/common.js' },
  output: {
    filename: '[name]',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpe?g|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 20000,
              name: '[name].[ext]',
              esModule: false,
            },
          },
        ],
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              additionalData: "@import 'global-imports.scss';",
            },
          },
        ],
      },
    ],
  },
  plugins: [],
};

// cf. https://www.key-p.com/blog/staff/archives/107125
glob.sync('**/*.html', { cwd: 'src' }).forEach((htmlName) => {
  const baseName = path.basename(htmlName, '.html');
  const jsName = baseName + '.js';
  const jsPath = path.resolve('src', jsName);
  const tsName = baseName + '.ts';
  const tsPath = path.resolve('src', tsName);
  const scssName = baseName + '.scss';
  const scssPath = path.resolve('src', scssName);
  const cssName = baseName + '.css';
  const cssPath = path.resolve('src', cssName);

  let chunks = ['common.js'];
  if (fs.existsSync(tsPath)) {
    webpackConfig.entry[jsName] = tsPath;
    chunks.push(jsName);
  } else if (fs.existsSync(jsPath)) {
    webpackConfig.entry[jsName] = jsPath;
    chunks.push(jsName);
  }

  if (fs.existsSync(scssPath)) {
    webpackConfig.entry[scssName + '.js'] = scssPath;
    chunks.push(scssName + '.js');
  } else if (fs.existsSync(cssPath)) {
    webpackConfig.entry[cssName + '.js'] = cssPath;
    chunks.push(cssName + '.js');
  }

  webpackConfig.plugins.push(
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src', htmlName),
      filename: htmlName,
      inject: 'body',
      chunks,
    }),
  );
});

module.exports = webpackConfig;
