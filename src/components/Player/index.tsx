import { Component, ComponentChild, Fragment, h } from 'preact';
import { Howl, Howler } from 'howler';
import { PlaylistEntry } from '../Playlist';
import { formatTime } from '../../utils';
import MetaContainer from '../MetaContainer';
import Loader from '../Loader/Loader';
import Range from '../Range/index';
import MuteButton from '../Buttons/MuteButton';
import DecreaseVolumeButton from '../Buttons/DecreaseVolumeButton';
import IncreaseVolumeButton from '../Buttons/IncreaseVolumeButton';
import StopButton from '../Buttons/StopButton';
import PauseButton from '../Buttons/PauseButton';
import PlayButton from '../Buttons/PlayButton';
import RepeatButton from '../Buttons/RepeatButton';
import ShuffleButton from '../Buttons/ShuffleButton';
import PrevButton from '../Buttons/PrevButton';
import NextButton from '../Buttons/NextButton';

import './player.scss';

interface Props {
    playlist: PlaylistEntry[];
    error: boolean;
    current: number;
    repeat: boolean;
    shuffle: boolean;
    volume: number;
    unlocked: boolean;
    onError?: (e: unknown) => unknown;
    onSongChanged?: (id: number) => unknown;
    onRepeatChanged?: (v: boolean) => unknown;
    onShuffleChanged?: (v: boolean) => unknown;
    onVolumeChanged?: (v: number) => unknown;
}

interface State {
    // current: number; // id of the active track
    progress: number;
    time: string;
    duration: string;
    state: 'playing' | 'paused';
    muted: boolean;
    unlocked: boolean;
    loading: boolean;
}

export default class Player extends Component<Props, State> {
    public override state: Readonly<State> = {
        progress: 0,
        time: '00:00',
        duration: '00:00',
        state: 'paused',
        muted: false,
        unlocked: false,
        loading: false,
    };

    public static override getDerivedStateFromProps(
        props: Readonly<Props>,
        prevState: Readonly<State>,
    ): Partial<State> | null {
        const result: Partial<State> = {};

        if (props.unlocked !== prevState.unlocked && !prevState.unlocked) {
            result.unlocked = props.unlocked;
        }

        return Object.keys(result).length ? result : null;
    }

    private _order: number[] = [];
    private _howl: Howl | undefined;

    public override componentDidUpdate(prevProps: Props, prevState: State): void {
        if (prevProps.volume !== this.props.volume) {
            Howler.volume(this.props.volume);
        }

        if (prevState.muted !== this.state.muted) {
            Howler.mute(this.state.muted);
        }

        if (prevProps.current !== this.props.current) {
            this._howl?.stop().unload();
            this._advance();
        }

        if (prevProps.shuffle !== this.props.shuffle || prevProps.playlist.length !== this.props.playlist.length) {
            this._makeOrder();
        }

        if (prevState.unlocked !== this.state.unlocked && this.state.unlocked) {
            this._onPlayClicked();
        }
    }

    private readonly _onPlayClicked = (): void => {
        const { current, playlist } = this.props;
        const { unlocked } = this.state;
        const entry = playlist[current];
        if (!entry) {
            return;
        }

        const state: Partial<State> = { loading: true };

        if (this._howl) {
            this._howl.stop().unload();
        }

        this._howl = this._createHowl(entry.url);

        if (!unlocked) {
            Howler.volume(this.props.volume);
            state.unlocked = true;
        }

        this.setState(state);
        this._howl.play();
    };

    private readonly _onPauseClicked = (): void => {
        this._howl?.pause();
    };

    private readonly _onStopClicked = (): void => {
        this._howl?.stop();
    };

    private readonly _onPrevClicked = (): void => {
        const { current, onSongChanged, playlist, repeat } = this.props;

        const position = this._order.indexOf(current);
        if (position > 0 || repeat) {
            const newPosition = position - 1 >= 0 ? position - 1 : playlist.length - 1;
            const id = this._order[newPosition]!;
            onSongChanged?.(id);
        }
    };

    private readonly _onNextClicked = (): void => {
        const { current, onSongChanged, playlist, repeat } = this.props;

        const position = this._order.indexOf(current);
        if (position < playlist.length || repeat) {
            const newPosition = position + 1 >= playlist.length ? 0 : position + 1;
            const id = this._order[newPosition]!;
            onSongChanged?.(id);
        }
    };

    private readonly _onMuteClicked = (): unknown => this.setState(({ muted }) => ({ muted: !muted }));

    private readonly _onVolumeDownClicked = (): unknown =>
        this.props.onVolumeChanged?.(this.props.volume < 0.05 ? 0 : this.props.volume - 0.05);

    private readonly _onVolumeUpClicked = (): unknown =>
        this.props.onVolumeChanged?.(this.props.volume > 0.95 ? 1 : this.props.volume + 0.05);

    private readonly _onRepeatListClicked = (): unknown => this.props.onRepeatChanged?.(!this.props.repeat);

    private readonly _onShuffleListClicked = (): unknown => this.props.onShuffleChanged?.(!this.props.shuffle);

