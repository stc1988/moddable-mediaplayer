import { Skins, Styles } from "assets";
import type { MediaPlayerModel } from "model";
import type * as MC from "piu/MC";
import "piu/MC";

interface DeviceInfoAnchors {
	NAME: MC.Label;
	STATUS: MC.Label;
}

const DeviceInfo = Container.template(($) => ({
	skin: Skins.panel,
	contents: [
		Content($, { left: 6, top: 0, width: 16, height: 16, skin: Skins.deviceIcon }),
		Label($, { anchor: "NAME", left: 28, top: 0, width: 112, height: 16, style: Styles.deviceName }),
		Label($, { anchor: "STATUS", right: 6, top: 0, width: 66, height: 16, style: Styles.deviceStatus }),
	],
	Behavior: class extends Behavior {
		declare anchors: DeviceInfoAnchors;

		onCreate(_container: MC.Container, anchors: DeviceInfoAnchors) {
			this.anchors = anchors;
		}
		onModelChanged(_container: MC.Container, model: MediaPlayerModel) {
			this.anchors.NAME.string = model.device.name;
			this.anchors.STATUS.string = model.playerConnection === "connected" ? "Connected" : model.device.status;
		}
	},
}));

export default DeviceInfo;
