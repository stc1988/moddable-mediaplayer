import type { Notification, NotificationAction, NotificationModel, ServiceUpdate } from "NotificationModel";
import { applyServiceUpdate, setActionPending } from "NotificationModel";
import type NotificationService from "NotificationService";
import type * as MC from "piu/MC";

function logNotification(event: "received" | "updated", notification: Notification) {
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
	declare model: NotificationModel;
	declare service: NotificationService;
	declare view: MC.Application | undefined;

	constructor(model: NotificationModel, service: NotificationService) {
		this.model = model;
		this.service = service;
		this.service.delegate = this;
	}

	attachView(view: MC.Application) {
		this.view = view;
		this.notifyView();
	}

	start() {
		this.service.start();
	}

	onServiceUpdate(update: ServiceUpdate) {
		const notificationUpdate = update.notification;
		const wasKnown = notificationUpdate
			? this.model.notifications.some((item) => item.uid === notificationUpdate.uid)
			: false;
		applyServiceUpdate(this.model, update);
		if (notificationUpdate) {
			const notification = this.model.notifications.find((item) => item.uid === notificationUpdate.uid);
			if (notification) logNotification(wasKnown ? "updated" : "received", notification);
		}
		if (update?.removedUID !== undefined) trace(`[notification] removed uid=${update.removedUID}\n`);
		this.notifyView();
	}

	onAction(uid: number, action: NotificationAction) {
		const notification = this.model.notifications.find((item) => item.uid === uid);
		const supported =
			(action === "positive" && notification?.hasPositiveAction) ||
			(action === "negative" && notification?.hasNegativeAction);
		if (!supported || notification.pendingAction) return;

		trace(`[notification] ${action} action requested uid=${uid}\n`);
		if (this.service.performAction(uid, action)) {
			setActionPending(this.model, uid, true);
			this.notifyView();
		} else {
			applyServiceUpdate(this.model, { error: `${action} action could not be sent` });
			this.notifyView();
		}
	}

	notifyView() {
		this.view?.distribute("onModelChanged", this.model);
	}
}

export default Controller;
