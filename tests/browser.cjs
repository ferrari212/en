const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const baseURL = process.env.PORTFOLIO_URL || 'http://127.0.0.1:8000';

async function checkLayout(browser, width) {
  const page = await browser.newPage({
    viewport: { width, height: 900 },
    isMobile: width < 500,
  });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {
    if (response.url().startsWith(baseURL) && response.status() >= 400) {
      errors.push(`${response.status()} ${response.url()}`);
    }
  });

  // Optional adaptation for proxies whose CA is trusted by curl but not Chromium.
  // curl retains certificate verification; the application itself is unmodified.
  if (process.env.PORTFOLIO_CURL_CDN === '1') {
    await page.route('https://**/*', async route => {
      const url = route.request().url();
      if (url.includes('googletagmanager')) return route.abort();
      const body = execFileSync('curl', [
        '--fail', '--silent', '--show-error', '--max-time', '20', url,
      ]);
      await route.fulfill({
        body,
        contentType: url.includes('.js') ? 'application/javascript' : 'text/css',
      });
    });
  }

  await page.goto(baseURL, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('main > section').count(), 4);
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));

  const toggle = page.locator('.animation-toggle');
  await toggle.click();
  assert.equal(await toggle.textContent(), 'Play animation');
  await page.setViewportSize({ width, height: 800 });
  await toggle.click();
  assert.equal(await toggle.textContent(), 'Pause animation');

  if (width < 500) await page.locator('.navbar-toggler').click();
  await page.locator('a.nav-link[href="#section2"]').click();
  await page.waitForTimeout(1000);
  assert.equal(await page.evaluate(() => location.hash), '#section2');

  for (const tab of await page.locator('[role=tab]').all()) {
    await tab.click();
    assert.equal(await tab.getAttribute('aria-selected'), 'true');
    assert.equal(await page.locator('[role=tabpanel]:visible').count(), 1);
  }
  await page.locator('[role=tab]').first().focus();
  await page.keyboard.press('End');
  assert.equal(await page.locator('[role=tab]').last().getAttribute('aria-selected'), 'true');
  assert.equal(await page.locator('img').evaluateAll(images => images.filter(image => !image.alt).length), 0);
  await page.waitForTimeout(200);
  assert.equal(await page.evaluate(() => doAnim), false, 'Animation pauses outside the hero');

  if (width < 500) await page.locator('.navbar-toggler').click();
  await page.locator('.navbar a[href="Felipe_CV.pdf"]').click();
  assert.equal((await page.request.get(baseURL + '/Felipe_CV.pdf')).status(), 200);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(() => document.querySelector('.animation-toggle').textContent === 'Play animation');
  await page.locator('#section1').scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  assert.equal(await page.evaluate(() => doAnim), false);
  assert.deepEqual(errors, []);
  console.log(`${width}px: navigation, tabs, keyboard, resize, animation controls, reduced motion, PDF, no overflow or runtime errors PASS`);
  await page.close();
}

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
    args: ['--no-sandbox'],
  });
  try {
    for (const width of [1440, 390, 320]) await checkLayout(browser, width);
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
