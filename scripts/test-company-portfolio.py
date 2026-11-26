#!/usr/bin/env python3
"""Run with the same documents-environment Python used to build the PDFs."""
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parent.parent
SCRATCH = Path.home() / '.hermes/cache/scratch'
SCRATCH.mkdir(parents=True, exist_ok=True)


def module():
    path = ROOT / 'scripts/build-company-portfolio.py'
    if not path.exists():
        raise AssertionError('Company portfolio generator is not implemented')
    spec = importlib.util.spec_from_file_location('company_portfolio', path)
    assert spec is not None and spec.loader is not None
    result = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(result)
    return result


class CompanyPortfolioTests(unittest.TestCase):
    def test_profile_validation(self):
        build = module()
        data = json.loads((ROOT / 'portfolio.json').read_text())
        profile = dict(slug='fixture-only', company='Fixture & Co', role='Target role',
                       projectKeys=[data['projects'][0]['detailKey']], headline='', summary='')
        with tempfile.TemporaryDirectory(dir=SCRATCH) as directory:
            path = Path(directory) / 'profile.json'
            for field, value in [('slug', '../escape'), ('slug', 'UPPER'), ('slug', 'a/b'),
                                 ('slug', ''), ('projectKeys', ['unknown-key']),
                                 ('projectKeys', ['../escape']), ('projectKeys', 'idleCyber'),
                                 ('company', ''), ('role', 42), ('extra', 'private JD')]:
                with self.subTest(field=field, value=value):
                    path.write_text(json.dumps({**profile, field: value}))
                    with self.assertRaises(ValueError):
                        build.load_profile(path, data)
            path.write_text(json.dumps(profile))
            self.assertEqual(build.load_profile(path, data), profile)

    def test_static_page_and_matching_pdf(self):
        from pypdf import PdfReader
        data = json.loads((ROOT / 'portfolio.json').read_text())
        active = [p for p in data['projects'] if p['status'] == 'active']
        keys = [active[-1]['detailKey'], active[0]['detailKey']]
        copy = '<script>alert("x")</script> & evidence'
        profile = dict(slug='fixture-only', company='Fixture & Co', role='Target role',
                       projectKeys=keys, headline=copy, summary=copy)
        default = ROOT / 'assets/Tran-Van-Hoa-CV.pdf'
        before = default.read_bytes()
        with tempfile.TemporaryDirectory(dir=SCRATCH) as directory:
            dest = Path(directory)
            config = dest / 'fixture.json'
            config.write_text(json.dumps(profile))
            command = [sys.executable, str(ROOT / 'scripts/build-company-portfolio.py'),
                       '--profile', str(config), '--output-root', str(dest)]
            result = subprocess.run(command, capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr + result.stdout)
            page = dest / 'companies/fixture-only/index.html'
            html = page.read_text()
            self.assertIn('<base href="../../">', html)
            self.assertIn('content="noindex, nofollow"', html)
            self.assertIn('https://hoatv2211.github.io/companies/fixture-only/', html)
            self.assertIn('assets/company-fixture-only-CV.pdf', html)
            self.assertNotIn('<script>alert', html)
            self.assertIn('&lt;script&gt;', html)
            positions = []
            for project in active:
                token = 'data-project-key="' + project['detailKey'] + '"'
                self.assertEqual(html.count(token), 1)
                self.assertIn('href="?project=' + project['detailKey'] + '"', html)
                positions.append(html.index(token))
            self.assertLess(html.index('data-project-key="' + keys[0] + '"'), min(positions[:-1]))
            for project in data['projects']:
                if project['status'] != 'active':
                    self.assertNotIn('data-project-key="' + project['detailKey'] + '"', html)
            for entry in data['experience']:
                self.assertIn(entry['position'].replace('&', '&amp;'), html)
            pdf = PdfReader(dest / 'assets/company-fixture-only-CV.pdf')
            text = ' '.join(' '.join(p.extract_text().split()) for p in pdf.pages)
            self.assertIn('Application: Fixture & Co', text)
            self.assertIn('Target role: Target role', text)
            self.assertIn('<script>alert("x")</script> & evidence', text)
            urls = [a.get_object()['/A']['/URI'] for p in pdf.pages for a in p.get('/Annots', [])
                    if a.get_object().get('/A', {}).get('/URI')]
            for key in keys:
                self.assertIn('https://hoatv2211.github.io/?project=' + key, urls)
            first = html
            subprocess.run(command, check=True, capture_output=True)
            self.assertEqual(page.read_text(), first)
        self.assertEqual(default.read_bytes(), before)

    def test_default_cv_output_override_keeps_default_content(self):
        self.assertIn('--output', (ROOT / 'scripts/generate-cv.py').read_text(),
                      'Output override missing; do not run legacy script against default PDF')
        from pypdf import PdfReader
        with tempfile.TemporaryDirectory(dir=SCRATCH) as directory:
            output = Path(directory) / 'default.pdf'
            result = subprocess.run([sys.executable, str(ROOT / 'scripts/generate-cv.py'),
                                     '--output', str(output)], capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)
            text = ' '.join(' '.join(p.extract_text().split()) for p in PdfReader(output).pages)
            self.assertIn('TRAN VAN HOA', text)
            self.assertIn('Idle Cyber (NFT)', text)
            self.assertNotIn('Application:', text)
            self.assertNotIn('Target role:', text)


if __name__ == '__main__':
    unittest.main(verbosity=2)
