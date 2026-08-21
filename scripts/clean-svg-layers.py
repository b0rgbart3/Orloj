#!/usr/bin/env python3
"""
Strip hidden Illustrator layers out of the traced clock SVGs.

Each file exported from public/clock/full_clock_trace.ai contains every
layer, with only its own layer toggled visible (the rest hidden via a
`display:none` CSS class). This keeps only the visible layer(s) per file
and prunes now-unused CSS classes, in place.

Run after re-exporting any of these files from Illustrator:
    python3 scripts/clean-svg-layers.py
"""
import os
import re

CLOCK_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'clock')

VISIBLE = {
    'background.svg': ['Background'],
    'gold_trim.svg': ['Layer_8'],
    'center_ring.svg': ['Layer_7'],
    'numeric_ring.svg': ['Numeric'],
    'roman_ring.svg': ['Roman'],
    'zodiac_ring.svg': ['Zodiac', 'zodiac_x5F_bars'],
}


def extract_top_groups(content):
    """Return [(id, start, end), ...] for each top-level <g id="..."> block."""
    groups = []
    for m in re.finditer(r'<g id="([^"]+)"[^>]*>', content):
        gid = m.group(1)
        depth = 1
        pos = m.end()
        while depth > 0:
            nextopen = content.find('<g', pos)
            nextclose = content.find('</g>', pos)
            if nextclose == -1:
                raise ValueError(f'unbalanced <g> tags while scanning {gid!r}')
            if nextopen != -1 and nextopen < nextclose:
                depth += 1
                pos = nextopen + 2
            else:
                depth -= 1
                pos = nextclose + 4
        groups.append((gid, m.start(), pos))
    return groups


def clean(path, visible_ids):
    content = open(path).read()

    groups = extract_top_groups(content)
    ids_found = [g[0] for g in groups]
    for vid in visible_ids:
        if vid not in ids_found:
            raise ValueError(f'{vid!r} not found in {path} (found: {ids_found})')

    header = content[:groups[0][1]]
    footer = content[groups[-1][2]:]
    body = '\n'.join(content[start:end] for gid, start, end in groups if gid in visible_ids)
    new_content = header + body + footer

    # Prune CSS classes that are no longer referenced by any kept element.
    style_match = re.search(r'(<style[^>]*>)(.*?)(</style>)', new_content, re.S)
    style_open, style_body, style_close = style_match.groups()
    rule_texts = re.findall(r'\.\S+?\s*\{[^}]*\}', style_body)
    rule_classes = re.findall(r'\.(\S+?)\s*\{[^}]*\}', style_body)

    non_style_content = new_content[:style_match.start()] + new_content[style_match.end():]
    used_classes = set(re.findall(r'class="([^"]+)"', non_style_content))

    kept_rules = [rt for cls, rt in zip(rule_classes, rule_texts) if cls in used_classes]
    new_style_body = '\n\t' + '\n\t'.join(kept_rules) + '\n'
    new_content = (
        new_content[:style_match.start()]
        + style_open + new_style_body + style_close
        + new_content[style_match.end():]
    )

    open(path, 'w').write(new_content)
    return len(content), len(new_content)


if __name__ == '__main__':
    for fname, visible_ids in VISIBLE.items():
        path = os.path.join(CLOCK_DIR, fname)
        if not os.path.exists(path):
            print(f'{fname}: skipped (not found)')
            continue
        before, after = clean(path, visible_ids)
        print(f'{fname}: {before} -> {after} bytes ({100 * after // before}%)')
