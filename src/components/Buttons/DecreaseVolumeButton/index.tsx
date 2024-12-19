import { h } from 'preact';

interface Props {
    disabled?: boolean;
    onClick?: () => unknown;
}

export default function DecreaseVolumeButton({ disabled, onClick }: Readonly<Props>): h.JSX.Element {
    return (
        <button aria-label="Тихіше" disabled={disabled} onClick={onClick}>
            <svg viewBox="0 0 47 47">
                <path d="M37 24c0-3.53-2.04-6.58-5-8.05v16.11c2.96-1.48 5-4.53 5-8.06m-27-6v12h8l10 10V8L18 18h-8" />
            </svg>
        </button>
    );
}
