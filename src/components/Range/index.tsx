import { h } from 'preact';
import './range.scss';

export default function Range(props: Readonly<h.JSX.InputHTMLAttributes>): h.JSX.Element {
    return <input type="range" className="Range" {...props} />;
}
