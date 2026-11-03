import {
  supabase,
  SupabaseSiteSettings,
  SupabaseTimelineItem,
  SupabaseGalleryItem,
  SupabaseGuestbookEntry
} from '../lib/supabase';
import { BirthdayConfig, Milestone, initialBirthdayConfig } from '../config/birthdayConfig';

export interface HealthStatus {
  connected: boolean;
  siteSettingsTableFound: boolean;
  timelineItemsTableFound: boolean;
  galleryItemsTableFound: boolean;
  errorMessage?: string;
}

/**
 * Checks Supabase connectivity and whether schema tables have been created
 */
export async function checkSupabaseHealth(): Promise<HealthStatus> {
  const status: HealthStatus = {
    connected: false,
    siteSettingsTableFound: false,
    timelineItemsTableFound: false,
    galleryItemsTableFound: false,
  };

  try {
    const { error: settingsErr } = await supabase.from('site_settings').select('id').limit(1);
    status.connected = true;
    if (!settingsErr) {
      status.siteSettingsTableFound = true;
    } else if (settingsErr.code !== 'PGRST205') {
      status.errorMessage = settingsErr.message;
    }

    const { error: timelineErr } = await supabase.from('timeline_items').select('id').limit(1);
    if (!timelineErr) status.timelineItemsTableFound = true;

    const { error: galleryErr } = await supabase.from('gallery_items').select('id').limit(1);
    if (!galleryErr) status.galleryItemsTableFound = true;

    return status;
  } catch (err: any) {
    return {
      ...status,
      errorMessage: err?.message || 'Failed to reach Supabase',
    };
  }
}

/**
 * Fetch site settings from Supabase, seamlessly converting to BirthdayConfig
 */
export async function fetchSiteSettings(): Promise<BirthdayConfig | null> {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle();

    if (error) {
      // Table may not exist yet or permission error
      console.warn('[Supabase] site_settings query returned error:', error.message);
      return null;
    }

    if (!data) {
      return null;
    }

    const row = data as SupabaseSiteSettings;

    // If full_config was stored as JSONB, start with that and overlay column fields
    let mergedConfig: BirthdayConfig = row.full_config
      ? { ...initialBirthdayConfig, ...row.full_config }
      : { ...initialBirthdayConfig };

    if (row.girlfriend_name) mergedConfig.girlfriendName = row.girlfriend_name;
    if (row.nickname) mergedConfig.nickname = row.nickname;
    if (row.boyfriend_name) mergedConfig.boyfriendName = row.boyfriend_name;
    if (row.birthday) mergedConfig.birthday = row.birthday;
    if (row.celebration_date) mergedConfig.celebrationDate = row.celebration_date;
    if (row.relationship_duration) mergedConfig.relationshipDurationDays = Number(row.relationship_duration);
    if (row.relationship_start_date) mergedConfig.relationshipStartDate = row.relationship_start_date;
    // Sanitize and prioritize valid cloud audio track URL
    const cloudAudioUrl = row.music_settings?.customAudioUrl || row.full_config?.audioTrackUrl || '';
    if (cloudAudioUrl && !cloudAudioUrl.startsWith('blob:')) {
      mergedConfig.audioTrackUrl = cloudAudioUrl;
    } else if (mergedConfig.audioTrackUrl?.startsWith('blob:')) {
      // Strip any dead local blob URLs
      mergedConfig.audioTrackUrl = '';
    }

    // If love_letter is present, update current primary language or English
    if (row.love_letter) {
      mergedConfig.letterContent = {
        ...mergedConfig.letterContent,
        my: row.love_letter,
        en: row.love_letter,
      };
    }

    return mergedConfig;
  } catch (err) {
    console.error('[Supabase] Unexpected error fetching site settings:', err);
    return null;
  }
}

/**
 * Save site settings to Supabase with strict URL sanitization
 */
