// THE STATUS CODES AS A UBIQUITOUS CATALOGUE
//
// The author: the codes "are a version and ubiquitous for cataloguing http
// requests at a 1.1 or 11 in indexing". Every HTTP/1.1 implementation already
// knows them, so they index requests anywhere. The seed is Node's built-in
// http.STATUS_CODES (saved in assets/http-status.json); 218, informal, is added
// as the departure (I-86). Each code reads as an index: its class (the
// hundreds), its atom and role (low three bits, I-96) and its colour (I-92).
// The version HTTP/1.1 reads as the index 11. wiki: SPEC-07 I-97.
import CODES from './assets/http-status.json' with { type: 'json' };
import { statusRole } from './colour.code.ts';

export const STATUS = { ...(CODES as Record<string, string>), 218: 'This is fine' } as Record<string, string>;

export type Entry = { code: number; phrase: string; standard: boolean; class: number; atom: number; role: string; colour: string };

/** One code's catalogue entry. */
export function catalogue(code: number): Entry {
  const phrase = STATUS[code];
  if (phrase === undefined) throw new RangeError(`no status code ${code}`);
  return { code, phrase, standard: code !== 218, class: Math.floor(code / 100), ...statusRole(code) };
}

/** Every code, in order. */
export const CATALOGUE = Object.keys(STATUS).map(Number).sort((a, b) => a - b).map(catalogue);

/** A protocol version as an index: "1.1" → 11 (the digits, without the dot). */
export const versionIndex = (version: string) => Number(version.replace(/\./g, ''));
