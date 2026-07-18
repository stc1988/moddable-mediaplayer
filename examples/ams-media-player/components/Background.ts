import { log } from "Logger";
import extractThemeColorsFromBitmap from "ThemeColorExtractor";
import { Skins } from "assets";
import loadJPEG from "commodetto/loadJPEG";
import type { MediaPlayerModel } from "model";
import type * as MC from "piu/MC";
import "piu/MC";

const FALLBACK_TOP = "#101418";
const MIN_TOP_LUMA = 82;

interface RGB {
	r: number;
	g: number;
	b: number;
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const toHex = (component: number) => clamp(component, 0, 255).toString(16).padStart(2, "0");

const rgbToHex = ({ r, g, b }: RGB) => `#${toHex(r)}${toHex(g)}${toHex(b)}`;

const luma = ({ r, g, b }: RGB) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

function brightenForBackground(color: RGB, minimumLuma: number): RGB {
	const current = luma(color);
	if (current >= minimumLuma) return color;

	const scale = minimumLuma / Math.max(1, current);
	return {
		r: Math.round(clamp(color.r * scale, 0, 255)),
		g: Math.round(clamp(color.g * scale, 0, 255)),
		b: Math.round(clamp(color.b * scale, 0, 255)),
	};
}

function extractBackgroundColor(data: ArrayBuffer): RGB | undefined {
	const bitmap = loadJPEG(data) as ReturnType<typeof loadJPEG> & { buffer: ByteBuffer };
	const colors = extractThemeColorsFromBitmap(bitmap);
	if (!colors) return undefined;
	const color = new Uint8Array(colors);
	return { r: color[0], g: color[1], b: color[2] };
}

const Background = Container.template(($) => ({
	skin: new Skin({ fill: FALLBACK_TOP }),
	contents: [Content($, { left: 0, right: 0, top: 0, bottom: 0, skin: Skins.backgroundGradient })],
	Behavior: class extends Behavior {
		declare key: string | null;
		declare color: string;

		onCreate(_container: MC.Container) {
			this.key = null;
			this.color = FALLBACK_TOP;
		}
		onModelChanged(container: MC.Container, model: MediaPlayerModel) {
			const artwork = model.artwork;
			if (artwork?.state !== "loaded" || !artwork.data) {
				if (this.key === null) return;
				this.key = null;
				this.color = FALLBACK_TOP;
				container.skin = new Skin({ fill: this.color });
				return;
			}
			if (this.key === artwork.key) return;
			this.key = artwork.key;
			try {
				const started = Date.now();
				const color = extractBackgroundColor(artwork.data);
				if (color) {
					const raw = rgbToHex(color);
					this.color = rgbToHex(brightenForBackground(color, MIN_TOP_LUMA));
					log("theme", "color extracted", `${artwork.key} raw=${raw} color=${this.color} ms=${Date.now() - started}`);
					container.skin = new Skin({ fill: this.color });
				} else {
					log("theme", "colors unavailable", `${artwork.key} ms=${Date.now() - started}`);
				}
			} catch (error) {
				log("theme", "color extraction failed", `${artwork.key} error=${error}`);
				this.color = FALLBACK_TOP;
				container.skin = new Skin({ fill: this.color });
			}
		}
	},
}));

export default Background;
