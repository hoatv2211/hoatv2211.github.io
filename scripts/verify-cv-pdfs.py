#!/usr/bin/env python3
"""Optional documents-environment PDF checks and visual review exports."""
import argparse
import importlib.util
import json
from pathlib import Path
import re
from pypdf import PdfReader
import pdfplumber
import pypdfium2

ROOT = Path(__file__).resolve().parents[1]


def verify(output_dir=None):
    spec = importlib.util.spec_from_file_location('cv_variants', ROOT / 'scripts/cv-variants.py')
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    reports = {}
    for audience, source in module.sources().items():
        path = ROOT / f'assets/Tran-Van-Hoa-{audience}-CV.pdf'
        reader = PdfReader(path)
        assert len(reader.pages) == 2, (audience, len(reader.pages))
        urls = {str(a.get_object().get('/A', {}).get('/URI', '')) for page in reader.pages for a in page.get('/Annots', [])}
        expected = set(re.findall(r'\]\(([^)]+)\)', source))
        assert urls == expected, (expected - urls, urls - expected)
        normalize = lambda text: ' '.join(text.split())
        pages = [normalize(page.extract_text()) for page in reader.pages]
        assert 'EXPERIENCE' in pages[0] and 'CSCMobi Studio' in pages[0]
        assert 'SELECTED' in pages[1] and 'EDUCATION' in pages[1]
        whole = ' '.join(pages)
        assert '(cid:' not in whole and '\ufffd' not in whole
        # Exact prose reading order against generated source, ignoring Markdown markup.
        cursor = 0
        for line in source.splitlines():
            if not line or line.startswith('<!--'):
                continue
            plain = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', line)
            plain = normalize(plain.lstrip('# ').replace('**', ''))
            offset = whole.find(plain, cursor)
            assert offset >= cursor, (audience, plain)
            cursor = offset + len(plain)
        details = []
        with pdfplumber.open(path) as document:
            for n, page in enumerate(document.pages, 1):
                assert abs(page.width - 595.276) < 0.1 and abs(page.height - 841.89) < 0.1
                for char in page.chars:
                    assert char['x0'] >= 41 and char['x1'] <= page.width - 41, (audience, n, char)
                    assert char['top'] > 31 and char['bottom'] < page.height - 20, (audience, n, char)
                body = [c for c in page.chars if c['top'] < page.height - 42]
                assert min(c['size'] for c in body) >= 9.99, (audience, n, 'body below 10pt')
                details.append({'page': n, 'characters': len(page.extract_text()), 'bodyBottom': max(c['bottom'] for c in body), 'minBodyFont': min(c['size'] for c in body)})
        reports[audience] = {'pages': details, 'links': sorted(urls)}
        if output_dir:
            output_dir.mkdir(parents=True, exist_ok=True)
            pdf = pypdfium2.PdfDocument(str(path))
            for n in range(len(pdf)):
                pdf[n].render(scale=1.7).to_pil().save(output_dir / f'{audience.lower()}-page-{n+1}.png')
            (output_dir / f'{audience.lower()}.txt').write_text('\n\n'.join(p.extract_text() for p in reader.pages))
        print(f'PASS {audience}: 2 A4 pages, >=10pt body, exact source reading order and links, Unicode text, margins')
    if output_dir:
        (output_dir / 'pdf-verification.json').write_text(json.dumps(reports, indent=2))
    return reports

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--render-dir', type=Path)
    args = parser.parse_args()
    verify(args.render_dir)
