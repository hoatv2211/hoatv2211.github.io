#!/usr/bin/env python3
"""Build the standalone recruiter HTML and optional ReportLab CV from canonical facts.

--check uses only the standard library; --pdf requires ReportLab.
"""
import argparse
from html import escape as esc
import hashlib
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT / 'assets/Tran-Van-Hoa-Unity-CV.pdf'


def load():
    data = json.loads((ROOT / 'portfolio.json').read_text())
    config = json.loads((ROOT / 'recruiter/profile.json').read_text())
    projects = {p['detailKey']: p for p in data['projects']}
    return data, config, projects


def stores(project):
    candidates = list((project.get('links') or {}).values())
    candidates += [e.get('url') for e in (project.get('detail') or {}).get('evidence', []) or []]
    result = {}
    for url in candidates:
        if not isinstance(url, str):
            continue
        if 'play.google.com/' in url:
            result[url] = 'Google Play'
        elif 'apps.apple.com/' in url:
            result[url] = 'App Store'
    return result


def contributions(project):
    return (project.get('detail') or {}).get('contribution') or project.get('myContributions') or []


def project_evidence(project):
    result = stores(project)
    for key, url in (project.get('links') or {}).items():
        if isinstance(url, str) and url.startswith(('https://', 'http://')):
            result.setdefault(url, {'github': 'GitHub', 'githubOrg': 'GitHub organization', 'website': 'Website', 'appStore': 'App Store', 'googlePlay': 'Google Play'}.get(key, 'View ' + re.sub(r'([A-Z])', r' \1', key).lower()))
    for entry in (project.get('detail') or {}).get('evidence', []) or []:
        url = entry.get('url')
        if isinstance(url, str) and url.startswith(('https://', 'http://')):
            result.setdefault(url, entry.get('label') or entry.get('title') or 'Project evidence')
    return result


def project_groups(data, config):
    active = [p for p in data['projects'] if p.get('status') == 'active']
    priority = [next(p for p in active if p['detailKey'] == key) for key in config['projectKeys'] if any(p['detailKey'] == key for p in active)]
    remaining = [p for p in active if p['detailKey'] not in config['projectKeys']]
    tools = [p for p in remaining if p.get('category') == 'agentic' or p.get('type') == 'tool']
    # Group this personal RPG beside JX1 without changing its canonical type.
    samples = [p for p in remaining if p not in tools and p.get('type') in ('sample', 'personal') and p['detailKey'] != 'flyingphoenix']
    production = [p for p in remaining if p not in tools and p not in samples]
    flying = next((p for p in production if p['detailKey'] == 'flyingphoenix'), None)
    if flying:
        production.remove(flying)
        jx1_index = next((i for i, p in enumerate(production) if p['detailKey'] == 'jx1'), len(production) - 1)
        production.insert(jx1_index + 1, flying)
    return [('Priority Unity production', priority), ('More production & interactive work', production), ('Samples & personal projects', samples), ('AI & developer tools', tools)]


def case_url(project, base=''):
    return base + '/?project=' + project['detailKey']


def evidence_text(entry, projects):
    if 'text' in entry:
        return entry['text']
    lines = contributions(projects[entry['projectKey']])
    return ' '.join(lines[i] for i in [entry['contributionIndex']] + ([entry['extraContributionIndex']] if 'extraContributionIndex' in entry else []))


def artwork(project, hero=False):
    """Use real detail media, not a tiny app icon stretched into a cover."""
    images = [m for m in (project.get('detail') or {}).get('media', []) if m.get('type') == 'image']
    wide = [m for m in images if m.get('width', 0) > m.get('height', 0)]
    chosen = wide[:1] or images[:3] or [project.get('image') or {}]
    rendered = []
    for image in chosen:
        if not image.get('src'):
            continue
        rendered.append(f'<img src="/{esc(image["src"], quote=True)}" alt="{esc(image.get("alt") or project["title"], quote=True)}" width="{image.get("width", 600)}" height="{image.get("height", 600)}" loading="{"eager" if hero else "lazy"}" decoding="async">')
    return ''.join(rendered)


