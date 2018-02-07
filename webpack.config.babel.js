// MODULES
const path = require("path");
const webpack = require("webpack");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
require("babel-polyfill");


const styleCSS = new ExtractTextPlugin("../css/[name].min.css");

export default {
    entry: {
        "main": ["babel-polyfill", "./app/app.js"]
    },
    output: {
        path: path.resolve("./dist/js"),
        filename: "[name].js"
    },

    /**
     * Allow ES6
     **/
    module: {
        rules: [{
            test: /.js$/,
            exclude: /node_modules/,
            use: [{
                loader: "babel-loader",
                query: { presets: ["es2015"] }
            }]
        }, {
            test: /\.xml$/,
            exclude: /node_modules/,
            use: { loader: "raw-loader" }
        }, {
            test: /\.scss$/,
            include: path.resolve("./src/meerkat"),
            loader: styleCSS.extract({
                fallback: "style-loader",
                use: ["css-loader", "sass-loader"]
            })
        }]
    },

    /**
     * Plugins
     */
    plugins: [
        styleCSS,
        new OptimizeCssAssetsPlugin({ // Extract SASS to meerkat.min.css
            assetNameRegExp: /\.min\.css$/,
            cssProcessorOptions: {
                discardComments: {
                    removeAll: true
                }
            }
        }),
        new webpack.optimize.CommonsChunkPlugin({
            names: "commons",
            filename: "commons.js"
            // minChunks: Infinity
        }),
        new webpack.SourceMapDevToolPlugin({
            filename: "[file].map"
        }),
        new UglifyJSPlugin({
            sourceMap: false,
            parallel: true,
            cache: false,
            uglifyOptions: {
                ecma: 5,
                // ie8: true,
                safari10: true,
                mangle: false,
                compress: {
                    warnings: false,
                    pure_funcs: ["console.log"]
                }
            }
        })
    ],

    /**
     * Allow laziness
     **/
    resolve: {
        modules: [
            path.resolve("./src/meerkat"),
            "node_modules"
        ],
        alias: {
            "@root": path.resolve("./"),
            "@app": path.resolve("./app"),
            "@meerkat": path.resolve("./src/meerkat"),
        },
        extensions: [".js"]
    },
}
