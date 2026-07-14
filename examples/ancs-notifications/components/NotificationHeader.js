import { Skins, Styles } from "NotificationAssets";
import { formatReceivedTime } from "NotificationModel";
import Timer from "timer";

const Header = Container.template(($) => ({
	skin: Skins.header,
	contents: [
		Label($, {
			anchor: "TITLE",
			left: 12,
			top: 6,
			width: 132,
			height: 25,
			style: Styles.headerTitle,
			string: "Notifications",
		}),
		Label($, {
			anchor: "TIME",
			right: 36,
			top: 7,
			width: 52,
			height: 19,
			style: Styles.headerStatus,
			string: formatReceivedTime(Date.now()),
		}),
		Content($, {
			anchor: "STATUS_ICON",
			right: 12,
			top: 10,
			width: 16,
			height: 16,
			skin: Skins.statusIcon,
			state: 0,
			variant: 1,
		}),
		Label($, {
			anchor: "COUNT",
			left: 12,
			right: 12,
			top: 31,
			height: 16,
			style: Styles.headerStatus,
			string: "0 alerts",
		}),
	],
	Behavior: class extends Behavior {
		onCreate(_container, data) {
			this.anchors = data;
		}

		onDisplaying() {
			this.updateClock();
			if (!this.clockTimer) this.clockTimer = Timer.repeat(() => this.updateClock(), 1000);
		}

		onUndisplaying() {
			if (!this.clockTimer) return;
			Timer.clear(this.clockTimer);
			this.clockTimer = undefined;
		}

		updateClock() {
			this.anchors.TIME.string = formatReceivedTime(Date.now());
		}

		onModelChanged(_container, model) {
			this.anchors.STATUS_ICON.state = model.connection === "connected" ? 1 : 0;
			const count = model.notifications.length;
			this.anchors.COUNT.string = `${count} ${count === 1 ? "alert" : "alerts"}`;
		}
	},
}));

export default Header;
