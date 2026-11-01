const { chromium } = require("playwright");
const AxeBuilder = require("@axe-core/playwright").default;
const assert = require("node:assert/strict");
const {
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
} = require("node:fs");
const { execFileSync } = require("node:child_process");
const { tmpdir } = require("node:os");
const { join, resolve, extname } = require("node:path");
const http = require("node:http");
const baseURL = process.env.PORTFOLIO_URL || "http://127.0.0.1:8000";
const executablePath =
  process.env.CHROMIUM_PATH ||
  (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined);
const routes = [
  "/",
  "/projects/",
  "/blog/",
  "/about/",
  "/projects/vessel3d/",
  "/projects/feascript-beam/",
  "/projects/ship-manoeuvring/",
  "/projects/mooring-dynamics/",
  "/projects/gunnerus-visualization/",
  "/projects/vesseljs-tutorial/",
  "/projects/catenary-model/",
  "/projects/digital-twin-data/",
];

async function newPage(browser, options) {
  const context = await browser.newContext(options);
  return context.newPage();
}

async function audit(page, label) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  assert.deepEqual(
    results.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
    [],
    label,
  );
}

async function visit(page, url) {
  const response = await page.goto(url, { waitUntil: "networkidle" });
  assert.equal(response.status(), 200, url);
  assert.equal(await page.locator("h1").count(), 1, url);
  assert(await page.locator("link[rel=canonical]").getAttribute("href"));
  assert(
    await page.locator('meta[property="og:image"]').getAttribute("content"),
  );
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    `${url}: horizontal overflow`,
  );
}

