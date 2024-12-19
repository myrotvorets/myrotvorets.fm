/* eslint-disable @typescript-eslint/no-require-imports */

if (process.env['NODE_ENV'] === 'development') {
    require('preact/debug');
}

import { h, render } from 'preact';
import App from './components/App';

export default function Application(): h.JSX.Element {
    return <App />;
}

if (!process.env['BUILD_SSR']) {
    const { body } = document;
    const node = document.getElementById('app') ?? undefined;
    // eslint-disable-next-line sonarjs/deprecation, @typescript-eslint/no-deprecated
    render(<Application />, body, node);
    if (node) {
        body.removeChild(node);
    }

    if (
        'serviceWorker' in navigator &&
        process.env['NODE_ENV'] === 'production' &&
        !/^(127|192\.168|10)\./u.test(window.location.hostname)
    ) {
        navigator.serviceWorker
            .register('sw.js')
            .then((reg) =>
                reg.addEventListener('updatefound', () => {
                    const installingWorker = reg.installing;
                    if (installingWorker) {
                        installingWorker.addEventListener('statechange', () => {
                            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // eslint-disable-next-line promise/no-nesting
                                reg.update().catch(() => {
                                    /* Do nothing */
                                });
                            }
                        });
                    }
                }),
            )
            .catch(() => {
                /* Do nothing */
            });
    }

    document.getElementById('version')!.addEventListener('click', () => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (self.caches) {
            self.caches
                .keys()
                .then((keyList) => Promise.all(keyList.map((key) => self.caches.delete(key))))
                .then(() => {
                    if ('serviceWorker' in navigator) {
                        navigator.serviceWorker
                            .getRegistration()
                            .then((reg) => {
                                if (reg) {
                                    reg.unregister()
                                        .then(() => self.location.reload())
                                        .catch((e: unknown) => console.error(e));
                                } else {
                                    self.location.reload();
                                }

                                return null;
                            })
                            .catch((e: unknown) => {
                                console.error(e);
                                self.location.reload();
                            });
                    } else {
                        self.location.reload();
                    }

                    return null;
                })
                .catch((e: unknown) => {
                    console.error(e);
                    self.location.reload();
                });
        } else {
            self.location.reload();
        }
    });
}
