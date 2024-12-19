import { ClassAttributes, Component, ComponentChild, ComponentConstructor, FunctionComponent, h } from 'preact';

const styleInner = {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    minHeight: '100%',
};

const styleContent = {
    position: 'absolute',
    left: 0,
    height: '100%',
    width: '100%',
    overflow: 'visible',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function throttleWithRAF<F extends (...args: any[]) => unknown>(
    callback: F,
): (this: ThisParameterType<F>, ...args: Parameters<F>) => void {
    let running = false;
    return function (this: ThisParameterType<F>, ...args: Parameters<F>): void {
        if (!running) {
            running = true;
            window.requestAnimationFrame((): void => {
                callback.apply(this, args);
                running = false;
            });
        }
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Props<T = any> {
    items: T[];
    rowHeight: number;
    overscan: number;
    renderItem: (item: T) => ComponentChild;
    initialState?: {
        firstIndex: number;
        lastIndex: number;
    };
    container?: keyof h.JSX.IntrinsicElements | FunctionComponent | ComponentConstructor;
}

interface State {
    height: number;
    offset: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default class VirtualList<T = any> extends Component<
    Props<T> & Omit<h.JSX.HTMLAttributes<HTMLDivElement>, 'ref'> & ClassAttributes<VirtualList<T>>,
    State
> {
    private _firstRender = true;

    public constructor() {
        super();
        this._onResizeHandler = throttleWithRAF(this._onResizeHandler);
    }

    public override state: Readonly<State> = {
        height: 0,
        offset: 0,
    };

    public override componentDidMount(): void {
        this._onResizeHandler();
        window.addEventListener('resize', this._onResizeHandler);
    }

    public override componentDidUpdate(): void {
        this._onResizeHandler();
    }

    public override componentWillUnmount(): void {
        window.removeEventListener('resize', this._onResizeHandler);
    }

    private readonly _onResizeHandler = (): void => {
        const base = this.base as HTMLElement;
        if (this.state.height !== base.offsetHeight) {
            this.setState({ height: base.offsetHeight });
        }
    };

    private readonly _onScrollHandler = (): void => {
        const base = this.base as HTMLElement;
        this.setState({ offset: base.scrollTop });
    };

    public scrollTo(item: number): void {
        const { rowHeight } = this.props;
        const { offset, height } = this.state;

        const start = Math.floor(offset / rowHeight || 0);
        const visibleRowCount = Math.floor(height / rowHeight || 0);
        const end = start + visibleRowCount;

        if (item >= start && item < end) {
            return;
        }

        const half = Math.floor(visibleRowCount / 2);
        const newStart = Math.max(0, (item - half) * rowHeight);
        (this.base as HTMLElement).scrollTop = newStart;
    }

    public render(): ComponentChild {
        const { container, items, rowHeight, renderItem, overscan, initialState, ...props } = this.props;
        const { offset, height } = this.state;

        let selection: T[];
        let start: number;

        if (this._firstRender && initialState) {
            this._firstRender = false;
            start = initialState.firstIndex;
            let end = initialState.lastIndex;
            if (overscan) {
                start = Math.max(0, start - (start % overscan));
                end += overscan;
            }

            selection = items.slice(start, end);
        } else {
            start = offset / rowHeight || 0;
            let visibleRowCount = height / rowHeight || 0;

            if (overscan) {
                start = Math.max(0, start - (start % overscan));
                visibleRowCount += overscan;
            }

            const end = start + 1 + visibleRowCount;
            selection = items.slice(start, end);
        }

        const Inner = container ?? 'div';

        return (
            <div onScroll={this._onScrollHandler} {...props}>
                <div style={{ ...styleInner, height: items.length * rowHeight }}>
                    <Inner style={{ ...styleContent, top: start * rowHeight }}>{selection.map(renderItem)}</Inner>
                </div>
            </div>
        );
    }
}
