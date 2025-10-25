# MenuSC

A fast, mobile-first PWA for viewing USC dining hall menus. Built with Next.js 15 and designed with a clean, Apple-inspired UI.

## Features

- View menus for all 3 USC dining halls (EVK, Parkside, USC Village)
- Filter by meal type (Breakfast, Lunch, Dinner, Brunch)
- Search functionality with live results
- Allergen information for all menu items
- Fully responsive and installable as a PWA
- Automated daily scraping via GitHub Actions

## Tech Stack

- **Next.js 15** - React framework with App Router
- **Supabase** - Storage for menu data
- **shadcn/ui** - UI components
- **Playwright** - Web scraping
- **Tailwind CSS** - Styling
- **next-pwa** - Progressive Web App support

## Getting Started

```bash
# Clone the repository
git clone git@github.com:asuryaUSC/menuSC.git
cd menuSC

# Install dependencies
npm install

# Set up environment variables
# Create .env.local with your Supabase credentials:
# SUPABASE_URL=your_supabase_url
# SUPABASE_SERVICE_KEY=your_service_key
# SUPABASE_ANON_KEY=your_anon_key
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Run development server
npm run dev
```

## Scraping Menus

The scraper runs automatically via GitHub Actions every hour. To run manually:

```bash
npm run scrape
```

## Project Structure

- `/app` - Next.js App Router pages
- `/components` - React components
- `/lib` - Utility functions and Supabase client
- `/scripts` - Menu scraping scripts
- `/supabase` - Supabase Edge Functions (backup scraper)

## License

MIT
