declare const RemoteCommandID: Readonly<{
	PLAY: 0;
	PAUSE: 1;
	TOGGLE_PLAY_PAUSE: 2;
	NEXT_TRACK: 3;
	PREVIOUS_TRACK: 4;
	VOLUME_UP: 5;
	VOLUME_DOWN: 6;
	ADVANCE_REPEAT_MODE: 7;
	ADVANCE_SHUFFLE_MODE: 8;
	SKIP_FORWARD: 9;
	SKIP_BACKWARD: 10;
	LIKE_TRACK: 11;
	DISLIKE_TRACK: 12;
	BOOKMARK_TRACK: 13;
}>;

type RemoteCommand = (typeof RemoteCommandID)[keyof typeof RemoteCommandID];

interface AMSState {
	player: {
		name?: string;
		volume?: number;
	};
	playback: {
		state?: number;
		rate?: number;
		elapsed?: number;
	};
	track: {
		artist?: string;
		album?: string;
		title?: string;
		duration?: number;
	};
	deviceName?: string;
}

interface AMSClientDelegate {
	onAMSConnected?(address: unknown): void;
	onAMSDeviceNameChanged?(name: string): void;
	onAMSStateChanged?(state: AMSState): void;
	onAMSError?(error: unknown): void;
}

declare class AMSClient {
	constructor(delegate: AMSClientDelegate);
	readonly connected: boolean;
	connect(address: unknown): boolean;
	remoteCommand(command: RemoteCommand): boolean;
	sample(): AMSState;
}

export type { AMSClientDelegate, AMSState, RemoteCommand };
export { AMSClient, RemoteCommandID };
