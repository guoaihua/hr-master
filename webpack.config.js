const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const isProd = process.env.NODE_ENV === "production"
const publicPath = normalizePublicPath(isProd ? '/hr' : "/");

module.exports = {
  entry: "./src/main.tsx",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.[contenthash].js",
    clean: true,
    publicPath,
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
      templateParameters: {
        publicPath,
      },
    }),
  ],
  devServer: {
    port: 4173,
    host: "0.0.0.0",
    proxy: [
      {
        context: ["/api"],
        target: "http://127.0.0.1:3001",
      },
    ],
    historyApiFallback: true,
    static: {
      directory: path.join(__dirname, "public"),
    },
  },
};

function normalizePublicPath(value) {
  const raw = String(value || "/").trim();
  if (!raw || raw === "/") return "/";
  return `/${raw.replace(/^\/+|\/+$/g, "")}/`;
}
