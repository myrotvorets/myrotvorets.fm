import { Component, ComponentChild, Fragment, h } from 'preact';
import Player from '../Player';
import Playlist, { PlaylistEntry } from '../Playlist';
import { setLSItem } from '../../utils';

// This is imported in `index.html` as a critical CSS
/* import './app.scss'; */
import './app-loaded.scss';

interface State {
    playlist: PlaylistEntry[] | null;
    active: number;
    volume: number;
    repeat: boolean;
    shuffle: boolean;
    unlocked: boolean;
}

export default class App extends Component<unknown, State> {
    public state: State = {
        playlist: null,
        active: -1,
        volume: 1,
        repeat: true,
        shuffle: false,
        unlocked: false,
    };

    public constructor(props: unknown) {
        super(props);

        if (typeof window !== 'undefined') {
            this.state.repeat = !!(window.localStorage.getItem('repeat') ?? true);
            this.state.shuffle = !!(window.localStorage.getItem('shuffle') ?? false);
            this.state.volume = parseFloat(window.localStorage.getItem('volume') ?? '1') || 1;
            this.state.active = parseInt(window.localStorage.getItem('active') ?? '0', 10) || 0;
            if (this.state.volume < 0 || this.state.volume > 1) {
                this.state.volume = 1;
            }
        }
    }

    public componentDidUpdate(prevProps: unknown, prevState: Readonly<State>): void {
        if (prevState.active !== this.state.active) {
            this._updateTitle();
            setLSItem('active', `${this.state.active}`);
        }

        if (prevState.volume !== this.state.volume) {
            setLSItem('volume', `${this.state.volume}`);
        }

        if (prevState.repeat !== this.state.repeat) {
            setLSItem('repeat', this.state.repeat ? '1' : '');
        }

        if (prevState.shuffle !== this.state.shuffle) {
            setLSItem('shuffle', this.state.shuffle ? '1' : '');
        }
    }

    private readonly _onPlaylistLoaded = (playlist: PlaylistEntry[] | null): unknown => this.setState({ playlist });

    private readonly _onSongClicked = (id: number): unknown => this.setState({ active: id, unlocked: true });

    private readonly _onSongChanged = (id: number): unknown => this.setState({ active: id });

    private readonly _onShuffleChanged = (v: boolean): unknown => this.setState({ shuffle: v });

    private readonly _onRepeatChanged = (v: boolean): unknown => this.setState({ repeat: v });

    private readonly _onVolumeChanged = (v: number): unknown => this.setState({ volume: v });

    // !TODO
    private readonly _onError = (e: unknown): unknown => console.error(e);

    private _updateTitle(): void {
        const { active, playlist } = this.state;
        if (playlist && playlist[active]) {
            const { artist, title } = playlist[active];
            document.title = `${artist ? `${artist} — ` : ''}${title} — Myrotvorets.FM`;
        } else {
            document.title = 'Myrotvorets.FM';
        }
    }

    public render(): ComponentChild {
        const { active, playlist, repeat, shuffle, volume, unlocked } = this.state;
        return (
            <Fragment>
                <Player
                    playlist={playlist || []}
                    error={playlist === null}
                    current={active}
                    volume={volume}
                    repeat={repeat}
                    shuffle={shuffle}
                    unlocked={unlocked}
                    onError={this._onError}
                    onSongChanged={this._onSongChanged}
                    onRepeatChanged={this._onRepeatChanged}
                    onShuffleChanged={this._onShuffleChanged}
                    onVolumeChanged={this._onVolumeChanged}
                />
                <Playlist
                    active={active}
                    onPlaylistLoaded={this._onPlaylistLoaded}
                    onSongClicked={this._onSongClicked}
                />
            </Fragment>
        );
    }
}
