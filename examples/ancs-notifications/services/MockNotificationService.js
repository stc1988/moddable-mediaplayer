import { ConnectionState } from "NotificationModel";
import NotificationService from "NotificationService";
import Timer from "timer";

const MOCK_NOTIFICATIONS = Object.freeze([
	{
		appIdentifier: "com.apple.MobileSMS",
		appName: "Messages",
		title: "Aya",
		message: "Are we still meeting at the station at 7?",
		hasNegativeAction: true,
	},
	{
		appIdentifier: "com.apple.mobilemail",
		appName: "Mail",
		title: "Design review",
		subtitle: "Tomorrow, 10:00",
		message: "The latest prototype is ready for review.",
		hasNegativeAction: true,
	},
	{
		appIdentifier: "com.apple.reminders",
		appName: "Reminders",
		title: "Buy coffee beans",
		message: "When arriving near the grocery store",
		hasNegativeAction: false,
	},
	{
		appIdentifier: "com.apple.weather",
		appName: "Weather",
		title: "Rain starting soon",
		message: "Rain is expected in your area within 20 minutes.",
		hasNegativeAction: true,
	},
]);

class MockNotificationService extends NotificationService {
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

	dismiss(uid) {
		const notification = this.notifications.get(uid);
		if (!notification?.hasNegativeAction) return false;
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
		if (this.notifications.size > 20) this.notifications.delete(this.notifications.keys().next().value);
		this.emit({ notification });
	}

	schedule(callback, delay) {
		const timer = Timer.set(() => {
			const index = this.timers.indexOf(timer);
			if (index >= 0) this.timers.splice(index, 1);
			callback();
		}, delay);
		this.timers.push(timer);
	}
}

export default MockNotificationService;
