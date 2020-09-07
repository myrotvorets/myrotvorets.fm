export interface IHowlProperties {
    xhr?: Record<string, unknown> | null;
}

export interface HowlerGlobal {
    stop(): void;
}
