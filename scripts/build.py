#!/usr/bin/env python3
"""Generate portable static HTML from trusted, author-maintained Markdown."""
import argparse
from datetime import date, datetime, timezone
from email.utils import format_datetime
from html import escape
import json
from pathlib import Path
import re
import shutil
from string import Template
import tomllib
from urllib.parse import quote
from xml.sax.saxutils import escape as xml_escape

import markdown
from latex2mathml.converter import convert

ROOT = Path(__file__).resolve().parents[1]
BASE_URL = 'https://shiptodata.com'
PROJECT_ORDER = ['vessel3d', 'feascript-beam', 'ship-manoeuvring', 'mooring-dynamics', 'digital-twin-data', 'gunnerus-visualization', 'vesseljs-tutorial', 'catenary-model']


def e(value):
    return escape(str(value), quote=True)


def render_markdown(text):
    # Preserve code verbatim: equations are processed only outside fenced/inline code.
    pieces = re.split(r'(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]+`)', text)
    for i in range(0, len(pieces), 2):
        pieces[i] = re.sub(r'\$\$([\s\S]+?)\$\$', lambda m: '\n\n' + convert(m[1].strip(), display='block') + '\n\n', pieces[i])
        pieces[i] = re.sub(r'(?<!\\)\$([^$\n]+?)\$', lambda m: convert(m[1].strip()), pieces[i])
    return markdown.markdown(''.join(pieces), extensions=['fenced_code', 'tables', 'toc', 'codehilite'], extension_configs={'toc': {'permalink': False}, 'codehilite': {'guess_lang': False}})


def projects():
    result = []
    for slug in PROJECT_ORDER:
        meta = json.loads((ROOT / 'content/projects' / f'{slug}.json').read_text())
        assert meta['slug'] == slug
        meta['body'] = render_markdown((ROOT / 'content/projects' / f'{slug}.md').read_text())
        if meta['image']:
            name = Path(meta['image']).stem
            meta['image'] = f'/images/optimized/{name}.webp'
        result.append(meta)
    return result


def posts(content_dir, include_drafts=False):
    result = []
    for file in sorted(content_dir.glob('*.md')):
        if file.name == 'README.md':
            continue
        raw = file.read_text()
        if not raw.startswith('+++\n') or '\n+++\n' not in raw[4:]:
            raise ValueError(f'{file.name}: TOML metadata must be wrapped in +++ lines')
        head, body = raw[4:].split('\n+++\n', 1)
        meta = tomllib.loads(head)
        for key in ['title', 'date', 'summary', 'tags', 'draft']:
            if key not in meta:
                raise ValueError(f'{file.name}: missing {key}')
        if not isinstance(meta['draft'], bool) or not isinstance(meta['tags'], list):
            raise ValueError(f'{file.name}: draft must be boolean and tags must be an array')
        meta['date'] = date.fromisoformat(str(meta['date']))
        meta['slug'] = file.stem
        if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', meta['slug']):
            raise ValueError(f'{file.name}: use a lowercase hyphenated filename')
        if meta['draft'] or meta['date'] > date.today():
            if not include_drafts:
                continue
        if not all(isinstance(meta[key], str) and meta[key].strip() for key in ['title', 'summary']):
            raise ValueError(f'{file.name}: published title and summary must be nonempty strings')
        if not all(isinstance(tag, str) and tag.strip() for tag in meta['tags']):
            raise ValueError(f'{file.name}: tags must contain nonempty strings')
        meta['body'] = render_markdown(body)
        result.append(meta)
    return sorted(result, key=lambda post: (post['date'], post['slug']), reverse=True)


def tags(values):
    return '<ul class="tags" aria-label="Topics">' + ''.join(f'<li>{e(value)}</li>' for value in values) + '</ul>'


def project_card(project, number):
    image = (f'<img src="{e(project["image"])}" width="720" height="450" loading="lazy" alt="{e(project["title"])} — existing project interface">' if project['image'] else '<span class="model-preview">y = a(cosh(x/a) − 1)<small>CATENARY MODEL · JAVASCRIPT</small></span>')
    return f'''<article class="project-card"><a class="project-image" href="/projects/{project['slug']}/" tabindex="-1" aria-hidden="true">{image}<span class="project-number">{number:02}</span></a><div class="project-card-copy"><p class="eyebrow">{e(project['category'])}</p><h3><a href="/projects/{project['slug']}/">{e(project['title'])} <span aria-hidden="true">↗</span></a></h3><p>{e(project['summary'])}</p>{tags(project['tags'])}</div></article>'''


