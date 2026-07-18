import type Controller from "Controller";
import type { PlayerCommand } from "Controller";
import type * as MC from "piu/MC";
import "piu/MC";

function captureTouch(content: MC.Content, id: number, x: number, y: number, ticks: number) {
	content.captureTouch(id as unknown as string, x, y, ticks);
}

function clamp(value: number, min: number, max: number) {
	return Math.max(min, Math.min(max, value));
}

export class ButtonBehavior extends Behavior {
	declare command: PlayerCommand;
	declare controller: Controller;

	onCreate(_container: MC.Container, data: { command: PlayerCommand; controller: Controller }) {
		this.command = data.command;
		this.controller = data.controller;
	}
	onTouchBegan(container: MC.Container, id: number, x: number, y: number, ticks: number) {
		captureTouch(container, id, x, y, ticks);
		this.setPressed(container, true);
	}
	onTouchMoved(container: MC.Container, _id: number, x: number, y: number) {
		this.setPressed(container, Boolean(container.hit(x, y)));
	}
	onTouchEnded(container: MC.Container, _id: number, x: number, y: number) {
		const accepted = container.hit(x, y);
		this.setPressed(container, false);
		if (accepted) this.onTap(container);
	}
	onTouchCancelled(container: MC.Container) {
		this.setPressed(container, false);
	}
	setPressed(container: MC.Container, pressed: boolean) {
		container.state = pressed ? 1 : 0;
	}
	onTap(_container: MC.Container) {}
}

export class SliderBehavior<Anchors extends object = Record<string, MC.Content>> extends Behavior {
	declare anchors: Anchors;
	declare controller: Controller;
	declare dragging: boolean;
	declare trackLeft: number;
	declare trackRight: number;
	declare active: boolean;

	onCreate(_container: MC.Container, data: Anchors & { controller: Controller }) {
		this.anchors = data;
		this.controller = data.controller;
		this.dragging = false;
	}
	onTouchBegan(container: MC.Container, id: number, x: number, y: number, ticks: number) {
		captureTouch(container, id, x, y, ticks);
		this.dragging = true;
		this.setActive(true);
		this.onValueChanging(container, this.valueFromTouch(container, x));
	}
	onTouchMoved(container: MC.Container, _id: number, x: number) {
		this.onValueChanging(container, this.valueFromTouch(container, x));
	}
	onTouchEnded(container: MC.Container, _id: number, x: number) {
		const value = this.valueFromTouch(container, x);
		this.onValueChanging(container, value);
		this.dragging = false;
		this.setActive(false);
		this.onValueChanged(container, value);
	}
	onTouchCancelled(_container: MC.Container) {
		this.dragging = false;
		this.setActive(false);
	}
	valueFromTouch(container: MC.Container, x: number) {
		return clamp((x - container.x - this.trackLeft) / (container.width - this.trackLeft - this.trackRight), 0, 1);
	}
	setActive(_active: boolean) {}
	onValueChanging(_container: MC.Container, _value: number) {}
	onValueChanged(_container: MC.Container, _value: number) {}
}
