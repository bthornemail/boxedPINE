// The mouse: change any CSS variable, any attribute, any property of any element of the page with the mouse alone.
// The author, 2026-11-04: "i want to vhane any css variable any dom vataible any jsdom binding, a mosue shoud be the
// only thing i need to do any fuckig thing". Carried by the portal into every room.
//
// The round button at the bottom right picks: the next click selects the element under it (the page does not get
// that click), and the panel shows the element's CSS variables (every --name the page's style sheets and inline
// styles declare, with its computed value here), its attributes, and its own properties. Each value is edited by
// its kind, with no key pressed:
//   a number (with or without a unit)  drag sideways on it, or click - and +
//   a colour                           click a hue and a lightness on the strip
//   true or false                      click it
//   any other text                     click one of the values already on the page, or spell it in Braille: the
//                                      eight dots of a cell are the eight bits of a byte; click dots, then add
// Every change can be undone to the value the element had when first selected (the literal kept, as the exchange's
// reset keeps it). ↑ selects the parent, ↓ the next child.

type Item = { kind: 'var' | 'attr' | 'prop'; name: string; get: () => string; set: (v: string) => void; was: string };

const NUM = /^(-?\d*\.?\d+(?:e[-+]?\d+)?)([a-z%]*)$/i;
const COLOR = /^(#[0-9a-f]{3,8}|rgba?\(.*\)|hsla?\(.*\))$/i;
const WORDS = ['YHWH', 'YAHWEH', 'YAH', 'GOD IS WORD', 'GOD OF WORD', 'GOD WAS WORD', 'WORD IS GOD', 'WORD OF GOD', 'WORD WAS GOD'];

/** Every custom property the page declares, from its style sheets and inline styles. */
export function customProperties(doc: Document = document): string[] {
  const names = new Set<string>();
  const fromStyle = (s: CSSStyleDeclaration) => { for (let i = 0; i < s.length; i++) if (s[i]!.startsWith('--')) names.add(s[i]!); };
  const walk = (rules: CSSRuleList) => {
    for (const r of Array.from(rules)) {
      if ('style' in r) fromStyle((r as CSSStyleRule).style);
      if ('cssRules' in r) { try { walk((r as CSSGroupingRule).cssRules); } catch { /* not readable */ } }
    }
  };
  for (const sheet of Array.from(doc.styleSheets)) { try { walk(sheet.cssRules); } catch { /* another origin's sheet */ } }
  doc.querySelectorAll<HTMLElement>('[style]').forEach((el) => fromStyle(el.style));
  return [...names].sort();
}

/** A number's next value by a drag of dx pixels: a step that suits its size. */
export function scrub(value: string, dx: number): string {
  const m = value.trim().match(NUM);
  if (!m) return value;
  const n = Number(m[1]), digits = m[1]!.includes('.') ? m[1]!.split('.')[1]!.length : 0;
  const step = digits ? 10 ** -digits : Math.abs(n) >= 100 ? 5 : 1;
  return `${+(n + Math.round(dx) * step).toFixed(digits)}${m[2]}`;
}

/** A byte as its Braille cell's eight dots (dot k is bit k - 1), and back. */
export const dotsOf = (byte: number) => [...Array(8).keys()].map((k) => (byte >> k) & 1);
export const cellOf = (byte: number) => String.fromCodePoint(0x2800 + byte);

function itemsOf(el: Element): Item[] {
  const items: Item[] = [], h = el as HTMLElement, cs = getComputedStyle(el);
  for (const name of customProperties(el.ownerDocument)) {
    const was = cs.getPropertyValue(name).trim();
    items.push({ kind: 'var', name, was, get: () => getComputedStyle(el).getPropertyValue(name).trim(), set: (v) => h.style.setProperty(name, v) });
  }
  for (const a of Array.from(el.attributes)) {
    if (a.name === 'style') continue;
    items.push({ kind: 'attr', name: a.name, was: a.value, get: () => el.getAttribute(a.name) ?? '', set: (v) => el.setAttribute(a.name, v) });
  }
  const props = new Set<string>(Object.keys(el));
  for (const p of ['hidden', 'title', 'value', 'checked', 'disabled', 'open', 'currentTime', 'volume', 'playbackRate']) if (p in el) props.add(p);
  if (!el.children.length && el.textContent && el.textContent.length < 200) props.add('textContent');
  for (const p of props) {
    const v = (el as unknown as Record<string, unknown>)[p];
    if (v !== null && typeof v === 'object' || typeof v === 'function') continue;
    const was = String(v);
    items.push({
      kind: 'prop', name: p, was, get: () => String((el as unknown as Record<string, unknown>)[p]),
      set: (s) => { const r = el as unknown as Record<string, unknown>; r[p] = typeof v === 'boolean' ? s === 'true' : typeof v === 'number' ? Number(s) : s; },
    });
  }
  return items;
}

const describe = (el: Element) => `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${el.classList.length ? `.${[...el.classList].join('.')}` : ''}`;

class CommonsMouse extends HTMLElement {
  #picking = false; #el: Element | null = null; #root = this.attachShadow({ mode: 'open' }); #items: Item[] = []; #open = -1; #byte = 0x20;

  connectedCallback() {
    this.#root.innerHTML = `<style>
      :host { all: initial; }
      .ball { position: fixed; right: 14px; bottom: 14px; z-index: 2147483647; width: 34px; height: 34px; border-radius: 50%; border: 1px solid #34404a; background: #0c1015; color: #e8c36a; font: 600 16px system-ui; cursor: pointer; }
      .ball[aria-pressed=true] { background: #e8c36a; color: #0c1015; }
      .panel { position: fixed; right: 14px; bottom: 56px; z-index: 2147483647; width: min(380px, calc(100vw - 28px)); max-height: 70vh; overflow: auto; background: rgba(12,16,21,.96); color: #edf0e9; border: 1px solid #34404a; border-radius: 8px; font: 12px/1.45 ui-monospace, monospace; padding: 8px; box-sizing: border-box; }
      .panel[hidden] { display: none; }
      .top { display: flex; gap: 6px; align-items: center; margin-bottom: 6px; } .top b { flex: 1; color: #e8c36a; overflow-wrap: anywhere; }
      button { font: 12px ui-monospace, monospace; color: #edf0e9; background: #141b22; border: 1px solid #34404a; border-radius: 4px; padding: 2px 7px; cursor: pointer; }
      button:hover { border-color: #e8c36a; }
      h4 { margin: 8px 0 3px; font: 600 11px system-ui; color: #9fb0bd; text-transform: uppercase; letter-spacing: .08em; }
      .row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr); gap: 6px; padding: 2px 0; align-items: center; border-top: 1px solid #1c252e; }
      .name { color: #8fd0e8; overflow-wrap: anywhere; } .val { cursor: pointer; overflow-wrap: anywhere; } .val.num { cursor: ew-resize; } .val.changed { color: #e8c36a; }
      .edit { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 4px; padding: 4px 0 6px; align-items: center; }
      .hues { display: grid; grid-template-columns: repeat(12, 1fr); width: 100%; gap: 1px; } .hues button { height: 16px; padding: 0; border: 0; }
      .dots { display: grid; grid-template-columns: repeat(2, 18px); gap: 3px; } .dots button { width: 18px; height: 18px; border-radius: 50%; padding: 0; }
      .dots button[aria-pressed=true] { background: #e8c36a; }
      .cell { font-size: 22px; min-width: 1.4em; text-align: center; }
      .pick { outline: 2px solid #e8c36a !important; }
    </style>
    <button class="ball" aria-pressed="false" title="pick an element">◎</button>
    <div class="panel" hidden><div class="top"><b>click the round button, then an element</b><button data-a="up" title="parent">↑</button><button data-a="down" title="next child">↓</button></div><div class="list"></div></div>`;
    const ball = this.#root.querySelector('.ball') as HTMLButtonElement;
    ball.addEventListener('click', () => { this.#picking = !this.#picking; ball.setAttribute('aria-pressed', String(this.#picking)); (this.#root.querySelector('.panel') as HTMLElement).hidden = false; });
    this.#root.querySelector('.top')!.addEventListener('click', (e) => {
      const a = (e.target as HTMLElement).dataset.a;
      if (!this.#el || !a) return;
      const next = a === 'up' ? this.#el.parentElement : (this.#el.children[0] ?? this.#el.nextElementSibling);
      if (next && next !== document.body.parentElement) this.select(next);
    });
    let hover: Element | null = null;
    document.addEventListener('pointerover', (e) => {
      if (!this.#picking || e.target === this) return;
      hover?.classList.remove('commons-mouse-pick'); hover = e.target as Element; hover.classList.add('commons-mouse-pick');
    }, true);
    document.addEventListener('click', (e) => {
      if (!this.#picking || e.composedPath().includes(this)) return;
      e.preventDefault(); e.stopPropagation();
      hover?.classList.remove('commons-mouse-pick');
      this.#picking = false; ball.setAttribute('aria-pressed', 'false');
      this.select(e.target as Element);
    }, true);
    const s = document.createElement('style');
    s.textContent = '.commons-mouse-pick { outline: 2px solid #e8c36a !important; outline-offset: -1px; }';
    document.head.appendChild(s);
  }

  /** Select an element and list what can be changed on it. */
  select(el: Element) {
    this.#el = el; this.#items = itemsOf(el); this.#open = -1;
    (this.#root.querySelector('.top b') as HTMLElement).textContent = describe(el);
    (this.#root.querySelector('.panel') as HTMLElement).hidden = false;
    this.render();
  }

  render() {
    const list = this.#root.querySelector('.list') as HTMLElement;
    list.replaceChildren();
    for (const kind of ['var', 'attr', 'prop'] as const) {
      const items = this.#items.map((it, i) => [it, i] as const).filter(([it]) => it.kind === kind);
      if (!items.length) continue;
      const h = document.createElement('h4'); h.textContent = { var: 'CSS variables', attr: 'attributes', prop: 'properties' }[kind]; list.appendChild(h);
      for (const [it, i] of items) list.appendChild(this.row(it, i));
    }
  }

  row(it: Item, i: number): HTMLElement {
    const row = document.createElement('div'); row.className = 'row';
    const v = it.get(), name = document.createElement('span'), val = document.createElement('span');
    name.className = 'name'; name.textContent = it.name;
    val.className = `val${NUM.test(v.trim()) ? ' num' : ''}${v !== it.was ? ' changed' : ''}`; val.textContent = v || '∅';
    row.append(name, val);
    if (NUM.test(v.trim())) {
      val.addEventListener('pointerdown', (e) => {
        const x0 = e.clientX, v0 = it.get(); let moved = false; val.setPointerCapture(e.pointerId);
        const move = (m: PointerEvent) => { if (Math.abs(m.clientX - x0) > 2) moved = true; it.set(scrub(v0, (m.clientX - x0) / 4)); val.textContent = it.get(); val.classList.toggle('changed', it.get() !== it.was); };
        val.addEventListener('pointermove', move);
        val.addEventListener('pointerup', () => { val.removeEventListener('pointermove', move); if (!moved) this.toggle(i); }, { once: true });
      });
    } else if (v === 'true' || v === 'false') {
      val.addEventListener('click', () => { it.set(v === 'true' ? 'false' : 'true'); this.render(); });
    } else val.addEventListener('click', () => this.toggle(i));
    if (this.#open === i) row.appendChild(this.editor(it));
    return row;
  }

  toggle(i: number) { this.#open = this.#open === i ? -1 : i; this.render(); }

  editor(it: Item): HTMLElement {
    const box = document.createElement('div'); box.className = 'edit';
    const btn = (label: string, f: () => void, title = '') => { const b = document.createElement('button'); b.textContent = label; b.title = title; b.addEventListener('click', (e) => { e.stopPropagation(); f(); this.render(); }); box.appendChild(b); return b; };
    const v = it.get().trim();
    if (NUM.test(v)) { btn('−', () => it.set(scrub(it.get(), -1))); btn('+', () => it.set(scrub(it.get(), 1))); }
    else if (COLOR.test(v) || /color|colour|bg|ink|accent|rule/i.test(it.name)) {
      for (const l of [30, 50, 70]) {
        const hues = document.createElement('div'); hues.className = 'hues';
        for (let k = 0; k < 12; k++) { const b = document.createElement('button'); b.style.background = `hsl(${k * 30} 70% ${l}%)`; b.title = `hsl(${k * 30} 70% ${l}%)`; b.addEventListener('click', (e) => { e.stopPropagation(); it.set(`hsl(${k * 30} 70% ${l}%)`); this.render(); }); hues.appendChild(b); }
        box.appendChild(hues);
      }
      for (const g of ['#000', '#555', '#999', '#ddd', '#fff']) btn(g, () => it.set(g));
    } else {
      // the values already on the page for this name, and the words
      const seen = new Set<string>([it.was, ...WORDS]);
      document.querySelectorAll(`[${CSS.escape(it.name)}]`).forEach((e) => { const a = e.getAttribute(it.name); if (a && a.length < 40) seen.add(a); });
      for (const s of [...seen].filter(Boolean).slice(0, 24)) btn(s, () => it.set(s));
      // a Braille cell: eight dots, the eight bits of a byte
      const dots = document.createElement('div'); dots.className = 'dots';
      for (const k of [0, 3, 1, 4, 2, 5, 6, 7]) {
        const d = document.createElement('button'); d.title = `dot ${k + 1}`; d.setAttribute('aria-pressed', String(((this.#byte >> k) & 1) === 1));
        d.addEventListener('click', (e) => { e.stopPropagation(); this.#byte ^= 1 << k; this.render(); });
        dots.appendChild(d);
      }
      box.appendChild(dots);
      const cell = document.createElement('span'); cell.className = 'cell'; cell.textContent = cellOf(this.#byte); cell.title = `byte ${this.#byte}`; box.appendChild(cell);
      const ch = this.#byte >= 0x20 && this.#byte < 0x7f ? String.fromCharCode(this.#byte) : '';
      btn(`add ${ch === ' ' ? '␠' : ch || '·'}`, () => { if (ch) it.set(it.get() + ch); }, 'add this byte as a letter');
      btn('⌫', () => it.set([...it.get()].slice(0, -1).join('')), 'take the last letter away');
      btn('∅', () => it.set(''), 'empty');
    }
    btn('undo', () => it.set(it.was), `back to ${it.was || '∅'}`);
    return box;
  }
}

if (!customElements.get('commons-mouse')) customElements.define('commons-mouse', CommonsMouse);
if (typeof document !== 'undefined' && !document.querySelector('commons-mouse')) document.body?.appendChild(document.createElement('commons-mouse'));
