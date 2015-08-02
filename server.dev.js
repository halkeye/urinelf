'use strict';
var WebpackDevServer = require('webpack-dev-server');
var webpack = require('webpack');
var config = require('./webpack.config');

var PORT = 3000;

//config.devtool = '#eval';
config.devtool = '#inline-source-map';
var compiler = webpack(config);

var server = new WebpackDevServer(compiler, {
  contentBase: config.output.path,
  quiet: false,
  noInfo: false,
  hot: true,
  stats: { colors: true },
  cache: false,
  https: true
});

// 0.0.0.0 listen to all interfaces - localhost...
server.listen(PORT, "0.0.0.0", function () {
  console.log('Listening on ' + PORT);
});
