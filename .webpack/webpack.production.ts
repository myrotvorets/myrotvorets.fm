import path from 'path';
import webpack from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';
import { merge } from 'webpack-merge';
import commonConfig from './common';
import commonProdConfig from './common-prod';

export default function (): webpack.Configuration {
    return merge(commonConfig('compat.html'), commonProdConfig(), {
        entry: {
            polyfills: path.resolve(__dirname, '../src/polyfills.js'),
        },
        output: {
            path: path.resolve(__dirname, '../dist'),
            filename: '[name].[fullhash:5].min.js',
            chunkFilename: '[name].[chunkhash:5].min.js',
        },
        module: {
            rules: [
                {
                    enforce: 'pre',
                    test: /\.tsx?$/u,
                    exclude: /node_modules/u,
                    use: {
                        loader: 'babel-loader',
                    },
                },
            ],
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env.ESM': JSON.stringify(false),
            }),
        ],
        optimization: {
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
        },
    });
}