def render(data, config, projects):
    identity, contact = data['identity'], data['contact']
    groups = []
    for heading, members in project_groups(data, config):
        cards = []
        for p in members:
            key = p['detailKey']
            kind = p.get('type') or 'Project'
            status = {'commercial': 'Commercial', 'sample': 'Sample', 'personal': 'Personal', 'tool': 'Developer tool'}.get(kind, kind.title())
            metadata = ' · '.join(str(v) for v in [status, p.get('category'), p.get('period')] if v)
            scope = ' · '.join(str(v) for v in [p.get('genre'), p.get('role')] if v)
            links = ''.join(f'<a href="{esc(url, quote=True)}" rel="noopener noreferrer">{esc(label)}</a>' for url, label in project_evidence(p).items())
            ownership = f'<p class="ownership">{esc(p["ownership"])}</p>' if p.get('ownership') else ''
            # Detailed context stays in the case study; ownership and the full
            # contribution list keep the overview useful for a recruiter scan.
            context_html = ''
            cover = f'<a class="project-cover" href="{case_url(p)}" aria-label="View {esc(p["title"], quote=True)} case study">{artwork(p)}</a>'
            cards.append(f'''<article class="project" data-project="{esc(key, quote=True)}">{cover}<div class="project-body"><div class="project-head"><span class="eyebrow">{esc(metadata)}</span><h3>{esc(p['title'])}</h3><p class="muted">{esc(scope)}</p></div>{ownership}{context_html}<ul>{''.join('<li>'+esc(c)+'</li>' for c in contributions(p))}</ul><div class="project-links"><a href="{case_url(p)}">Read case study<span class="sr-only">: {esc(p['title'])}</span></a>{links}</div></div></article>''')
        if cards:
            groups.append(f'<section class="project-group" aria-labelledby="group-{len(groups)}"><div class="group-heading"><h3 id="group-{len(groups)}">{esc(heading)}</h3><span class="group-count">{len(cards):02d} projects</span></div><div class="projects">{"".join(cards)}</div></section>')
    experiences = []
    for i, job in enumerate(data['experience']):
        bullets = [job['highlights'][n] for n in config['experienceHighlights'][i]]
        experiences.append(f'<article class="job"><div><h3>{esc(job["company"])}</h3><p>{esc(job["position"])}</p></div><p class="period">{esc(job["period"])}</p><ul>{"".join("<li>"+esc(b)+"</li>" for b in bullets)}</ul></article>')
    evidence = []
    for entry in config['evidence']:
        link = f'<a href="{case_url(projects[entry["projectKey"]])}">View {esc(projects[entry["projectKey"]]["title"])} case study</a>' if 'projectKey' in entry else '<span class="muted">Profile-listed principles</span>'
        evidence.append(f'<div class="evidence"><h3>{esc(entry["title"])}</h3><p>{esc(evidence_text(entry, projects))}</p>{link}</div>')
    education = ''.join(f'<article><h3>{esc(e["institution"])}</h3><p>{esc(e["degree"])}</p><p class="muted">{esc(e["period"])}</p></article>' for e in data['education'])
    return f'''<!doctype html>
<html lang="en" data-type="software"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>{esc(identity['fullName'])} — {esc(config['role'])}</title><meta name="description" content="Unity developer portfolio: casual and puzzle gameplay, mobile optimization, published games, experience, and a separate PDF CV."><meta name="page-type" content="software"><meta name="site-kind" content="gaming"><meta name="theme-color" content="#171819"><meta property="og:title" content="Hoa / MAD — Senior Unity Developer"><meta property="og:description" content="Gameplay, mobile systems, and production work. View projects and engineering contributions."><meta property="og:image" content="{esc(identity['portfolioUrl'].rstrip('/'))}/assets/thumbnail_2.webp"><link rel="icon" href="/assets/logo.png"><link rel="stylesheet" href="/recruiter/style.css"></head>
<body><a class="skip" href="#main">Skip to content</a><header class="topbar"><a class="brand" href="/recruiter/">{esc(identity['alias'])}<span> / HOA · UNITY DEVELOPER</span></a><nav aria-label="Main navigation"><a href="#projects">All projects</a><a href="#experience">Experience</a><a href="/?focus=all">All work & services ↗</a></nav></header>
<main id="main"><section class="intro" aria-labelledby="name"><div class="intro-copy"><p class="eyebrow">{esc(identity['location']['city'])}, {esc(identity['location']['country'])} · 8+ years in games</p><h1 id="name">{esc(identity['fullName'])}<span class="alias"> / {esc(identity['alias'])}</span></h1><p class="role">{esc(config['role'])}</p><p class="summary">{esc(config['summary'])}</p><div class="actions"><a class="button" href="mailto:{esc(contact['email'])}">Discuss a Unity role ↗</a><a class="button secondary" href="/assets/Tran-Van-Hoa-Unity-CV.pdf">Download Unity CV (PDF) ↓</a></div><p class="contact-line"><a href="mailto:{esc(contact['email'])}">{esc(contact['email'])}</a><a href="tel:{re.sub(r'[^+0-9]', '', contact['phone'])}">{esc(contact['phone'])}</a><a href="{esc(data['social']['linkedin'])}">LinkedIn ↗</a></p></div><div class="hero-work"><div class="hero-work-top"><span class="eyebrow">Gameplay / selected work</span><span class="media-index" aria-hidden="true">UNITY / C#</span></div><a class="hero-main" href="/?project=sandwich" aria-label="View Sandwich Please! gameplay contributions">{artwork(projects['sandwich'], True)}</a><div class="hero-bottom"><div class="hero-note"><span class="eyebrow">Engineering focus</span><h2>Gameplay<br>through release.</h2><p>Core loops. Mobile UI.<br>Profiling & production support.</p></div><a class="hero-portrait" href="/?project=MeowFlow" aria-label="View Meow Flow case study">{artwork(projects['MeowFlow'], True)}</a></div></div></section>
<div class="work-index" aria-label="Portfolio overview"><span><strong>{len([p for p in data['projects'] if p.get('status') == 'active']):02d}</strong> projects / complete catalog</span><span>C# <b> / </b> Unity <b> / </b> Mobile</span><a href="#projects">View production work ↓</a></div>
<section id="projects"><div class="section-heading"><div><p class="eyebrow">Complete project portfolio</p><h2>Unity production first. Full delivery breadth.</h2></div><p>Start with six Unity production games, then explore more production work, samples, personal projects, and AI tools. Each project includes hands-on contributions and available product or source links.</p></div>{''.join(groups)}</section>
<section id="skills"><div class="section-heading"><div><p class="eyebrow">Technical evidence</p><h2>Skills linked to actual work</h2></div></div><div class="evidence-grid">{''.join(evidence)}</div><p class="note">Explore UI animation in Tile Candy, physics and particles in Rise of Trial Bike, and mobile 3D profiling in MU Loren Mobile.</p></section>
<section id="experience"><p class="eyebrow">Career</p><h2>Experience</h2><div class="experience">{''.join(experiences)}</div></section>
<section id="education"><p class="eyebrow">Education</p><h2>Study & training</h2><div class="education">{education}</div></section>
<section class="closing"><div><p class="eyebrow">Contact</p><h2>Let's discuss your next Unity game.</h2><a href="mailto:{esc(contact['email'])}">{esc(contact['email'])}</a></div><a class="button secondary" href="/assets/Tran-Van-Hoa-Unity-CV.pdf">Download Unity CV (PDF)</a></section></main><footer><p>Unity recruiter portfolio · <a href="/?focus=all">Full portfolio & services</a></p><nav aria-label="Other portfolio styles"><a href="/themes/game-studio/">Game studio style</a><a href="/themes/dev-console/">Developer console style</a></nav></footer></body></html>
'''


