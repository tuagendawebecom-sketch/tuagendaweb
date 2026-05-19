import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://localhost:3001";
const viewports = [360, 390, 430, 768, 1024, 1440];

async function expectVisible(locator, label) {
  await locator.waitFor({ state: "visible", timeout: 10000 }).catch((error) => {
    throw new Error(`Expected visible: ${label}. ${error.message}`);
  });
}

async function checkWhatsApp(page) {
  const links = page.locator("a[href*='wa.me/5493810000000']");
  const count = await links.count();
  if (count < 1) throw new Error("No WhatsApp links found");
  const href = await links.first().getAttribute("href");
  if (!href?.includes("text=")) throw new Error("WhatsApp link has no prefilled text");
}

async function checkNoHorizontalOverflow(page, label) {
  const metrics = await page.evaluate(() => ({
    body: document.body.scrollWidth,
    doc: document.documentElement.scrollWidth,
    viewport: window.innerWidth
  }));
  const overflow = Math.max(metrics.body, metrics.doc) - metrics.viewport;
  if (overflow > 2) throw new Error(`${label} has horizontal overflow: ${JSON.stringify(metrics)}`);
}

function watchConsole(page, label, errors) {
  page.on("console", (message) => {
    const text = message.text();
    if (message.type() === "error" && /hydration|hydrated|didn't match|Minified React error/i.test(text)) {
      errors.push(`${label}: ${text}`);
    }
  });
  page.on("pageerror", (error) => {
    errors.push(`${label}: ${error.message}`);
  });
}

const browser = await chromium.launch({ headless: true });
const errors = [];

for (const width of viewports) {
  const page = await browser.newPage({ viewport: { width, height: width < 768 ? 920 : 1100 }, isMobile: width < 768 });
  page.setDefaultNavigationTimeout(60000);
  watchConsole(page, `home-${width}`, errors);
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  await expectVisible(page.getByRole("heading", { name: "Tu negocio con agenda propia, sin vueltas." }), `home hero ${width}`);
  await expectVisible(page.getByText("Desde $100.000", { exact: true }).first(), `home price ${width}`);
  await expectVisible(page.getByText("Captura desktop pendiente").first(), `desktop placeholder ${width}`);
  await expectVisible(page.locator("a[href^='/demos/']").filter({ hasText: "Ver demo" }).first(), `carousel link ${width}`);
  await checkWhatsApp(page);
  await checkNoHorizontalOverflow(page, `home-${width}`);

  if (width >= 1024) {
    await page.getByRole("button", { name: "Demos" }).hover();
    await expectVisible(page.locator("a[href='/demos/barberia']").first(), `desktop dropdown ${width}`);
  } else {
    await expectVisible(page.locator("button[aria-label='Abrir menú']"), `mobile menu button ${width}`);
    await page.locator("button[aria-label='Abrir menú']").click({ force: true });
    await expectVisible(page.locator("nav[aria-label='Mobile'] a[href='/demos/estetica']").first(), `mobile demo link ${width}`);
  }

  await page.getByRole("button", { name: "Demo siguiente" }).click();
  await page.close();
}

for (const slug of ["barberia", "estetica"]) {
  for (const width of [390, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: width < 768 ? 920 : 1000 }, isMobile: width < 768 });
    page.setDefaultNavigationTimeout(60000);
    watchConsole(page, `${slug}-${width}`, errors);
    await page.goto(`${baseUrl}/demos/${slug}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);
    await expectVisible(page.getByText("Servicios de ejemplo"), `${slug} services ${width}`);
    await expectVisible(page.getByText("Captura desktop pendiente").first(), `${slug} placeholder ${width}`);
    await checkWhatsApp(page);
    await checkNoHorizontalOverflow(page, `${slug}-${width}`);
    await page.close();
  }
}

await browser.close();

if (errors.length > 0) {
  throw new Error(`Console/page errors detected:\n${errors.join("\n")}`);
}