def post_card(post):
    return f'''<article class="post-card"><time datetime="{post['date'].isoformat()}">{post['date'].strftime('%d %B %Y')}</time><h3><a href="/blog/{post['slug']}/">{e(post['title'])} →</a></h3><p>{e(post['summary'])}</p>{tags(post['tags'])}</article>'''


def layout(body, title, description, path, active='', image='/images/optimized/Gunnerus_starboard_su.webp', extra_head='', article=False):
    arrow = '<svg class="external-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>'
    body = body.replace('↗', arrow)
    nav = ''.join(f'<a href="{url}"' + (' aria-current="page"' if active == key else '') + f'>{label}</a>' for key, label, url in [('home','Home','/'),('projects','Projects','/projects/'),('blog','Writing','/blog/'),('about','About','/about/')]) + '<a class="nav-contact" href="#contact">Contact ↗</a>'
    return Template((ROOT / 'templates/layout.html').read_text()).substitute(title=e(title + ' · Felipe Ferrari'), description=e(description), canonical=e(BASE_URL + path), og_type='article' if article else 'website', share_image=e(BASE_URL + image), extra_head=extra_head, navigation=nav, body=body).replace('↗', arrow).replace("  \n", "\n")


def build(output, posts_dir, include_drafts=False):
    generated = {}
    def page(path, body, title, description, active='', image='/images/optimized/Gunnerus_starboard_su.webp', extra_head='', article=False):
        filename = path.lstrip('/') + 'index.html' if path.endswith('/') else path.lstrip('/')
        html = layout(body, title, description, path, active, image or '/images/optimized/Gunnerus_starboard_su.webp', extra_head, article)
        generated[filename] = '\n'.join(line.rstrip() for line in html.splitlines()) + '\n'

    work = projects()
    writing = posts(posts_dir, include_drafts)
    known_projects = {p['slug'] for p in work}
    for post in writing:
        if not isinstance(post.get('projects', []), list) or set(post.get('projects', [])) - known_projects:
            raise ValueError(f'{post["slug"]}: projects must reference existing project slugs')
    recent = '<section class="shell section-space"><div class="section-heading"><div><p class="eyebrow">RECENT WRITING</p><h2>Notes from the work.</h2></div><a class="text-link" href="/blog/">All writing →</a></div><div class="writing-grid">' + ''.join(post_card(p) for p in writing[:3]) + '</div></section>' if writing else '''<section class="shell section-space writing-intro"><div><p class="eyebrow">TECHNICAL WRITING</p><h2>Models need explanations, too.</h2><p>A space for notes on scientific computing, engineering software, and my developing research in applied AI. No posts published yet; the existing Vessel.js tutorial is a place to start.</p><a class="text-link" href="/blog/">Explore writing & the tutorial →</a></div><a class="writing-resource" href="/projects/vesseljs-tutorial/"><span class="eyebrow">EXISTING INTERACTIVE GUIDE</span><h3>From the hull to simulation</h3><p>Follow the path from vessel data to a digital model and manoeuvrability simulation.</p><span>Read about the guide ↗</span></a></section>'''
    home = Template((ROOT / 'templates/home.html').read_text()).substitute(selected_projects=''.join(project_card(p,i+1) for i,p in enumerate(work[:3])), writing_section=recent)
    page('/', home, 'Engineering models, software & maritime data', 'Felipe Ferrari de Oliveira — naval and structural engineer building scientific software, maritime simulations, and data applications. Developing a specialization in applied AI.', 'home')
    all_work = ''.join(project_card(p,i+1) for i,p in enumerate(work))
    page('/projects/', f'''<section class="shell page-intro"><p class="eyebrow">PROJECTS & DEMONSTRATIONS</p><h1>Engineering you can<br><em>see and explore.</em></h1><p class="lede">Numerical models, interactive tools, and research from my work in maritime engineering. Individual contributions and collaborative work are identified on each project page.</p></section><section class="shell section-space compact-top" aria-label="Project collection"><div class="project-grid">{all_work}</div><aside class="related-note"><h2>More from the original portfolio</h2><p><a href="https://shiplab.github.io/vesseljs/examples/epoch.html">Offshore operations visualization ↗</a> — a collaborative ShipLab example illustrating an offshore operation for carbon dioxide storage.</p><p><a href="https://shiplab.github.io/vesseljs/">Explore the Vessel.js library ↗</a></p></aside></section>''', 'Projects', 'Explore Vessel3D, FEAScript contributions, ship manoeuvring, floating-body dynamics, Gunnerus, catenary models, and digital twin research.', 'projects')
    for project in work:
        links = ''.join(f'<a class="button {"secondary" if i else ""}" href="{e(link["url"])}">{e(link["label"])} ↗</a>' for i,link in enumerate(project['links']))
        image = f'<figure class="project-hero"><img src="{e(project["image"])}" width="1000" height="620" alt="{e(project["title"])} — project preview"><figcaption>{e(project.get("image_caption", "Existing project material from my original portfolio."))}</figcaption></figure>' if project['image'] else '<div class="model-preview detail-model">y = a(cosh(x/a) − 1)<small>STATIC CATENARY GEOMETRY · EXPLORE THE LIVE MODEL BELOW</small></div>'
        related = [post for post in writing if project['slug'] in post.get('projects', [])]
        related_html = '<section class="related-note"><h2>Related writing</h2>' + ''.join(post_card(post) for post in related) + '</section>' if related else ''
        body = f'''<section class="shell page-intro"><a class="breadcrumb" href="/projects/">← All projects</a><p class="eyebrow">{e(project['category'])}</p><h1>{e(project['title'])}</h1><p class="lede">{e(project['summary'])}</p>{tags(project['tags'])}</section><div class="shell project-detail">{image}<div class="detail-grid"><article class="prose">{project['body']}{related_html}</article><aside class="project-sidebar"><p class="eyebrow">MY CONTRIBUTION</p><p>{e(project['contribution'])}</p><h2>Explore the work</h2><div class="actions">{links}</div><p class="small">Demonstrations open on their original project websites.</p></aside></div></div>'''
        page('/projects/'+project['slug']+'/', body, project['title'], project['summary'], 'projects', project['image'])
    publications = json.loads((ROOT / 'content/publications.json').read_text())
    table = '<table><caption>Selected research publications</caption><thead><tr><th scope="col">Year</th><th scope="col">Publication & authors</th><th scope="col">Venue</th></tr></thead><tbody>' + ''.join(f'<tr><th scope="row">{p["year"]}</th><td><a href="{e(p["url"])}">{e(p["title"])} ↗</a><p class="small">{e(p["authors"])}</p></td><td>{e(p["venue"])}</td></tr>' for p in publications) + '</tbody></table>'
    about = Template((ROOT / 'templates/about.html').read_text()).substitute(publication_table=table)
    page('/about/', about, 'About & publications', 'Felipe Ferrari de Oliveira: naval and structural engineering, DNV experience, NTNU research, publications, the Wakeham Prize, and life beyond the models.', 'about', '/images/optimized/portrait.webp')
    filters = '<div class="tag-filters" role="group" aria-label="Filter writing by topic"><button type="button" aria-pressed="true" data-tag="all">All topics</button>' + ''.join(f'<button type="button" aria-pressed="false" data-tag="{e(tag)}">{e(tag)}</button>' for tag in sorted({tag for p in writing for tag in p['tags']})) + '</div>' if writing else ''
    cards = ''.join(f'<div data-post-tags="{e(json.dumps(p["tags"]))}">{post_card(p)}</div>' for p in writing)
    blog = f'''<section class="shell page-intro"><p class="eyebrow">WRITING & RESEARCH NOTES</p><h1>Working things out.<br><em>Sharing what I learn.</em></h1><p class="lede">Scientific computing, engineering software, and the developing connection between AI and physical systems.</p><p>Project explanations, technical experiments, and research progress — grounded in work I can show.</p></section><section class="shell section-space compact-top" aria-label="Blog posts">{filters}<p class="filter-status small" role="status" aria-live="polite"></p><div class="writing-grid">{cards}</div>{'' if writing else '<div class="empty-state"><span class="eyebrow">THE NOTEBOOK IS OPEN</span><h2>No posts published yet.</h2><p>In the meantime, explore my existing interactive guide to creating digital vessel models with Vessel.js.</p><a class="text-link" href="/projects/vesseljs-tutorial/">From the hull to simulation →</a></div>'}</section>'''
    page('/blog/', blog, 'Writing', 'Technical writing and research notes on scientific computing, maritime software, simulation, and learning applied AI.', 'blog', extra_head='<link rel="alternate" type="application/rss+xml" title="Ship to Data writing" href="/feed.xml">')
    for post in writing:
        related = [p for p in work if p['slug'] in post.get('projects', [])]
        related_html = '<aside class="related-note"><h2>Related projects</h2>' + ''.join(f'<p><a href="/projects/{p["slug"]}/">{e(p["title"])} →</a></p>' for p in related) + '</aside>' if related else ''
        draft = '<p class="draft-banner">Draft preview — not included in the public build.</p>' if post['draft'] or post['date'] > date.today() else ''
        page('/blog/'+post['slug']+'/', f'''<article class="shell article-shell"><header class="article-header"><a class="breadcrumb" href="/blog/">← All writing</a>{draft}<p class="eyebrow">TECHNICAL NOTE · <time datetime="{post['date']}">{post['date'].strftime('%d %B %Y')}</time></p><h1>{e(post['title'])}</h1><p class="lede">{e(post['summary'])}</p>{tags(post['tags'])}<p class="small">By Felipe Ferrari de Oliveira</p></header><div class="prose">{post['body']}{related_html}</div></article>''', post['title'], post['summary'], 'blog', post.get('image', '/images/optimized/Gunnerus_starboard_su.webp'), extra_head=f'<meta property="article:published_time" content="{post["date"]}"><meta name="author" content="Felipe Ferrari de Oliveira">' + ('<meta name="robots" content="noindex,nofollow">' if include_drafts else ''), article=True)
    page('/404.html', '<section class="shell page-intro"><p class="eyebrow">404</p><h1>That page is off course.</h1><p>The address may have changed. Find a project, browse the writing, or return to the homepage.</p><div class="actions"><a class="button" href="/">Back to home</a><a href="/projects/">Browse projects →</a></div></section>', 'Page not found', 'Find your way back to Felipe Ferrari’s portfolio.')
    generated['sitemap.xml'] = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + ''.join(f'<url><loc>{BASE_URL}/{file.removesuffix("index.html")}</loc></url>' for file in generated if file.endswith('index.html') and not (include_drafts and file.startswith('blog/'))) + '</urlset>\n'
    items = ''.join(f'<item><title>{xml_escape(p["title"])}</title><link>{BASE_URL}/blog/{p["slug"]}/</link><guid>{BASE_URL}/blog/{p["slug"]}/</guid><description>{xml_escape(p["summary"])}</description><pubDate>{format_datetime(datetime.combine(p["date"],datetime.min.time(),timezone.utc))}</pubDate></item>' for p in writing if not p['draft'] and p['date'] <= date.today())
    generated['feed.xml'] = '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Ship to Data · Felipe Ferrari</title><link>https://shiptodata.com/blog/</link><description>Engineering software, scientific computing, and applied AI.</description>' + items + '</channel></rss>\n'
    generated['robots.txt'] = 'User-agent: *\nAllow: /\nSitemap: https://shiptodata.com/sitemap.xml\n'
    generated['.nojekyll'] = ''
    output.mkdir(parents=True, exist_ok=True)
    manifest = output / '.generated-pages.json'
    previous = json.loads(manifest.read_text()) if manifest.exists() else []
    # Only delete old generated files, never an arbitrary path supplied in a manifest.
    for filename in set(previous) - set(generated):
        target = (output / filename).resolve()
        if not target.is_relative_to(output.resolve()) or target.suffix not in ['.html', '.xml', '.txt']:
            raise ValueError('Unsafe generated path')
        target.unlink(missing_ok=True)
    for filename, contents in generated.items():
        target = output / filename
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(contents)
    manifest.write_text(json.dumps(sorted(generated), indent=2)+'\n')
    if output.resolve() != ROOT:
        for filename in ['style.css', 'index.js', 'favicon.svg', 'Felipe_CV.pdf', 'CNAME']:
            shutil.copy2(ROOT / filename, output / filename)
        shutil.copytree(ROOT/'images/optimized', output/'images/optimized', dirs_exist_ok=True)
    return generated


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=ROOT)
    parser.add_argument('--posts-dir', type=Path, default=ROOT/'content/posts')
    parser.add_argument('--drafts', action='store_true', help='Include drafts locally; never publish this output')
    args = parser.parse_args()
    if args.drafts and args.output.resolve() == ROOT:
        parser.error('Draft previews require a separate --output directory')
    files = build(args.output, args.posts_dir, args.drafts)
    print(f'Generated {len(files)} files in {args.output}')