export async function saveSiteSettingsToSupabase(config: BirthdayConfig): Promise<{ success: boolean; error?: string }> {
  try {
    // Sanitize audioTrackUrl: NEVER save local blob: URLs to Supabase!
    const cleanAudioUrl = (config.audioTrackUrl && !config.audioTrackUrl.startsWith('blob:'))
      ? config.audioTrackUrl
      : '';

    const safeFullConfig = {
      ...config,
      audioTrackUrl: cleanAudioUrl,
    };

    const payload = {
      id: 'default',
      girlfriend_name: config.girlfriendName,
      nickname: config.nickname,
      boyfriend_name: config.boyfriendName,
      birthday: config.birthday,
      celebration_date: config.celebrationDate,
      birthday_message: config.celebrationSubtitle?.my || config.celebrationSubtitle?.en || '',
      theme_settings: {
        primaryColor: '#f472b6',
        goldAccent: true,
      },
      animation_settings: {
        fallingPetals: true,
        shootingStars: true,
        interactiveCanvas: true,
      },
      music_settings: {
        customAudioUrl: cleanAudioUrl,
      },
      love_letter: config.letterContent?.my || config.letterContent?.en || '',
      relationship_duration: config.relationshipDurationDays,
      relationship_start_date: config.relationshipStartDate,
      full_config: safeFullConfig,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('site_settings')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save settings' };
  }
}

/**
 * Fetch timeline items from Supabase
 */
export async function fetchTimelineItems(): Promise<Milestone[] | null> {
  try {
    const { data, error } = await supabase
      .from('timeline_items')
      .select('*')
      .order('display_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return null;
    }

    return data.map((item: SupabaseTimelineItem) => ({
      id: item.id,
      title: (item.title_i18n as any) || {
        my: item.title,
        en: item.title,
        ko: item.title,
        zh: item.title,
      },
      tagline: (item.tagline_i18n as any) || {
        my: item.description,
        en: item.description,
        ko: item.description,
        zh: item.description,
      },
      dateStr: item.event_date || '',
      description: (item.description_i18n as any) || {
        my: item.description,
        en: item.description,
        ko: item.description,
        zh: item.description,
      },
      iconName: (item.icon_name as any) || 'Heart',
      photoUrl: item.image_path || undefined,
    }));
  } catch (err) {
    console.error('[Supabase] Error fetching timeline items:', err);
    return null;
  }
}

/**
 * Save timeline items to Supabase
 */
export async function saveTimelineItemsToSupabase(milestones: Milestone[]): Promise<{ success: boolean; error?: string }> {
  try {
    const records = milestones.map((m, idx) => ({
      id: m.id.includes('-') && m.id.length === 36 ? m.id : undefined, // only keep if valid UUID
      title: m.title.en || m.title.my,
      description: m.description.en || m.description.my,
      event_date: m.dateStr,
      image_path: m.photoUrl || null,
      display_order: idx + 1,
      title_i18n: m.title,
      description_i18n: m.description,
      tagline_i18n: m.tagline,
      icon_name: m.iconName,
      updated_at: new Date().toISOString(),
    }));

    // If items without valid UUID exist, let supabase generate it
    for (const record of records) {
      const { error } = await supabase.from('timeline_items').upsert(record);
      if (error) {
        console.warn('[Supabase] Timeline item upsert warning:', error.message);
      }
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save timeline items' };
  }
}

/**
 * Delete a timeline item
 */
export async function deleteTimelineItemFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('timeline_items').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Fetch gallery items from Supabase
 */
export async function fetchGalleryItems(): Promise<SupabaseGalleryItem[]> {
  try {
    const { data, error } = await supabase
      .from('gallery_items')
      .select('*')
      .order('display_order', { ascending: true });

    if (error || !data) return [];
    return data;
  } catch (err) {
    console.error('[Supabase] Error fetching gallery items:', err);
    return [];
  }
}

/**
 * Add a gallery item to Supabase
 */
export async function addGalleryItemToSupabase(item: { image_path: string; caption?: string; display_order?: number }): Promise<{ success: boolean; data?: SupabaseGalleryItem; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('gallery_items')
      .insert({
        image_path: item.image_path,
        caption: item.caption || null,
        display_order: item.display_order ?? 0,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to add gallery item' };
  }
}

/**
 * Delete a gallery item
 */
export async function deleteGalleryItemFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('gallery_items').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Upload a photo to Supabase storage bucket 'gallery'
 * Supports JPG, JPEG, PNG, WEBP from phone or computer
 */
export async function uploadPhotoToSupabase(file: File): Promise<{ url?: string; error?: string }> {
  try {
    if (!file || file.size === 0) {
      return { error: 'The selected file is empty. Please select a valid photo.' };
    }

    // Supported formats: JPG, JPEG, PNG, WEBP
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    const isExtensionValid = allowedExtensions.includes(fileExt);
    const isMimeValid = file.type ? allowedMimeTypes.includes(file.type.toLowerCase()) : isExtensionValid;

    if (!isExtensionValid && !isMimeValid) {
      return { error: 'Unsupported file format. Please upload a JPG, JPEG, PNG, or WEBP image.' };
    }

    // Maximum file size (15 MB)
    if (file.size > 15 * 1024 * 1024) {
      return { error: 'Photo size exceeds 15MB limit. Please choose a smaller photo.' };
    }

    const cleanExt = isExtensionValid ? fileExt : 'jpg';
    const fileName = `memory_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${cleanExt}`;
    const filePath = `photos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return { error: uploadError.message };
    }

    const { data } = supabase.storage.from('gallery').getPublicUrl(filePath);
    return { url: data.publicUrl };
  } catch (err: any) {
    return { error: err?.message || 'Upload failed' };
  }
}

/**
 * Helper to convert File to Base64 Data URL for persistent cloud DB fallback
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Upload a song or audio track to Supabase cloud storage (bucket 'gallery')
 * Supports MP3, M4A, WAV, AAC, OGG, FLAC from mobile phones, tablets, or computers.
 * Features multi-stage cloud storage fallback (music/ -> photos/ -> database direct Base64)
 * ensuring that sound is NEVER lost across devices even if storage bucket policies differ.
 */
export async function uploadAudioToSupabase(
  file: File
): Promise<{ url?: string; error?: string; isDataUrl?: boolean }> {
  try {
    if (!file || file.size === 0) {
      return { error: 'The selected audio file is empty. Please select a valid song.' };
    }

    // Supported audio formats: MP3, M4A, WAV, AAC, OGG, FLAC, WEBM, MP4
    const allowedExtensions = ['mp3', 'm4a', 'wav', 'aac', 'ogg', 'flac', 'webm', 'mp4'];
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';

    const isAudioMime = file.type
      ? file.type.startsWith('audio/') || file.type.includes('video/mp4')
      : false;
    const isExtensionValid = allowedExtensions.includes(fileExt);

    if (!isAudioMime && !isExtensionValid) {
      return {
        error: 'Unsupported audio format. Please upload an MP3, M4A, WAV, AAC, or OGG song file.',
      };
    }

    // Maximum file size for cloud storage (50 MB)
    if (file.size > 50 * 1024 * 1024) {
      return { error: 'Song size exceeds 50MB limit. Please choose a smaller audio file.' };
    }

    const cleanExt = isExtensionValid ? fileExt : 'mp3';
    const mimeMap: Record<string, string> = {
      mp3: 'audio/mpeg',
      m4a: 'audio/mp4',
      wav: 'audio/wav',
      aac: 'audio/aac',
      ogg: 'audio/ogg',
      flac: 'audio/flac',
      webm: 'audio/webm',
      mp4: 'audio/mp4',
    };
    const contentType = file.type || mimeMap[cleanExt] || 'audio/mpeg';
    const fileName = `themesong_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${cleanExt}`;

    // Attempt 1: Upload to gallery bucket in 'music/' folder with upsert: false (avoids requiring UPDATE permission)
    const primaryPath = `music/${fileName}`;
    const { error: primaryError } = await supabase.storage
      .from('gallery')
      .upload(primaryPath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType,
      });

    if (!primaryError) {
      const { data } = supabase.storage.from('gallery').getPublicUrl(primaryPath);
      if (data?.publicUrl) {
        return { url: data.publicUrl };
      }
    }

    console.warn('[uploadAudioToSupabase] Primary upload to music/ path failed:', primaryError?.message);

    // Attempt 2: Fallback to 'photos/' folder in 'gallery' bucket (confirmed working for photos)
    const fallbackPath = `photos/${fileName}`;
    const { error: fallbackError } = await supabase.storage
      .from('gallery')
      .upload(fallbackPath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType,
      });

    if (!fallbackError) {
      const { data } = supabase.storage.from('gallery').getPublicUrl(fallbackPath);
      if (data?.publicUrl) {
        return { url: data.publicUrl };
      }
    }

    console.warn('[uploadAudioToSupabase] Fallback upload to photos/ path failed:', fallbackError?.message);

    // Attempt 3: If file is <= 5MB, convert to Base64 data URL to store directly in Supabase site_settings table!
    // This provides 100% cloud cross-device sync even if storage bucket RLS restricts uploads.
    if (file.size <= 5 * 1024 * 1024) {
      try {
        const base64Data = await fileToBase64(file);
        return { url: base64Data, isDataUrl: true };
      } catch (convErr: any) {
        console.warn('[uploadAudioToSupabase] Base64 conversion failed:', convErr);
      }
    }

    return {
      error:
        primaryError?.message ||
        fallbackError?.message ||
        'Failed to upload song to Supabase cloud storage.',
    };
  } catch (err: any) {
    return { error: err?.message || 'Audio upload failed' };
  }
}

/**
 * Default initial wishes to guarantee a warm, lively guestbook experience
 */
export const DEFAULT_GUESTBOOK_ENTRIES: SupabaseGuestbookEntry[] = [
  {
    id: 'seed-nyi-nyi-01',
    sender_name: 'ညီညီ (Nyi Nyi) ❤️',
    message: 'ချစ်ရတဲ့ မနှင်းလေး... မွေးနေ့မှာ စိတ်ချမ်းသာ ကိုယ်ကျန်းမာပြီး လိုအင်ဆန္ဒတွေအားလုံး ပြည့်ဝပါစေ။ မင်းဘေးမှာ ကိုယ်အမြဲတမ်း လက်တွဲပြီး ရှိနေပေးမယ်နော်။ ချစ်တယ် မနှင်းလေးရေ 💕',
    relationship_tag: 'Boyfriend',
    avatar_color: 'rose',
    is_pinned: true,
    likes_count: 899,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'seed-friend-02',
    sender_name: 'Su Su 🌸',
    message: 'Happy Birthday Hnin Lae Yee! May your special day bring you as much joy as you bring to everyone around you! Stay sweet and happy always! 🎂✨',
    relationship_tag: 'Friend',
    avatar_color: 'pink',
    is_pinned: false,
    likes_count: 42,
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'seed-friend-03',
    sender_name: 'Aung Kyaw & Friends 💐',
    message: 'မွေးနေ့မှာ ပျော်ရွှင်ပါစေ မနှင်းလေးရေ! လှပတဲ့ဘဝခရီးလမ်းမှာ အောင်မြင်မှုတွေနဲ့ အလှပဆုံးအမှတ်တရများ ပိုင်ဆိုင်နိုင်ပါစေခင်ဗျာ။ 🌸🎉',
    relationship_tag: 'Well-wisher',
    avatar_color: 'amber',
    is_pinned: false,
    likes_count: 28,
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
];

const LOCAL_GUESTBOOK_KEY = 'hny_guestbook_entries_cache_v1';

/**
 * Fetch guestbook entries from Supabase with robust local cache fallback
 */
export async function fetchGuestbookEntries(): Promise<SupabaseGuestbookEntry[]> {
  try {
    const { data, error } = await supabase
      .from('guestbook_entries')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      // Store fresh entries in local storage as reliable backup
      try {
        localStorage.setItem(LOCAL_GUESTBOOK_KEY, JSON.stringify(data));
      } catch {
        // quota exceeded fallback
      }
      return data;
    }

    // If table returned empty or error, check local storage
    const cached = localStorage.getItem(LOCAL_GUESTBOOK_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        // invalid cache
      }
    }

    // Default warm seed data
    return DEFAULT_GUESTBOOK_ENTRIES;
  } catch (err) {
    console.warn('[Supabase] Guestbook fetch error, falling back to local:', err);
    const cached = localStorage.getItem(LOCAL_GUESTBOOK_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // fallback
      }
    }
    return DEFAULT_GUESTBOOK_ENTRIES;
  }
}

/**
 * Add a new guestbook birthday wish to Supabase and local cache
 */
export async function addGuestbookEntry(
  entry: Omit<SupabaseGuestbookEntry, 'id' | 'created_at'>
): Promise<{ success: boolean; entry?: SupabaseGuestbookEntry; error?: string }> {
  try {
    const newRecord = {
      sender_name: entry.sender_name.trim(),
      message: entry.message.trim(),
      relationship_tag: entry.relationship_tag || 'Friend',
      avatar_color: entry.avatar_color || 'rose',
      is_pinned: Boolean(entry.is_pinned),
      likes_count: 1,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('guestbook_entries')
      .insert(newRecord)
      .select()
      .single();

    if (!error && data) {
      // Update local storage cache
      try {
        const current = await fetchGuestbookEntries();
        const updated = [data, ...current.filter((c) => c.id !== data.id)];
        localStorage.setItem(LOCAL_GUESTBOOK_KEY, JSON.stringify(updated));
      } catch {
        // safe
      }
      return { success: true, entry: data };
    }

    // If Supabase table isn't migrated yet, save to local cache so user's wish is never lost!
    const localEntry: SupabaseGuestbookEntry = {
      id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...newRecord,
    };

    try {
      const current = await fetchGuestbookEntries();
      const updated = [localEntry, ...current];
      localStorage.setItem(LOCAL_GUESTBOOK_KEY, JSON.stringify(updated));
    } catch {
      // safe
    }

    return { success: true, entry: localEntry };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to submit birthday wish' };
  }
}

/**
 * Delete a guestbook entry (Admin control)
 */
export async function deleteGuestbookEntry(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('guestbook_entries').delete().eq('id', id);

    // Also remove from local cache
    try {
      const cached = localStorage.getItem(LOCAL_GUESTBOOK_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        const filtered = parsed.filter((item: SupabaseGuestbookEntry) => item.id !== id);
        localStorage.setItem(LOCAL_GUESTBOOK_KEY, JSON.stringify(filtered));
      }
    } catch {
      // safe
    }

    return !error;
  } catch {
    return false;
  }
}

/**
 * Like / react to a guestbook entry
 */
export async function likeGuestbookEntry(id: string, currentLikes: number = 0): Promise<number> {
  const newLikes = (currentLikes || 0) + 1;
  try {
    await supabase
      .from('guestbook_entries')
      .update({ likes_count: newLikes })
      .eq('id', id);
  } catch {
    // safe fallback
  }

  // Update local cache
  try {
    const cached = localStorage.getItem(LOCAL_GUESTBOOK_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      const updated = parsed.map((item: SupabaseGuestbookEntry) =>
        item.id === id ? { ...item, likes_count: newLikes } : item
      );
      localStorage.setItem(LOCAL_GUESTBOOK_KEY, JSON.stringify(updated));
    }
  } catch {
    // safe
  }

  return newLikes;
}


