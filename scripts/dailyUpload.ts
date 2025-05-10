#!/usr/bin/env node
/**
 * Daily USC Dining Menu Upload Script
 */

import { chromium } from "playwright";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Firestore, QueryDocumentSnapshot } from "firebase-admin/firestore";
import { parseUSCMenu } from "./scraperParser.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = "https://hospitality.usc.edu/residential-dining-menus/";

// Format date for URL query param
function formatDateForURL(date: Date): string {
  return date
    .toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    .replace(/,/g, "");
}

// Today + next 3 days
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

// Delete menu documents older than N days
async function deleteOldMenus(db: Firestore, days: number = 15): Promise<void> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const snapshot = await db.collection("menus").get();
  const batch = db.batch();
  let deleteCount = 0;

  snapshot.forEach((doc: QueryDocumentSnapshot) => {
    const docId = doc.id; // expected format: YYYY-MM-DD
    const docDate = new Date(docId);

    if (!isNaN(docDate.getTime()) && docDate < cutoff) {
      batch.delete(doc.ref);
      deleteCount++;
      console.log(`🧹 Deleting old menu: ${docId}`);
    }
  });

  if (deleteCount > 0) {
    await batch.commit();
    console.log(`🧹 Deleted ${deleteCount} old menu(s) older than ${days} days`);
  } else {
    console.log("🧹 No old menus found to delete");
  }
}

async function main(): Promise<void> {
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
    await deleteOldMenus(db, 15); // delete menus older than 15 days

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
