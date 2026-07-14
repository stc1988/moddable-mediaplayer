class NotificationService {
	constructor() {
		this.delegate = null;
	}

	start() {
		throw new Error("NotificationService.start must be implemented by a concrete service.");
	}

	dismiss(_uid) {
		throw new Error("NotificationService.dismiss must be implemented by a concrete service.");
	}

	emit(update) {
		this.delegate?.onServiceUpdate(update);
	}
}

export default NotificationService;
