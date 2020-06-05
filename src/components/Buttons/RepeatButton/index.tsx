import { h } from 'preact';

interface Props {
    repeat: boolean;
    onClick?: () => unknown;
}

export default function RepeatButton({ onClick, repeat }: Props): h.JSX.Element {
    const label = repeat ? 'Не повторювати список' : 'Закільцювати список';
    const cls = repeat ? 'RepeatButton repeat' : 'RepeatButton';

    return (
        <button className={cls} aria-label={label} onClick={onClick}>
            <svg viewBox="0 0 47 47">
                <path d="M14 14h20v6l8-8-8-8v6H10v12h4v-8m20 20H14v-6l-8 8 8 8v-6h24V26h-4v8" />
            </svg>
        </button>
    );
}
