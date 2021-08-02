/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */

import webpack from 'webpack';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function (env: Record<string, any>, args: Record<string, any>): webpack.Configuration[] {
    let config: webpack.Configuration[];
    if (args.mode && args.mode === 'production') {
        process.env.NODE_ENV = 'production';
        config = [
            require('./.webpack/webpack.esm.ts').default(),
            require('./.webpack/webpack.production.ts').default(),
        ];
    } else {
        process.env.NODE_ENV = 'development';
        config = [require('./.webpack/webpack.development.ts').default()];
    }

    return config;
}
