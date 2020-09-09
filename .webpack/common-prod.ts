/* eslint-disable @typescript-eslint/ban-ts-comment */
import glob from 'glob';
import path from 'path';
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import PurgecssPlugin from 'purgecss-webpack-plugin';
import SriPlugin from 'webpack-subresource-integrity';
import { InjectManifest } from 'workbox-webpack-plugin';
import { HwpInlineRuntimeChunkPlugin } from 'hwp-inline-runtime-chunk-plugin';
import { HwpCspPlugin } from 'hwp-csp-plugin';
import ServiceWorkerPlugin from './ServiceWorkerPlugin';

export default function (): webpack.Configuration {
    return {
        output: {
            pathinfo: false,
            crossOriginLoading: 'anonymous',
        },
        devtool: 'source-map',
        mode: 'production',
        module: {
            rules: [
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
                                postcssOptions: {
                                    config: path.resolve(path.join(__dirname, '..')),
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
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify('production'),
                'process.env.BUILD_SSR': JSON.stringify(false),
            }),
            new HwpInlineRuntimeChunkPlugin({ removeSourceMap: true }),
            new SriPlugin({ hashFuncNames: ['sha384'] }),
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
            minimize: true,
            runtimeChunk: 'single',
        },
    };
}