async function mainLayouts(browser) {
  for (const width of [1440, 768, 390, 320]) {
    const page = await newPage(browser, { viewport: { width, height: 900 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      if (response.status() >= 400)
        errors.push(`${response.status()} ${response.url()}`);
    });
    await page.route("https://**/*", (route) => {
      errors.push(
        "Unexpected external runtime dependency: " + route.request().url(),
      );
      return route.abort();
    });
    for (const route of routes) {
      await visit(page, baseURL + route);
      // Exercise all actual image resources, including lazy previews below the fold.
      await page
        .locator("img")
        .evaluateAll((images) =>
          images.forEach((image) => (image.loading = "eager")),
        );
      await page.waitForFunction(() =>
        [...document.images].every(
          (image) => image.complete && image.naturalWidth > 0,
        ),
      );
      assert.equal(await page.locator("img:not([alt])").count(), 0);
      if (width === 1440 || ["/", "/about/", "/blog/"].includes(route))
        await audit(page, `${width}px ${route}`);
    }
    await visit(page, baseURL + "/");
    await page.keyboard.press("Tab");
    assert.equal(await page.locator(":focus").textContent(), "Skip to content");
    await page.keyboard.press("Enter");
    assert.equal(await page.locator(":focus").getAttribute("id"), "main");
    await page.locator(".animation-toggle").focus();
    await page.keyboard.press("Enter");
    assert.equal(
      await page.locator(".animation-toggle").textContent(),
      "Play animation",
    );
    const pausedFrame = await page
      .locator("canvas")
      .evaluate((canvas) => canvas.toDataURL());
    await page.waitForTimeout(160);
    assert.equal(
      await page.locator("canvas").evaluate((canvas) => canvas.toDataURL()),
      pausedFrame,
    );
    await page.setViewportSize({ width, height: 800 });
    await page.locator(".animation-toggle").click();
    await page.waitForTimeout(180);
    assert.equal(
      await page.locator("canvas").getAttribute("data-running"),
      "true",
    );
    await page.locator("#contact").scrollIntoViewIfNeeded();
    await page.waitForFunction(
      () => document.querySelector("canvas").dataset.running === "false",
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.locator("canvas").scrollIntoViewIfNeeded();
    await page.waitForFunction(
      () =>
        document.querySelector(".animation-toggle").textContent ===
        "Play animation",
    );
    assert.equal(
      await page.locator("canvas").getAttribute("data-running"),
      "false",
    );
    await page.locator('.site-header a[href="/projects/"]').click();
    await page
      .locator('.project-card h3 a[href="/projects/ship-manoeuvring/"]')
      .click();
    await page.waitForURL("**/projects/ship-manoeuvring/");
    assert.equal(
      await page
        .locator(".project-sidebar .button")
        .first()
        .getAttribute("href"),
      "https://shiplab.github.io/openbridge/index.html",
    );
    assert.equal(
      (await page.request.get(baseURL + "/Felipe_CV.pdf")).status(),
      200,
    );
    await page.goto(baseURL + "/#section2");
    await page.waitForURL("**/about/");
    assert.deepEqual(errors, []);
    console.log(
      `${width}px: all routes, images, keyboard, canvas pause/resume/offscreen, reduced motion, legacy links and accessibility PASS`,
    );
    await page.close();
  }
}

async function writingWorkflow(browser) {
  const temp = mkdtempSync(join(tmpdir(), "portfolio-writing-"));
  let server;
  try {
    mkdirSync(join(temp, "posts"));
    const metadata = (title, tags, draft) =>
      `+++\ntitle = "${title}"\ndate = 2020-01-02\nsummary = "A temporary browser-test fixture; never published."\ntags = ${JSON.stringify(tags)}\nprojects = ["ship-manoeuvring"]\ndraft = ${draft}\n+++\n\n## Methods\n\nInline $x^2$.\n\n$$\ny = a \\cosh(x/a)\n$$\n\n\`\`\`python\nprint("$not_math$")\n\`\`\`\n\n<figure><img src="/images/optimized/man.webp" alt="Vessel manoeuvring interface"><figcaption>Temporary test figure.</figcaption></figure>\n`;
    writeFileSync(
      join(temp, "posts/numerical-note.md"),
      metadata("Test-only numerical note", ["Simulation"], false),
    );
    writeFileSync(
      join(temp, "posts/software-note.md"),
      metadata("Test-only software note", ["Software"], false),
    );
    writeFileSync(
      join(temp, "posts/unpublished.md"),
      metadata("Unpublished test draft", ["Private draft"], true),
    );
    const python =
      process.env.PORTFOLIO_PYTHON ||
      (existsSync(".venv/bin/python") ? ".venv/bin/python" : "python3");
    execFileSync(python, [
      "scripts/build.py",
      "--posts-dir",
      join(temp, "posts"),
      "--output",
      join(temp, "public"),
    ]);
    const publicRoot = resolve(temp, "public");
    const mime = {
      ".html": "text/html",
      ".css": "text/css",
      ".js": "application/javascript",
      ".webp": "image/webp",
      ".svg": "image/svg+xml",
    };
    server = http.createServer((request, response) => {
      let path = new URL(request.url, "http://localhost").pathname;
      if (path.endsWith("/")) path += "index.html";
      const filename = resolve(publicRoot, "." + path);
      if (!filename.startsWith(publicRoot + "/") || !existsSync(filename)) {
        response.writeHead(404);
        response.end();
        return;
      }
      response.setHeader(
        "Content-Type",
        mime[extname(filename)] || "application/octet-stream",
      );
      response.end(readFileSync(filename));
    });
    await new Promise((done) => server.listen(0, "127.0.0.1", done));
    const address = `http://127.0.0.1:${server.address().port}`;
    const page = await newPage(browser, {
      viewport: { width: 390, height: 844 },
    });
    await visit(page, address + "/blog/");
    assert.equal(await page.locator(".post-card").count(), 2);
    await page.getByRole("button", { name: "Simulation", exact: true }).focus();
    await page.keyboard.press("Enter");
    assert.equal(await page.locator(".post-card:visible").count(), 1);
    assert.match(
      await page.locator("[role=status]").textContent(),
      /1 post shown/,
    );
    await page.locator(".post-card:visible h3 a").click();
    await page.waitForURL("**/blog/numerical-note/");
    assert.equal(await page.locator("math").count(), 2);
    assert.equal(await page.locator("pre").count(), 1);
    assert.equal(
      await page.locator("figcaption").textContent(),
      "Temporary test figure.",
    );
    await audit(page, "Published article: code, equations, figures, metadata");
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await page.locator(".related-note a").click();
    assert.equal(await page.locator(".related-note .post-card").count(), 2);
    assert.equal(
      (await page.request.get(address + "/blog/unpublished/")).status(),
      404,
    );
    await page.goto(address + "/");
    assert.match(await page.locator("main").textContent(), /RECENT WRITING/);
    console.log(
      "Temporary published articles: index, topic filtering, stable URLs, MathML, code, figures, related projects, recent posts and draft exclusion PASS",
    );
    await page.close();
  } finally {
    if (server) await new Promise((done) => server.close(done));
    rmSync(temp, { recursive: true, force: true });
  }
}

async function noScriptAndPerformance(browser) {
  const noJS = await newPage(browser, {
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  await visit(noJS, baseURL + "/projects/");
  await noJS
    .locator('.project-card h3 a[href="/projects/ship-manoeuvring/"]')
    .click();
  await noJS.waitForURL("**/projects/ship-manoeuvring/");
  await noJS.close();
  const page = await newPage(browser, {
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  await visit(page, baseURL + "/");
  await page
    .locator("img")
    .evaluateAll((images) =>
      images.forEach((image) => (image.loading = "eager")),
    );
  await page.waitForFunction(() =>
    [...document.images].every(
      (image) => image.complete && image.naturalWidth > 0,
    ),
  );
  assert.equal(
    await page.locator("canvas").getAttribute("data-running"),
    "false",
  );
  const metrics = await page.evaluate(() => ({
    transfer:
      performance
        .getEntriesByType("resource")
        .reduce((sum, item) => sum + item.transferSize, 0) +
      performance.getEntriesByType("navigation")[0].transferSize,
    resources: performance.getEntriesByType("resource").length,
    dom: document.querySelectorAll("*").length,
  }));
  assert(metrics.transfer < 450000, JSON.stringify(metrics));
  assert(metrics.dom < 700);
  console.log(
    "No-JavaScript navigation PASS; homepage measured transfer:",
    metrics.transfer,
    "bytes;",
    metrics.resources,
    "local resources; reduced motion at initial load PASS",
  );
  await page.close();
}

(async () => {
  const browser = await chromium.launch({
    executablePath,
    args: ["--no-sandbox"],
  });
  try {
    await mainLayouts(browser);
    await writingWorkflow(browser);
    await noScriptAndPerformance(browser);
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
