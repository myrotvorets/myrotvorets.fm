import { h } from 'preact';

interface Props {
    disabled?: boolean;
    onClick?: () => unknown;
}

export default function NextButton({ disabled, onClick }: Readonly<Props>): h.JSX.Element {
    return (
        <button aria-label="Наступна" disabled={disabled} onClick={onClick}>
            <svg viewBox="0 0 47 47">
                <path d="M12 36l17-12-17-12v24m20-24v24h4V12h-4" />
            </svg>
        </button>
    );
}
