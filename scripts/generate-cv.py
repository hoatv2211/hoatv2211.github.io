#!/usr/bin/env python3
"""Build the portfolio CV with ReportLab; run in the documents environment."""
import argparse
import importlib.util
import json
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_RIGHT
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether

ROOT = Path(__file__).resolve().parent.parent
DATA = json.loads((ROOT / "portfolio.json").read_text())
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--profile', type=Path, help='Explicit company profile JSON')
parser.add_argument('--output', type=Path, help='Override destination PDF')
args = parser.parse_args()
PROFILE = None
if args.profile:
    spec = importlib.util.spec_from_file_location('company_portfolio', ROOT / 'scripts/build-company-portfolio.py')
    assert spec is not None and spec.loader is not None
    company_builder = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(company_builder)
    try:
        PROFILE = company_builder.load_profile(args.profile, DATA)
    except (ValueError, OSError) as error:
        parser.error(str(error))
OUT = args.output or (ROOT / f"assets/company-{PROFILE['slug']}-CV.pdf" if PROFILE else ROOT / 'assets/Tran-Van-Hoa-CV.pdf')
OUT.parent.mkdir(parents=True, exist_ok=True)
BLUE = colors.HexColor("#1764b1")
GRAY = colors.HexColor("#526071")
styles = {
    "body": ParagraphStyle("body", fontName="Helvetica", fontSize=9.5, leading=12.5, textColor=colors.HexColor("#26313e"), spaceAfter=5),
    "small": ParagraphStyle("small", fontName="Helvetica", fontSize=9, leading=12, textColor=GRAY),
    "name": ParagraphStyle("name", fontName="Helvetica-Bold", fontSize=25, leading=30, spaceAfter=5),
    "heading": ParagraphStyle("heading", fontName="Helvetica-Bold", fontSize=11, leading=16, spaceBefore=12, spaceAfter=7, textColor=colors.HexColor("#111827")),
    "company": ParagraphStyle("company", fontName="Helvetica-Bold", fontSize=11, leading=14),
    "date": ParagraphStyle("date", fontName="Helvetica", fontSize=9, leading=14, alignment=TA_RIGHT, textColor=GRAY),
    "role": ParagraphStyle("role", fontName="Helvetica-Bold", fontSize=9.5, leading=12.5, textColor=BLUE, spaceAfter=5),
    "bullet": ParagraphStyle("bullet", fontName="Helvetica", fontSize=9.5, leading=12.5, leftIndent=11, firstLineIndent=-9, spaceAfter=4, textColor=colors.HexColor("#26313e")),
}


def p(text, style="body"):
    return Paragraph(text, styles[style])


def text(value):
    return escape(value)


def section(title):
    return p(title.upper(), "heading")


def job(entry):
    heading = Table([[p(text(entry["company"]), "company"), p(text(entry["period"]), "date")]], colWidths=[315, 180])
    heading.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 0), ("BOTTOMPADDING", (0, 0), (-1, -1), 2)]))
    bullets = [p("- " + text(line.rstrip(".") + "."), "bullet") for line in entry["highlights"]]
    return [KeepTogether([heading, p(text(entry["position"]), "role"), bullets[0]]), *bullets[1:], Spacer(1, 8)]


def footer(canvas, doc):
    canvas.setStrokeColor(colors.HexColor("#d6dde5"))
    canvas.line(50, 39, A4[0] - 50, 39)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(GRAY)
    canvas.drawString(50, 25, "TRAN VAN HOA | Senior Unity Developer & Technical Lead")
    canvas.drawRightString(A4[0] - 50, 25, str(doc.page))


story = [p("TRAN VAN HOA", "name"), p("Senior Unity Developer &amp; Technical Lead · 8+ Years · Mobile · WebGL · GameFi · AI Automation", "small"), Spacer(1, 7), p('Ha Noi, Vietnam (UTC+7) · <a href="mailto:hoatv.mad@gmail.com" color="#1764b1">hoatv.mad@gmail.com</a> · +84 374 639 758', "small"), p('<a href="https://linkedin.com/in/hoatv" color="#1764b1">linkedin.com/in/hoatv</a> · <a href="https://github.com/hoatv2211" color="#1764b1">github.com/hoatv2211</a> · <a href="https://hoatv2211.github.io" color="#1764b1">hoatv2211.github.io</a>', "small"), section("Profile"), p(text(DATA["about"]["summary"]) + " " + text(DATA["about"]["pitch"])), section("Selected results")]
if PROFILE:
    story[1] = p(text(DATA['identity']['headline']), 'small')
    story[6] = p(text(PROFILE['summary'] or DATA['about']['summary']) + ' ' + text(DATA['about']['pitch']))
    story[4:4] = [p(text('Application: ' + PROFILE['company']) + '<br/>' + text('Target role: ' + PROFILE['role']), 'small')]
    if PROFILE['headline']:
        story.insert(5, p(text(PROFILE['headline'])))
