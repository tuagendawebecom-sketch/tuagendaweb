import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://localhost:3001";
const routes = [
  "/",
  "/login",
  "/panel",
  "/superadmin",
  "/demos/barberia",
  "/demos/estetica",
  "/demos/canchas",
  "/privacidad",
  "/terminos",
  "/api/health"
];
const viewports = [
  { name: "mobile-360", width: 360, height: 740 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "mobile-430", width: 430, height: 932 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 1000 }
];

const browser = await chromium.launch({ headless: true });
const issues = [];

async function expectVisible(locator, label) {
  if (!(await locator.isVisible())) {
    issues.push(`${label} is not visible`);
  }
}

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport });
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) {
      const text = message.text();
      if (!text.includes("Firebase") && !text.includes("auth/")) {
        issues.push(`${viewport.name} console ${message.type()}: ${text}`);
      }
    }
  });

  for (const route of routes) {
    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
    if (!response?.ok()) {
      issues.push(`${viewport.name} ${route} returned ${response?.status() ?? "no response"}`);
      continue;
    }

    const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
    if (hasHorizontalOverflow) {
      issues.push(`${viewport.name} ${route} has horizontal overflow`);
    }

    const bodyText = await page.locator("body").innerText().catch(() => "");
    if (/[ÃÂ]/.test(bodyText)) {
      issues.push(`${viewport.name} ${route} has mojibake text`);
    }

    if (route === "/") {
      const ctas = await page.locator('a[href*="wa.me"]').count();
      if (ctas < 3) {
        issues.push(`${viewport.name} home has too few WhatsApp CTAs`);
      }

      const pricingHref = await page.locator('nav[aria-label="Principal"] a', { hasText: "Precios" }).first().getAttribute("href").catch(() => null);
      if (viewport.name === "desktop" && pricingHref !== "#planes") {
        issues.push(`desktop Precios link points to ${pricingHref ?? "nothing"} instead of #planes`);
      }

      if (!(await page.locator("#planes").count())) {
        issues.push(`${viewport.name} home is missing #planes anchor`);
      }

      if (!(await page.locator("#comparativa").count())) {
        issues.push(`${viewport.name} home is missing #comparativa anchor`);
      }

      if ((await page.getByText(/\$10\.000\/mes|\$10\.000 \/ mes|10\.000/).count()) < 1) {
        issues.push(`${viewport.name} home is missing Agenda Full promotional price`);
      }

      if ((await page.getByText("Agenda Full").count()) < 1) {
        issues.push(`${viewport.name} home is missing Agenda Full copy`);
      }

      if (viewport.name === "desktop") {
        const solutionsTrigger = page.getByTestId("solutions-menu-trigger");
        const solutionsMenu = page.getByTestId("solutions-menu");
        await solutionsTrigger.hover();
        await expectVisible(solutionsMenu, "desktop solutions dropdown after hover");
        const firstSolution = solutionsMenu.getByRole("menuitem").first();
        await firstSolution.hover();
        await expectVisible(solutionsMenu, "desktop solutions dropdown while hovering item");

        const demosTrigger = page.getByTestId("demos-menu-trigger");
        const demosMenu = page.getByTestId("demos-menu");
        await demosTrigger.hover();
        await expectVisible(demosMenu, "desktop demos dropdown after hover");
        const firstDemo = demosMenu.getByRole("menuitem").first();
        await firstDemo.hover();
        await expectVisible(demosMenu, "desktop demos dropdown while hovering item");
      }

      if (viewport.name.startsWith("mobile")) {
        await page.getByRole("button", { name: /Abrir/i }).click();
        await expectVisible(page.locator('nav[aria-label="Mobile"]'), "mobile menu");
        await expectVisible(page.locator('nav[aria-label="Mobile"]').getByText("Soluciones").first(), "mobile solutions heading");
        await expectVisible(page.locator('nav[aria-label="Mobile"]').getByText("Demos").first(), "mobile demos heading");
        await page.keyboard.press("Escape");
      }

      const internalPhrases = ["Meta Ads", "lista para vender por Instagram", "campañas publicitarias", "tráfico frío"];
      for (const phrase of internalPhrases) {
        if (bodyText.includes(phrase)) {
          issues.push(`${viewport.name} home exposes internal wording: ${phrase}`);
        }
      }
    }
  }

  await page.close();
}

const apiPage = await browser.newPage();
const healthResponse = await apiPage.request.get(`${baseUrl}/api/health`);
if (healthResponse.status() !== 200) {
  issues.push(`/api/health returned ${healthResponse.status()} instead of 200`);
}
if (!healthResponse.headers()["cache-control"]?.includes("no-store")) {
  issues.push("/api/health is missing no-store cache header");
}
if (healthResponse.headers()["x-robots-tag"] !== "noindex") {
  issues.push("/api/health is missing noindex robots header");
}

const invalidLeadResponse = await apiPage.request.post(`${baseUrl}/api/leads`, {
  data: "not-json",
  headers: { "content-type": "text/plain" }
});
if (invalidLeadResponse.status() !== 415) {
  issues.push(`/api/leads invalid content-type returned ${invalidLeadResponse.status()} instead of 415`);
}
await apiPage.close();

await browser.close();

if (issues.length) {
  console.error(issues.join("\n"));
  process.exit(1);
}

console.log(`Smoke check OK: ${routes.length} routes x ${viewports.length} viewports`);
