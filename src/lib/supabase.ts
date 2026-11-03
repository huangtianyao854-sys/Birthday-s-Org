import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://aygelnthkzbdxevhewkz.supabase.co';
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_rpjyaIwTN4XczIZ8AZX-6g_ZalU8_Jp';

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export interface SupabaseSiteSettings {
  id: string;
  girlfriend_name: string;
  nickname: string;
  boyfriend_name: string;
  birthday: string;
  celebration_date: string;
  birthday_message: string;
  theme_settings: Record<string, any>;
  animation_settings: Record<string, any>;
  music_settings: Record<string, any>;
  love_letter: string;
  relationship_duration: number;
  relationship_start_date: string | null;
  full_config?: Record<string, any>;
  updated_at?: string;
}

export interface SupabaseTimelineItem {
  id: string;
  title: string;
  description: string;
  event_date: string | null;
  image_path: string | null;
  display_order: number;
  title_i18n?: Record<string, string>;
  description_i18n?: Record<string, string>;
  tagline_i18n?: Record<string, string>;
  icon_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseGalleryItem {
  id: string;
  image_path: string;
  caption: string | null;
  display_order: number;
  created_at?: string;
}

export interface SupabaseGuestbookEntry {
  id: string;
  sender_name: string;
  message: string;
  relationship_tag?: string;
  avatar_color?: string;
  is_pinned?: boolean;
  likes_count?: number;
  created_at?: string;
}
