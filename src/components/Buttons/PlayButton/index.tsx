import { h } from 'preact';

interface Props {
    disabled?: boolean;
    onClick?: () => unknown;
}

export default function PlayButton({ disabled, onClick }: Props): h.JSX.Element {
    return (
        <button disabled={disabled} aria-label="Відтворення" onClick={onClick}>
            <svg viewBox="0 0 47 47">
                <path d="M16 10v28l22-14" />
            </svg>
        </button>
    );
}
