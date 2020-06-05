import { h } from 'preact';

interface Props {
    shuffle: boolean;
    onClick?: () => unknown;
}

export default function ShuffleButton({ onClick, shuffle }: Props): h.JSX.Element {
    const label = shuffle ? 'Випадковий порядок відтворення' : 'Послідовний порядок відтворення';
    const cls = shuffle ? 'ShuffleButton shuffle' : 'ShuffleButton';

    return (
        <button className={cls} aria-label={label} onClick={onClick}>
            <svg viewBox="0 0 47 47">
                <path d="M21.17 18.34L10.83 8 8 10.83l10.34 10.34 2.83-2.83M29 8l4.09 4.09L8 37.17 10.83 40l25.09-25.09L40 19V8H29m.66 18.83l-2.83 2.83 6.26 6.26L29 40h11V29l-4.09 4.09-6.25-6.26" />
            </svg>
        </button>
    );
}
