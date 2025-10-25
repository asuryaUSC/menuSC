// USC Dining Menu Scraper Edge Function
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

// Types
interface FoodItem {
  name: string;
  allergens: string[];
}

interface MealSection {
  name: string;
  items: FoodItem[];
}

interface DiningHall {
  name: string;
  sections: MealSection[];
}

interface MenuData {
  date: string;
  breakfast?: DiningHall[];
  brunch?: DiningHall[];
  lunch?: DiningHall[];
  dinner?: DiningHall[];
}

// Constants
const API_BASE_URL = "https://hospitality.usc.edu/wp-json/hsp-api/v1/get-res-dining-menus";
const DINING_HALLS = [
  { name: "Everybody's Kitchen", value: "evk" },
  { name: "Parkside", value: "parkside" },
  { name: "USC Village", value: "university-village" }
];

// Helper function to normalize meal types from API
function normalizeMealType(mealName: string): keyof MenuData | null {
  const t = mealName.toLowerCase();
  if (t.includes("brunch")) return "brunch";
  if (t.includes("breakfast")) return "breakfast"; 
  if (t.includes("lunch")) return "lunch";
  if (t.includes("dinner")) return "dinner";
  return null;
}

// Helper function to extract allergens from API response
function extractAllergens(allergenList: string[]): string[] {
  if (!Array.isArray(allergenList)) return [];
  
  // Map USC's allergen names to our expected format
  const allergenMap: Record<string, string> = {
    'dairy': 'Dairy',
    'eggs': 'Eggs', 
    'fish': 'Fish',
    'gluten': 'Gluten/Wheat',
    'peanuts': 'Peanuts',
    'sesame': 'Sesame',
    'shellfish': 'Shellfish',
    'soy': 'Soy',
    'tree-nuts': 'Tree Nuts',
    'wheat': 'Wheat',
    'vegetarian': 'Vegetarian',
    'vegan': 'Vegan',
    'halal-ingredients': 'Halal',
    'gluten-free': 'Gluten Free'
  };
  return allergenList.map(allergen => allergenMap[allergen.toLowerCase()] || allergen);
}

// Parse USC menu from API response
async function parseAPIResponse(apiData: any, diningHallName: string, date: string): Promise<MenuData> {
  const menuData: MenuData = {
    date,
    breakfast: [],
    brunch: [],
    lunch: [],
    dinner: [],
  };

  if (!apiData || !apiData.meals || !Array.isArray(apiData.meals)) {
    console.warn('Invalid API response format');
    return menuData;
  }

  // Group meals by type
  for (const mealData of apiData.meals) {
    if (!mealData.name || !mealData.stations) continue;
    
    const normalizedMealType = normalizeMealType(mealData.name);
    if (!normalizedMealType) continue;

    const diningHall: DiningHall = {
      name: diningHallName,
      sections: [],
    };

    // Process each station
    for (const stationData of mealData.stations) {
      if (!stationData.station || !Array.isArray(stationData.menu)) continue;
      
      const items: FoodItem[] = [];
      
      for (const itemData of stationData.menu) {
        if (!itemData.item) continue;
        
        // Skip items that are just section headers or bars
        const skipPhrases = [
          "MADE TO ORDER",
          "BAR",
          "STATION OPENS",
          "*",
          "NUTS AND PEANUTS ARE USED HERE",
          "CHEF'S",
          "SALAD AND DELI BAR",
          "HOT CHICKEN SANDWICH BAR"
        ];

        if (skipPhrases.some((phrase) => itemData.item.toUpperCase().includes(phrase))) {
          continue;
        }

        // Extract allergens and dietary preferences
        const allergens = extractAllergens(itemData.allergens || []);
        const preferences = extractAllergens(itemData.preferences || []);
        const allTags = [...new Set([...allergens, ...preferences])];

        items.push({
          name: itemData.item,
          allergens: allTags,
        });
      }

      // Only add sections that have items
      if (items.length > 0) {
        diningHall.sections.push({
          name: stationData.station,
          items,
        });
      }
    }

    // Only add the dining hall to this meal if it has sections
    if (diningHall.sections.length > 0) {
      const mealArray = menuData[normalizedMealType];
      if (Array.isArray(mealArray)) {
        mealArray.push(diningHall);
      }
    }
  }

  return menuData;
}

