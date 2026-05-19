import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });

await page.goto("http://localhost:3001", { waitUntil: "domcontentloaded" });
await page.waitForSelector("video", { timeout: 15000 });

const video = page.locator("video").first();
const result = await video.evaluate((element) => ({
  src: element.getAttribute("src"),
  controls: element.controls,
  width: element.clientWidth,
  height: element.clientHeight
}));

if (result.src !== "/assets/videos/tuagendaweb-demo.mp4") {
  throw new Error(`Unexpected video src: ${result.src}`);
}

if (!result.controls || result.width < 500 || result.height < 250) {
  throw new Error(`Video embed is not rendered correctly: ${JSON.stringify(result)}`);
}

console.log(JSON.stringify(result));
await browser.close();
