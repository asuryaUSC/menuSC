import { DailyMenu } from "./types";
import { supabase } from "./supabase";

// Get menu data from Supabase Storage
export async function getMenuData(): Promise<Record<string, DailyMenu>> {
  try {
    // Get list of available menu files
    const { data: files, error: listError } = await supabase.storage
      .from('menus')
      .list();

    if (listError) {
      console.error('Error listing menu files:', listError);
      return {};
    }

    if (!files || files.length === 0) {
      console.log('No menu files found in storage');
      return {};
    }

    const menuData: Record<string, DailyMenu> = {};

    // Download each menu file
    for (const file of files) {
      if (file.name.endsWith('.json')) {
        try {
          const { data, error } = await supabase.storage
            .from('menus')
            .download(file.name);

          if (error) {
            console.error(`Error downloading ${file.name}:`, error);
            continue;
          }

          const text = await data.text();
          const menu = JSON.parse(text) as DailyMenu;
          menuData[menu.date] = menu;
        } catch (parseError) {
          console.error(`Error parsing ${file.name}:`, parseError);
        }
      }
    }

    console.log('Loaded menus for dates:', Object.keys(menuData));
    return menuData;
  } catch (error) {
    console.error('Error loading menu data from Supabase:', error);
    return {};
  }
}

// Helper to get specific date menu
export async function getMenuForDate(date: string): Promise<DailyMenu | null> {
  try {
    const fileName = `menu-${date}.json`;
    
    const { data, error } = await supabase.storage
      .from('menus')
      .download(fileName);

    if (error) {
      console.error(`Error downloading menu for ${date}:`, error);
      return null;
    }

    const text = await data.text();
    return JSON.parse(text) as DailyMenu;
  } catch (error) {
    console.error(`Error getting menu for ${date}:`, error);
    return null;
  }
}

// Helper to get today's menu specifically
export async function getTodaysMenu(): Promise<DailyMenu | null> {
  const today = new Date().toISOString().split('T')[0];
  return await getMenuForDate(today);
}

// Legacy function names for compatibility
export const getTestMenuData = getMenuData;
export const getTodaysTestMenu = getTodaysMenu;