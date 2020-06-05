/* eslint-disable @typescript-eslint/ban-ts-comment */
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import PurgecssPlugin from 'purgecss-webpack-plugin';
import SriPlugin from 'webpack-subresource-integrity';
import glob from 'glob';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import { InjectManifest } from 'workbox-webpack-plugin';
import InlineRuntimePlugin from 'html-webpack-inline-runtime-plugin';
import { HwpCspPlugin } from 'hwp-csp-plugin';
import ServiceWorkerPlugin from './ServiceWorkerPlugin';

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
            pathinfo: false,
            globalObject: 'this',
            crossOriginLoading: 'anonymous',
        },
        devtool: 'source-map',
        mode: 'production',
        resolve: {
            extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx'],
            alias: {
                howler: 'howler/src/howler.core',
            },
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
                    loaders: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: true,
                                importLoaders: 1,
                            },
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                sourceMap: true,
                                config: {
                                    path: path.resolve(path.join(__dirname, '..')),
                                },
                            },
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: true,
                            },
                        },
                    ],
                },
            ],
        },
        plugins: [
            new CleanWebpackPlugin(),
            new webpack.NoEmitOnErrorsPlugin(),
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify('production'),
                'process.env.BUILD_SSR': JSON.stringify(false),
                'process.env.ESM': JSON.stringify(true),
            }),
            new webpack.ProvidePlugin({
                h: ['preact', 'h'],
                Fragment: ['preact', 'Fragment'],
            }),
            new HtmlWebpackPlugin({
                filename: 'compat.html',
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
            new SriPlugin({
                hashFuncNames: ['sha384'],
            }),
            new HwpCspPlugin({
                policy: {
                    'block-all-mixed-content': '',
                    'default-src': "'none'",
                    'connect-src': ["'self'", 'https://psb4ukr.natocdn.net'],
                    'form-action': "'none'",
                    'img-src': ["'self'", 'data:'],
                    'manifest-src': "'self'",
                    'media-src': ['https://psb4ukr.natocdn.net', 'data:'],
                    'script-src': "'self'",
                    'style-src': "'self'",
                    'worker-src': "'self'",
                },
                addIntegrity: true,
                hashEnabled: true,
                hashFunc: 'sha384',
            }),
            new InlineRuntimePlugin(),
            new InjectManifest({
                swSrc: './src/sw.ts',
                include: ['index.html', /\.js$/, /\.svg$/, /\.css$/, /\.webp$/],
                excludeChunks: ['runtime', 'polyfills'],
                // @ts-ignore
                dontCacheBustURLsMatching: /\.[0-9a-f]{5}\./,
            }),
            new ServiceWorkerPlugin(),
            new webpack.HashedModuleIdsPlugin(),
            new webpack.optimize.ModuleConcatenationPlugin(),
            new PurgecssPlugin({
                paths: glob.sync(`${path.join(__dirname, '../src')}/**/*`, {
                    nodir: true,
                }),
            }),
            new MiniCssExtractPlugin({
                filename: '[name].[contenthash:5].min.css',
                chunkFilename: '[name].[contenthash:5].min.css',
            }),
        ],
        optimization: {
            moduleIds: 'hashed',
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        output: {
                            comments: false,
                            ecma: 5,
                        },
                        sourceMap: true,
                        mangle: true,
                        compress: {
                            ecma: 5,
                            keep_fargs: false,
                            pure_getters: true,
                            hoist_funs: true,
                            pure_funcs: [
                                'classCallCheck',
                                '_classCallCheck',
                                '_possibleConstructorReturn',
                                'Object.freeze',
                                'invariant',
                                'warning',
                            ],
                        },
                    },
                    extractComments: false,
                }),
            ],
            minimize: true,
            runtimeChunk: {
                name: 'runtime',
            },
        },
    };
}
