import { h } from 'preact';

interface Props {
    disabled?: boolean;
    onClick?: () => unknown;
}

export default function PrevButton({ disabled, onClick }: Props): h.JSX.Element {
    return (
        <button aria-label="Попередня" disabled={disabled} onClick={onClick}>
            <svg viewBox="0 0 47 47">
                <path d="M12 12h4v24h-4zm7 12l17 12V12" />
            </svg>
        </button>
    );
}
