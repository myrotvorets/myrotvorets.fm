/* eslint-disable no-restricted-globals */
/* eslint-disable global-require */

if (process.env.NODE_ENV === 'development') {
    require('preact/debug');
}

import { h, render } from 'preact';
import App from './components/App';

export default function Application(): h.JSX.Element {
    return <App />;
}

if (!process.env.BUILD_SSR) {
    const { body } = document;
    const node = document.getElementById('app') || undefined;
    render(<Application />, body, node);
    if (node) {
        body.removeChild(node);
    }

    if (
        'serviceWorker' in navigator &&
        process.env.NODE_ENV === 'production' &&
        !/^(127|192\.168|10)\./u.test(window.location.hostname)
    ) {
        navigator.serviceWorker
            .register('sw.js')
            .then((reg) => {
                reg.addEventListener('updatefound', () => {
                    const installingWorker = reg.installing;
                    if (installingWorker) {
                        installingWorker.addEventListener('statechange', () => {
                            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                reg.update().catch(() => {
                                    /* Do nothing */
                                });
                            }
                        });
                    }
                });
            })
            .catch(() => {
                /* Do nothing */
            });
    }

    (document.getElementById('version') as HTMLElement).addEventListener('click', () => {
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
                                        .catch((e) => console.error(e));
                                } else {
                                    self.location.reload();
                                }
                            })
                            .catch((e) => {
                                console.error(e);
                                self.location.reload();
                            });
                    } else {
                        self.location.reload();
                    }
                })
                .catch((e) => {
                    console.error(e);
                    self.location.reload();
                });
        } else {
            self.location.reload();
        }
    });
}
