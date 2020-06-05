export function formatTime(secs: number): string {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs - minutes * 60);

    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

export function setLSItem(key: string, value: string): void {
    try {
        window.localStorage.setItem(key, value);
    } catch (e) {
        // Swallow
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Callback = (...args: any[]) => void;

export function debounce<F extends Callback>(
    callback: F,
    delay: number,
): (this: ThisParameterType<F>, ...args: Parameters<F>) => void {
    let timeout: number | undefined;
    return function (this: ThisParameterType<F>, ...args: Parameters<F>): void {
        window.clearTimeout(timeout);

        timeout = window.setTimeout((): void => {
            callback.apply(this, args);
        }, delay);
    };
}
