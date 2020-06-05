import { h } from 'preact';

interface Props {
    onClick?: () => unknown;
}

export default function PauseButton({ onClick }: Props): h.JSX.Element {
    return (
        <button aria-label="Пауза" onClick={onClick}>
            <svg viewBox="0 0 47 47">
                <path d="M12 38h8V10h-8v28m16-28v28h8V10h-8" />
            </svg>
        </button>
    );
}
