#!/usr/bin/env node
/**
 * Daily USC Dining Menu Upload Script
 *
 * Run daily at 12:05 AM via cron:
 * 5 0 * * * cd /path/to/project && /usr/local/bin/npm run upload-daily-menu >> cron.log 2>&1
 */

import { chromium } from "playwright";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { parseUSCMenu } from "./scraperParser.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = "https://hospitality.usc.edu/residential-dining-menus/";

// Helper to format date for URL parameter
function formatDateForURL(date: Date): string {
  return date
    .toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    .replace(/,/g, "");
}

// Helper to get array of dates (today + next 3 days)
function getDateRange(): Date[] {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 4; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }
  return dates;
}

async function main() {
  console.log("🔍 Starting multi-day menu upload");

  if (getApps().length === 0) {
    const keyPath = join(__dirname, "serviceAccountKey.json");
    console.log("🪪 Using Firebase key:", keyPath);
    initializeApp({ credential: cert(keyPath) });
  }

  const db = getFirestore();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    const dates = getDateRange();
    console.log(`📅 Processing ${dates.length} days of menus`);

    for (const date of dates) {
      const isoDate = date.toISOString().split("T")[0];
      const urlDate = formatDateForURL(date);
      const url =
        date === dates[0] ? BASE_URL : `${BASE_URL}?menu_date=${urlDate}`;

      console.log(`🌐 Fetching menu for ${urlDate}...`);
      await page.goto(url, { timeout: 60000 });
      await page.waitForTimeout(5000);

      const html = await page.content();
      const menuData = parseUSCMenu(html);

      // Update the date in the menu data to match the target date
      menuData.date = isoDate;

      console.log(`📦 Parsed menu for ${isoDate}`);
      await db.collection("menus").doc(isoDate).set(menuData);
      console.log(`✅ Uploaded menu for ${isoDate}`);
    }
  } catch (err) {
    console.error("❌ Upload failed:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main()
  .then(() => console.log("✅ Done!"))
  .catch((err) => {
    console.error("❌ Fatal error:", err);
    process.exit(1);
  });
