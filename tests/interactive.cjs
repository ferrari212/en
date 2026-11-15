const { chromium } = require("playwright");
const AxeBuilder = require("@axe-core/playwright").default;
const assert = require("node:assert/strict");
const { mkdirSync } = require("node:fs");

const baseURL = process.env.PORTFOLIO_URL || "http://127.0.0.1:8000";
const demoURL = "https://shiplab.github.io/vesseljs/examples/Gunnerus_Complete_Example.html";

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH,
    args: ["--no-sandbox"],
  });
  try {
    mkdirSync("test-results", { recursive: true });
    for (const width of [1440, 768, 390, 320]) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await context.newPage();
      const errors = [];
      let demoRequests = 0;
      page.on("pageerror", (error) => errors.push(error.message));
      // Exercise the embed lifecycle independently of the external WebGL service.
      await page.route(demoURL, (route) => {
        demoRequests++;
        return route.fulfill({ contentType: "text/html", body: "<html lang='en'><title>Viewer fixture</title><p>3D viewer fixture</p></html>" });
      });
      await page.goto(baseURL);
      const portrait = page.locator(".hero-portrait img");
      await portrait.evaluate((image) => image.decode());
      assert.equal(await page.locator(".hero canvas").count(), 0);
      assert.equal(await page.locator(".interactive-projects canvas").count(), 1);
      assert.equal(await page.locator("#gunnerus-frame").getAttribute("src"), null);
      assert.equal(demoRequests, 0, "External viewer must stay unloaded initially");
      await page.screenshot({ path: `test-results/home-${width}.png` });
      await page.locator(".interactive-projects").scrollIntoViewIfNeeded();
      await page.locator(".animation-toggle").click();
      assert.equal(await page.locator("canvas").getAttribute("data-running"), "false");
      await page.locator(".demo-load").focus();
      await page.keyboard.press("Enter");
      await page.frameLocator("#gunnerus-frame").getByText("3D viewer fixture").waitFor();
      assert.equal(demoRequests, 1);
      assert(await page.locator("#gunnerus-frame").isVisible());
      await page.locator(".demo-close").click();
      assert.equal(await page.locator("#gunnerus-frame").getAttribute("src"), null);
      assert(await page.locator(".demo-load").evaluate((button) => button === document.activeElement));
      await page.locator(".demo-load").click();
      await page.frameLocator("#gunnerus-frame").getByText("3D viewer fixture").waitFor();
      assert.equal(demoRequests, 2, "Viewer can reopen after unloading");
      await page.locator(".demo-close").click();
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      const audit = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      assert.deepEqual(audit.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })), []);
      assert.deepEqual(errors, []);
      await page.screenshot({ path: `test-results/examples-${width}.png` });
      await context.close();
      console.log(`${width}px: portrait, vortex, deferred viewer, keyboard loading, close/reopen, layout and accessibility PASS`);
    }
    const page = await browser.newPage({ javaScriptEnabled: false });
    await page.goto(baseURL);
    assert(await page.locator("noscript a").isVisible());
    assert.equal(await page.locator("noscript a").getAttribute("href"), demoURL);
    assert(await page.locator(".demo-load").isHidden());
    console.log("No-JavaScript example link PASS");
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
