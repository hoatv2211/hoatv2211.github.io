#!/bin/bash
# generate-landing-page.sh - Generate a portfolio landing page from template
# Usage: ./generate-landing-page.sh [output-path]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE="$SCRIPT_DIR/templates/portfolio-landing-page.html"
OUTPUT="${1:-}"

if [ -z "$OUTPUT" ]; then
    echo "Usage: $0 <output-path>"
    echo "Example: $0 ../../docs/Share002_Chess.html"
    exit 1
fi

if [ ! -f "$TEMPLATE" ]; then
    echo "Error: Template not found at $TEMPLATE"
    exit 1
fi

cp "$TEMPLATE" "$OUTPUT"

echo "Generated: $OUTPUT"
echo ""
echo "TODO: Replace these placeholders in the generated file:"
echo "  {{PROJECT_TITLE}} - Project name (e.g., Share002 Chess Game)"
echo "  {{PROJECT_TYPE}} - Project type (e.g., Unity Game Sample)"
echo "  {{PROJECT_BADGE}} - Badge text (e.g., Unity Game Sample #002)"
echo "  {{PROJECT_DESCRIPTION}} - Project description paragraph"
echo "  {{LIVE_DEMO_URL}} - Live demo URL"
echo "  {{SOURCE_URL}} - Source code URL"
echo "  {{PORTFOLIO_URL}} - Portfolio URL"
echo "  {{FEATURES_DESCRIPTION}} - Features section description"
echo "  {{FEATURE_CARDS}} - Feature cards HTML (repeat .feature-card pattern)"
echo "  {{TECH_DESCRIPTION}} - Tech stack description"
echo "  {{TECH_CARDS}} - Tech cards HTML (repeat .tech-item pattern)"
echo "  {{INFO_DESCRIPTION}} - Project info description"
echo "  {{INFO_CARDS}} - Info cards HTML (repeat .info-card pattern)"
echo "  {{GITHUB_REPO_URL}} - GitHub repo URL"
echo "  {{REPO_NAME}} - Repository name"
echo "  {{REPO_DESCRIPTION}} - Repository description"
echo "  {{YEAR}} - Current year"
echo "  {{AUTHOR}} - Author name"
