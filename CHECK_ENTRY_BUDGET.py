#!/usr/bin/env python3
"""Measure UTF-8 HTML on disk. Run CHECK_ENTRY_BUDGET.py ROOT [--previous PREVIOUS_ROOT] [--json].
Mark program-specific DOM, script, style and template elements with data-entry-program="Name".
Bytes include tags and descendants. The remaining bytes belong to the shared Engine entry.
"""
import argparse
from collections import Counter
import gzip
from html.parser import HTMLParser
import json
from pathlib import Path

RAW_LIMIT = 280 * 1024
GZIP_LIMIT = 72 * 1024
PROGRAM_LIMIT = 24 * 1024
BLOCK_LIMIT = 48 * 1024
VOID = set('area base br col embed hr img input link meta param source track wbr'.split())
WONDERWAKE_IDS = {'homeportShipStyle', 'lantern-harbor', 'lantern-document', 'lantern-launcher',
                  'wonderwakeFleetLessons', 'wonderwakeFleetLaunch', 'wonderwakePreviewVessel'}


class Entry(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=False)
        self.source = source
        self.line_starts = [0]
        self.line_starts.extend(i + 1 for i, ch in enumerate(source) if ch == '\n')
        self.stack = []
        self.ranges = []
        self.blocks = []

    def source_offset(self):
        line, col = self.getpos()
        return self.line_starts[line - 1] + col

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        start = self.source_offset()
        opening = self.get_starttag_text()
        end = start + len(opening)
        label = attrs.get('id') or tag
        parent_owner = self.stack[-1]['owner'] if self.stack else None
        owner = attrs.get('data-entry-program') or parent_owner
        if not owner and label in WONDERWAKE_IDS:
            owner = 'Wonderwake'
        # Identify the equivalent unnamed Prism blocks for cross-build reporting.
        if not owner and tag in ('script', 'style'):
            peek = self.source[end:end + 160].lstrip()
            if peek.startswith('#lantern-harbor {') or "const harbor = document.getElementById('lantern-harbor')" in peek:
                owner = 'Wonderwake'
        item = dict(tag=tag, label=label, owner=owner, parent=parent_owner, start=start, content=end)
        if tag in VOID:
            self.finish(item, end, end)
        else:
            self.stack.append(item)
        for key in ['srcdoc', 'src', 'href']:
            value = attrs.get(key) or ''
            if key == 'srcdoc' or value.startswith('data:'):
                if value:
                    self.blocks.append((label + '[' + key + ']', len(value.encode()), owner or 'Engine'))

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            item = self.stack.pop()
            self.finish(item, item['content'], item['content'])

    def finish(self, item, close, end):
        owner = item['owner'] or 'Engine'
        if item['owner'] != item['parent']:
            self.ranges.append((item['start'], end, owner, item['parent'] or 'Engine'))
        if item['tag'] in ('script', 'style', 'template'):
            self.blocks.append((item['label'], len(self.source[item['content']:close].encode()), owner))

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i]['tag'] == tag:
                close = self.source_offset()
                end = self.source.index('>', close) + 1
                for item in self.stack[i + 1:]:
                    self.finish(item, close, close)
                self.finish(self.stack[i], close, end)
                del self.stack[i:]
                return


def measure(root):
    file = root / 'index.html' if root.is_dir() else root
    raw = file.read_bytes()
    source = raw.decode('utf-8')
    parser = Entry(source)
    parser.feed(source)
    parser.close()
    for item in parser.stack:
        parser.finish(item, len(source), len(source))
    owners = Counter(Engine=len(raw))
    for start, end, owner, parent in parser.ranges:
        size = len(source[start:end].encode())
        owners[owner] += size
        owners[parent] -= size
    gzip_size = len(gzip.compress(raw, compresslevel=9, mtime=0))
    return dict(raw_bytes=len(raw), gzip9_bytes=gzip_size, entry_bytes_by_program=dict(sorted(owners.items())),
                inline_blocks=[dict(id=name, bytes=n, program=p) for name, n, p in sorted(parser.blocks, key=lambda row: -row[1])])


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument('root', nargs='?', type=Path, default=Path(__file__).parent)
    cli.add_argument('--previous', type=Path, help='Release directory or previous index.html')
    cli.add_argument('--json', action='store_true')
    args = cli.parse_args()
    data = measure(args.root)
    budgets = dict(raw_bytes=RAW_LIMIT, gzip9_bytes=GZIP_LIMIT, per_program_bytes=PROGRAM_LIMIT, single_inline_block_bytes=BLOCK_LIMIT)
    issues = []
    for key in ['raw_bytes', 'gzip9_bytes']:
        if data[key] > budgets[key]:
            issues.append(f'{key} exceeds {budgets[key]}')
    for name, n in data['entry_bytes_by_program'].items():
        if name != 'Engine' and n > PROGRAM_LIMIT:
            issues.append(f'{name} entry exceeds {PROGRAM_LIMIT} B')
    for block in data['inline_blocks']:
        if block['bytes'] > BLOCK_LIMIT:
            issues.append(f"{block['id']} exceeds {BLOCK_LIMIT} B")
    growth = {}
    if args.previous:
        prev = measure(args.previous)
        for key in ['raw_bytes', 'gzip9_bytes']:
            growth[key] = data[key] - prev[key]
        a, b = data['entry_bytes_by_program'], prev['entry_bytes_by_program']
        growth['entry_bytes_by_program'] = {k: a.get(k, 0) - b.get(k, 0) for k in sorted(a.keys() | b.keys())}
    if args.json:
        print(json.dumps(dict(**data, limits=budgets, growth=growth, violations=issues), indent=2))
    else:
        print(f"HTML {data['raw_bytes']:,} B / {RAW_LIMIT:,} B; gzip -9 {data['gzip9_bytes']:,} B / {GZIP_LIMIT:,} B")
        for name, n in data['entry_bytes_by_program'].items():
            delta = growth.get('entry_bytes_by_program', {}).get(name)
            print(f'{name:20} {n:>10,} B' + (f'   ({delta:+,} B)' if delta is not None else ''))
        if growth:
            print(f"Change: {growth['raw_bytes']:+,} B raw, {growth['gzip9_bytes']:+,} B gzip -9")
        for issue in issues:
            print('FAIL', issue)
        if not issues:
            print('PASS entry, gzip, program and inline block budgets')
    return bool(issues)


if __name__ == '__main__':
    raise SystemExit(main())
