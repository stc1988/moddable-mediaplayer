import { Skins, Styles } from "NotificationAssets";
import type { NotificationAction, NotificationModel } from "NotificationModel";
import type Controller from "NotificationsController";
import type * as MC from "piu/MC";
import "piu/MC";

const MESSAGE_TOP = 49;
const MESSAGE_BOTTOM = 8;
const MAX_MESSAGE_LINES = 3;
const ACTION_LABEL_WIDTH = 36;

function captureTouch(content: MC.Content, id: number, x: number, y: number, ticks: number) {
	content.captureTouch(id as unknown as string, x, y, ticks);
}

function actionLabel(label: string | undefined, style: MC.Style, fallback: string) {
	return label && (style.measure(label).width ?? Number.POSITIVE_INFINITY) <= ACTION_LABEL_WIDTH ? label : fallback;
}

class VerticalScrollerBehavior extends Behavior {
	declare anchor: number;
	declare y: number;
	declare waiting: boolean;

	onTouchBegan(scroller: MC.Scroller, _id: number, _x: number, y: number) {
		this.anchor = scroller.scroll.y ?? 0;
		this.y = y;
		this.waiting = true;
	}

	onTouchMoved(scroller: MC.Scroller, id: number, x: number, y: number, ticks: number) {
		const delta = y - this.y;
		if (this.waiting) {
			if (Math.abs(delta) < 8) return;
			this.waiting = false;
			captureTouch(scroller, id, x, y, ticks);
		}
		scroller.scrollTo(0, this.anchor - delta);
	}
}

class ActionButtonBehavior extends Behavior {
	declare controller: Controller;
	declare uid: number;
	declare action: NotificationAction;

	onCreate(
		_button: MC.Container,
		data: { controller: Controller; notification: { uid: number }; action: NotificationAction },
	) {
		this.controller = data.controller;
		this.uid = data.notification.uid;
		this.action = data.action;
	}

	onTouchBegan(button: MC.Container, id: number, x: number, y: number, ticks: number) {
		captureTouch(button, id, x, y, ticks);
		const label = button.first;
		if (label) label.state = 1;
	}

	onTouchMoved(button: MC.Container, _id: number, x: number, y: number) {
		const label = button.first;
		if (label) label.state = button.hit(x, y) ? 1 : 0;
	}

	onTouchEnded(button: MC.Container, _id: number, x: number, y: number) {
		const accepted = button.hit(x, y);
		const label = button.first;
		if (label) label.state = 0;
		if (accepted) this.controller.onAction(this.uid, this.action);
	}

	onTouchCancelled(button: MC.Container) {
		const label = button.first;
		if (label) label.state = 0;
	}
}

class NotificationCardBehavior extends Behavior {
	declare anchors: { MESSAGE: MC.Text };

	onCreate(_card: MC.Container, anchors: { MESSAGE: MC.Text }) {
		this.anchors = anchors;
	}

	onDisplaying(card: MC.Container) {
		const message = this.anchors.MESSAGE;
		const lineHeight = Math.ceil(Styles.message.measure("Ag").height ?? 0);
		const messageHeight = Math.min(message.height, lineHeight * MAX_MESSAGE_LINES);

		message.height = messageHeight;
		card.height = MESSAGE_TOP + messageHeight + MESSAGE_BOTTOM;
	}
}

const NotificationCard = Container.template(($) => {
	const notification = $.notification;
	const positiveActionable = notification.hasPositiveAction && !notification.pendingAction;
	const negativeActionable = notification.hasNegativeAction && !notification.pendingAction;
	const positiveLabel = actionLabel(notification.positiveActionLabel, Styles.positive, "+");
	const negativeLabel = actionLabel(notification.negativeActionLabel, Styles.negative, "×");
	const appName = notification.appName ?? notification.appIdentifier ?? "iPhone";
	const title = notification.title || notification.subtitle || "Notification";
	const message = notification.message || notification.subtitle || "No additional details";

	return {
		left: 8,
		right: 8,
		top: 8,
		height: 106,
		clip: true,
		skin: notification.pendingAction ? Skins.cardPending : Skins.card,
		Behavior: NotificationCardBehavior,
		contents: [
			Content($, { left: 0, top: 0, width: 4, bottom: 0, skin: Skins.accent }),
			Label($, { left: 12, right: 144, top: 6, height: 19, style: Styles.appName, string: appName }),
			Label($, {
				right: 88,
				top: 6,
				width: 52,
				height: 19,
				style: Styles.receivedTime,
				string: notification.receivedTime,
			}),
			Label($, { left: 12, right: 86, top: 26, height: 20, style: Styles.title, string: title }),
			Text($, { anchor: "MESSAGE", left: 12, right: 12, top: MESSAGE_TOP, style: Styles.message, string: message }),
			Container(
				{ controller: $.controller, notification, action: "positive" },
				{
					right: 44,
					top: 1,
					width: 40,
					height: 40,
					active: positiveActionable,
					contents: [
						Label($, {
							left: 0,
							right: 0,
							top: 0,
							bottom: 1,
							style: positiveActionable ? Styles.positive : Styles.actionDisabled,
							string: positiveLabel,
						}),
					],
					Behavior: ActionButtonBehavior,
				},
			),
			Container(
				{ controller: $.controller, notification, action: "negative" },
				{
					right: 4,
					top: 1,
					width: 40,
					height: 40,
					active: negativeActionable,
					contents: [
						Label($, {
							left: 0,
							right: 0,
							top: 0,
							bottom: 1,
							style: negativeActionable ? Styles.negative : Styles.actionDisabled,
							string: negativeLabel,
						}),
					],
					Behavior: ActionButtonBehavior,
				},
			),
		],
	};
});

const EmptyState = Column.template(($) => ({
	left: 18,
	right: 18,
	top: 72,
	contents: [
		Label($, { left: 0, right: 0, height: 30, style: Styles.emptyTitle, string: "No notifications" }),
		Text($, {
			left: 0,
			right: 0,
			top: 4,
			height: 62,
			style: Styles.emptyBody,
			string: "New iPhone alerts will appear here, newest first.",
		}),
	],
}));

const NotificationList = Scroller.template(($) => ({
	active: true,
	backgroundTouch: true,
	clip: true,
	contents: [
		Column($, {
			anchor: "LIST",
			left: 0,
			right: 0,
			top: 0,
			Behavior: class extends Behavior {
				declare controller: Controller;
				declare firstUID: number | undefined;

				onCreate(_column: MC.Column, data: { controller: Controller }) {
					this.controller = data.controller;
					this.firstUID = undefined;
				}

				onModelChanged(column: MC.Column, model: NotificationModel) {
					const firstUID = model.notifications[0]?.uid;
					const hasNewTopNotification = this.firstUID !== undefined && firstUID !== this.firstUID;
					this.firstUID = firstUID;
					column.empty();
					if (model.notifications.length) {
						for (const notification of model.notifications) {
							column.add(new NotificationCard({ controller: this.controller, notification }));
						}
						column.add(Content(null, { height: 8 }));
					} else column.add(new EmptyState());
					if (hasNewTopNotification) (column.container as MC.Scroller).scrollTo(0, 0);
				}
			},
		}),
	],
	Behavior: VerticalScrollerBehavior,
}));

export default NotificationList;
