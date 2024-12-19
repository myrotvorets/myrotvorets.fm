import { Fragment, h } from 'preact';

interface Props {
    text: string;
    filter: string;
}

export default function MatchedText({ text, filter }: Readonly<Props>): h.JSX.Element {
    if (!filter.length) {
        return <Fragment>{text}</Fragment>;
    }

    const re = new RegExp(`(${filter.replace(/[/\\^$*+?.()|[\]{}-]/gu, '\\$&')})`, 'iu');
    const parts = text.split(re);
    return (
        <Fragment>
            {parts.map(
                (part: string, index: number): h.JSX.Element =>
                    re.test(part) ? <mark key={index}>{part}</mark> : <Fragment key={index}>{part}</Fragment>,
            )}
        </Fragment>
    );
}
