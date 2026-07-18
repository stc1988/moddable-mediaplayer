import { SliderBehavior } from "Behaviors";
import type Controller from "Controller";
import { Skins } from "assets";
import type { MediaPlayerModel } from "model";
import type * as MC from "piu/MC";
import "piu/MC";

const TRACK_LEFT = 28;
const TRACK_RIGHT = 28;
const TRACK_TOP = 9;
const TRACK_HEIGHT = 2;
const TRACK_ACTIVE_TOP = 8;
const TRACK_ACTIVE_HEIGHT = 4;
const KNOB_SIZE = 8;
const KNOB_ACTIVE_SIZE = 14;
const KNOB_CENTER_Y = 9;

interface VolumeAnchors {
	controller: Controller;
	VOLUME_TRACK: MC.Content;
	VOLUME_FILL: MC.Content;
	VOLUME_KNOB: MC.Content;
}

const Volume = Container.template(($) => ({
	active: true,
	contents: [
		Content($, { left: 0, top: 0, width: 20, height: 20, skin: Skins.muteIcon }),
		Content($, {
			anchor: "VOLUME_TRACK",
			left: TRACK_LEFT,
			right: TRACK_RIGHT,
			top: TRACK_TOP,
			height: TRACK_HEIGHT,
			skin: Skins.progressTrack,
		}),
		Content($, {
			anchor: "VOLUME_FILL",
			left: TRACK_LEFT,
			top: TRACK_TOP,
			width: 0,
			height: TRACK_HEIGHT,
			skin: Skins.sliderFillInactive,
		}),
		Content($, { anchor: "VOLUME_KNOB", left: TRACK_LEFT, top: 5, width: 8, height: 8, skin: Skins.knobSmallInactive }),
		Content($, { right: 0, top: 0, width: 20, height: 20, skin: Skins.volumeIcon }),
	],
	Behavior: class extends SliderBehavior<VolumeAnchors> {
		declare volumeWidth: number | undefined;

		onCreate(_container: MC.Container, data: VolumeAnchors) {
			super.onCreate(_container, data);
			this.trackLeft = TRACK_LEFT;
			this.trackRight = TRACK_RIGHT;
		}
		setActive(active: boolean) {
			this.active = active;
			this.updateTrack();
			this.anchors.VOLUME_FILL.skin = active ? Skins.sliderFillActive : Skins.sliderFillInactive;
			this.anchors.VOLUME_KNOB.skin = active ? Skins.knobSmallActive : Skins.knobSmallInactive;
			this.updateVolumeKnob(this.volumeWidth || 0);
		}
		updateTrack() {
			const top = this.active ? TRACK_ACTIVE_TOP : TRACK_TOP;
			const height = this.active ? TRACK_ACTIVE_HEIGHT : TRACK_HEIGHT;
			this.anchors.VOLUME_TRACK.coordinates = {
				left: TRACK_LEFT,
				right: TRACK_RIGHT,
				top,
				height,
			} as MC.Coordinates;
			this.anchors.VOLUME_FILL.coordinates = {
				left: TRACK_LEFT,
				top,
				width: this.volumeWidth || 0,
				height,
			} as MC.Coordinates;
		}
		onValueChanging(container: MC.Container, value: number) {
			this.updateVolume(container, value);
		}
		onValueChanged(_container: MC.Container, value: number) {
			if (this.controller) this.controller.onVolumeChange(value);
		}
		updateVolume(container: MC.Container, value: number) {
			const trackWidth = container.width - TRACK_LEFT - TRACK_RIGHT;
			const width = Math.round(trackWidth * value);
			this.anchors.VOLUME_FILL.width = width;
			this.volumeWidth = width;
			this.updateTrack();
			this.updateVolumeKnob(width);
		}
		updateVolumeKnob(width: number) {
			const size = this.active ? KNOB_ACTIVE_SIZE : KNOB_SIZE;
			this.anchors.VOLUME_KNOB.coordinates = {
				left: TRACK_LEFT + width - (size >> 1),
				top: KNOB_CENTER_Y - (size >> 1),
				width: size,
				height: size,
			} as MC.Coordinates;
		}
		onModelChanged(container: MC.Container, model: MediaPlayerModel) {
			if (this.dragging) return;
			const value = model.volume ?? 0.45;
			this.updateVolume(container, value);
		}
	},
}));

export default Volume;
