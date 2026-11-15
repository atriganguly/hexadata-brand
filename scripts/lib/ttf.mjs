// Minimal TrueType `name` / `OS/2` reader (no dependencies). Enough to verify that a font file is the face we claim it is.
export function readTtfInfo(buf) {
  const tag = buf.toString('latin1', 0, 4);
  if (tag !== '\x00\x01\x00\x00' && tag !== 'true') throw new Error('not a TrueType (glyf) font');
  const numTables = buf.readUInt16BE(4);
  const tables = {};
  for (let i = 0; i < numTables; i++) {
    const o = 12 + i * 16;
    tables[buf.toString('latin1', o, o + 4)] = { offset: buf.readUInt32BE(o + 8), length: buf.readUInt32BE(o + 12) };
  }
  const name = tables['name'];
  const os2 = tables['OS/2'];
  if (!name || !os2) throw new Error('missing name or OS/2 table');
  const count = buf.readUInt16BE(name.offset + 2);
  const strings = buf.readUInt16BE(name.offset + 4);
  const names = {};
  for (let i = 0; i < count; i++) {
    const r = name.offset + 6 + i * 12;
    const [platform, , , id, len, off] = [0, 1, 2, 3, 4, 5].map((k) => buf.readUInt16BE(r + k * 2));
    const raw = buf.subarray(name.offset + strings + off, name.offset + strings + off + len);
    // Prefer the Windows (3) / Unicode (0) UTF-16BE records; fall back to Mac Roman (1) ASCII.
    const text = platform === 1 ? raw.toString('latin1') : Buffer.from(raw).swap16().toString('utf16le');
    if (names[id] === undefined || platform === 3) names[id] = text;
  }
  return {
    family: names[16] ?? names[1],
    subfamily: names[17] ?? names[2],
    fullName: names[4],
    version: names[5],
    postScriptName: names[6],
    weight: buf.readUInt16BE(os2.offset + 4),
    isVariable: Boolean(tables['fvar']),
  };
}
