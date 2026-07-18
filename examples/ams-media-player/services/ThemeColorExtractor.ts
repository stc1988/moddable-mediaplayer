import type Bitmap from "commodetto/Bitmap";

const extractThemeColors = native("xs_extractThemeColors") as (
	buffer: ByteBuffer,
	width: number,
	height: number,
	pixelFormat: number,
	offset: number,
) => ArrayBuffer | undefined;

export default function extractThemeColorsFromBitmap(bitmap: Bitmap & { buffer: ByteBuffer }) {
	return extractThemeColors(bitmap.buffer, bitmap.width, bitmap.height, bitmap.pixelFormat, bitmap.offset);
}
