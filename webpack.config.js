const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
require("dotenv").config();

module.exports = {
  entry: "./src/main.tsx",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.[contenthash].js",
    clean: true,
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpe?g|webp|svg)$/i,
        type: "asset/resource",
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
    new webpack.DefinePlugin({
      "import.meta.env.VITE_LLM_API_KEY": JSON.stringify(
        process.env.VITE_LLM_API_KEY || ""
      ),
      "import.meta.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "development"
      ),
    }),
  ],
  devServer: {
    port: 4173,
    host: "0.0.0.0",
    historyApiFallback: true,
    static: {
      directory: path.join(__dirname, "public"),
    },
  },
};