// Get date range (today + next 3 days for frontend)
function getDateRange(): Date[] {
  const dates = [];
  const today = new Date();
  // Scrape 4 days: today + 3 future days (matches frontend requirement)
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

// Helper to merge menu data from multiple dining halls
function mergeMenuData(existingMenu: MenuData, newMenu: MenuData): MenuData {
  return {
    date: existingMenu.date,
    breakfast: [...(existingMenu.breakfast || []), ...(newMenu.breakfast || [])],
    brunch: [...(existingMenu.brunch || []), ...(newMenu.brunch || [])],
    lunch: [...(existingMenu.lunch || []), ...(newMenu.lunch || [])],
    dinner: [...(existingMenu.dinner || []), ...(newMenu.dinner || [])]
  };
}

// Main Edge Function
Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting USC Menu Scraper...');

    // Initialize Supabase client with service key
    // Note: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are automatically available in Edge Functions
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Clean up old files first
    console.log('🧹 Cleaning up old menu files...');
    try {
      const { data: files } = await supabase.storage.from('menus').list();
      
      if (files) {
        const today = new Date();
        const cutoffDate = new Date(today);
        cutoffDate.setDate(today.getDate()); // Keep files from today onwards
        
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + 4); // Delete files more than 4 days in the future
        
        const filesToDelete = files
          .filter(file => file.name.endsWith('.json'))
          .filter(file => {
            const match = file.name.match(/menu-(\d{4}-\d{2}-\d{2})\.json/);
            if (!match) return false;
            const fileDate = new Date(match[1]);
            // Delete files older than today OR more than 4 days in the future
            return fileDate < cutoffDate || fileDate >= futureDate;
          })
          .map(file => file.name);

        if (filesToDelete.length > 0) {
          await supabase.storage.from('menus').remove(filesToDelete);
          console.log(`🧹 Deleted ${filesToDelete.length} old files:`, filesToDelete);
        } else {
          console.log('🧹 No old files to delete');
        }
      }
    } catch (cleanupError) {
      console.warn('⚠️ Cleanup failed:', cleanupError);
    }

    const dates = getDateRange();
    console.log(`📅 Processing ${dates.length} days of menus`);
    
    const results = [];

    for (const date of dates) {
      const isoDate = date.toISOString().split("T")[0];
      const fileName = getMenuFileName(isoDate);
      
      console.log(`🌐 Fetching menus for ${isoDate}...`);
      
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
          // Build API URL with date parameters
          const year = date.getFullYear();
          const month = date.getMonth() + 1; // JavaScript months are 0-indexed
          const day = date.getDate();
          const apiUrl = `${API_BASE_URL}/${hall.value}?y=${year}&m=${month}&d=${day}`;

          console.log(`    API URL: ${apiUrl}`);

          // Fetch from USC API
          const response = await fetch(apiUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const apiData = await response.json();
          
          // Parse the API response
          const hallMenuData = await parseAPIResponse(apiData, hall.name, isoDate);
          
          // Check if we got any data for this hall
          const hasData = hallMenuData.breakfast?.length || hallMenuData.brunch?.length || 
                         hallMenuData.lunch?.length || hallMenuData.dinner?.length;
          
          if (hasData) {
            combinedMenuData = mergeMenuData(combinedMenuData, hallMenuData);
            console.log(`  ✅ Successfully scraped ${hall.name}`);
          } else {
            console.log(`  ⚠️ No menu data found for ${hall.name} on ${isoDate}`);
          }
        } catch (hallError) {
          console.error(`  ❌ Error scraping ${hall.name}:`, hallError);
        }
      }

      // Check if we have any menu data at all
      const totalHasData = combinedMenuData.breakfast?.length || combinedMenuData.brunch?.length || 
                          combinedMenuData.lunch?.length || combinedMenuData.dinner?.length;

      if (totalHasData) {
        console.log(`📦 Uploading menu file: ${fileName}`);
        
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('menus')
          .upload(fileName, JSON.stringify(combinedMenuData, null, 2), {
            contentType: 'application/json',
            upsert: true
          });

        if (uploadError) {
          console.error(`❌ Failed to upload ${fileName}:`, uploadError);
          results.push({ date: isoDate, success: false, error: uploadError.message });
        } else {
          console.log(`✅ Successfully uploaded ${fileName}`);
          results.push({ date: isoDate, success: true, fileName });
        }
      } else {
        console.log(`⚠️ No menu data found for any dining hall on ${isoDate}`);
        results.push({ date: isoDate, success: false, error: 'No menu data found' });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`🎉 Scraping complete! ${successCount}/${results.length} dates processed successfully`);

    return new Response(JSON.stringify({
      success: true,
      message: `Processed ${successCount}/${results.length} dates successfully`,
      results
    }, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Fatal error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});