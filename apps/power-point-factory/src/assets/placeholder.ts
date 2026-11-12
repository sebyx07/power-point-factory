import sharp from "sharp";
import { mix } from "@/core/color";
import type { Hex } from "@/core/types";

const esc = (s: string) => s.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c] ?? c);

/** Stand-in when an image can't be generated (no KUBEEZ_API_KEY). QA flags every one. */
export async function placeholderPng(wPx: number, hPx: number, label: string, base: Hex, accent: Hex): Promise<Buffer> {
  const a = mix(accent, base, 0.35);
  const b = mix(accent, base, 0.12);
  const words = label.slice(0, 140);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${wPx}" height="${hPx}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <text x="50%" y="46%" text-anchor="middle" font-family="Liberation Sans" font-size="${Math.round(hPx / 22)}" font-weight="700" fill="#ffffff" opacity="0.9">IMAGE PLACEHOLDER</text>
  <text x="50%" y="54%" text-anchor="middle" font-family="Liberation Sans" font-size="${Math.round(hPx / 40)}" fill="#ffffff" opacity="0.8">${esc(words)}</text>
</svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}
