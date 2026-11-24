// swift-site driver: the harness runs `node /bot/main.ts` (node22). It reads
// every case from /input/cases.json (a JSON array of { id, input }), answers
// each one alone with run() from solve.js, and writes /output/answers.json:
// a JSON array of the answers, one per case and in the cases' order.
// Outside a container MAKEFUN_INPUT_DIR and MAKEFUN_OUTPUT_DIR stand in for
// /input and /output.

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { setFlagsFromString } from 'node:v8';

// V8's incremental marking off, set before solve.js is imported so all of its
// work runs under it (the house baseline runs with --no-incremental-marking,
// and an entry may tune V8's flags too).
setFlagsFromString('--no-incremental-marking');

type Runner = (input: unknown) => unknown;
const solve = (await import(new URL('./solve.js', import.meta.url).href)) as { run: Runner };

const inDir = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const rawCases = readFileSync(join(inDir, 'cases.json'), 'utf8');
const entries = JSON.parse(rawCases) as { id: string; input: unknown }[];
const results = entries.map((entry) => solve.run(entry.input));
writeFileSync(join(outDir, 'answers.json'), JSON.stringify(results));
