type ANCSAction = "positive" | "negative";

interface ANCSNotification {
	uid: number;
	appIdentifier?: string;
	appName?: string;
	title?: string;
	subtitle?: string;
	message?: string;
	positiveActionLabel?: string;
	negativeActionLabel?: string;
	hasPositiveAction?: boolean;
	hasNegativeAction?: boolean;
}

interface ANCSServiceDelegate {
	onANCSStatus?(status: string): void;
	onANCSConnected?(address: unknown): void;
	onANCSReady?(): void;
	onANCSNotification?(notification: ANCSNotification): void;
	onANCSNotificationRemoved?(notification: { uid: number }): void;
	onANCSServiceChanged?(change: unknown): void;
	onANCSSessionEnded?(): void;
	onANCSError?(error: unknown): void;
}

interface ANCSServiceOptions {
	deviceName?: string;
}

declare class ANCSService {
	constructor(delegate: ANCSServiceDelegate, options?: ANCSServiceOptions);
	start(): void;
	performAction(uid: number, action: ANCSAction): boolean;
}

export default ANCSService;
export type { ANCSAction, ANCSNotification, ANCSServiceDelegate, ANCSServiceOptions };
