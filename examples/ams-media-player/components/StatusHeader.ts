import { Layout, Skins } from "assets";
import type { MediaPlayerModel } from "model";
import type * as MC from "piu/MC";
import "piu/MC";

const StatusIcon = Content.template(($) => ({
	width: Layout.statusIconSize,
	height: Layout.statusIconSize,
	skin: Skins.statusIcon,
	state: $.state,
	variant: $.variant,
}));

const StatusHeader = Container.template(($) => ({
	skin: Skins.statusHeader,
	contents: [
		Row($, {
			right: 8,
			top: 3,
			height: Layout.statusIconSize,
			contents: [
				new StatusIcon({ state: 0, variant: 0 }),
				Content($, { width: 6 }),
				new StatusIcon({ state: 0, variant: 1 }),
			],
		}),
	],
	Behavior: class extends Behavior {
		onModelChanged(container: MC.Container, model: MediaPlayerModel) {
			const icons = container.first as MC.Container | null;
			if (!icons) return;
			if (icons.first) icons.first.state = model.network.connected ? 1 : 0;
			if (icons.last) icons.last.state = model.playerConnection === "connected" ? 1 : 0;
		}
	},
}));

export default StatusHeader;
