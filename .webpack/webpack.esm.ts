import webpack from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';
import path from 'path';
import { HwpAttributesPlugin } from 'hwp-attributes-plugin';
import { merge } from 'webpack-merge';
import commonConfig from './common';
import commonProdConfig from './common-prod';

export default function (): webpack.Configuration {
    return merge(commonConfig('index.html'), commonProdConfig(), {
        output: {
            path: path.resolve(__dirname, '../dist-esm'),
            filename: '[name].[hash:5].min.mjs',
            chunkFilename: '[name].[chunkhash:5].min.mjs',
            jsonpScriptType: 'module',
            globalObject: 'self',
        },
        module: {
            rules: [
                {
                    enforce: 'pre',
                    test: /\.tsx?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            babelrc: false,
                            presets: [
                                '@babel/preset-typescript',
                                [
                                    '@babel/preset-env',
                                    {
                                        modules: false,
                                        bugfixes: true,
                                        ignoreBrowserslistConfig: true,
                                        targets: {
                                            esmodules: true,
                                        },
                                    },
                                ],
                            ],
                            plugins: [
                                [
                                    '@babel/plugin-transform-react-jsx',
                                    {
                                        pragma: 'h',
                                        pragmaFrag: 'Fragment',
                                    },
                                ],
                                ['@babel/plugin-proposal-class-properties', { loose: true }],
                                ['@babel/plugin-proposal-optional-chaining', { loose: true }],
                                ['@babel/plugin-proposal-nullish-coalescing-operator', { loose: true }],
                            ],
                        },
                    },
                },
            ],
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env.ESM': JSON.stringify(true),
            }),
            new HwpAttributesPlugin({
                module: ['**.mjs'],
            }),
        ],
        optimization: {
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        output: {
                            comments: false,
                            ecma: 8,
                            safari10: true,
                        },
                        sourceMap: true,
                        mangle: true,
                        compress: {
                            ecma: 8,
                            module: true,
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
        },
    });
}
