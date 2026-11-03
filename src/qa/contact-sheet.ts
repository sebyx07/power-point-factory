import sharp from "sharp";

/** All slides on one image, numbered — the first thing an agent (or human) looks at. */
export async function contactSheet(pngs: string[], out: string, cols = 3, thumbW = 560): Promise<void> {
  if (pngs.length === 0) return;
  const thumbH = Math.round((thumbW * 9) / 16);
  const pad = 24;
  const label = 26;
  const rows = Math.ceil(pngs.length / cols);
  const W = cols * thumbW + (cols + 1) * pad;
  const H = rows * (thumbH + label) + (rows + 1) * pad;
  const tiles = await Promise.all(
    pngs.map(async (p, i) => {
      const x = pad + (i % cols) * (thumbW + pad);
      const y = pad + Math.floor(i / cols) * (thumbH + label + pad);
      const img = await sharp(p).resize(thumbW, thumbH, { fit: "fill" }).png().toBuffer();
      const tag = Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${thumbW}" height="${label}"><text x="0" y="19" font-family="Liberation Sans" font-size="16" font-weight="700" fill="#444">${String(i + 1).padStart(2, "0")}</text></svg>`,
      );
      return [
        { input: img, left: x, top: y + label },
        { input: tag, left: x, top: y },
      ];
    }),
  );
  await sharp({ create: { width: W, height: H, channels: 3, background: "#EDEDED" } })
    .composite(tiles.flat())
    .png()
    .toFile(out);
}
