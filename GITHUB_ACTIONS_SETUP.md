# GitHub Actions Setup Instructions

## ✅ Code Successfully Pushed!

Your code has been pushed to GitHub: https://github.com/asuryaUSC/menuSC

Commit: `9a96464` - Migrate from Firebase to Supabase and update scraper

## 🔐 Step 1: Add GitHub Secrets

You need to add **3 secrets** to your GitHub repository for the automated workflow to work.

### How to Add Secrets:

1. **Go to your GitHub repository**: https://github.com/asuryaUSC/menuSC

2. **Navigate to Settings**:
   - Click the **"Settings"** tab at the top of the repository

3. **Go to Secrets**:
   - In the left sidebar, expand **"Secrets and variables"**
   - Click **"Actions"**

4. **Add the secrets** by clicking **"New repository secret"** for each:

### Secret #1: SUPABASE_URL
```
Name: SUPABASE_URL
Value: https://iozwqlxririkmbncmpnq.supabase.co
```

### Secret #2: SUPABASE_SERVICE_KEY
```
Name: SUPABASE_SERVICE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvendxbHhyaXJpa21ibmNtcG5xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjEwMTM0MywiZXhwIjoyMDcxNjc3MzQzfQ.6omEA5-aqIf7oyJNOXhYKE6S1K-190BWtMehNpzNvDk
```

### Secret #3: SUPABASE_ANON_KEY
```
Name: SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvendxbHhyaXJpa21ibmNtcG5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMDEzNDMsImV4cCI6MjA3MTY3NzM0M30.yS8bQYa3vD9Kv8koQu0xHA_dxqUgBVqiF6QN_G0pRk4
```

---

## 🧪 Step 2: Test the Workflow Manually

After adding the secrets, test the workflow:

1. **Go to the Actions tab**: https://github.com/asuryaUSC/menuSC/actions

2. **Find the workflow**:
   - Look for **"Daily USC Menu Upload"** in the left sidebar

3. **Run it manually**:
   - Click **"Run workflow"** button (top right)
   - Select branch: **main**
   - Click the green **"Run workflow"** button

4. **Monitor the run**:
   - Wait for the workflow to start (usually 5-10 seconds)
   - Click on the running workflow to see live logs
   - It should take about 2-3 minutes to complete

5. **Check for success**:
   - ✅ Green checkmark = Success!
   - ❌ Red X = Something went wrong (check the logs)

---

## 📊 Step 3: Verify the Results

After a successful run:

1. **Check Supabase Storage**:
   - Go to your Supabase project dashboard
   - Navigate to **Storage → menus**
   - You should see 4 JSON files (menu-YYYY-MM-DD.json)

2. **Check your frontend**:
   - Visit your deployed site or run `npm run dev`
   - Navigate to the menu page
   - Menus should display with fresh data

---

## ⏰ Automated Schedule

Once the workflow runs successfully, it will automatically run:

- **Every hour** at minute 0 (e.g., 1:00 PM, 2:00 PM, 3:00 PM, etc.)
- **24 times per day**
- **365 days per year**

The workflow will:
1. Scrape all 3 dining halls
2. Generate menus for today + next 3 days
3. Upload to Supabase Storage
4. Clean up old files automatically

---

## 🔍 Monitoring

### View Workflow Runs
- Go to: https://github.com/asuryaUSC/menuSC/actions
- See all past and current workflow runs
- Click on any run to see detailed logs

### Check Logs
- Each workflow run shows:
  - Installation logs
  - Scraper output
  - Success/failure status
  - Any error messages

### Get Notifications
GitHub will automatically:
- Email you if a workflow fails
- Show badges on the Actions page

---

## 🐛 Troubleshooting

### If the workflow fails:

1. **Check the logs**:
   - Click on the failed run
   - Expand each step to see error messages

2. **Common issues**:
   - **Missing secrets**: Make sure all 3 secrets are added
   - **Wrong secret values**: Double-check you copied them correctly
   - **USC website changed**: The HTML structure may have changed
   - **Rate limiting**: Playwright may be rate-limited

3. **Manual test**:
   - Run locally: `npm run scrape`
   - If it works locally but fails on GitHub, it's likely an environment issue

4. **Re-run the workflow**:
   - Click **"Re-run all jobs"** to try again
   - Sometimes transient network issues cause failures

---

## 📝 Workflow Details

**File**: `.github/workflows/daily-upload.yml`

**Schedule**: `0 * * * *` (every hour)

**Steps**:
1. Checkout code
2. Setup Node.js 20
3. Install npm dependencies
4. Install Playwright browsers
5. Run scraper script
6. Upload results to Supabase

**Environment Variables**:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_KEY` - Admin key for uploads
- `SUPABASE_ANON_KEY` - Public key for reads

---

## ✅ Success Checklist

- [ ] All 3 secrets added to GitHub
- [ ] Manual workflow run completed successfully
- [ ] 4 menu files visible in Supabase Storage
- [ ] Frontend displays menu data correctly
- [ ] Waited for next hourly run to confirm automation

---

## 🎉 You're Done!

Once you complete all steps, your USC Dining PWA will:
- ✅ Automatically scrape menus every hour
- ✅ Keep data fresh for the next 4 days
- ✅ Clean up old data automatically
- ✅ Work 24/7 without manual intervention

**No more manual uploads needed!** 🚀
