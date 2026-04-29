import sharp from "sharp";

/** Final dimensions/quality of the master JPEG we store in Blob storage. */
export const MASTER_MAX_WIDTH = 2400;
export const MASTER_MAX_HEIGHT = 1800;
export const MASTER_QUALITY = 85;

export type ProcessedImage = {
  buffer: Buffer;
  width: number;
  height: number;
  contentType: "image/jpeg";
  blur: string; // base64 data URL of the LQIP
};

/**
 * Server-side image pipeline:
 *  - Strip EXIF (privacy: no GPS / device data)
 *  - Auto-rotate based on EXIF orientation tag (iPhone photos arrive sideways otherwise)
 *  - Resize so longest edge ≤ MASTER_MAX_WIDTH (preserving aspect)
 *  - Re-encode to JPEG @ MASTER_QUALITY for delivery consistency
 *  - Generate a 16x base64 LQIP for `placeholder="blur"` on next/image
 */
export async function processImage(input: Buffer): Promise<ProcessedImage> {
  const base = sharp(input, { failOn: "none" }).rotate(); // auto-orient
  const metadata = await base.metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error("Could not read image dimensions");
  }

  const fitsInBox =
    metadata.width <= MASTER_MAX_WIDTH && metadata.height <= MASTER_MAX_HEIGHT;

  // Master image
  const masterPipeline = base
    .clone()
    .resize(
      fitsInBox
        ? { width: metadata.width }
        : {
            width: MASTER_MAX_WIDTH,
            height: MASTER_MAX_HEIGHT,
            fit: "inside",
            withoutEnlargement: true,
          }
    )
    .jpeg({ quality: MASTER_QUALITY, mozjpeg: true })
    .withMetadata({}); // strip everything

  const { data: buffer, info } = await masterPipeline.toBuffer({ resolveWithObject: true });

  // LQIP — 16px wide blurred JPEG, base64-encoded, used for placeholder="blur"
  const lqipBuffer = await base
    .clone()
    .resize(16)
    .jpeg({ quality: 50 })
    .toBuffer();
  const blur = `data:image/jpeg;base64,${lqipBuffer.toString("base64")}`;

  return {
    buffer,
    width: info.width,
    height: info.height,
    contentType: "image/jpeg",
    blur,
  };
}