    private readonly _onVolumeChanged = ({ currentTarget }: h.JSX.TargetedEvent<HTMLInputElement>): void => {
        const { valueAsNumber } = currentTarget;
        this.props.onVolumeChanged?.(valueAsNumber / 100);
    };

    private readonly _onPositionChanged = ({ currentTarget }: h.JSX.TargetedEvent<HTMLInputElement>): void => {
        const { valueAsNumber } = currentTarget;

        if (this._howl?.playing()) {
            this._howl.seek((this._howl.duration() * valueAsNumber) / 100);
        }
    };

    private readonly _onPauseHandler = (): unknown => this.setState({ state: 'paused' });

    private readonly _onPlayHandler = (): void => {
        this.setState({ state: 'playing', loading: false });
        requestAnimationFrame(this._step);
    };

    private readonly _onStopHandler = (): unknown => this.setState({ state: 'paused', time: formatTime(0) });

    private readonly _onSeekHandler = (): unknown => requestAnimationFrame(this._step);

    private readonly _onErrorHandler = (_: unknown, e: unknown): void => {
        this.setState({ loading: false, state: 'paused' });
        this.props.onError?.(e);
    };

    private readonly _step = (): void => {
        if (this._howl) {
            const position = +this._howl.seek() || 0;
            const duration = this._howl.duration();

            this.setState({
                progress: duration ? Math.round((position / duration) * 1000) / 10 : 0,
                time: formatTime(position),
                duration: formatTime(duration),
            });

            if (this._howl.playing()) {
                requestAnimationFrame(this._step);
            }
        }
    };

    private _createHowl(url: string): Howl {
        return new Howl({
            src: url,
            html5: true,
            autoplay: false,
            onplay: this._onPlayHandler,
            onpause: this._onPauseHandler,
            onstop: this._onStopHandler,
            onseek: this._onSeekHandler,
            onend: this._onNextClicked,
            onloaderror: this._onErrorHandler,
            onplayerror: this._onErrorHandler,
        });
    }

    private _advance(): void {
        const { unlocked } = this.state;

        this.setState({
            progress: 0,
            time: formatTime(0),
            duration: formatTime(this._howl?.duration() ?? 0),
        });

        if (unlocked) {
            this._onPlayClicked();
        }
    }

    private _makeOrder(): void {
        const { playlist, shuffle } = this.props;
        const order: number[] = [];

        let len = playlist.length;
        for (let i = 0; i < len; ++i) {
            order.push(i);
        }

        if (shuffle) {
            while (len > 0) {
                // eslint-disable-next-line sonarjs/pseudo-random
                const randomIndex = Math.floor(Math.random() * len);
                --len;

                const tmp = order[len]!;
                order[len] = order[randomIndex]!;
                order[randomIndex] = tmp;
            }
        }

        this._order = order;
    }

    public render(): ComponentChild {
        const { current, playlist, repeat, shuffle, volume } = this.props;
        const { duration, loading, muted, progress, state, time } = this.state;
        const entry = playlist[current];
        const index = this._order.indexOf(current);

        return (
            <div className="Player" role="main" aria-label="Аудіоплеєр">
                <div className="volume-container">
                    <MuteButton muted={muted} onClick={this._onMuteClicked} />
                    <DecreaseVolumeButton disabled={volume <= 0} onClick={this._onVolumeDownClicked} />
                    <IncreaseVolumeButton disabled={volume >= 1} onClick={this._onVolumeUpClicked} />
                    <div className="volume">
                        <div
                            className="volume-bar"
                            style={{ backgroundSize: `${Math.round(volume * 1000) / 10}% 100%` }}
                            title={`Гучність: ${Math.round(volume * 100)}%`}
                        />
                        <Range aria-label="Регулятор гучності" value={volume * 100} onInput={this._onVolumeChanged} />
                    </div>
                </div>
                <div className="progress-container">
                    <div className="progress">
                        <div className="progress-bar" style={{ backgroundSize: `${progress}% 100%` }} />
                        <Range
                            step={0.1}
                            value={progress}
                            aria-label="Прогрес відтворення"
                            disabled={!this._howl?.playing}
                            onInput={this._onPositionChanged}
                        />
                    </div>
                    <div className="time-container">
                        {loading ? (
                            <Loader />
                        ) : (
                            <Fragment>
                                {time} / {duration}
                            </Fragment>
                        )}
                    </div>
                </div>
                <MetaContainer artist={entry?.artist ?? ''} title={entry?.title ?? ''} />
                <div className="control-container">
                    <PrevButton disabled={!playlist.length || (index <= 0 && !repeat)} onClick={this._onPrevClicked} />
                    {!entry || state === 'paused' ? (
                        <PlayButton disabled={!entry} onClick={this._onPlayClicked} />
                    ) : (
                        <PauseButton onClick={this._onPauseClicked} />
                    )}
                    <StopButton disabled={!entry} onClick={this._onStopClicked} />
                    <NextButton disabled={index >= playlist.length - 1 && !repeat} onClick={this._onNextClicked} />
                    <ShuffleButton shuffle={shuffle} onClick={this._onShuffleListClicked} />
                    <RepeatButton repeat={repeat} onClick={this._onRepeatListClicked} />
                </div>
            </div>
        );
    }
}
