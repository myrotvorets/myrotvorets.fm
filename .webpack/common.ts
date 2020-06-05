import webpack from 'webpack';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import { execSync } from 'child_process';

let version: string;
try {
    version = execSync('git describe --always --long', { cwd: path.resolve(path.join(__dirname, '..')) })
        .toString()
        .trim();
} catch (e) {
    version = 'development';
}

const prodMinifyOptions: HtmlWebpackPlugin.MinifyOptions = {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    useShortDoctype: true,
    keepClosingSlash: true,
    html5: true,
};

export default function (htmlFile: string): webpack.Configuration {
    return {
        context: path.resolve(__dirname, '..'),
        node: false,
        entry: {
            bundle: path.resolve(__dirname, '../src/index.tsx'),
        },
        output: {
            publicPath: '',
            globalObject: 'this',
        },
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
                    test: /\.svg$/,
                    loader: 'url-loader',
                    options: {
                        name: '[name].[contenthash:5].[ext]',
                        esModule: false,
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
                    issuer: /\.ejs$/,
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
            ],
        },
        plugins: [
            new CleanWebpackPlugin(),
            new webpack.NoEmitOnErrorsPlugin(),
            new webpack.DefinePlugin({
                'process.env.APP_VERSION': JSON.stringify(version),
            }),
            new webpack.ProvidePlugin({
                h: ['preact', 'h'],
                Fragment: ['preact', 'Fragment'],
            }),
            new HtmlWebpackPlugin({
                filename: htmlFile,
                template: './src/index.ejs',
                xhtml: true,
                templateParameters: {
                    version,
                },
                minify: process.env.NODE_ENV === 'production' ? prodMinifyOptions : false,
            }),
        ],
    };
}
