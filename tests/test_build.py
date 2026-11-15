"""Exercise publishing behavior without creating any real public posts."""
from contextlib import redirect_stdout
from html.parser import HTMLParser
import io
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import build


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.ids = set()
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.add(attrs['id'])
        for key in ['href', 'src']:
            if key in attrs:
                self.links.append(attrs[key])


class BuildTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.posts = self.root/'posts'
        self.posts.mkdir()
        self.output = self.root/'public'

    def post(self, slug='fixture-note', draft=False, date='2020-01-02', summary='A test-only technical note.', related='ship-manoeuvring'):
        path = self.posts/(slug+'.md')
        path.write_text(f'''+++
title = "Test-only note & methods"
date = {date}
summary = "{summary}"
tags = ["Simulation", "Python"]
projects = ["{related}"]
draft = {str(draft).lower()}
+++

## Numerical example

Inline $x^2$ and a display equation:

$$
y = a \\cosh(x/a)
$$

```python
print("$not_math$")
```

<figure><img src="/images/optimized/man.webp" alt="An existing vessel simulation"><figcaption>Test figure only.</figcaption></figure>

| Input | Unit |
| --- | --- |
| Length | m |
''')
        return path

    def generate(self, drafts=False):
        return build.build(self.output, self.posts, drafts)

    def test_public_site_has_no_fabricated_posts_and_valid_internal_links(self):
        files = self.generate()
        self.assertIn('No posts published yet.', files['blog/index.html'])
        self.assertNotIn('RECENT WRITING', files['index.html'])
        parsed = {}
        for name, body in files.items():
            if name.endswith('.html'):
                parser = Links(); parser.feed(body); parsed[name] = parser
        for name, page in parsed.items():
            for url in page.links:
                parts = urlsplit(url)
                if parts.scheme or parts.netloc:
                    continue
                path = unquote(parts.path)
                target = path.lstrip('/') if path else name
                if path.endswith('/'):
                    target += 'index.html'
                self.assertTrue((self.output/target).exists(), (name, url))
                if parts.fragment:
                    self.assertIn(unquote(parts.fragment), parsed[target].ids, (name,url))
        self.assertFalse((self.output/'content').exists())
        self.assertFalse((self.output/'templates').exists())
        self.assertEqual((self.output/'CNAME').read_text().strip(), 'shiptodata.com')
        ET.fromstring(files['feed.xml'])
        ET.fromstring(files['sitemap.xml'])

    def test_published_post_equations_code_figures_feed_and_related_work(self):
        self.post()
        files = self.generate()
        article = files['blog/fixture-note/index.html']
        self.assertIn('<math', article)
        self.assertIn('display="block"', article)
        self.assertIn('$not_math$', article)
        self.assertIn('codehilite', article)
        self.assertIn('<figcaption>', article)
        self.assertIn('<table>', article)
        self.assertIn('RECENT WRITING', files['index.html'])
        self.assertIn('data-tag="Simulation"', files['blog/index.html'])
        self.assertIn('/projects/ship-manoeuvring/', article)
        self.assertIn('/blog/fixture-note/', files['projects/ship-manoeuvring/index.html'])
        self.assertIn('https://shiptodata.com/blog/fixture-note/', article)
        self.assertIn('article:published_time', article)
        self.assertEqual(len(ET.fromstring(files['feed.xml']).findall('./channel/item')),1)
        self.assertIn('/blog/fixture-note/', files['sitemap.xml'])

    def test_draft_and_future_posts_are_excluded_then_removed_on_unpublishing(self):
        path = self.post()
        self.generate()
        self.assertTrue((self.output/'blog/fixture-note/index.html').exists())
        path.write_text(path.read_text().replace('draft = false','draft = true'))
        self.post('future-note', date='2999-01-01')
        files = self.generate()
        self.assertNotIn('fixture-note', files['blog/index.html'])
        self.assertNotIn('future-note', files['feed.xml'])
        self.assertFalse((self.output/'blog/fixture-note/index.html').exists())
        files = self.generate(drafts=True)
        self.assertIn('Draft preview', files['blog/fixture-note/index.html'])
        self.assertIn('noindex,nofollow', files['blog/fixture-note/index.html'])
        self.assertNotIn('<item>', files['feed.xml'])

    def test_unknown_related_project_is_rejected(self):
        self.post(related='unverified-project')
        with self.assertRaisesRegex(ValueError, 'existing project slugs'):
            self.generate()

    def test_empty_public_summary_is_rejected(self):
        self.post(summary='')
        with self.assertRaisesRegex(ValueError, 'nonempty'):
            self.generate()

    def test_drafts_cannot_overwrite_tracked_public_pages(self):
        result = subprocess.run([sys.executable,str(ROOT/'scripts/build.py'),'--drafts'],capture_output=True,text=True)
        self.assertNotEqual(result.returncode,0)
        self.assertIn('separate --output', result.stderr)

    def test_generated_output_is_repeatable(self):
        first = self.generate()
        second = self.generate()
        self.assertEqual(first, second)


if __name__ == '__main__':
    unittest.main()