results = ["100+ games delivered/published, including private outsource work.", "Primary developer on Idle Cyber and Nekoverse, both externally funded GameFi products.", "Dalgona reached Top 1 on the World App game ranking during its launch period.", "Led and mentored teams of up to 15 developers, artists, and QA.", "Cross-platform delivery across iOS, Android, WebGL, Telegram Mini App, and World App."]
for result in results:
    story.append(p("- " + text(result), "bullet"))
story.append(section("Experience"))
for entry in DATA["experience"][:3]:
    story.extend(job(entry))
story.extend([PageBreak(), section("Experience / continued")])
for entry in DATA["experience"][3:]:
    story.extend(job(entry))
story.extend([PageBreak(), section("Selected projects")])
projects = [
    ("Idle Cyber (NFT)", "Unity Developer · Core Unity implementation · BEEMOB Studio · team of 10", "Built idle progression, combat, rewards, ad integration, mobile/WebGL delivery, and wallet/NFT marketplace proof-of-concept flows for a funded GameFi product.", "https://hoatv2211.github.io/?project=idleCyber"),
    ("Nekoverse", "Senior Unity Developer · Core gameplay implementation · Neko Global", "Built real-time PvE/PvP combat, elemental skill interactions, resource farming, crafting, NFT integrations, staking flows, and mobile performance improvements for a funded GameFi MMORPG.", "https://hoatv2211.github.io/?project=nekoverse"),
    ("MU: Loren Mobile / JX1 Mobile", "Senior Unity Developer · Gameplay systems", "Built MMORPG systems spanning quests, classes, monsters, events, UI flows, progression, and PvE/PvP gameplay, with mobile optimization and production delivery.", "https://hoatv2211.github.io/?project=muloren"),
    ("Dalgona - Worldchain", "Tech Dev Leader · Gameplay and World App integration · team of 15", "Built core mechanics, difficulty progression, UI, leaderboard and ranking systems, and World App integration. Reached Top 1 on the World App game ranking during launch.", "https://hoatv2211.github.io/?project=dalgona"),
]
if PROFILE and PROFILE['projectKeys']:
    # The PDF is a selected-work CV, unlike the complete HTML catalog.
    by_key = {project['detailKey']: project for project in DATA['projects']}
    projects = [(by_key[key]['title'], by_key[key].get('role', ''),
                 by_key[key].get('summary') or by_key[key].get('description', ''),
                 DATA['identity']['portfolioUrl'].rstrip('/') + '/?project=' + key)
                for key in PROFILE['projectKeys']]
for title, role, description, link in projects:
    links = f'<a href="{link}" color="#1764b1">View project detail</a>'
    if title == "MU: Loren Mobile / JX1 Mobile":
        links = f'<a href="{link}" color="#1764b1">MU: Loren detail</a> · <a href="https://hoatv2211.github.io/?project=jx1" color="#1764b1">JX1 detail</a>'
    story.append(KeepTogether([p(text(title), "company"), p(text(role), "role"), p(text(description)), p(links, "small"), Spacer(1, 10)]))
story.append(section("Core skills"))
for label, value in [
    ("Engine & languages", "Unity, C#, C++, Lua"),
    ("Platforms", "iOS, Android, WebGL, Telegram Mini App, World App"),
    ("Gameplay", "Idle, tower defense, MMORPG, casual, GameFi, multiplayer"),
    ("Monetization & analytics", "AdMob, MAX, IronSource, IAP, ASO, Firebase Analytics, AppsFlyer, GameAnalytics"),
    ("Backend & infrastructure", "Firebase, Supabase, AWS, Docker, CI/CD"),
    ("Web3", "NFT integration, staking, MetaMask, TON wallet, World App"),
    ("AI & automation", "Agentic workflows, n8n, proxy APIs, Telegram bots, internal dashboards"),
    ("Leadership & tools", "Agile/Scrum, task breakdown, mentoring, remote teams, Git, Figma, Postman, Unity Profiler, Unity Cloud Build"),
]:
    story.append(p(f"<b>{text(label)}:</b> {text(value)}"))
story.append(section("Education"))
for entry in DATA["education"]:
    story.append(p(f'<b>{text(entry["institution"])}</b><br/>{text(entry["degree"])} · {text(entry["period"])}'))

SimpleDocTemplate(str(OUT), pagesize=A4, rightMargin=50, leftMargin=50, topMargin=43, bottomMargin=53, title="Tran Van Hoa - Senior Unity Developer & Technical Lead", author="Tran Van Hoa").build(story, onFirstPage=footer, onLaterPages=footer)
print(OUT)
