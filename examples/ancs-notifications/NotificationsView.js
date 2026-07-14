import { Skins } from "NotificationAssets";
import Header from "NotificationHeader";
import NotificationList from "NotificationList";

const NotificationsApplication = Application.template(($) => ({
	skin: Skins.app,
	contents: [
		Header($, { left: 0, right: 0, top: 0, height: 54 }),
		NotificationList($, { left: 0, right: 0, top: 54, bottom: 0 }),
	],
}));

export default NotificationsApplication;
