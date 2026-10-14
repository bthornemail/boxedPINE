// The Colossal Cave as a proof tree, deciphered from the game's behaviour (open-adventure, /usr/games/advent).
//
// The author, 2026-10-14: "so the game is a proof tree", "we can reverse engineer with agents to validate", then "not engineer, but decipher": read
// from what the game says back, with no source.
// The game reads each word by its first five letters, and a log of a seed and words replays exactly
// (its notes: the seed command and -l). So: from a fixed seed, with the lamp lit, an explorer tries
// each movement word from each room it has reached, then LOOK to see where it is; every move that
// lands somewhere is a triple (room, WORD, room). Breadth first, so each room's route is a shortest
// one. Then every route is validated: replayed from the seed, it reaches its room again. A state where
// the game is waiting on a yes or no ("Please answer the question.") is not a room: it holds between
// none and some until it is answered.
//   node scripts/adventure-map.mjs [--limit N] [--out file.json]
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const LIMIT = Number(opt('--limit', 400)), OUT = opt('--out', null), SEED = 1972;
const WORDS = ['N', 'S', 'E', 'W', 'NE', 'NW', 'SE', 'SW', 'U', 'D', 'IN', 'OUT', 'XYZZY', 'PLUGH', 'PLOVER'];
const START = ['IN', 'TAKE LAMP', 'ON'];
// The hints as the global mask (the author: "the hints are the global mask"): the hint page turned into
// commands, tried in every state, not only where a reader would think of them. --mask turns it on.
const MASK = ['TAKE CAGE', 'TAKE BIRD', 'FREE BIRD', 'TAKE ROD', 'WAVE ROD', 'DROP ROD', 'TAKE KEYS', 'UNLOCK GRATE', 'TAKE BOTTLE', 'FILL BOTTLE', 'OIL DOOR', 'TAKE BEAR', 'DROP BEAR', 'TAKE FOOD', 'FEED BEAR', 'TAKE CHAIN', 'UNLOCK CHAIN', 'THROW FOOD'];
const MOVES = args.includes('--mask') ? [...WORDS, ...MASK] : WORDS;

/** Play: the seed, the words, then LOOK; returns the room LOOK describes (its first sentence), or null. */
function play(words) {
  const input = ['no', `seed ${SEED}`, ...START, ...words, 'look', 'inventory', 'quit', 'yes'].join('\n') + '\n';
  const out = spawnSync('/usr/games/advent', [], { input, encoding: 'utf8', timeout: 5000 }).stdout ?? '';
  const blocks = out.split(/\n> /);
  const look = blocks[blocks.length - 4] ?? ''; // the answer to LOOK: before INVENTORY's, QUIT's and YES's
  const carried = (blocks[blocks.length - 3] ?? '').split('\n').slice(1).map((l) => l.trim()).filter(Boolean).filter((l) => !/^You are currently holding/.test(l)).sort().join(', ');
  const lines = look.split('\n').map((l) => l.trim()).filter(Boolean);
  const after = lines.findIndex((l) => /long description of your location/.test(l)); // LOOK apologises first, then repeats the room
  const first = (after >= 0 ? lines.slice(after + 1) : lines.slice(1)).join(' ').split(/(?<=[.!?])\s/)[0] ?? '';
  if (!first || /know the word|pitch dark|Do you really want|reincarnat|Please answer the question/i.test(first)) return null;
  return `${first.replace(/\s+/g, ' ')} [${carried}]`; // a state: the room and what is carried
}

const start = play([]);
const route = new Map([[start, []]]), triples = [];
const queue = [start];
let runs = 1;
while (queue.length && route.size < LIMIT) {
  const room = queue.shift(), path = route.get(room);
  for (const w of MOVES) {
    const to = play([...path, w]); runs++;
    if (!to || to === room) continue;
    triples.push([room, w, to]);
    if (!route.has(to)) { route.set(to, [...path, w]); queue.push(to); }
  }
}
// validate: each room's route, replayed from the seed, reaches it again
const failed = [...route].filter(([room, path]) => play(path) !== room);
const rooms = new Set([...route.keys()].map((k) => k.replace(/ \[.*$/, '')));
const result = { seed: SEED, start: START, mask: MOVES === WORDS ? [] : MASK, places: rooms.size, rooms: route.size, triples: triples.length, runs, validated: route.size - failed.length, failed: failed.map(([r]) => r), routes: Object.fromEntries(route), edges: triples };
if (OUT) writeFileSync(OUT, JSON.stringify(result, null, 1) + '\n');
console.log(`adventure-map: ${rooms.size} rooms in ${route.size} states (room and what is carried), ${triples.length} triples, ${runs} plays; routes validated by replay: ${result.validated}/${route.size}`);
