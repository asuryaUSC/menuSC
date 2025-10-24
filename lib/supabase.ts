import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

// Validate required environment variables
if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL environment variable')
}
if (!supabaseAnonKey) {
  throw new Error('Missing SUPABASE_ANON_KEY environment variable')
}

// Frontend client (uses anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server client (uses service key for admin operations) - only available on server side
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// Storage helper functions
export const supabaseStorage = {
  // Upload menu file
  async uploadMenuFile(fileName: string, data: unknown): Promise<{ success: boolean; error?: string }> {
    if (!supabaseAdmin) {
      return { success: false, error: 'Admin client not available - missing SUPABASE_SERVICE_KEY' }
    }

    try {
      const { error } = await supabaseAdmin.storage
        .from('menus')
        .upload(fileName, JSON.stringify(data, null, 2), {
          contentType: 'application/json',
          upsert: true // Overwrite if exists
        })

      if (error) {
        console.error('Upload error:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (err) {
      console.error('Upload exception:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  },

  // Download menu file
  async downloadMenuFile(fileName: string): Promise<{ data: unknown; error?: string }> {
    try {
      const { data, error } = await supabase.storage
        .from('menus')
        .download(fileName)

      if (error) {
        console.error('Download error:', error)
        return { data: null, error: error.message }
      }

      const text = await data.text()
      const jsonData = JSON.parse(text)
      return { data: jsonData }
    } catch (err) {
      console.error('Download exception:', err)
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  },

  // List all files in menus bucket
  async listMenuFiles(): Promise<{ files: string[]; error?: string }> {
    if (!supabaseAdmin) {
      return { files: [], error: 'Admin client not available - missing SUPABASE_SERVICE_KEY' }
    }

    try {
      const { data, error } = await supabaseAdmin.storage
        .from('menus')
        .list()

      if (error) {
        console.error('List error:', error)
        return { files: [], error: error.message }
      }

      const files = data.map(file => file.name).filter(name => name.endsWith('.json'))
      return { files }
    } catch (err) {
      console.error('List exception:', err)
      return { files: [], error: err instanceof Error ? err.message : 'Unknown error' }
    }
  },

  // Delete a menu file
  async deleteMenuFile(fileName: string): Promise<{ success: boolean; error?: string }> {
    if (!supabaseAdmin) {
      return { success: false, error: 'Admin client not available - missing SUPABASE_SERVICE_KEY' }
    }

    try {
      const { error } = await supabaseAdmin.storage
        .from('menus')
        .remove([fileName])

      if (error) {
        console.error('Delete error:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (err) {
      console.error('Delete exception:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  },

  // Clean up old menu files (keep only specified number of days)
  async cleanupOldFiles(keepDays: number = 4): Promise<{ success: boolean; deletedCount: number; error?: string }> {
    if (!supabaseAdmin) {
      return { success: false, deletedCount: 0, error: 'Admin client not available - missing SUPABASE_SERVICE_KEY' }
    }

    try {
      const { files, error: listError } = await this.listMenuFiles()
      
      if (listError) {
        return { success: false, deletedCount: 0, error: listError }
      }

      const today = new Date()
      const cutoffDate = new Date(today)
      cutoffDate.setDate(today.getDate() - keepDays + 1) // Keep today + (keepDays-1) future days

      const filesToDelete = files.filter(fileName => {
        // Extract date from filename (menu-YYYY-MM-DD.json)
        const match = fileName.match(/menu-(\d{4}-\d{2}-\d{2})\.json/)
        if (!match) return false

        const fileDate = new Date(match[1])
        return fileDate < cutoffDate
      })

      let deletedCount = 0
      for (const fileName of filesToDelete) {
        const result = await this.deleteMenuFile(fileName)
        if (result.success) {
          deletedCount++
          console.log(`🧹 Deleted old menu file: ${fileName}`)
        } else {
          console.error(`Failed to delete ${fileName}:`, result.error)
        }
      }

      return { success: true, deletedCount }
    } catch (err) {
      console.error('Cleanup exception:', err)
      return { success: false, deletedCount: 0, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }
}