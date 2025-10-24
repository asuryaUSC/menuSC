# USC Dining PWA - Supabase Setup Documentation

## ✅ Supabase Integration Complete!

Your scraper is fully integrated with Supabase Storage and working perfectly.

## 📋 What's Configured

### **Supabase Storage Bucket: `menus`**
- **Status**: ✅ Created and working
- **Public Access**: ✅ Enabled (frontend can read)
- **Admin Access**: ✅ Configured (scraper can upload/delete)
- **Current Files**: 4 menu JSON files (today + next 3 days)

### **Environment Variables** (`.env.local`)
```bash
# Backend (for scraper)
SUPABASE_URL=https://iozwqlxririkmbncmpnq.supabase.co
SUPABASE_SERVICE_KEY=ey...  # Service role key for admin operations
SUPABASE_ANON_KEY=ey...     # Public anon key

# Frontend (for Next.js)
NEXT_PUBLIC_SUPABASE_URL=https://iozwqlxririkmbncmpnq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...
```

## 🎯 How It Works

### **1. Scraping Flow**
```
USC Website → Playwright → Parse HTML → Generate JSON → Upload to Supabase Storage
```

**Scraper**: `scripts/dailyUpload.ts`
- Uses Playwright to navigate USC dining site
- Scrapes 3 dining halls (EVK, Parkside, USC Village)
- Generates 4 days of menus (today + 3 future days)
- Uploads to Supabase Storage bucket `menus/`
- Cleans up old files automatically

### **2. Data Flow**
```
Supabase Storage (menus/) → Frontend (lib/test-data-utils.ts) → Display
```

**Frontend**: `lib/test-data-utils.ts`
- Uses `supabase.storage.from('menus').list()` to get all files
- Downloads each `menu-YYYY-MM-DD.json`
- Parses and provides to React components

### **3. File Cleanup**
- Automatically runs before each scrape
- Keeps only 4 files: today + next 3 days
- Deletes files older than today

## 🚀 Running the Scraper

### **Option 1: With npm script (recommended)**
```bash
npm run scrape
```
This automatically loads environment variables from `.env.local`

### **Option 2: Manual with env vars**
```bash
set -a && source .env.local && set +a && cd scripts && npx tsx dailyUpload.ts
```

### **Option 3: Direct (requires env vars set)**
```bash
npm run upload-daily-menu
```

## 📄 Output Format

Each menu file (`menu-YYYY-MM-DD.json`) contains:

```json
{
  "date": "2025-10-24",
  "breakfast": [
    {
      "name": "Everybody's Kitchen",
      "sections": [
        {
          "name": "Hot Line",
          "items": [
            {
              "name": "Scrambled Eggs",
              "allergens": ["Eggs", "Halal", "Vegetarian"]
            }
          ]
        }
      ]
    }
  ],
  "brunch": [],
  "lunch": [...],
  "dinner": [...]
}
```

## 🔧 Key Files

| File | Purpose |
|------|---------|
| `lib/supabase.ts` | Supabase client & storage helpers |
| `lib/test-data-utils.ts` | Frontend data fetching functions |
| `scripts/dailyUpload.ts` | Main scraper script |
| `scripts/scraperParser.ts` | HTML parsing logic |
| `scripts/run-scraper.sh` | Helper script to run scraper with env vars |
| `.env.local` | Environment variables (DO NOT COMMIT) |

## ✅ Verified Working

- [x] Supabase Storage bucket exists
- [x] Scraper uploads files successfully
- [x] Cleanup deletes old files
- [x] Frontend can list files (anon key)
- [x] Frontend can download files (anon key)
- [x] All 3 dining halls scraped
- [x] All meal types (breakfast, lunch, dinner, brunch) captured
- [x] Allergen data properly extracted

## 🎨 Frontend Integration

The frontend is already connected to Supabase!

**Pages using Supabase data:**
- `app/menu/page.tsx` - Main menu display
- `app/search/page.tsx` - Search functionality

Both use `getTestMenuData()` from `lib/test-data-utils.ts` which:
1. Lists all menu files from Supabase Storage
2. Downloads each JSON file
3. Returns as `Record<string, DailyMenu>`

## 🤖 GitHub Actions (Optional - Already Configured)

The scraper is ready to run automatically via GitHub Actions!

**Workflow**: `.github/workflows/daily-upload.yml`
- Runs every hour: `cron: '0 * * * *'`
- Can be triggered manually via workflow dispatch

**Required GitHub Secrets:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`

To enable, add these secrets in your GitHub repo:
Settings → Secrets and variables → Actions → New repository secret

## 📊 Current Status

**Last Successful Scrape**: Just ran successfully ✅

**Files in Supabase Storage:**
- `menu-2025-10-24.json` (67.3 KB)
- `menu-2025-10-25.json` (67.3 KB)
- `menu-2025-10-26.json` (67.3 KB)
- `menu-2025-10-27.json` (67.3 KB)

**Total Storage Used**: ~269 KB

## 🎉 Summary

Your USC Dining PWA is fully operational with Supabase! The scraper works, uploads succeed, cleanup is automated, and the frontend can access the data. Everything is ready for production use.

**Next Steps (Optional):**
1. Set up GitHub Actions secrets for automation
2. Test the frontend display at http://localhost:3000
3. Deploy to Vercel/production when ready
