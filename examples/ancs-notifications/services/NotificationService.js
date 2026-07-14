class NotificationService {
	constructor() {
		this.delegate = null;
	}

	start() {
		throw new Error("NotificationService.start must be implemented by a concrete service.");
	}

	performAction(_uid, _action) {
		throw new Error("NotificationService.performAction must be implemented by a concrete service.");
	}

	dismiss(uid) {
		return this.performAction(uid, "negative");
	}

	emit(update) {
		this.delegate?.onServiceUpdate(update);
	}
}

export default NotificationService;
