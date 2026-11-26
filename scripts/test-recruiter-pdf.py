"""Optional documents-environment checks for the generated Unity CV."""
import json
from pathlib import Path
from pypdf import PdfReader
import pdfplumber

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT / 'portfolio.json').read_text())
config = json.loads((ROOT / 'recruiter/profile.json').read_text())
path = ROOT / 'assets/Tran-Van-Hoa-Unity-CV.pdf'
reader = PdfReader(path)
assert len(reader.pages) == 2, f'Expected two pages, got {len(reader.pages)}'
text = ' '.join(' '.join(p.extract_text().split()) for p in reader.pages)
assert '(cid:' not in text
urls = {str(a.get_object().get('/A', {}).get('/URI', '')) for p in reader.pages for a in p.get('/Annots', [])}
project_urls = {url for url in urls if '/?project=' in url}
assert project_urls == {data['identity']['portfolioUrl'] + '/?project=' + key for key in config['projectKeys']}
for key in config['projectKeys']:
    project = next(p for p in data['projects'] if p['detailKey'] == key)
    assert project['title'] in text
    assert data['identity']['portfolioUrl'] + '/?project=' + key in urls
for education in data['education']:
    assert education['institution'] in text
for job in data['experience']:
    assert job['company'] in text
with pdfplumber.open(path) as document:
    for page in document.pages:
        for char in page.chars:
            assert char['x0'] >= 30 and char['x1'] <= page.width - 30
            assert char['top'] > 20 and char['bottom'] < page.height - 15
print('PASS Unity CV: 2 pages, six selected projects only, canonical career/education, six exact deep links, text inside margins')
