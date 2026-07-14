import { applyServiceUpdate, setDismissalPending } from "NotificationModel";

function logNotification(event, notification) {
	const appName = notification.appName ?? notification.appIdentifier ?? "unknown app";
	trace(`[notification] ${event} at=${notification.receivedTime} uid=${notification.uid} app=${appName}\n`);
	trace(`  title: ${notification.title ?? ""}\n`);
	trace(`  subtitle: ${notification.subtitle ?? ""}\n`);
	trace(`  message: ${notification.message ?? ""}\n`);
	trace(
		`  actions: positive=${Boolean(notification.hasPositiveAction)} negative=${Boolean(notification.hasNegativeAction)}\n`,
	);
}

class Controller {
	constructor(model, service) {
		this.model = model;
		this.service = service;
		this.service.delegate = this;
	}

	attachView(view) {
		this.view = view;
		this.notifyView();
	}

	start() {
		this.service.start();
	}

	onServiceUpdate(update) {
		const wasKnown = update?.notification
			? this.model.notifications.some((item) => item.uid === update.notification.uid)
			: false;
		applyServiceUpdate(this.model, update);
		if (update?.notification) {
			const notification = this.model.notifications.find((item) => item.uid === update.notification.uid);
			if (notification) logNotification(wasKnown ? "updated" : "received", notification);
		}
		if (update?.removedUID !== undefined) trace(`[notification] removed uid=${update.removedUID}\n`);
		this.notifyView();
	}

	onDismiss(uid) {
		const notification = this.model.notifications.find((item) => item.uid === uid);
		if (!notification?.hasNegativeAction || notification.pendingDismissal) return;

		trace(`[notification] dismiss requested uid=${uid}\n`);
		if (this.service.dismiss(uid)) {
			setDismissalPending(this.model, uid, true);
			this.notifyView();
		} else {
			applyServiceUpdate(this.model, { error: "Dismiss action could not be sent" });
			this.notifyView();
		}
	}

	notifyView() {
		this.view?.distribute("onModelChanged", this.model);
	}
}

export default Controller;
