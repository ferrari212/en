# Ship to Data · Felipe Ferrari

A light, static portfolio connecting naval and structural engineering, scientific
software, demonstrations, publications, and developing interests in applied AI.
It retains the original red/white/blue identity and the custom vortex illustration.

## Develop

Python 3.11+ is needed only to build Markdown content:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python scripts/build.py --output _site
python3 -m http.server 8000 --bind 127.0.0.1 --directory _site
```

Pages render without JavaScript; JavaScript enhances only the illustration,
legacy fragment routing, and writing filters. No external runtime CDN is required.

## Checks

```sh
.venv/bin/python -m unittest discover -s tests -p 'test_*.py'
npm ci
npx playwright install chromium
# With the generated site served on port 8000:
npm test
```

Browser checks cover 1440px, 768px, 390px, and 320px layouts, keyboard navigation,
all internal routes, image loading, CV download, reduced motion, WCAG accessibility,
and a homepage transfer budget. Override `PORTFOLIO_URL` for a different local
server, and `CHROMIUM_PATH` for an existing Chromium binary.

## Content and publishing

- [Add, preview, and publish a post](docs/publishing.md)
- [Content sources, authorship boundaries, and CV privacy](docs/content-sources.md)
- `content/projects/`: case study Markdown and metadata
- `content/publications.json`: publication table
- `content/posts/`: original writing (no fabricated launch posts)
- `templates/`: shared page layouts
- `scripts/build.py`: static generator; tracked HTML is generated, not hand-edited

The production artifact is `_site`, not the full checkout. The included Pages
workflow deploys only after a push to `master`; feature-branch pushes do not
publish the website. GitHub Pages must be configured to use GitHub Actions.
