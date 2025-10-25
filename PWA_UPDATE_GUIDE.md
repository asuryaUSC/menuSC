# PWA Update Guide

This guide explains how the MenuSC PWA update system works and how to deploy updates to users who have already installed the app.

## How PWA Updates Work

### Automatic Update System

The app is configured to automatically detect and prompt users for updates:

1. **Service Worker Configuration** (`next.config.ts`):
   - `skipWaiting: true` - New service worker activates immediately
   - `NetworkFirst` strategy for Supabase menu data (always fresh)
   - Checks for updates every 60 seconds when app is active

2. **Version Tracking** (`public/manifest.json`):
   - Current version: `2.0.0`
   - Increment this version with each major release

3. **Update Notification** (`components/PWAUpdatePrompt.tsx`):
   - Shows a user-friendly prompt when updates are available
   - "Update Now" button to apply changes immediately
   - "Later" button to dismiss and update on next visit

## How to Deploy an Update

### Step 1: Increment Version
Edit `public/manifest.json` and bump the version:
```json
{
  "version": "2.1.0"  // Increment from 2.0.0
}
```

### Step 2: Build the App
```bash
npm run build
```

### Step 3: Deploy to Production
Deploy to your hosting platform (Vercel, Netlify, etc.):
```bash
# Example for Vercel
vercel --prod

# Or push to main branch if you have auto-deploy configured
git push origin main
```

### Step 4: Users Get Updated Automatically

**What happens for existing users:**

1. User opens the installed PWA app
2. Service worker detects new version within 60 seconds
3. Red update banner appears at bottom of screen
4. User clicks "Update Now"
5. App reloads with new version
6. New Supabase integration works immediately!

## Update Behavior

### For Users with Installed PWA:
- ✅ Auto-detects updates when app is opened
- ✅ Shows update prompt immediately
- ✅ Updates in background without manual reinstall
- ✅ Preserves app installation (stays on home screen)

### For Web Browser Users:
- ✅ Get updates on next page refresh (no prompt needed)
- ✅ Can install PWA from updated version

## Cache Strategy

### Menu Data (Supabase):
- **Strategy**: NetworkFirst
- **Cache Duration**: 1 hour
- **Why**: Always fetches fresh menus, falls back to cache if offline

### Images:
- **Strategy**: CacheFirst
- **Cache Duration**: 30 days
- **Why**: Static assets rarely change

### Fonts:
- **Strategy**: CacheFirst
- **Cache Duration**: 30 days
- **Why**: Static assets rarely change

## Testing the Update System

### Local Testing:

1. Build and run production build:
```bash
npm run build
npm start
```

2. Open app in browser (http://localhost:3000)

3. Install PWA (if testing on mobile)

4. Make a change to the code

5. Rebuild:
```bash
npm run build
```

6. Restart the server

7. Refresh the PWA - update prompt should appear!

### Production Testing:

1. Deploy current version
2. Install PWA on your device
3. Make updates and deploy new version
4. Open installed PWA
5. Update prompt should appear within 60 seconds

## Forcing Immediate Update

If you need users to update immediately (critical bug fix):

1. Increment the version in `manifest.json`
2. The service worker will detect the change
3. Update prompt appears automatically
4. No user action needed beyond clicking "Update Now"

## Version History

- **v2.0.0** - Migration from Firebase to Supabase
  - New Supabase Storage integration
  - Automated GitHub Actions scraper
  - Improved caching strategy
  - Update notification system

## Troubleshooting

### Update Not Appearing?

1. Check browser console for service worker errors
2. Verify `manifest.json` version was incremented
3. Clear service worker cache:
   - Chrome: DevTools > Application > Service Workers > Unregister
   - Safari: Preferences > Advanced > Show Develop menu > Empty Caches

### Users Still Seeing Old Data?

1. Verify Supabase menu files are being updated by GitHub Actions
2. Check that menu files exist in Supabase Storage
3. NetworkFirst strategy should fetch fresh data automatically

## Future Updates

To deploy future updates, simply:
1. Make your code changes
2. Increment version in `manifest.json`
3. Build and deploy
4. Users get notified automatically!
