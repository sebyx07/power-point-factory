/**
 * LibreOffice stamps CreationDate, xmp dates and a random /ID into each PDF.
 * Rewrite them in place with SAME-LENGTH values (keeps the xref byte offsets valid):
 * dates → the deck date; /ID, /DocChecksum, uuids → a hash of the rest of the file.
 */
export function normalizePdf(bytes: Uint8Array, at: Date): Uint8Array {
  const s = Buffer.from(bytes).toString("latin1");
  const iso = at.toISOString(); // 2026-11-03T00:00:00.000Z
  const ymd = `${iso.slice(0, 4)}${iso.slice(5, 7)}${iso.slice(8, 10)}`;
  const sameLen = (v: string, want: string) => (want + v.slice(want.length).replace(/\d/g, "0")).slice(0, v.length);
  const DATE = /\(D:(\d{14})([^)]*)\)/g;
  // any XMP timestamp element: xmp:CreateDate/ModifyDate/MetadataDate, rdf:li inside dc:date …
  const XMP = /(<(?:xmp:\w*Date|rdf:li)>)(\d{4}-\d{2}-\d{2}T[^<]*)(<\/(?:xmp:\w*Date|rdf:li)>)/g;
  const SUM = /(\/DocChecksum \/)([0-9A-F]{32})/g;
  const UUID = /uuid:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;
  const ID = /(\/ID\s*\[\s*<)([0-9A-Fa-f]{32})(>\s*<)([0-9A-Fa-f]{32})(>\s*\])/g;
  const stable = s.replace(DATE, "").replace(XMP, "$1$3").replace(ID, "$1$3$5").replace(UUID, "").replace(SUM, "$1");
  const hash = new Bun.CryptoHasher("md5").update(stable).digest("hex").toUpperCase();
  const out = s
    .replace(DATE, (_m, _t, tz: string) => `(D:${ymd}000000${tz.replace(/\d/g, "0")})`)
    .replace(XMP, (_m, a: string, v: string, b: string) => `${a}${sameLen(v, iso.slice(0, 19))}${b}`)
    .replace(ID, (_m, a: string, _h1, mid: string, _h2, z: string) => `${a}${hash}${mid}${hash}${z}`)
    .replace(SUM, (_m, a: string) => `${a}${hash}`)
    .replace(UUID, () => `uuid:${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`.toLowerCase());
  return new Uint8Array(Buffer.from(out, "latin1"));
}
