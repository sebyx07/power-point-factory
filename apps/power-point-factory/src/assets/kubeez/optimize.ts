import sharp from "sharp";

/** Kubeez returns ~9 MB PNGs. Store photos as mozjpeg q88 (visually lossless, ~1 MB), max 2560 px; keep alpha as PNG. */
export async function optimize(bytes: Uint8Array, keepAlpha: boolean): Promise<Buffer> {
  const img = sharp(bytes).rotate().resize(2560, 2560, { fit: "inside", withoutEnlargement: true });
  return keepAlpha
    ? img.png({ compressionLevel: 9, palette: false }).toBuffer()
    : img.jpeg({ quality: 88, mozjpeg: true, chromaSubsampling: "4:4:4" }).toBuffer();
}
