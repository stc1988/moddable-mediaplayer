const Colors = Object.freeze({
	background: "#eef2f6",
	header: "#f8fafc",
	card: "#ffffff",
	cardPending: "#e9edf2",
	text: "#17212b",
	muted: "#6d7885",
	accent: "#1677ff",
	disconnected: "#9aa4af",
	danger: "#ef5350",
	dangerPressed: "#c93f3c",
	success: "#1f9d55",
	successPressed: "#157a40",
	disabled: "#b6bec7",
});

const Textures = Object.freeze({
	statusIcons: new Texture("status-icons-mask.png"),
});

const Skins = Object.freeze({
	app: new Skin({ fill: Colors.background }),
	header: new Skin({ fill: Colors.header, stroke: "#dce2e8", borders: { bottom: 1 } }),
	card: new Skin({ fill: Colors.card, stroke: "#dfe5eb", borders: { left: 1, right: 1, top: 1, bottom: 1 } }),
	cardPending: new Skin({
		fill: Colors.cardPending,
		stroke: "#d7dde4",
		borders: { left: 1, right: 1, top: 1, bottom: 1 },
	}),
	accent: new Skin({ fill: Colors.accent }),
	statusIcon: new Skin({
		texture: Textures.statusIcons,
		width: 16,
		height: 16,
		states: 16,
		variants: 16,
		color: [Colors.disconnected, Colors.accent],
	}),
});

const Styles = Object.freeze({
	headerTitle: new Style({
		font: "semibold 18px M PLUS 1",
		color: Colors.text,
		horizontal: "left",
		vertical: "middle",
	}),
	headerStatus: new Style({
		font: "medium 16px M PLUS 1",
		color: Colors.muted,
		horizontal: "right",
		vertical: "middle",
	}),
	appName: new Style({
		font: "medium 16px M PLUS 1",
		color: Colors.accent,
		horizontal: "left",
		vertical: "middle",
	}),
	receivedTime: new Style({
		font: "medium 16px M PLUS 1",
		color: Colors.muted,
		horizontal: "right",
		vertical: "middle",
	}),
	title: new Style({
		font: "semibold 18px M PLUS 1",
		color: Colors.text,
		horizontal: "left",
		vertical: "middle",
	}),
	message: new Style({
		font: "medium 16px M PLUS 1",
		color: Colors.muted,
		horizontal: "left",
		vertical: "top",
	}),
	positive: new Style({
		font: "semibold 18px M PLUS 1",
		color: [Colors.success, Colors.successPressed],
		horizontal: "center",
		vertical: "middle",
	}),
	negative: new Style({
		font: "semibold 18px M PLUS 1",
		color: [Colors.danger, Colors.dangerPressed],
		horizontal: "center",
		vertical: "middle",
	}),
	actionDisabled: new Style({
		font: "semibold 18px M PLUS 1",
		color: Colors.disabled,
		horizontal: "center",
		vertical: "middle",
	}),
	emptyTitle: new Style({
		font: "semibold 18px M PLUS 1",
		color: Colors.text,
		horizontal: "center",
		vertical: "middle",
	}),
	emptyBody: new Style({
		font: "medium 16px M PLUS 1",
		color: Colors.muted,
		horizontal: "center",
		vertical: "top",
	}),
});

export { Colors, Skins, Styles, Textures };
