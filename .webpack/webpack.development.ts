/* eslint-disable @typescript-eslint/ban-ts-comment */
import webpack from 'webpack';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';

export default function (): webpack.Configuration {
    return {
        context: path.resolve(__dirname, '..'),
        node: false,
        entry: {
            bundle: path.resolve(__dirname, '../src/index.tsx'),
            polyfills: path.resolve(__dirname, '../src/polyfills.js'),
        },
        output: {
            path: path.resolve(__dirname, '../dist'),
            filename: '[name].[hash:5].min.js',
            chunkFilename: '[name].[chunkhash:5].min.js',
            publicPath: '',
            pathinfo: true,
            globalObject: 'this',
        },
        devtool: 'cheap-eval-source-map',
        mode: 'development',
        resolve: {
            extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx'],
            alias: {
                howler: 'howler/src/howler.core',
            },
        },
        devServer: {
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            contentBase: path.resolve(__dirname, '../dist'),
            compress: true,
            port: 8081,
            historyApiFallback: true,
            writeToDisk: true,
            disableHostCheck: true,
        },
        module: {
            rules: [
                {
                    enforce: 'pre',
                    test: /\.tsx?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                    },
                },
                {
                    test: /\.svg$/,
                    loader: 'url-loader',
                    options: {
                        name: '[name].[contenthash:5].[ext]',
                    },
                },
                {
                    test: /\.(png|webp)$/,
                    loader: 'file-loader',
                    options: {
                        name: '[name].[contenthash:5].[ext]',
                        esModule: false,
                    },
                },
                {
                    test: /\.json$/,
                    issuer: /\.html$/,
                    type: 'javascript/auto',
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: '[name].[contenthash:5].[ext]',
                                esModule: false,
                            },
                        },
                        {
                            loader: 'extract-loader',
                        },
                        {
                            loader: 'ref-loader',
                        },
                    ],
                },
                {
                    test: /\.s?css$/,
                    loaders: ['style-loader', 'css-loader', 'sass-loader'],
                },
            ],
        },
        plugins: [
            new CleanWebpackPlugin(),
            new webpack.NoEmitOnErrorsPlugin(),
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify('development'),
                'process.env.BUILD_SSR': JSON.stringify(false),
                'process.env.ESM': JSON.stringify(false),
            }),
            new webpack.ProvidePlugin({
                h: ['preact', 'h'],
                Fragment: ['preact', 'Fragment'],
            }),
            new HtmlWebpackPlugin({
                filename: 'index.html',
                template: './src/index.html',
                xhtml: true,
                minify: {
                    collapseWhitespace: true,
                    removeComments: true,
                    removeRedundantAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributes: true,
                    useShortDoctype: true,
                    keepClosingSlash: true,
                    html5: true,
                },
            }),
            new ForkTsCheckerWebpackPlugin({
                async: true,
                useTypescriptIncrementalApi: true,
                eslint: true,
            }),
        ],
    };
}
