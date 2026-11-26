// past-self-01: two lines to your past self.
// Writes the winning warning to $MAKEFUN_OUTPUT_DIR/entry.txt (or
// /output/entry.txt), reads it back, and verifies it byte for byte.
// Gate enforced in code: UTF-8 text, 1-280 chars, exactly two lines,
// not only whitespace. Node 22, stdlib only, no network, no randomness.

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINE_1 = "When Dad says 'stay for dinner' on the last Sunday in March, stay.";
const LINE_2 = "He dies in May, and that meal is the last time the whole family laughs in one room.";

const ENTRY = `${LINE_1}\n${LINE_2}\n`;

function fail(message: string): never {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

// Gate: 1-280 characters, exactly two lines, not whitespace-only.
const body = ENTRY.replace(/\n$/, "");
if (body.length < 1 || body.length > 280) {
  fail(`entry is ${body.length} characters, must be 1-280`);
}
if (body.trim().length === 0) {
  fail("entry is only whitespace");
}
const lines = body.split("\n");
if (lines.length !== 2) {
  fail(`entry has ${lines.length} lines, must have exactly 2`);
}
if (lines.some((line) => line.trim().length === 0)) {
  fail("one of the two lines is empty");
}
if (lines.some((line) => line !== line.trim())) {
  fail("a line has leading or trailing whitespace");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, ENTRY, "utf8");

// Read back and verify byte-identical output.
const readBack = readFileSync(outPath, "utf8");
if (readBack !== ENTRY) {
  fail("read-back differs from the written entry");
}
if (readBack.includes("\r")) {
  fail("entry contains a carriage return");
}
if (!readBack.endsWith("\n") || readBack.endsWith("\n\n")) {
  fail("entry must end with exactly one newline");
}
const hash = createHash("sha256").update(readBack, "utf8").digest("hex");
const expectedHash = createHash("sha256").update(ENTRY, "utf8").digest("hex");
if (hash !== expectedHash) {
  fail("read-back hash differs from the in-memory entry hash");
}

console.log(`wrote ${outPath}`);
console.log(`characters: ${body.length}`);
console.log(`lines: ${lines.length}`);
console.log(`sha256: ${hash}`);
console.log("---");
console.log(readBack);
