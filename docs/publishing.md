# Writing and publishing

The website is plain HTML, CSS, and JavaScript. Python converts author-owned
Markdown into static pages before publication. Node is used only for browser
checks, not to run the website. No account, database, or content server is needed.

## Set up once

Use Python 3.11+ (TOML support is built in):

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
```

On Windows, use `.venv\Scripts\python` instead of `.venv/bin/python`.

## Start a draft

```sh
.venv/bin/python scripts/new_post.py a-stable-url "Your actual article title"
```

Edit `content/posts/a-stable-url.md`. The filename becomes `/blog/a-stable-url/`;
keep it unchanged after publication so shared links continue working. The helper
creates metadata and an empty draft, not an automatically written article.

Metadata format (replace all example content with your own):

```toml
+++
title = "Your article title"
date = 2026-11-01
summary = "An accurate one- or two-sentence description of the article."
tags = ["Scientific computing", "Simulation"]
projects = ["ship-manoeuvring"]
draft = true
+++
```

Use `projects = []` if unrelated to existing projects. The generator validates
project slugs and creates links in both directions. Titles, dates, summaries,
and tags appear in the blog index; the three newest published posts automatically
appear on the homepage. Topic filters work with a keyboard. Without JavaScript,
all posts remain visible.

Drafts and future-dated posts are excluded from normal builds, RSS, and the
sitemap. **Draft is a visibility control, not confidentiality:** source committed
to a public Git repository is still public. Keep confidential research out of
this repository entirely.

## Write technical content

Use standard Markdown for headings, links, lists, tables, and fenced code blocks.
Specify a language after the opening fence, for example `python` or `javascript`,
for build-time syntax highlighting. Code does not run in the reader's browser.

Inline LaTeX uses `$...$`; display equations use `$$...$$` on separate lines.
The build converts equations to native MathML, so no CDN or JavaScript math
renderer is required. Supported syntax is defined by the pinned `latex2mathml`
package. Keep equations outside code fences.

Images can use Markdown with meaningful alt text. For figures and captions, use
HTML inside Markdown:

```html
<figure>
  <img src="/images/optimized/your-actual-output.webp"
       width="1000" height="600" loading="lazy"
       alt="Describe what this plot shows, including the relevant trend">
  <figcaption>Explain the result and credit any external source.</figcaption>
</figure>
```

Store public post images under `images/optimized/`, which is copied into the
publication output. Prefer compressed WebP and provide dimensions to avoid
layout shifts. Link to project pages using `/projects/project-slug/`.

## Preview locally

```sh
.venv/bin/python scripts/build.py --drafts --output _site
python3 -m http.server 8000 --bind 127.0.0.1 --directory _site
```

Open localhost port 8000 in your local browser. Re-run the build after edits.
The preview has draft warnings and noindex metadata. It does not publish anything.
The builder refuses to include drafts in the tracked root output.

## Publish

1. Finish and check the article. Set `draft = false` and use the real publication
   date. A future date stays unpublished until a build on or after that date.
2. Run `.venv/bin/python scripts/build.py` to refresh the tracked HTML for review.
3. Run `.venv/bin/python -m unittest discover -s tests -p 'test_*.py'`.
4. Run a clean public build with `--output _site`, serve it, and run `npm test`
   after installing test tools with `npm ci` and `npx playwright install chromium`.
5. Commit the Markdown, any public images, and generated changes. Push the feature
   branch, review it, and merge into the production branch when ready.

The included GitHub Actions workflow builds and checks the site on pull requests
and deploys **only the generated `_site` artifact** after pushes to `master`.
Select **GitHub Actions** as the repository's Pages source before using it.
It preserves the `shiptodata.com` canonical domain. Domain/DNS and Pages settings
are managed in GitHub; this change does not modify them or deploy this branch.
Do not publish the complete source checkout as an artifact: it includes templates,
author documentation, and draft sources. GitHub's Pages deployment must use the
workflow's `_site` artifact. A different static host should also use `_site` as
its publication directory.

A push or merge does not schedule future-dated posts by itself. Re-run the build
workflow on or after the date, or publish with a current date.

## Update projects and publications

Edit `content/projects/<slug>.md` for the case study and the matching `.json`
for summary, contribution, methods/tags, image, and external links. The project
order is curated in `scripts/build.py`. Never invent project responsibility or
validation results. Publication rows live in `content/publications.json`.

The public CV download currently remains the pre-existing `Felipe_CV.pdf`. The
uploaded CV informed the biography and publications, but includes a home address;
replace the public file with an approved, publication-ready copy before updating
that download. The source upload is not included in the build artifact.
