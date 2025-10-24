#!/bin/bash
# Load environment variables and run the scraper

# Load .env.local
set -a
source ../.env.local
set +a

# Run the scraper
npx tsx dailyUpload.ts
