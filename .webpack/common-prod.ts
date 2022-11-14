/* eslint-disable @typescript-eslint/ban-ts-comment */
import glob from 'glob';
import path from 'path';
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { PurgeCSSPlugin } from 'purgecss-webpack-plugin';
import { SubresourceIntegrityPlugin } from 'webpack-subresource-integrity';
import { InjectManifest } from 'workbox-webpack-plugin';
import { HwpInlineRuntimeChunkPlugin } from 'hwp-inline-runtime-chunk-plugin';
import { HwpCspPlugin } from 'hwp-csp-plugin';

export default function (): webpack.Configuration {
    return {
        output: {
            pathinfo: false,
            crossOriginLoading: 'anonymous',
        },
        devtool: 'hidden-source-map',
        mode: 'production',
        module: {
            rules: [
                {
                    test: /\.s?css$/u,
                    use: [
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
            // @ts-ignore
            new SubresourceIntegrityPlugin({ hashFuncNames: ['sha384'] }),
            new HwpCspPlugin({
                policy: {
                    'block-all-mixed-content': '',
                    'default-src': "'none'",
                    'connect-src': ["'self'", 'https://cdn.myrotvorets.center'],
                    'form-action': "'none'",
                    'img-src': ["'self'", 'data:'],
                    'manifest-src': "'self'",
                    'media-src': ['https://cdn.myrotvorets.center', 'data:'],
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
                compileSrc: true,
                include: ['index.html', /\.m?js$/u, /\.svg$/u, /\.css$/u, /\.webp$/u],
                excludeChunks: ['runtime', 'polyfills'],
                dontCacheBustURLsMatching: /\.[0-9a-f]{5}\./u,
            }),
            new PurgeCSSPlugin({
                paths: glob.sync(`${path.join(__dirname, '../src')}/**/*`, {
                    nodir: true,
                }),
                safelist: [],
                blocklist: [],
            }),
            new MiniCssExtractPlugin({
                filename: '[name].[contenthash:5].min.css',
                chunkFilename: '[name].[contenthash:5].min.css',
            }),
        ],
        optimization: {
            moduleIds: 'deterministic',
            minimize: true,
            runtimeChunk: 'single',
            realContentHash: true,
        },
    };
}
