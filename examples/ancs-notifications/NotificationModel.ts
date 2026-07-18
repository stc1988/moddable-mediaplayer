const ConnectionState = Object.freeze({
	DISCONNECTED: "disconnected",
	CONNECTING: "connecting",
	CONNECTED: "connected",
});

type ConnectionStateValue = (typeof ConnectionState)[keyof typeof ConnectionState];
type NotificationAction = "positive" | "negative";

interface NotificationInput {
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
	receivedAt?: number;
}

interface Notification extends NotificationInput {
	receivedAt: number;
	receivedTime: string;
	pendingAction: boolean;
}

interface NotificationModel {
	connection: ConnectionStateValue;
	status: string;
	notifications: Notification[];
	error?: string;
}

interface ServiceUpdate {
	connection?: ConnectionStateValue;
	status?: string;
	clearNotifications?: boolean;
	notification?: NotificationInput;
	removedUID?: number;
	error?: unknown;
}

const MAX_NOTIFICATIONS = 20;

function formatReceivedTime(timestamp: number) {
	const date = new Date(timestamp);
	const hours = date.getHours();
	const minutes = date.getMinutes();
	return `${hours < 10 ? "0" : ""}${hours}:${minutes < 10 ? "0" : ""}${minutes}`;
}

function createInitialModel(): NotificationModel {
	return {
		connection: ConnectionState.DISCONNECTED,
		status: "Starting",
		notifications: [],
		error: undefined,
	};
}

function addOrUpdateNotification(model: NotificationModel, notification: NotificationInput) {
	const index = model.notifications.findIndex((item) => item.uid === notification.uid);
	const previous = index >= 0 ? model.notifications[index] : undefined;
	const receivedAt = notification.receivedAt ?? Date.now();
	const next = {
		...previous,
		...notification,
		receivedAt,
		receivedTime: formatReceivedTime(receivedAt),
		pendingAction: false,
	};

	if (index >= 0) model.notifications[index] = next;
	else model.notifications.unshift(next);

	if (model.notifications.length > MAX_NOTIFICATIONS) model.notifications.length = MAX_NOTIFICATIONS;
}

function removeNotification(model: NotificationModel, uid: number) {
	const index = model.notifications.findIndex((item) => item.uid === uid);
	if (index >= 0) model.notifications.splice(index, 1);
}

function setActionPending(model: NotificationModel, uid: number, pending: boolean) {
	const notification = model.notifications.find((item) => item.uid === uid);
	if (notification) notification.pendingAction = pending;
}

function applyServiceUpdate(model: NotificationModel, update?: ServiceUpdate) {
	if (!update) return model;
	if (update.connection !== undefined) model.connection = update.connection;
	if (update.status !== undefined) model.status = update.status;
	if (update.clearNotifications) model.notifications.length = 0;
	if (update.notification) addOrUpdateNotification(model, update.notification);
	if (update.removedUID !== undefined) removeNotification(model, update.removedUID);
	if ("error" in update) model.error = update.error === undefined ? undefined : `${update.error}`;
	return model;
}

export type {
	ConnectionStateValue,
	Notification,
	NotificationAction,
	NotificationInput,
	NotificationModel,
	ServiceUpdate,
};
export {
	addOrUpdateNotification,
	applyServiceUpdate,
	ConnectionState,
	createInitialModel,
	formatReceivedTime,
	removeNotification,
	setActionPending,
};
