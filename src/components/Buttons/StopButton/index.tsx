import { h } from 'preact';

interface Props {
    disabled?: boolean;
    onClick?: () => unknown;
}

export default function StopButton({ disabled, onClick }: Props): h.JSX.Element {
    return (
        <button disabled={disabled} aria-label="Стоп" onClick={onClick}>
            <svg viewBox="0 0 47 47">
                <path d="M12 12h24v24H12" />
            </svg>
        </button>
    );
}
