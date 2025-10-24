#!/usr/bin/env node
/**
 * Daily USC Dining Menu Upload Script - Supabase Storage Version
 */

import { chromium } from "playwright";
import { parseUSCMenu } from "./scraperParser.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { supabaseStorage } from "../lib/supabase.js";
import { MenuData } from "../lib/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = "https://hospitality.usc.edu/dining-hall-menus/";

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

// Generate filename for menu data
function getMenuFileName(date: string): string {
  return `menu-${date}.json`;
}

// Clean up old menu files (keep only today + next 3 days = 4 files max)
async function cleanupOldFiles(): Promise<void> {
  console.log("🧹 Cleaning up old menu files...");
  const result = await supabaseStorage.cleanupOldFiles(4);
  
  if (result.success) {
    if (result.deletedCount > 0) {
      console.log(`🧹 Deleted ${result.deletedCount} old menu file(s)`);
    } else {
      console.log("🧹 No old menu files found to delete");
    }
  } else {
    console.error("❌ Failed to cleanup old files:", result.error);
  }
}

// Define dining halls with their button selectors
const DINING_HALLS = [
  { name: "Everybody's Kitchen", value: "evk" },
  { name: "Parkside", value: "parkside" },
  { name: "USC Village", value: "university-village" }
];

// Helper to merge menu data from multiple dining halls
function mergeMenuData(existingMenu: MenuData, newMenu: MenuData): MenuData {
  const merged: MenuData = {
    date: existingMenu.date,
    breakfast: [...(existingMenu.breakfast || []), ...(newMenu.breakfast || [])],
    brunch: [...(existingMenu.brunch || []), ...(newMenu.brunch || [])],
    lunch: [...(existingMenu.lunch || []), ...(newMenu.lunch || [])],
    dinner: [...(existingMenu.dinner || []), ...(newMenu.dinner || [])]
  };
  return merged;
}

async function main(): Promise<void> {
  console.log("🔍 Starting multi-day menu upload to Supabase Storage");

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Clean up old files first
    await cleanupOldFiles();

    const dates = getDateRange();
    console.log(`📅 Processing ${dates.length} days of menus`);

    for (const date of dates) {
      const isoDate = date.toISOString().split("T")[0];
      const urlDate = formatDateForURL(date);
      const fileName = getMenuFileName(isoDate);
      
      console.log(`🌐 Fetching menus for ${urlDate}...`);
      
      let combinedMenuData: MenuData = {
        date: isoDate,
        breakfast: [],
        brunch: [],
        lunch: [],
        dinner: []
      };

      for (const hall of DINING_HALLS) {
        console.log(`  📍 Processing ${hall.name}...`);
        
        try {
          // Navigate to the base URL
          const url = date === dates[0] ? BASE_URL : `${BASE_URL}?menu_date=${urlDate}`;
          await page.goto(url, { timeout: 60000 });
          await page.waitForTimeout(3000);

          // Click the dining hall button to switch to this hall
          const hallButton = await page.waitForSelector(`button[data-value="${hall.value}"]`, { timeout: 10000 });
          if (hallButton) {
            await hallButton.click();
            await page.waitForTimeout(2000); // Wait for content to load
          } else {
            console.log(`⚠️ Could not find button for ${hall.name}, trying to continue...`);
          }

          const html = await page.content();
          const hallMenuData = parseUSCMenu(html, hall.name);
          
          // Check if we got any data for this hall
          const hasData = hallMenuData.breakfast?.length || hallMenuData.brunch?.length || 
                         hallMenuData.lunch?.length || hallMenuData.dinner?.length;
          
          if (hasData) {
            combinedMenuData = mergeMenuData(combinedMenuData, hallMenuData);
            console.log(`  ✅ Successfully scraped ${hall.name}`);
          } else {
            console.log(`  ⚠️ No menu data found for ${hall.name} on ${urlDate}`);
          }
        } catch (hallError) {
          console.error(`  ❌ Error scraping ${hall.name}:`, hallError);
          // Continue with other halls even if one fails
        }
      }

      // Check if we have any menu data at all
      const totalHasData = combinedMenuData.breakfast?.length || combinedMenuData.brunch?.length || 
                          combinedMenuData.lunch?.length || combinedMenuData.dinner?.length;

      if (totalHasData) {
        console.log(`📦 Uploading menu file: ${fileName}`);
        const uploadResult = await supabaseStorage.uploadMenuFile(fileName, combinedMenuData);
        
        if (uploadResult.success) {
          console.log(`✅ Successfully uploaded ${fileName}`);
        } else {
          console.error(`❌ Failed to upload ${fileName}:`, uploadResult.error);
        }
      } else {
        console.log(`⚠️ No menu data found for any dining hall on ${isoDate}`);
      }
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
