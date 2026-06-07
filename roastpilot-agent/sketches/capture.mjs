// Screenshot capture for the Figma Make prototypes.
// Usage: node capture.mjs dashboard | cloud
import { chromium } from "playwright-core";

const OUT = new URL("./screenshots/", import.meta.url).pathname;
const mode = process.argv[2] ?? "dashboard";

const browser = await chromium.launch({ channel: "chrome" });

async function hideToolbars(page) {
  // Dev-only switcher pills and annotation labels in the prototype: hide for clean captures.
  await page.addStyleTag({
    content: `
      div.fixed.top-6.left-6 { display: none !important; }
      div.fixed.bottom-6.right-6 { display: none !important; }
      div.absolute.bottom-6 { display: none !important; }
      div[class*="-top-3"] { display: none !important; }
      div.absolute.top-8.right-8 { display: none !important; }
    `,
  });
}

async function settle(page) {
  await page.waitForTimeout(1200);
}

// Programmatic click by button text — works even when the toolbar is CSS-hidden.
async function clickButton(page, label) {
  await page.evaluate((text) => {
    const btn = [...document.querySelectorAll("button")].find(
      (b) => b.textContent?.trim() === text,
    );
    if (!btn) throw new Error(`button not found: ${text}`);
    btn.click();
  }, label);
}

if (mode === "dashboard") {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
  await hideToolbars(page);

  // Live (normal)
  await clickButton(page, "Live Dashboard");
  await page.waitForSelector("path.recharts-line-curve", { timeout: 10000 });
  await settle(page);
  await page.screenshot({ path: OUT + "dashboard-live.png" });

  // Live + recovery modal
  await clickButton(page, "Operator Recovery");
  await settle(page);
  await page.screenshot({ path: OUT + "dashboard-recovery.png" });

  // Live + fault banner (banner pushes dashboard below the fold — capture full page)
  await clickButton(page, "Fault State");
  await settle(page);
  await page.screenshot({ path: OUT + "dashboard-fault.png", fullPage: true });
  await clickButton(page, "Normal Operation");

  // Roast detail
  await clickButton(page, "Roast Detail");
  await settle(page);
  await page.screenshot({ path: OUT + "roast-detail.png", fullPage: true });

  // Roast detail with the CLAMP decision row selected → chart highlight marker
  await page.evaluate(() => {
    const row = [...document.querySelectorAll("tr")].find((tr) =>
      tr.textContent?.includes("02:15") && tr.textContent?.includes("CLAMP"),
    );
    if (!row) throw new Error("CLAMP trace row not found");
    row.click();
  });
  await settle(page);
  await page.screenshot({ path: OUT + "roast-detail-selected.png", fullPage: true });

  // History (mock data)
  await clickButton(page, "Roast History");
  await settle(page);
  await page.screenshot({ path: OUT + "history.png", fullPage: true });

  // History (empty state)
  await clickButton(page, "Show Empty State");
  await settle(page);
  await page.screenshot({ path: OUT + "history-empty.png" });
} else {
  // Cloud taster review page — phone viewport.
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto("http://localhost:5174/", { waitUntil: "networkidle" });
  await settle(page);
  await page.screenshot({ path: OUT + "cloud-review-mobile.png", fullPage: true });
}

await browser.close();
console.log("done:", mode);
