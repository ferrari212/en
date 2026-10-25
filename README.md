# Felipe Ferrari's portfolio

A static portfolio built with HTML, CSS, JavaScript, Bootstrap, and a custom
canvas illustration of a vortex street. There is no application build step.

## Local development

From the repository root:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

The site loads jQuery and Bootstrap from external CDNs. Internet access is
required for those resources. The canvas starts paused when the browser requests
reduced motion; the animation button always allows an explicit choice.

## Browser regression checks

With the server running and Playwright available to Node:

```sh
node --check index.js
node tests/browser.cjs
```

Set `PORTFOLIO_URL` to test a different local server address.
The checks use Chromium at `/usr/bin/chromium` (override with `CHROMIUM_PATH`) and cover desktop and narrow phone
layouts, navigation, keyboard project tabs, animation controls and resizing,
reduced motion, image descriptions, and the CV response. They fail on runtime
errors or horizontal overflow.

In a proxied environment where Chromium does not share the system CA trust,
`PORTFOLIO_CURL_CDN=1 node tests/browser.cjs` supplies external assets through
TLS-verified curl downloads. It does not disable certificate validation. Analytics
is excluded in that mode. This is a test-only transport adaptation, not a change
to how the website serves assets.

Project summaries describe the existing demonstrations. More detailed personal
contributions and measurable outcomes should be added only after the author
confirms them.
