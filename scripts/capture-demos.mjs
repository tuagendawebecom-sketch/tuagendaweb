import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.CAPTURE_BASE_URL ?? "http://localhost:3001";
const outputDir = join(process.cwd(), "public", "assets", "demos");

const demos = [
  "barberia",
  "estetica",
  "canchas",
  "medicos",
  "peluqueria",
  "unas",
  "tatuajes",
  "masajes"
];

const shots = [
  { name: "desktop", width: 1440, height: 1000, fullPage: false },
  { name: "mobile", width: 390, height: 844, fullPage: false, isMobile: true },
  { name: "cover", width: 1200, height: 750, fullPage: false }
];

if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

const browser = await chromium.launch({ headless: true });

for (const slug of demos) {
  for (const shot of shots) {
    const page = await browser.newPage({
      viewport: { width: shot.width, height: shot.height },
      isMobile: Boolean(shot.isMobile)
    });

    const url = `${baseUrl}/demos/${slug}`;
    const path = join(outputDir, `${slug}-${shot.name}.png`);

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
    await page.screenshot({ path, fullPage: shot.fullPage });
    await page.close();

    console.log(`Saved ${path}`);
  }
}

await browser.close();
