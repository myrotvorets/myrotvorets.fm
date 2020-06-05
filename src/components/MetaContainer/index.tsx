import { h } from 'preact';

interface Props {
    artist?: string;
    title?: string;
}

export default function MetaContainer({ artist, title }: Props): h.JSX.Element {
    return (
        <div className="meta-container">
            {artist || title ? (
                <span>
                    <strong>{artist}</strong>&nbsp;&mdash; {title}
                </span>
            ) : null}
        </div>
    );
}
