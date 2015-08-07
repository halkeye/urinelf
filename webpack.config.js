/*eslint no-var:0 */
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');
var autoprefixer = require('autoprefixer-core');

var isDev = process.env.BUILD_ENV !== 'production';
var sourceMapParam = isDev ? '?sourceMap' : '';

// Plugins to be used only for production build
var prodPlugins = isDev
  ? []
  : [
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.DedupePlugin()
  ];

var NoErrorsPluginBeep = function NoErrorsPluginBeep() {};
NoErrorsPluginBeep.prototype.apply = function apply(compiler) {
  compiler.plugin('should-emit', function (compilation) {
    if (compilation.errors.length > 0) {
      process.stdout.write('Error \x07');
      return false;
    }
  });
  compiler.plugin('compilation', function (compilation) {
    compilation.plugin('should-record', function () {
      if (compilation.errors.length > 0) {
        process.stdout.write('Error \x07');
        return false;
      }
    });
  });
};

var config = {
  context: path.join(__dirname, './src'),
  entry: {
    common: [
      'consolelog',
      'es5-shim',
      'es5-shim/es5-sham',
      'es6-shim',
      'es6-shim/es6-sham',
      'json3'
    ],
    js: [
      'webpack/hot/dev-server',
      './js/main.js'
    ],
    css: [
      'webpack/hot/dev-server',
      './css/main.scss'
    ]
  },
  module: {
    preLoaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules|bower_components|app\/vendor\/.*/,
        loader: 'eslint-loader'
      }
    ],
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loaders: ['babel-loader']
      },
      {
        test: /\.scss$/,
        //loader: ExtractTextPlugin.extract('style',
        loader: 'style!css!sass!postcss?outputStyle=expanded&' + [
          'includePaths[]=' + path.resolve(__dirname, './src'),
          'includePaths[]=' + path.resolve(__dirname, './node_modules')
        ].join('&')
        //)
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style-loader', [
          'css-loader?importLoaders=1' + sourceMapParam.replace('?', '&'),
          'postcss-loader' + sourceMapParam
        ].join('!'))
      },
      { test: /\.txt/, loader: 'text-loader' },
      { test: /\.html/, loader: 'html-loader' },
      { test: /\.mustache$/, loader: 'mustache?minify' },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader?limit=10000&minetype=application/font-woff'
      },
      { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file-loader' },
      { test: /\.(gif|jpg|jpeg|png|webm)$/, loader: 'file-loader' }
    ]
  },
  output: {
    filename: !isDev ? 'js/[name]-[hash].js' : 'js/[name].js',
    path: path.join(__dirname, './dist'),
    publicPath: './'
  },
  plugins: [
    new NoErrorsPluginBeep(),
    new webpack.HotModuleReplacementPlugin(),
    new ExtractTextPlugin(!isDev ? '[name]-[hash].css' : '[name].css'),
    new HtmlWebpackPlugin({ inject: true, template: './src/index.html' })
  ].concat(prodPlugins),
  resolve: { modulesDirectories: ['node_modules'] },
  postcss: [ autoprefixer() ]
};

module.exports = config;
