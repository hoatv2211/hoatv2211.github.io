"""Dependency-free contract for the separate, canonical-derived recruiter surface."""
import json
import re
from html import escape
from pathlib import Path
import subprocess
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]


class RecruiterContract(unittest.TestCase):
    def test_flying_phoenix_sits_beside_jx1_in_more_work(self):
        import importlib.util
        spec = importlib.util.spec_from_file_location('recruiter_builder', ROOT / 'scripts/build-recruiter-portfolio.py')
        assert spec is not None and spec.loader is not None
        builder = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(builder)
        data, config, projects = builder.load()
        groups = dict(builder.project_groups(data, config))
        keys = [p['detailKey'] for p in groups['More production & interactive work']]
        self.assertEqual(len(keys), 12)
        self.assertEqual(keys[keys.index('jx1') + 1], 'flyingphoenix')
        self.assertEqual(projects['flyingphoenix']['type'], 'personal')

    def test_visual_identity_and_canonical_media(self):
        html = (ROOT / 'recruiter/index.html').read_text()
        css = (ROOT / 'recruiter/dev.css').read_text()
        self.assertIn('class="hero-work"', html)
        self.assertIn('MAD', html)
        canonical = json.loads((ROOT / 'portfolio.json').read_text())
        for project in canonical['projects']:
            if project.get('status') != 'active':
                continue
            match = re.search(r'<article class="project" data-project="' + re.escape(project['detailKey']) + r'">(.*?)</article>', html, re.S)
            assert match is not None
            card = match.group(1)
            self.assertIn('class="project-cover"', card)
            images = [m for m in project.get('detail', {}).get('media', []) if m.get('type') == 'image']
            if images:
                self.assertTrue(any('/' + m['src'] in card for m in images), project['detailKey'])
        self.assertIn('prefers-reduced-motion: reduce', css)
        self.assertIn('color-scheme: dark', css)
        self.assertNotIn('position:fixed', css)

    def test_store_union_includes_detail_only_evidence_and_deduplicates(self):
        import importlib.util
        spec = importlib.util.spec_from_file_location('recruiter_builder', ROOT / 'scripts/build-recruiter-portfolio.py')
        assert spec is not None and spec.loader is not None
        builder = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(builder)
        url = 'https://play.google.com/store/apps/details?id=test'
        self.assertEqual(builder.stores({'links': {'googlePlay': url}, 'detail': {'evidence': [{'url': url}, {'url': 'https://example.org/demo'}]}}), {url: 'Google Play'})
        self.assertEqual(builder.stores({'detail': {'evidence': [{'url': url}]}}), {url: 'Google Play'})
        self.assertEqual(builder.stores({}), {})
        self.assertEqual(builder.stores({'links': None, 'detail': None}), {})
        self.assertEqual(builder.stores({'links': {'website': None}, 'detail': {'evidence': None}}), {})

    def test_null_optional_fields_render_without_fabricated_facts(self):
        import importlib.util
        import copy
        spec = importlib.util.spec_from_file_location('recruiter_builder', ROOT / 'scripts/build-recruiter-portfolio.py')
        assert spec is not None and spec.loader is not None
        builder = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(builder)
        data, config, _ = builder.load()
        data = copy.deepcopy(data)
        for p in data['projects']:
            for field in ['links', 'genre', 'ownership', 'type', 'period']:
                p[field] = None
        html = builder.render(data, config, {p['detailKey']: p for p in data['projects']})
        self.assertNotIn('None', html)
        self.assertCountEqual(re.findall(r'data-project="([^"]+)"', html), [p['detailKey'] for p in data['projects'] if p.get('status') == 'active'])

    def test_static_recruiter_is_reproducible_and_evidence_backed(self):
        page = ROOT / 'recruiter/index.html'
        self.assertTrue(page.exists(), 'Missing dedicated static recruiter portfolio')
        result = subprocess.run([sys.executable, str(ROOT / 'scripts/build-recruiter-portfolio.py'), '--check'], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        html = page.read_text()
        canonical = json.loads((ROOT / 'portfolio.json').read_text())
        keys = [p['detailKey'] for p in canonical['projects'] if p.get('status') == 'active']
        rendered = re.findall(r'data-project="([^"]+)"', html)
        self.assertCountEqual(rendered, keys, 'Every active project must appear exactly once on the recruiter page')
        self.assertEqual(rendered[:6], ['sandwich', 'MeowFlow', 'tilesmatch3', 'sudoku', 'bike', 'muloren'])
        for key in keys:
            project = next(p for p in canonical['projects'] if p['detailKey'] == key)
            match = re.search(r'<article class="project" data-project="' + re.escape(key) + r'">(.*?)</article>', html, re.S)
            assert match is not None
            card = match.group(1)
            for field in ['role', 'ownership']:
                if project.get(field):
                    self.assertIn(escape(project[field]), card)
            for line in (project.get('detail') or {}).get('contribution') or project.get('myContributions') or []:
                self.assertIn(escape(line), card)
            self.assertIn(f'data-project="{key}"', html)
            self.assertIn(f'?project={key}', html)
            self.assertIn(escape(project['title']), html)
            evidence = project.get('detail', {}).get('evidence', [])
            urls = list((project.get('links') or {}).values()) + [e['url'] for e in evidence]
            for url in urls:
                if isinstance(url, str) and url.startswith(('https://', 'http://')):
                    self.assertIn(escape(url, quote=True), card)
        self.assertIn('Senior Unity Developer', html)
        self.assertIn('8+ years in games', html)
        self.assertIn('/assets/Tran-Van-Hoa-Unity-CV.pdf', html)
        self.assertNotIn('<script', html)
        self.assertNotIn('Gamee', html)
        self.assertNotIn('Sonat', html)
        self.assertNotIn('canonical record', html)
        self.assertNotIn('VFX specialization', html)
        for education in canonical['education']:
            self.assertIn(education['institution'], html)
        for experience in canonical['experience']:
            self.assertIn(experience['company'], html)
        self.assertTrue((ROOT / 'assets/Tran-Van-Hoa-Unity-CV.pdf').is_file())
        for theme in ['game-studio', 'dev-console']:
            alias = (ROOT / f'themes/{theme}/index.html').read_text()
            self.assertIn(f'/backup/{theme}/', alias)


if __name__ == '__main__':
    unittest.main()
