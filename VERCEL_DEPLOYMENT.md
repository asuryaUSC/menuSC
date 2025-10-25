# Vercel Deployment Guide

## Environment Variables Setup

Your app requires Supabase environment variables to work. Add these in Vercel:

### Steps:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://iozwqlxririkmbncmpnq.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview, Development |
| `SUPABASE_URL` | `https://iozwqlxririkmbncmpnq.supabase.co` | Production, Preview, Development |
| `SUPABASE_SERVICE_KEY` | Your Supabase service role key | Production, Preview, Development |
| `SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview, Development |

### Important Notes:

- **Frontend variables** (`NEXT_PUBLIC_*`): Required for the app to fetch menu data
- **Backend variables**: Required if you want to run scraper via Vercel Functions (optional)
- All variables should be added to **Production**, **Preview**, and **Development** environments

## Build Settings

Your build should use these settings (should be auto-detected):

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node Version**: 18.x or higher

## Deployment Process

### First Deployment:

1. Connect your GitHub repository to Vercel
2. Add environment variables (see above)
3. Deploy!

### Subsequent Deployments:

1. Push to `main` branch
2. Vercel automatically builds and deploys
3. PWA update notification appears for existing users

## Troubleshooting Build Errors

### Common Issues:

#### 1. "Missing NEXT_PUBLIC_SUPABASE_URL"
**Solution**: Add the environment variables in Vercel settings

#### 2. "Module not found" errors
**Solution**: Make sure all dependencies are in `package.json` and run `npm install` locally first

#### 3. Type errors during build
**Solution**: Run `npm run build` locally to catch TypeScript errors before deploying

#### 4. PWA service worker issues
**Solution**: PWA is disabled in development mode, only builds in production

## Verifying Deployment

After deployment:

1. Visit your Vercel URL
2. Check browser console for errors
3. Verify menu data loads (check Network tab)
4. Install PWA on mobile device to test

## GitHub Actions + Vercel

Your GitHub Actions scraper runs independently from Vercel:

- **GitHub Actions**: Runs hourly to scrape menus → uploads to Supabase
- **Vercel**: Hosts the frontend → fetches from Supabase

Both need Supabase credentials, but stored separately:
- **GitHub**: Repository Secrets
- **Vercel**: Environment Variables

## Custom Domain (Optional)

To add a custom domain:

1. Go to Vercel project → **Settings** → **Domains**
2. Add your domain (e.g., `menusc.org`)
3. Follow DNS configuration instructions
4. Update manifest.json `start_url` if needed

## Production Checklist

Before going live:

- [ ] All environment variables added to Vercel
- [ ] GitHub Actions secrets configured
- [ ] Test deployment works (menus load)
- [ ] PWA installs correctly on mobile
- [ ] Service worker caching works (test offline)
- [ ] Scraper is running (check Supabase Storage)

## Support

If you encounter issues:

1. Check Vercel build logs for specific errors
2. Verify environment variables are set correctly
3. Test locally with `npm run build && npm start`
4. Check Supabase Storage has menu JSON files
