"""Stdlib regression checks for the two audience-specific CV sources."""
import importlib.util
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]

class CVVariants(unittest.TestCase):
    def test_html_only_build_cannot_bless_modified_pdf(self):
        import subprocess
        import sys
        path = ROOT / 'assets/Tran-Van-Hoa-Fullstack-CV.pdf'
        original = path.read_bytes()
        try:
            path.write_bytes(original + b'\n% tampered test fixture\n')
            result = subprocess.run([sys.executable, str(ROOT / 'scripts/build-recruiter-portfolio.py')], capture_output=True, text=True)
            self.assertNotEqual(result.returncode, 0, 'HTML-only generation must not bless a modified PDF')
        finally:
            path.write_bytes(original)

    def test_sources_are_distinct_submission_ready_and_canonical(self):
        spec = importlib.util.spec_from_file_location('cv_variants', ROOT / 'scripts/cv-variants.py')
        assert spec and spec.loader, 'Reproducible CV variant builder required'
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        sources = module.sources()
        data = json.loads((ROOT / 'portfolio.json').read_text())
        self.assertEqual(set(sources), {'Unity', 'Fullstack'})
        for audience, source in sources.items():
            self.assertEqual((ROOT / f'recruiter/cv-{audience.lower()}.md').read_text(), source)
            self.assertNotRegex(source, r'\[(?:Android|Peak|Supported)|Pending measurements')
            self.assertIn('100+ games shipped', source)
            self.assertIn('8+ years in game development', source)

            self.assertIn('MOStudio Kit (beta)', source)
            for job in data['experience']:
                self.assertIn(job['company'], source)
                self.assertIn(job['position'], source)
                self.assertIn(job['period'], source)
            for group in ['Client', 'Server', 'Web']:
                self.assertIn(group, source)
        unity = sources['Unity'].split('## SELECTED GAME PROJECTS')[1]
        self.assertNotIn('ProxyAPI.MAD', sources['Unity'])
        self.assertNotIn('project=proxyapi-mad', sources['Unity'])
        self.assertIn('CLIProxyAPI', sources['Fullstack'])
        keys = ['jx1', 'muloren', 'sandwich', 'dalgona', 'sudoku', 'MeowFlow']
        offsets = [unity.index('/?project=' + key) for key in keys]
        self.assertEqual(offsets, sorted(offsets))
        self.assertIn('personal project in development', sources['Fullstack'])
        self.assertIn('accelerate', sources['Fullstack'])
        self.assertNotIn('100+ full-stack', sources['Fullstack'])
        self.assertIn('Tran-Van-Hoa-Fullstack-CV.pdf', (ROOT / 'index.html').read_text())

if __name__ == '__main__':
    unittest.main()
