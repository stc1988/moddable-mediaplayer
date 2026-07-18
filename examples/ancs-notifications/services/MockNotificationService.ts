import type { NotificationAction, NotificationInput } from "NotificationModel";
import { ConnectionState } from "NotificationModel";
import NotificationService from "NotificationService";
import Timer from "timer";

const MOCK_NOTIFICATIONS: readonly Omit<NotificationInput, "uid">[] = Object.freeze([
	{
		appIdentifier: "com.moddablue.layout-test",
		appName: "Layout Test",
		title: "One-line body",
		message: "This is one line.",
		positiveActionLabel: "Open",
		negativeActionLabel: "Clear",
		hasPositiveAction: true,
		hasNegativeAction: true,
	},
	{
		appIdentifier: "com.moddablue.layout-test",
		appName: "Layout Test",
		title: "Two-line body",
		message: "This is line one.\nThis is line two.",
		negativeActionLabel: "Clear",
		hasPositiveAction: false,
		hasNegativeAction: true,
	},
	{
		appIdentifier: "com.moddablue.layout-test",
		appName: "Layout Test",
		title: "Four-line body",
		message: "This is line one.\nThis is line two.\nThis is line three.\nThis is line four.",
		positiveActionLabel: "View",
		hasPositiveAction: true,
		hasNegativeAction: false,
	},
	{
		appIdentifier: "com.apple.weather",
		appName: "Weather",
		title: "Rain starting soon",
		message: "Rain is expected in your area within 20 minutes.",
		positiveActionLabel: "View Forecast",
		negativeActionLabel: "Dismiss",
		hasPositiveAction: true,
		hasNegativeAction: true,
	},
]);

class MockNotificationService extends NotificationService {
	declare notifications: Map<number, NotificationInput>;
	declare nextUID: number;
	declare sampleIndex: number;
	declare timers: Timer[];

	constructor() {
		super();
		this.notifications = new Map();
		this.nextUID = 100;
		this.sampleIndex = 0;
		this.timers = [];
	}

	start() {
		this.emit({ connection: ConnectionState.CONNECTING, status: "Connecting to mock iPhone" });
		this.schedule(() => {
			this.emit({ connection: ConnectionState.CONNECTED, status: "Mock iPhone connected" });
			this.addNextNotification();
		}, 500);
		this.schedule(() => this.addNextNotification(), 1800);
		this.schedule(() => this.addNextNotification(), 3200);
		Timer.repeat(() => this.addNextNotification(), 7000);
	}

	performAction(uid: number, action: NotificationAction) {
		const notification = this.notifications.get(uid);
		const supported =
			(action === "positive" && notification?.hasPositiveAction) ||
			(action === "negative" && notification?.hasNegativeAction);
		if (!supported) return false;
		this.schedule(() => {
			this.notifications.delete(uid);
			this.emit({ removedUID: uid });
		}, 250);
		return true;
	}

	addNextNotification() {
		const sample = MOCK_NOTIFICATIONS[this.sampleIndex % MOCK_NOTIFICATIONS.length];
		this.sampleIndex += 1;
		const notification = { ...sample, uid: this.nextUID++ };
		this.notifications.set(notification.uid, notification);
		const oldestUID = this.notifications.keys().next().value;
		if (this.notifications.size > 20 && oldestUID !== undefined) this.notifications.delete(oldestUID);
		this.emit({ notification });
	}

	schedule(callback: () => void, delay: number) {
		const timer = Timer.set(() => {
			const index = this.timers.indexOf(timer);
			if (index >= 0) this.timers.splice(index, 1);
			callback();
		}, delay);
		this.timers.push(timer);
	}
}

export default MockNotificationService;
