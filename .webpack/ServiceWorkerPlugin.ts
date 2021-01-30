/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import webpack, { Chunk, WebpackError } from 'webpack';
import { resolve } from 'path';
import { existsSync } from 'fs';

export default class ServiceWorkerPlugin {
    public apply(compiler: webpack.Compiler): void {
        const src = resolve(__dirname, '../src/sw.ts');

        if (existsSync(src)) {
            compiler.hooks.make.tapAsync(
                this.constructor.name,
                (compilation: webpack.Compilation, callback: () => void): void => {
                    const outputOptions = compiler.options;

                    const child = compilation.createChildCompiler(this.constructor.name, { filename: '[name].js' }, []);
                    child.context = compiler.context;
                    child.options = { ...outputOptions };
                    child.options.entry = { sw: { filename: src } };
                    child.options.target = 'webworker';
                    child.outputFileSystem = compiler.outputFileSystem;

                    new webpack.EntryPlugin(compiler.context, src, 'sw').apply(child);

                    compilation.hooks.additionalAssets.tapAsync(
                        this.constructor.name,
                        (childProcessDone: () => void) => {
                            child.runAsChild(
                                (err?: Error, entries?: Chunk[], childCompilation?: webpack.Compilation) => {
                                    if (!err) {
                                        if (childCompilation) {
                                            // eslint-disable-next-line no-param-reassign
                                            compilation.assets = { ...childCompilation.assets, ...compilation.assets };
                                        }
                                    } else {
                                        compilation.errors.push(err as WebpackError);
                                    }

                                    childProcessDone();
                                },
                            );
                        },
                    );

                    callback();
                },
            );
        }
    }
}
