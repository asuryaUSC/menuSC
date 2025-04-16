#!/usr/bin/env node
/**
 * Daily USC Dining Menu Upload Script
 * 
 * Run daily at 12:05 AM via cron:
 * 5 0 * * * cd /path/to/project && /usr/local/bin/npm run upload-daily-menu >> cron.log 2>&1
 */

import { chromium } from 'playwright';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { parseUSCMenu } from './scraperParser.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const URL = 'https://hospitality.usc.edu/residential-dining-menus/';

async function main() {
  console.log("🔍 Starting daily upload");

  if (getApps().length === 0) {
    const keyPath = join(__dirname, 'serviceAccountKey.json');
    console.log("🪪 Using Firebase key:", keyPath);
    initializeApp({ credential: cert(keyPath) });
  }

  const db = getFirestore();

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log("🌐 Visiting USC dining site...");
    await page.goto(URL, { timeout: 60000 });
    await page.waitForTimeout(5000);

    const html = await page.content();
    const menuData = parseUSCMenu(html);
    console.log("📦 Parsed:", JSON.stringify(menuData, null, 2));

    const today = new Date().toISOString().split("T")[0];
    await db.collection("menus").doc(today).set(menuData);
    console.log("✅ Uploaded menu for", today);
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