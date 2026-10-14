# The Unicode names that carry the colour synsets' words (public/polytron/unicode-colors.json).
#
# Unicode names every character in uppercase English, so a name is a run of
# tag-like terms. For each colour synset's first word (public/polytron/
# colors.json), this lists the characters whose name holds it as a whole word,
# and marks a homograph where the character is a letter or syllable (Unicode
# category L...): there the word only names the letter (GEORGIAN CAPITAL LETTER
# TAN), it is not a colour. A colour's glyph is its LARGE <WORD> SQUARE, then
# its LARGE or MEDIUM <WORD> CIRCLE, when Unicode has one.
#   python3 scripts/unicode-colors.py   (Node has no table of Unicode names)
import json, re, unicodedata
colors = json.load(open('public/polytron/colors.json'))['colors']
names = {cp: unicodedata.name(chr(cp), None) for cp in range(0x110000)}
names = {cp: n for cp, n in names.items() if n}
out = {}
for c in colors:
    w = c['word'].upper()
    rx = re.compile(r'(^| )' + re.escape(w) + r'( |$)')
    hits = [cp for cp, n in names.items() if rx.search(n)]
    if not hits:
        continue
    glyph = next((cp for form in (f'LARGE {w} SQUARE', f'{w} LARGE SQUARE', f'LARGE {w} CIRCLE', f'MEDIUM {w} CIRCLE') for cp, n in names.items() if n == form), None)
    out[c['word']] = {
        'glyph': None if glyph is None else {'cp': glyph, 'char': chr(glyph), 'name': names[glyph]},
        'names': len(hits),
        'homographs': [{'cp': cp, 'name': names[cp]} for cp in hits if unicodedata.category(chr(cp)).startswith('L')][:8],
        'homographCount': sum(1 for cp in hits if unicodedata.category(chr(cp)).startswith('L')),
    }
json.dump({'source': 'Unicode character names (Python unicodedata %s)' % unicodedata.unidata_version, 'named': len(names), 'words': out}, open('public/polytron/unicode-colors.json', 'w'), ensure_ascii=False, indent=1)
print('unicode-colors: %d of %d colour words are in Unicode names; %d with a glyph; %d with homographs' % (len(out), len(colors), sum(1 for v in out.values() if v['glyph']), sum(1 for v in out.values() if v['homographCount'])))
