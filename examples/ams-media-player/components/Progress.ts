import { SliderBehavior } from "Behaviors";
import type Controller from "Controller";
import { log } from "Logger";
import { Skins, Styles } from "assets";
import type { MediaPlayerModel } from "model";
import type * as MC from "piu/MC";
import "piu/MC";

const TRACK_LEFT = 46;
const TRACK_RIGHT = 46;
const TRACK_TOP = 8;
const TRACK_HEIGHT = 3;
const TRACK_ACTIVE_TOP = 7;
const TRACK_ACTIVE_HEIGHT = 5;
const KNOB_SIZE = 10;
const KNOB_ACTIVE_SIZE = 16;
const KNOB_CENTER_Y = 9;

interface ProgressAnchors {
	controller: Controller;
	ELAPSED: MC.Label;
	DURATION: MC.Label;
	PROGRESS_TRACK: MC.Content;
	PROGRESS_FILL: MC.Content;
	PROGRESS_KNOB: MC.Content;
}

function formatTime(seconds: number) {
	seconds = Math.max(0, Math.floor(seconds || 0));
	const minutes = Math.floor(seconds / 60);
	const rest = seconds % 60;
	return `${minutes}:${rest < 10 ? "0" : ""}${rest}`;
}

const Progress = Container.template(($) => ({
	active: true,
	skin: Skins.touchArea,
	contents: [
		Label($, { anchor: "ELAPSED", left: 0, top: 0, width: 38, height: 18, style: Styles.time }),
		Content($, {
			anchor: "PROGRESS_TRACK",
			left: TRACK_LEFT,
			right: TRACK_RIGHT,
			top: TRACK_TOP,
			height: TRACK_HEIGHT,
			skin: Skins.progressTrack,
		}),
		Content($, {
			anchor: "PROGRESS_FILL",
			left: TRACK_LEFT,
			top: TRACK_TOP,
			width: 0,
			height: TRACK_HEIGHT,
			skin: Skins.sliderFillInactive,
		}),
		Content($, { anchor: "PROGRESS_KNOB", left: TRACK_LEFT, top: 4, width: 10, height: 10, skin: Skins.knobInactive }),
		Label($, { anchor: "DURATION", right: 0, top: 0, width: 38, height: 18, style: Styles.time }),
	],
	Behavior: class extends SliderBehavior<ProgressAnchors> {
		declare progressWidth: number | undefined;
		declare duration: number | undefined;

		onCreate(_container: MC.Container, data: ProgressAnchors) {
			super.onCreate(_container, data);
			this.trackLeft = TRACK_LEFT;
			this.trackRight = TRACK_RIGHT;
		}
		setActive(active: boolean) {
			this.active = active;
			this.updateTrack();
			this.anchors.PROGRESS_FILL.skin = active ? Skins.sliderFillActive : Skins.sliderFillInactive;
			this.anchors.PROGRESS_KNOB.skin = active ? Skins.knobActive : Skins.knobInactive;
			this.updateProgressKnob(this.progressWidth || 0);
		}
		updateTrack() {
			const top = this.active ? TRACK_ACTIVE_TOP : TRACK_TOP;
			const height = this.active ? TRACK_ACTIVE_HEIGHT : TRACK_HEIGHT;
			this.anchors.PROGRESS_TRACK.coordinates = {
				left: TRACK_LEFT,
				right: TRACK_RIGHT,
				top,
				height,
			} as MC.Coordinates;
			this.anchors.PROGRESS_FILL.coordinates = {
				left: TRACK_LEFT,
				top,
				width: this.progressWidth || 0,
				height,
			} as MC.Coordinates;
		}
		onValueChanging(container: MC.Container, fraction: number) {
			const duration = this.duration || 0;
			if (!duration || !this.controller) {
				log("progress", "seek ignored", `duration=${duration} controller=${this.controller ? "attached" : "missing"}`);
				return;
			}
			const elapsed = Math.round(duration * fraction);
			log("progress", "seek preview", `elapsed=${elapsed} duration=${duration} fraction=${fraction}`);
			this.updateProgress(container, elapsed, duration);
		}
		onValueChanged(_container: MC.Container, fraction: number) {
			const duration = this.duration || 0;
			if (!duration || !this.controller) return;
			const elapsed = Math.round(duration * fraction);
			log("progress", "seek commit", `elapsed=${elapsed} duration=${duration} fraction=${fraction}`);
			this.controller.onSeekTo(elapsed);
		}
		updateProgress(container: MC.Container, elapsed: number, duration: number) {
			const trackWidth = container.width - TRACK_LEFT - TRACK_RIGHT;
			const width = duration ? Math.round((trackWidth * elapsed) / duration) : 0;
			this.anchors.PROGRESS_FILL.width = width;
			this.progressWidth = width;
			this.updateTrack();
			this.updateProgressKnob(width);
			this.anchors.ELAPSED.string = formatTime(elapsed);
			this.anchors.DURATION.string = formatTime(duration);
		}
		updateProgressKnob(width: number) {
			const size = this.active ? KNOB_ACTIVE_SIZE : KNOB_SIZE;
			this.anchors.PROGRESS_KNOB.coordinates = {
				left: TRACK_LEFT + width - (size >> 1),
				top: KNOB_CENTER_Y - (size >> 1),
				width: size,
				height: size,
			} as MC.Coordinates;
		}
		onModelChanged(container: MC.Container, model: MediaPlayerModel) {
			if (this.dragging) return;
			const duration = model.track.duration || 0;
			const elapsed = Math.min(model.track.elapsed || 0, duration);
			this.duration = duration;
			this.updateProgress(container, elapsed, duration);
		}
	},
}));

export default Progress;
