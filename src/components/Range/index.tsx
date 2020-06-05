import { h } from 'preact';
import './range.scss';

export default function Range(props: h.JSX.HTMLAttributes<HTMLInputElement>): h.JSX.Element {
    return <input type="range" className="Range" {...props} />;
}
