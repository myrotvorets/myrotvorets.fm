/* eslint-disable import/first, global-require */

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
        !/^(127|192\.168|10)\./.test(window.location.hostname)
    ) {
        navigator.serviceWorker.register('sw.js').then((reg) => {
            // eslint-disable-next-line no-param-reassign
            reg.onupdatefound = () => {
                const installingWorker = reg.installing;
                if (installingWorker) {
                    installingWorker.onstatechange = () => {
                        if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            reg.update();
                        }
                    };
                }
            };
        });
    }

    (document.getElementById('version') as HTMLElement).addEventListener('click', () => {
        if (window.caches) {
            window.caches
                .keys()
                .then((keyList) => Promise.all(keyList.map((key) => window.caches.delete(key))))
                .then(() => {
                    if ('serviceWorker' in navigator) {
                        navigator.serviceWorker.getRegistration().then((reg) => {
                            if (reg) {
                                reg.unregister().then(() => window.location.reload(true));
                            } else {
                                window.location.reload(true);
                            }
                        });
                    } else {
                        window.location.reload(true);
                    }
                });
        }
    });
}
