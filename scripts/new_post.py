#!/usr/bin/env python3
"""Create an unpublished Markdown draft without overwriting existing work."""
from datetime import date
import json
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
if len(sys.argv) < 3 or not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', sys.argv[1]):
    raise SystemExit('Usage: python scripts/new_post.py stable-post-slug "Post title"')
path = ROOT / 'content/posts' / (sys.argv[1] + '.md')
path.parent.mkdir(exist_ok=True)
with path.open('x') as file:
    file.write(f'''+++
title = {json.dumps(sys.argv[2])}
date = {date.today().isoformat()}
summary = ""
tags = []
projects = []
draft = true
+++

''')
print(f'Created draft {path.relative_to(ROOT)}. Add your original writing before publishing.')
