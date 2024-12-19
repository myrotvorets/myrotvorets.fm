import { Component, ComponentChild, RefObject, createRef, h } from 'preact';
import MatchedText from '../MatchedText';
import { debounce } from '../../utils';
import VirtualList from '../VirtualList/index';

import './playlist.scss';

export interface PlaylistEntry {
    id: number;
    artist: string;
    title: string;
    url: string;
}

interface Props {
    active?: number;
    onPlaylistLoaded?: (playlist: PlaylistEntry[] | null) => unknown;
    onSongClicked?: (id: number) => unknown;
}

interface State {
    playlist: undefined | null | PlaylistEntry[];
    filtered: PlaylistEntry[];
    filter: string;
}

const baseURL = 'https://cdn.myrotvorets.center/m/mp3/';
const playlistURL = `${baseURL}playlist.txt?utm_source=myrfm`;

export default class Playlist extends Component<Props, State> {
    public state: Readonly<State> = {
        playlist: undefined,
        filtered: [],
        filter: '',
    };

    private readonly _listRef: RefObject<VirtualList<PlaylistEntry>> = createRef();

    private readonly _filterList = debounce((filter: string): void => {
        const { playlist } = this.state;
        if (filter.length >= 2) {
            // eslint-disable-next-line @typescript-eslint/unbound-method
            const filtered = playlist!.filter(this.filterPlaylist, filter);
            this.setState({ filter, filtered });
        } else {
            this.setState({ filtered: playlist ?? [], filter });
        }
    }, 250);

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    public async componentDidMount(): Promise<void> {
        try {
            const response = await fetch(playlistURL);
            if (response.ok) {
                const text = await response.text();
                this.parsePlaylist(text);
            } else {
                this._onPlaylistfetchError();
            }
        } catch {
            this._onPlaylistfetchError();
        }
    }

    public componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>): void {
        if (prevProps.active !== this.props.active || prevState.playlist?.length !== this.state.playlist?.length) {
            const n = this.state.filtered.findIndex((e) => e.id === this.props.active);
            this._listRef.current?.scrollTo(n);
        }
    }

    private _onPlaylistfetchError(): void {
        this.setState({ playlist: null });
        this.props.onPlaylistLoaded?.(null);
    }

    private readonly _onEntryClicked = (e: MouseEvent): void => {
        const { onSongClicked } = this.props;

        if (onSongClicked !== undefined && e.target) {
            const li = (e.target as HTMLElement).closest<HTMLElement>('[data-id]');
            if (li) {
                const id = parseInt(li.dataset.id ?? '', 10);
                onSongClicked(id);
            }
        }
    };

    private readonly _onFilterChanged = (e: h.JSX.TargetedEvent<HTMLInputElement>): void => {
        const filter = e.currentTarget.value;
        this._filterList(filter);
    };

    private parsePlaylist(text: string): void {
        const items = text
            .replace(/^\ufeff/u, '')
            .replace(/\r/gu, '')
            .split('\n');

        let id = 0;
        const playlist: PlaylistEntry[] = items
            .map((line: string): PlaylistEntry | null => {
                const parts = line.split('\t');
                if (parts.length === 3) {
                    return {
                        id: id++,
                        artist: parts[0].replace(/^_/u, ''),
                        title: parts[1],
                        url: `${baseURL}${parts[2]}`,
                    };
                }

                console.warn('Unable to parse playlist entry:', line);
                return null;
            })
            .filter(Boolean) as PlaylistEntry[];

        this.setState({ playlist, filtered: playlist });
        this.props.onPlaylistLoaded?.(playlist);
    }

    private filterPlaylist(this: string, { artist, title }: PlaylistEntry): boolean {
        const filter = this.toLocaleLowerCase();
        return artist.toLocaleLowerCase().includes(filter) || title.toLocaleLowerCase().includes(filter);
    }

    private readonly _renderPlaylistEntry = ({ id, artist, title }: PlaylistEntry): ComponentChild => {
        const { active } = this.props;
        const { filter } = this.state;

        return filter.length >= 2 ? (
            <li key={id} data-id={id} className={active === id ? 'active item' : 'item'}>
                <strong>
                    {id + 1}. <MatchedText text={artist} filter={filter} />
                </strong>{' '}
                — <MatchedText text={title} filter={filter} />
            </li>
        ) : (
            <li key={id} data-id={id} className={active === id ? 'active item' : 'item'}>
                <strong>
                    {id + 1}. {artist}
                </strong>{' '}
                — {title}
            </li>
        );
    };

    public render(): ComponentChild {
        const { filter, filtered, playlist } = this.state;
        if (playlist === undefined) {
            return (
                <div className="playlist">
                    <p>Завантаження списку відтворення…</p>
                </div>
            );
        }

        if (playlist === null) {
            return (
                <div className="playlist">
                    <p>Під час завантаження списку відтворення сталася помилка. Будь-ласка, спробуйте пізніше.</p>
                </div>
            );
        }

        if (!playlist.length) {
            return (
                <div className="playlist">
                    <p>Список відтворення порожній. Будь-ласка, спробуйте пізніше.</p>
                </div>
            );
        }

        return (
            <div className="playlist" role="main" aria-label="Список відтворення">
                <input
                    type="search"
                    value={filter}
                    onInput={this._onFilterChanged}
                    placeholder="Шукати…"
                    aria-label="Пошук"
                />
                {filtered.length ? (
                    <VirtualList
                        items={filtered}
                        overscan={10}
                        rowHeight={41}
                        renderItem={this._renderPlaylistEntry}
                        className="items"
                        onClick={this._onEntryClicked}
                        ref={this._listRef}
                        container="ul"
                    />
                ) : (
                    <p>
                        <strong>Нічого не знайдено 😢</strong>
                    </p>
                )}
            </div>
        );
    }
}
