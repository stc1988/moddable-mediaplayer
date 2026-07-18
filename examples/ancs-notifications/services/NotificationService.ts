import type { NotificationAction, ServiceUpdate } from "NotificationModel";

interface NotificationServiceDelegate {
	onServiceUpdate(update: ServiceUpdate): void;
}

class NotificationService {
	declare delegate: NotificationServiceDelegate | null;

	constructor() {
		this.delegate = null;
	}

	start(): void {
		throw new Error("NotificationService.start must be implemented by a concrete service.");
	}

	performAction(_uid: number, _action: NotificationAction): boolean {
		throw new Error("NotificationService.performAction must be implemented by a concrete service.");
	}

	dismiss(uid: number) {
		return this.performAction(uid, "negative");
	}

	emit(update: ServiceUpdate) {
		this.delegate?.onServiceUpdate(update);
	}
}

export default NotificationService;
export type { NotificationServiceDelegate };
