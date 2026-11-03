import JSZip from "jszip";

/**
 * Byte-identical output for identical recipes: pin every zip entry date and the core.xml
 * created/modified stamps (also inside embedded chart workbooks) to one fixed instant.
 * Without this, every rebuild dirties committed decks.
 */
const CORE = "docProps/core.xml";

async function pinZip(bytes: Uint8Array, at: Date, depth = 0): Promise<Uint8Array> {
  const zip = await JSZip.loadAsync(bytes);
  const iso = at.toISOString().replace(/\.\d{3}Z$/, "Z");
  const names = Object.keys(zip.files)
    .filter((n) => !zip.files[n]?.dir)
    .sort();
  const out = new JSZip();
  for (const name of names) {
    let data: Uint8Array | string = await (zip.file(name) as JSZip.JSZipObject).async("uint8array");
    if (name === CORE) data = new TextDecoder().decode(data).replace(/(<dcterms:(?:created|modified)[^>]*>)[^<]*/g, `$1${iso}`);
    else if (depth === 0 && /\.xlsx$/.test(name)) data = await pinZip(data, at, depth + 1);
    out.file(name, data, { date: at, createFolders: false });
  }
  return out.generateAsync({ type: "uint8array", compression: "DEFLATE", compressionOptions: { level: 6 } });
}

export const reproducible = (pptx: Uint8Array, at: Date) => pinZip(pptx, at);
