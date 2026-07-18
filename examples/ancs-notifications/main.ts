import { createInitialModel } from "NotificationModel";
import NotificationServiceProvider from "NotificationServiceProvider";
import Controller from "NotificationsController";
import NotificationsApplication from "NotificationsView";
import "piu/MC";

const model = createInitialModel();
const service = new NotificationServiceProvider();
const controller = new Controller(model, service);

const app = new NotificationsApplication(
	{ controller, model },
	{ commandListLength: 4096, displayListLength: 4096, touchCount: 1 },
);
controller.attachView(app);
controller.start();

export default app;
