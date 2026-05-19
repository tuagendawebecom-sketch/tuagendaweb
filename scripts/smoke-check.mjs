import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://localhost:3001";
const routes = ["/", "/login", "/panel", "/superadmin", "/agenda/victorias-estetica", "/demos/barberia"];
const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 1000 }
];

const browser = await chromium.launch({ headless: true });
const issues = [];

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
  }

  await page.close();
}

await browser.close();

if (issues.length) {
  console.error(issues.join("\n"));
  process.exit(1);
}

console.log(`Smoke check OK: ${routes.length} routes x ${viewports.length} viewports`);