def make_pdf(data, config, projects):
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_LEFT
    from reportlab.lib.pagesizes import A4
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, KeepTogether, PageBreak
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name='CVBody', fontName='Helvetica', fontSize=9.4, leading=12.6, spaceAfter=5, textColor=colors.HexColor('#263345')))
    styles.add(ParagraphStyle(name='CVHeading', fontName='Helvetica-Bold', fontSize=13, leading=17, spaceBefore=10, spaceAfter=7, textColor=colors.HexColor('#183d59')))
    styles.add(ParagraphStyle(name='CVName', fontName='Helvetica-Bold', fontSize=24, leading=28, spaceAfter=7))
    flow = []
    base = data['identity']['portfolioUrl'].rstrip('/')
    def para(text, style='CVBody'):
        return Paragraph(text, styles[style])
    def link(url, label):
        return f'<link href="{esc(url, quote=True)}" color="#175478">{esc(label)}</link>'
    def heading(text):
        flow.append(para(text, 'CVHeading'))
    flow += [para(esc(data['identity']['fullName']), 'CVName'), para(esc(config['role']) + ' | 8+ years in games'), para(esc(data['identity']['location']['city']) + ', Vietnam | ' + esc(data['contact']['phone']) + ' | ' + link('mailto:'+data['contact']['email'], data['contact']['email'])), para(link(base+'/recruiter/', 'Recruiter portfolio')+' | '+link(data['social']['linkedin'], 'LinkedIn')+' | '+link(base+'/?focus=all', 'Full portfolio')), Spacer(1, 6), para(esc(config['summary']))]
    heading('SELECTED PRODUCTION GAMES')
    for key in config['projectKeys']:
        project = projects[key]
        text = f'<b>{esc(project["title"])}</b> | {esc(project.get("period", ""))} | {esc(project["genre"])}'
        body = ' '.join(line if line.endswith(('.', '!', '?')) else line + '.' for line in contributions(project))
        urls = [link(case_url(project, base), 'Case study')] + [link(url, label) for url, label in stores(project).items()]
        flow.append(KeepTogether([para(text), para(esc(body)), para(' | '.join(urls)), Spacer(1, 4)]))
    flow.append(para('Selected production work. Explore linked case studies for hands-on contributions and store pages for the released products. The recruiter portfolio includes the complete project catalog.'))
    flow.append(PageBreak())
    heading('EXPERIENCE')
    for i, job in enumerate(data['experience']):
        bullets = [job['highlights'][n] for n in config['experienceHighlights'][i]]
        flow.append(KeepTogether([para(f'<b>{esc(job["company"])}</b> | {esc(job["period"])}'), para(esc(job['position']))]+[para('- '+esc(b)) for b in bullets]))
    heading('TECHNICAL EVIDENCE')
    flow.append(para('Core skills: C#, Unity, OOP, SOLID, and design patterns.'))
    flow.append(para('Puzzle rules: Sudoku Universe. UI animation: Tile Candy. Physics and particles: Rise of Trial Bike. Mobile 3D profiling: MU Loren Mobile. Gameplay, analytics and device optimization: Sandwich Please! Explore linked case studies for implementation scope.'))
    heading('EDUCATION')
    for education in data['education']:
        flow.append(para(f'<b>{esc(education["institution"])}</b><br/>{esc(education["degree"])} | {esc(education["period"])}'))
    def footer(canvas, doc):
        canvas.setFont('Helvetica', 8)
        canvas.setFillColor(colors.HexColor('#5d6978'))
        canvas.drawString(40, 25, 'TRAN VAN HOA | Senior Unity Developer')
        canvas.drawRightString(A4[0]-40, 25, str(doc.page))
    SimpleDocTemplate(str(PDF), pagesize=A4, rightMargin=40, leftMargin=40, topMargin=32, bottomMargin=40, title=data['identity']['fullName']+' - Unity CV', author=data['identity']['fullName']).build(flow, onFirstPage=footer, onLaterPages=footer)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    parser.add_argument('--pdf', action='store_true')
    args = parser.parse_args()
    data, config, projects = load()
    html = render(data, config, projects)
    target = ROOT / 'recruiter/index.html'
    digest = hashlib.sha256(json.dumps([data, config], sort_keys=True, ensure_ascii=False).encode()).hexdigest()
    manifest_path = ROOT / 'recruiter/build-manifest.json'
    if args.check:
        stale = not target.exists() or target.read_text() != html
        manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
        stale |= manifest.get('sourceHash') != digest or not PDF.exists()
        if PDF.exists():
            stale |= manifest.get('pdfHash') != hashlib.sha256(PDF.read_bytes()).hexdigest()
        if stale:
            parser.exit(1, 'Recruiter artifacts stale: regenerate HTML and PDF with --pdf.\n')
        print('Recruiter HTML, source fingerprint and PDF integrity: OK (stdlib only)')
        return
    if args.pdf:
        make_pdf(data, config, projects)
    if not PDF.exists():
        parser.exit(1, 'PDF missing: use the documents Python with --pdf.\n')
    if not args.pdf and manifest_path.exists():
        old = json.loads(manifest_path.read_text())
        if old.get('sourceHash') != digest:
            parser.exit(1, 'Canonical inputs changed: regenerate the PDF with --pdf.\n')
    target.write_text(html)
    manifest_path.write_text(json.dumps({'sourceHash': digest, 'pdfHash': hashlib.sha256(PDF.read_bytes()).hexdigest()}, indent=2)+'\n')
    print('Generated recruiter/index.html' + (' and assets/Tran-Van-Hoa-Unity-CV.pdf' if args.pdf else ''))


if __name__ == '__main__':
    main()
