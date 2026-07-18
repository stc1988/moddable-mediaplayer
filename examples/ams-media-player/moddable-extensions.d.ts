declare module "commodetto/Bitmap" {
	interface Bitmap {
		readonly buffer: ByteBuffer;
	}
}

declare module "piu/ImageBuffer" {
	import type { Content, ContentDictionary } from "piu/MC";

	interface ImageBuffer extends Content {
		buffer: ByteBuffer;
	}

	interface ImageBufferDictionary extends ContentDictionary {
		imageType?: number;
		imageWidth: number;
		imageHeight: number;
	}

	interface ImageBufferConstructor {
		new (behaviorData?: unknown, dictionary?: ImageBufferDictionary): ImageBuffer;
		(behaviorData?: unknown, dictionary?: ImageBufferDictionary): ImageBuffer;
	}

	global {
		const ImageBuffer: ImageBufferConstructor;
	}
}
