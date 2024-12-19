import webpack from 'webpack';
import { type Configuration as DevServerConfiguration } from 'webpack-dev-server';
import path from 'path';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import { merge } from 'webpack-merge';
import commonConfig from './common';

export default function (): webpack.Configuration & { devServer?: DevServerConfiguration } {
    return merge(commonConfig('index.html') as webpack.Configuration & { devServer?: DevServerConfiguration }, {
        entry: {
            polyfills: path.resolve(__dirname, '../src/polyfills.js'),
        },
        output: {
            path: path.resolve(__dirname, '../dist'),
            filename: '[name].[fullhash:5].js',
            chunkFilename: '[name].[chunkhash:5].js',
            pathinfo: true,
        },
        devtool: 'eval-cheap-source-map',
        mode: 'development',
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
                {
                    test: /\.s?css$/u,
                    use: ['style-loader', 'css-loader', 'sass-loader'],
                },
            ],
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify('development'),
                'process.env.BUILD_SSR': JSON.stringify(false),
                'process.env.ESM': JSON.stringify(false),
            }),
            new ForkTsCheckerWebpackPlugin(),
        ],
    });
}
