import { h } from 'preact';

interface Props {
    muted: boolean;
    onClick?: () => unknown;
}

export default function MuteButton({ onClick, muted }: Readonly<Props>): h.JSX.Element {
    const label = muted ? 'Увімкнути звук' : 'Вимкнути звук';
    const cls = muted ? 'MuteButton muted' : 'MuteButton';

    return (
        <button className={cls} aria-label={label} onClick={onClick}>
            <svg viewBox="0 0 47 47">
                <path d="M14 18v12h8l10 10V8L22 18h-8" />
            </svg>
        </button>
    );
}
