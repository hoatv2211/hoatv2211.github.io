#!/usr/bin/env python3
"""Canonical-derived CV Markdown and Unicode, single-column PDF renderer.

Imported lazily by the recruiter builder so --check remains stdlib-only.
"""
from html import escape
import importlib.util
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def sources():
    spec = importlib.util.spec_from_file_location('recruiter', ROOT / 'scripts/build-recruiter-portfolio.py')
    assert spec and spec.loader
    builder = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(builder)
    data, config, projects = builder.load()
    base = data['identity']['portfolioUrl'].rstrip('/')
    result = {}
    for audience in ['Unity', 'Fullstack']:
        profile = config if audience == 'Unity' else config['fullstack']
        portfolio = base + ('/recruiter/' if audience == 'Unity' else '/')
        lines = ['# ' + data['identity']['fullName'] + ' (MAD)', profile['role'], '',
                 f"{data['identity']['location']['city']}, Vietnam | {data['contact']['phone']} | [{data['contact']['email']}](mailto:{data['contact']['email']})",
                 f"[Portfolio]({portfolio}) | [LinkedIn]({data['social']['linkedin']}) | [GitHub]({data['social']['github']})", '',
                 '## PROFILE', config['cvSummary'] if audience == 'Unity' else profile['summary'], '', '## CORE SKILLS']
        lines += [f'**{label}:** {value}' for label, value in profile['skillGroups'].items()]
        lines += ['', '## EXPERIENCE']
        # Titles, dates and responsibility statements stay canonical; select only relevance.
        indexes = [[0, 3], [0, 1], [0, 2, 3], [1, 0, 2], [0, 2], [0], [0]]
        for job, selected in zip(data['experience'], indexes):
            lines += ['', f"### {job['company']} | {job['period']}", f"**{job['position']}**"]
            bullets = builder.career_bullets(job, selected)
            # Consolidate coordination evidence, without losing hiring/onboarding/mentoring.
            if job['company'] == 'BLAMEO Technology':
                bullets = [bullets[0], bullets[1] + '; mentored developers and coordinated with design, QA, and backend teams']
            if job['company'] == 'Neko Global':
                bullets = [bullets[0], bullets[1] + '; managed task breakdown and team coordination']
            lines += ['- ' + bullet.rstrip('.') + '.' for bullet in bullets]
        lines += ['', '<!-- pagebreak -->', '', '## SELECTED GAME PROJECTS' if audience == 'Unity' else '## SELECTED DELIVERY & TOOLS']
        for key in profile['projectKeys']:
            p = projects[key]
            metadata = ' | '.join(str(v) for v in [p.get('period'), p.get('role')] if v)
            lines += ['', f"### {p['title']}" + (' | ' + metadata if metadata else ''),
                      f"[Case study]({base}/?project={key})"]
            lines += ['- ' + line for line in profile['projectCopy'][key]]
        if audience == 'Unity':
            lines += ['', '## AI & DEVELOPER TOOLS', config['toolingSummary']]
            # Keep tools concise: product, attributable scope, one inspectable link each.
            for key, label, scope in [
                ('gamestudio-codexkit', 'MOStudio Kit (beta)', 'AI skills for Unity, C++/Lua services and release workflows; Python maintenance tools.'),

                ('brproxies', 'BrProxies', 'Rust/Tauri and React/TypeScript workspace; HTTP automation, MCP and SDKs.')]:
                lines += [f'- **{label}:** {scope}', f'[Case study]({base}/?project={key})']
        else:
            lines += ['', '## DELIVERY APPROACH', profile['delivery']]
        lines += ['', '## EDUCATION']
        for education in data['education']:
            lines += [f"**{education['institution']}** | {education['period']}", education['degree']]
        result[audience] = '\n'.join(lines) + '\n'
    return result


def make_pdf(source, output, role):
    import os
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import ParagraphStyle
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    from reportlab.platypus import SimpleDocTemplate, Paragraph, KeepTogether, PageBreak
    candidates = [os.environ.get('CV_FONT_DIR', ''), '/System/Library/Fonts/Supplemental', '/usr/share/fonts/truetype/dejavu']
    directory = next((Path(p) for p in candidates if p and (Path(p) / 'Arial.ttf').exists() or p and (Path(p) / 'DejaVuSans.ttf').exists()), None)
    if directory is None:
        raise RuntimeError('Set CV_FONT_DIR to a directory with Arial.ttf/Arial Bold.ttf or DejaVuSans.ttf/DejaVuSans-Bold.ttf')
    arial = (directory / 'Arial.ttf').exists()
    for name, filename in [('CV', 'Arial.ttf' if arial else 'DejaVuSans.ttf'), ('CVBold', 'Arial Bold.ttf' if arial else 'DejaVuSans-Bold.ttf')]:
        pdfmetrics.registerFont(TTFont(name, str(directory / filename)))
    pdfmetrics.registerFontFamily('CV', normal='CV', bold='CVBold', italic='CV', boldItalic='CVBold')
    styles = {
        'body': ParagraphStyle('body', fontName='CV', fontSize=10, leading=12, spaceAfter=2.5, textColor=colors.HexColor('#24303b')),
        'name': ParagraphStyle('name', fontName='CVBold', fontSize=22, leading=26, spaceAfter=4),
        'h2': ParagraphStyle('h2', fontName='CVBold', fontSize=11, leading=13, spaceBefore=8, spaceAfter=4, keepWithNext=True, textColor=colors.HexColor('#1a526f')),
        'h3': ParagraphStyle('h3', fontName='CVBold', fontSize=10, leading=12, spaceBefore=5, spaceAfter=2, keepWithNext=True),
        'bullet': ParagraphStyle('bullet', fontName='CV', fontSize=10, leading=12, spaceAfter=2.5, leftIndent=10, firstLineIndent=-8, textColor=colors.HexColor('#24303b')),
    }
    def para(line, style='body'):
        text = escape(line)
        text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<link href="\2" color="#175478"><nobr>\1</nobr></link>', text)
        text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
        return Paragraph(text, styles[style])
    flow = []
    lines = source.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        i += 1
        if not line:
            continue
        if line == '<!-- pagebreak -->':
            flow.append(PageBreak())
        elif line.startswith('### '):
            block = [para(line[4:], 'h3')]
            while i < len(lines) and lines[i].strip() and not lines[i].startswith('#'):
                item = lines[i].strip()
                i += 1
                block.append(para(item, 'bullet' if item.startswith('- ') else 'body'))
            flow.append(KeepTogether(block))
        elif line.startswith('## '):
            flow.append(para(line[3:], 'h2'))
        elif line.startswith('# '):
            flow.append(para(line[2:], 'name'))
        else:
            flow.append(para(line, 'bullet' if line.startswith('- ') else 'body'))
    def footer(canvas, doc):
        canvas.setFont('CV', 8)
        canvas.setFillColor(colors.HexColor('#596774'))
        canvas.drawString(42, 25, 'TRAN VAN HOA | ' + role)
        canvas.drawRightString(A4[0] - 42, 25, str(doc.page))
    SimpleDocTemplate(str(output), pagesize=A4, leftMargin=42, rightMargin=42, topMargin=32, bottomMargin=42, title='Tran Van Hoa - ' + role, author='Tran Van Hoa', invariant=1).build(flow, onFirstPage=footer, onLaterPages=footer)
