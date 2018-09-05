const path = require('path');
const webpack = require('webpack');
const HappyPack = require('happypack');

console.log(path.resolve(__dirname, 'app.ts'));
module.exports = {
  mode: 'production',
  entry: [
    path.resolve(__dirname, 'src/app.ts')
  ],
  target: 'node',
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              happyPackMode: true
            }
          }
        ],
      }
    ]
  },
  plugins: [
    new HappyPack({
      loaders: ['ts-loader'],
    }),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.LoaderOptionsPlugin({
      debug: false,
    }),
  ],
  bail: true,
};