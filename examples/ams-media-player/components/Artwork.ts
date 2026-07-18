import { log } from "Logger";
import { Layout, Skins } from "assets";
import loadJPEG from "commodetto/loadJPEG";
import type { MediaPlayerModel } from "model";
import "piu/ImageBuffer";
import type * as MC from "piu/MC";
import "piu/MC";

const ARTWORK_WIDTH = Layout.artwork.width;
const ARTWORK_HEIGHT = Layout.artwork.height;

class ArtworkImageBehavior extends Behavior {
	declare key: string | null;

	onCreate(image: MC.Content) {
		this.key = null;
		image.visible = false;
	}
	onModelChanged(image: MC.Content & { buffer: ByteBuffer }, model: MediaPlayerModel) {
		const artwork = model.artwork;
		if (artwork?.state !== "loaded" || !artwork.data) {
			this.key = null;
			image.visible = false;
			return;
		}
		if (this.key === artwork.key) return;
		this.key = artwork.key;
		try {
			const bitmap = loadJPEG(artwork.data) as ReturnType<typeof loadJPEG> & { buffer: ByteBuffer };
			image.buffer = bitmap.buffer;
			image.visible = true;
			log("artwork", "decoded", `${artwork.key} ${bitmap.width}x${bitmap.height}`);
		} catch (error) {
			image.visible = false;
			log("artwork", "decode failed", error);
		}
	}
}

const Artwork = Container.template(($) => ({
	skin: Skins.artwork,
	contents: [
		ImageBuffer($, {
			anchor: "ARTWORK_IMAGE",
			left: 0,
			top: 0,
			width: ARTWORK_WIDTH,
			height: ARTWORK_HEIGHT,
			imageWidth: ARTWORK_WIDTH,
			imageHeight: ARTWORK_HEIGHT,
			Behavior: ArtworkImageBehavior,
		}),
		Content($, {
			anchor: "PLACEHOLDER",
			left: (ARTWORK_WIDTH - 20) >> 1,
			top: (ARTWORK_HEIGHT - 20) >> 1,
			width: 20,
			height: 20,
			skin: Skins.musicNoteIcon,
		}),
	],
	Behavior: class extends Behavior {
		declare anchors: { PLACEHOLDER: MC.Content };

		onCreate(_container: MC.Container, anchors: { PLACEHOLDER: MC.Content }) {
			this.anchors = anchors;
		}
		onModelChanged(_container: MC.Container, model: MediaPlayerModel) {
			const loaded = model.artwork?.state === "loaded" && model.artwork.data;
			this.anchors.PLACEHOLDER.visible = !loaded;
		}
	},
}));

export default Artwork;
