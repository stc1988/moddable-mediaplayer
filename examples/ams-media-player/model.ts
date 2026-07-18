import { isElapsedOnlyUpdate, log, logUpdate } from "Logger";

const ConnectionState = Object.freeze({
	DISCONNECTED: "disconnected",
	CONNECTING: "connecting",
	CONNECTED: "connected",
});

const PlaybackState = Object.freeze({
	UNKNOWN: "unknown",
	STOPPED: "stopped",
	PAUSED: "paused",
	PLAYING: "playing",
});

type ConnectionStateValue = (typeof ConnectionState)[keyof typeof ConnectionState];
type PlaybackStateValue = (typeof PlaybackState)[keyof typeof PlaybackState];

interface Track {
	title: string;
	artist: string;
	album: string;
	duration: number;
	elapsed: number;
}

type TrackUpdate = Partial<Track>;

interface Artwork {
	key: string;
	state: "empty" | "loaded" | "loading" | "unavailable" | "error";
	url?: string;
	data?: ArrayBuffer;
	error?: string;
}

interface NetworkState {
	connected: boolean;
	ip?: string;
}

interface DeviceState {
	name: string;
	status: string;
}

interface MediaPlayerModel {
	playerConnection: ConnectionStateValue;
	playback: PlaybackStateValue;
	track: Track;
	artwork: Artwork | null;
	network: NetworkState;
	volume: number;
	device: DeviceState;
}

interface ModelUpdate {
	playerConnection?: ConnectionStateValue;
	playback?: PlaybackStateValue;
	track?: TrackUpdate;
	artwork?: Artwork | null;
	network?: Partial<NetworkState>;
	volume?: number;
	device?: Partial<DeviceState>;
}

interface InitialModel {
	network?: Partial<NetworkState>;
}

function createInitialModel(initial: InitialModel = {}): MediaPlayerModel {
	const model = {
		playerConnection: ConnectionState.DISCONNECTED,
		playback: PlaybackState.UNKNOWN,
		track: createEmptyTrack(),
		artwork: null,
		network: {
			connected: initial.network?.connected ?? false,
			ip: initial.network?.ip,
		},
		volume: 0.45,
		device: {
			name: "Apple Media Service",
			status: "Disconnected",
		},
	};
	log("model", "initial state created", `playerConnection=${model.playerConnection} playback=${model.playback}`);
	return model;
}

function createEmptyTrack(): Track {
	return {
		title: "",
		artist: "",
		album: "",
		duration: 0,
		elapsed: 0,
	};
}

function mergeTrack(target: Track, source?: TrackUpdate) {
	if (!source) return;
	target.title = source.title ?? target.title;
	target.artist = source.artist ?? target.artist;
	target.album = source.album ?? target.album;
	target.duration = source.duration ?? target.duration;
	target.elapsed = source.elapsed ?? target.elapsed;
}

function applyModelUpdate(model: MediaPlayerModel, update?: ModelUpdate) {
	if (!update) return model;
	const shouldLog = !isElapsedOnlyUpdate(update);
	if (shouldLog) logUpdate("model", "apply update", update);
	if (update.playerConnection !== undefined) model.playerConnection = update.playerConnection;
	if (update.playback !== undefined) model.playback = update.playback;
	if (update.track !== undefined) mergeTrack(model.track, update.track);
	if (update.artwork !== undefined) model.artwork = update.artwork;
	if (update.network !== undefined) model.network = { ...model.network, ...update.network };
	if (update.volume !== undefined) model.volume = update.volume;
	if (update.device !== undefined) model.device = { ...model.device, ...update.device };
	if (shouldLog) {
		log(
			"model",
			"state changed",
			`playerConnection=${model.playerConnection} playback=${model.playback} title=${model.track.title}`,
		);
	}
	return model;
}

export type {
	Artwork,
	ConnectionStateValue,
	DeviceState,
	InitialModel,
	MediaPlayerModel,
	ModelUpdate,
	NetworkState,
	PlaybackStateValue,
	Track,
	TrackUpdate,
};
export { applyModelUpdate, ConnectionState, createEmptyTrack, createInitialModel, PlaybackState };
