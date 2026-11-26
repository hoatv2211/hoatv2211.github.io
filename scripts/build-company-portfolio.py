#!/usr/bin/env python3
"""Build opt-in, static recruiter pages and matching CVs from canonical data."""
import argparse
from html import escape
import json
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parent.parent
FIELDS = {'slug', 'company', 'role', 'projectKeys', 'headline', 'summary'}


def load_profile(path, data):
    profile = json.loads(Path(path).read_text(encoding='utf-8'))
    if not isinstance(profile, dict) or set(profile) != FIELDS:
        raise ValueError('Profile must contain exactly: ' + ', '.join(sorted(FIELDS)))
    if not isinstance(profile['slug'], str) or not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', profile['slug']) or len(profile['slug']) > 64:
        raise ValueError('slug must be lowercase ASCII words/digits separated by hyphens (max 64)')
    for field in ('company', 'role', 'headline', 'summary'):
        value = profile[field]
        if not isinstance(value, str) or len(value) > 4000 or any(ord(c) < 32 for c in value):
            raise ValueError(f'{field} must be plain single-line text (max 4000 characters)')
        if field in ('company', 'role') and not value.strip():
            raise ValueError(f'{field} is required')
    keys = profile['projectKeys']
    known = {p['detailKey'] for p in data['projects'] if p['status'] == 'active'}
    if not isinstance(keys, list) or any(not isinstance(k, str) or k not in known for k in keys) or len(set(keys)) != len(keys):
        raise ValueError('projectKeys must be unique canonical detailKey values')
    return profile


def ordered_projects(data, profile):
    projects = sorted((p for p in data['projects'] if p['status'] == 'active'), key=lambda p: p.get('displayOrder', 9999))
    selected = {key: n for n, key in enumerate(profile['projectKeys'])}
    return sorted(projects, key=lambda p: selected.get(p['detailKey'], len(selected)))


def render_page(data, profile):
    e = lambda value: escape(str(value), quote=True)
    identity = data['identity']
    base = identity['portfolioUrl'].rstrip('/')
    slug = profile['slug']
    parts = [f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><base href="../../">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<link rel="canonical" href="{e(base)}/companies/{slug}/">
<title>{e(identity['fullName'])} — {e(profile['company'])}</title>
<link rel="icon" href="assets/avt.jpg">
<style>
*{{box-sizing:border-box}}body{{margin:0;background:#f4f6fa;color:#253142;font:16px/1.65 system-ui,sans-serif}}
main{{max-width:1080px;margin:auto;padding:48px 24px}}header,section{{margin-bottom:36px}}
h1{{font-size:2.6rem;line-height:1.15}}h2{{border-bottom:1px solid #cbd5e1;padding-bottom:8px}}
a{{color:#1764b1}}.grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px}}
article{{background:white;padding:22px;border:1px solid #d9e1ec;border-radius:12px}}
img{{max-width:100%;height:160px;object-fit:contain}}.muted{{color:#526071}}
@media print{{body{{background:white}}main{{padding:0}}article{{break-inside:avoid}}}}
</style></head><body><main><header>
<p class="muted">Application: {e(profile['company'])} · Target role: {e(profile['role'])}</p>
<h1>{e(identity['fullName'])}</h1><p>{e(identity['title'])}</p>
<p>{e(profile['headline'] or identity['headline'])}</p>
<p>{e(identity['location']['city'])}, {e(identity['location']['country'])} · {e(identity['location']['timezone'])}</p>
<p><a href="mailto:{e(data['contact']['email'])}">{e(data['contact']['email'])}</a> · {e(data['contact']['phone'])}</p>
<p><a href="assets/company-{slug}-CV.pdf">Download tailored CV (PDF)</a> · <a href="index.html">Full portfolio</a></p>
</header><section><h2>Profile</h2><p>{e(profile['summary'] or data['about']['summary'])}</p><p>{e(data['about']['pitch'])}</p></section>
<section><h2>Experience</h2>''']
    for job in data['experience']:
        parts.append(f"<h3>{e(job['company'])}</h3><p><strong>{e(job['position'])}</strong> · {e(job['period'])}</p><ul>" + ''.join(f'<li>{e(line)}</li>' for line in job['highlights']) + '</ul>')
    parts.append('</section><section><h2>Skills</h2>')
    for label, values in data['skills']['fullSkillset'].items():
        parts.append(f'<p><strong>{e(label)}:</strong> {e(", ".join(values))}</p>')
    parts.append('</section><section><h2>Education</h2>')
    for entry in data['education']:
        parts.append(f"<p><strong>{e(entry['institution'])}</strong><br>{e(entry['degree'])} · {e(entry['period'])}</p>")
    parts.append('</section><section><h2>All projects</h2><p>Prioritized for this application; the full catalog is retained.</p><div class="grid">')
    for project in ordered_projects(data, profile):
        image = project.get('image') or {}
        parts.append(f'''<article data-project-key="{e(project['detailKey'])}">
<img src="{e(image.get('src', identity['avatar']))}" alt="{e(image.get('alt', project['title']))}" loading="lazy">
<h3>{e(project['title'])}</h3><p>{e(project.get('role', ''))} · {e(project.get('engine', ''))}</p>
<p>{e(project.get('summary') or project.get('description', ''))}</p>
<a href="?project={e(project['detailKey'])}">View project detail</a></article>''')
    parts.append('</div></section></main></body></html>\n')
    return '\n'.join(parts)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--profile', required=True, type=Path)
    parser.add_argument('--output-root', type=Path, default=ROOT,
                        help='Destination site root; defaults to repository. Assets are referenced, not copied.')
    args = parser.parse_args()
    data = json.loads((ROOT / 'portfolio.json').read_text(encoding='utf-8'))
    try:
        profile = load_profile(args.profile, data)
    except (ValueError, OSError) as error:
        parser.error(str(error))
    output_root = args.output_root.resolve()
    page = output_root / 'companies' / profile['slug'] / 'index.html'
    pdf = output_root / 'assets' / f"company-{profile['slug']}-CV.pdf"
    for path in (page, pdf):
        if not path.resolve().is_relative_to(output_root):
            parser.error('Output path escapes destination root (symlink)')
    pdf.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run([sys.executable, str(ROOT / 'scripts/generate-cv.py'),
                    '--profile', str(args.profile.resolve()), '--output', str(pdf)], check=True)
    page.parent.mkdir(parents=True, exist_ok=True)
    page.write_text(render_page(data, profile), encoding='utf-8')
    print(json.dumps({'page': str(page), 'pdf': str(pdf), 'projects': len(ordered_projects(data, profile))}))


if __name__ == '__main__':
    main()
