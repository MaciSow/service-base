const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;

module.exports = () => {
    const dev = process.env.NODE_ENV !== 'production';

    return {
        mode: dev ? 'development' : 'production',

        entry: {
            home: './src/js/app.ts'
        },

        output: {
            path: path.resolve(__dirname, './dist'),
            filename: dev ? '[name].js' : '[name].[chunkhash].js'
        },

        devtool: 'inline-source-map',

        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },

        module: {
            rules: [
                // {
                //     test: /\.js$/,
                //     exclude: /node_modules/,
                //     use: {
                //         loader: 'babel-loader',
                //         options: {presets: ['@babel/preset-env']}
                //     }
                // },

                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },

                {
                    test: /\.s[ac]ss$/i,
                    use: [
                        dev ? 'style-loader' : MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                url: false,
                                sourceMap: true
                            },
                        },
                        {
                            loader: 'sass-loader',
                            options: {sourceMap: true},
                        },
                    ],
                },

                {
                    test: /\.hbs$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "handlebars-loader"
                    }
                },
                {
                    test: /\.svg$/,
                    use: 'inline-svg-loader',
                },
                {
                    test: /\.(png|jpg|gif)$/,
                    use: {
                        loader: "file-loader",
                        options: {
                            name: "[name].[ext]"
                        }
                    }
                }
            ]
        },

        plugins: [
            new MiniCssExtractPlugin({
                filename: '[name].[chunkhash].css',
                chunkFilename: '[id].css'
            }),

            new HtmlWebpackPlugin({
                template: "./src/index.html"
            }),

            new CopyWebpackPlugin([
                {from: 'src/images', to: 'images'},
                {from: 'src/fonts', to: 'fonts'}
            ]),

            new ImageminPlugin({
                test: /\.(jpe?g|png|gif)$/i,
                disable: process.env.NODE_ENV !== 'production'
            }),

            new BrowserSyncPlugin({
                host: 'localhost',
                port: 3005,
                browser: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
                server: {baseDir: ['dist']}
            })
        ],
    }
};
