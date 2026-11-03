-- ====================================================================
-- SIMPLIFIED SUPABASE SCHEMA FOR CINEMATIC BIRTHDAY SURPRISE
-- Dedicated to Hnin Lae Yee (Baby / မနှင်းလေး) from Nyi Nyi ❤️
-- Designed for H143 password-protected admin panel with direct cloud sync
-- ====================================================================

-- 1. Create site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    girlfriend_name TEXT NOT NULL DEFAULT 'Hnin Lae Yee',
    nickname TEXT NOT NULL DEFAULT 'Baby',
    boyfriend_name TEXT NOT NULL DEFAULT 'Nyi Nyi',
    birthday DATE DEFAULT '1996-11-09',
    celebration_date DATE DEFAULT '2026-11-09',
    birthday_message TEXT DEFAULT 'You are my favorite person, my most beautiful memory, and the person I want beside me in every chapter of my life.',
    theme_settings JSONB DEFAULT '{"primaryColor": "#f472b6", "starDensity": "high", "goldAccent": true}'::jsonb,
    animation_settings JSONB DEFAULT '{"fallingPetals": true, "shootingStars": true, "interactiveCanvas": true}'::jsonb,
    music_settings JSONB DEFAULT '{"volume": 0.4, "autoPlayHint": true, "customAudioUrl": ""}'::jsonb,
    love_letter TEXT,
    relationship_duration INTEGER DEFAULT 899,
    relationship_start_date DATE DEFAULT '2024-05-24',
    full_config JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create timeline_items table
CREATE TABLE IF NOT EXISTS public.timeline_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date TEXT,
    image_path TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    title_i18n JSONB,
    description_i18n JSONB,
    tagline_i18n JSONB,
    icon_name TEXT DEFAULT 'Heart',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create gallery_items table
CREATE TABLE IF NOT EXISTS public.gallery_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_path TEXT NOT NULL,
    caption TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

-- 5. Row Level Security Policies
-- Allows seamless read and write using the publishable public key
-- (Access is secured by the H143 password gate in the website admin panel)

-- site_settings policies
DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
CREATE POLICY "Public can view site settings" 
ON public.site_settings FOR SELECT 
TO public 
USING (true);

DROP POLICY IF EXISTS "Public can update site settings" ON public.site_settings;
CREATE POLICY "Public can update site settings" 
ON public.site_settings FOR ALL 
TO public 
USING (true)
WITH CHECK (true);

-- timeline_items policies
DROP POLICY IF EXISTS "Public can view timeline items" ON public.timeline_items;
CREATE POLICY "Public can view timeline items" 
ON public.timeline_items FOR SELECT 
TO public 
USING (true);

DROP POLICY IF EXISTS "Public can manage timeline items" ON public.timeline_items;
CREATE POLICY "Public can manage timeline items" 
ON public.timeline_items FOR ALL 
TO public 
USING (true)
WITH CHECK (true);

-- gallery_items policies
DROP POLICY IF EXISTS "Public can view gallery items" ON public.gallery_items;
CREATE POLICY "Public can view gallery items" 
ON public.gallery_items FOR SELECT 
TO public 
USING (true);

DROP POLICY IF EXISTS "Public can manage gallery items" ON public.gallery_items;
CREATE POLICY "Public can manage gallery items" 
ON public.gallery_items FOR ALL 
TO public 
USING (true)
WITH CHECK (true);

-- 6. Storage Bucket for Photos ('gallery')
INSERT INTO storage.buckets (id, name, public) 
VALUES ('gallery', 'gallery', true) 
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can view gallery photos" ON storage.objects;
CREATE POLICY "Public can view gallery photos" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Public can upload gallery photos" ON storage.objects;
CREATE POLICY "Public can upload gallery photos" 
ON storage.objects FOR INSERT 
TO public 
WITH CHECK (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Public can update gallery photos" ON storage.objects;
CREATE POLICY "Public can update gallery photos" 
ON storage.objects FOR UPDATE 
TO public 
USING (bucket_id = 'gallery')
WITH CHECK (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Public can delete gallery photos" ON storage.objects;
CREATE POLICY "Public can delete gallery photos" 
ON storage.objects FOR DELETE 
TO public 
USING (bucket_id = 'gallery');

-- 7. Seed Initial Default Data (No duplicates)
INSERT INTO public.site_settings (
    id,
    girlfriend_name,
    nickname,
    boyfriend_name,
    birthday,
    celebration_date,
    birthday_message,
    love_letter,
    relationship_duration,
    relationship_start_date
) VALUES (
    'default',
    'Hnin Lae Yee',
    'Baby',
    'Nyi Nyi',
    '1996-11-09',
    '2026-11-09',
    'You are my favorite person, my most beautiful memory, and the person I want beside me in every chapter of my life.',
    'မနှင်းလေး... မင်းဟာ ကိုယ့်ဘဝရဲ့ အလှပဆုံးသော အလင်းရောင်လေးပါ။\n\nမင်းနဲ့အတူ ဖြတ်သန်းခဲ့တဲ့ ရက်ပေါင်း ၈၉၉ ရက်ဟာ ကိုယ့်အတွက်တော့ စကြဝဠာတစ်ခုလုံးမှာ အဖိုးမဖြတ်နိုင်ဆုံး ရတနာပါပဲ။ မင်းရဲ့ အပြုံးလေးတွေ၊ မင်းရဲ့ မျက်ဝန်းလေးတွေနဲ့ မင်းရဲ့ နူးညံ့မှုလေးတွေဟာ ကိုယ့်တစ်နေ့တာလုံးအတွက် ခွန်အားတွေ ဖြစ်စေခဲ့တယ်။\n\nဒီနေ့ မင်းရဲ့ မွေးနေ့ရက်မြတ်လေးမှာ မင်းလိုချင်တဲ့ ဆုမွန်ကောင်းတွေအားလုံး ပြည့်စုံပါစေ။ ကိုယ်တို့ရဲ့ ရှေ့ဆက်ရမယ့် အနာဂတ်နေ့ရက်တွေတိုင်းမှာလည်း မင်းလက်ကို ကိုယ်ဘယ်တော့မှ လက်မလွှတ်ဘဲ ထာဝရ အတူတူ လျှောက်လှမ်းသွားပါ့မယ်။\n\nမွေးနေ့မှာ ပျော်ရွှင်ပါစေ ချစ်ရတဲ့ မနှင်းလေး ❤️\n- ချစ်ရတဲ့ ကိုကို ညီညီ',
    899,
    '2024-05-24'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.timeline_items (title, description, event_date, display_order, icon_name)
SELECT 'The Day We First Began', 'The magical moment our paths crossed and my world became infinitely brighter.', '2024-05-24', 1, 'Sparkles'
WHERE NOT EXISTS (SELECT 1 FROM public.timeline_items);

INSERT INTO public.timeline_items (title, description, event_date, display_order, icon_name)
SELECT 'Every Little Smile We Shared', 'Countless coffee dates, late-night talks, and quiet moments that built our forever.', '2025-02-14', 2, 'Heart'
WHERE (SELECT COUNT(*) FROM public.timeline_items) < 2;

INSERT INTO public.timeline_items (title, description, event_date, display_order, icon_name)
SELECT 'Celebrating You Today & Always', '899 beautiful days together, celebrating your birthday with all my heart and love.', '2026-11-09', 3, 'Cake'
WHERE (SELECT COUNT(*) FROM public.timeline_items) < 3;

-- 8. Create guestbook_entries table for birthday wishes
CREATE TABLE IF NOT EXISTS public.guestbook_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_name TEXT NOT NULL,
    message TEXT NOT NULL,
    relationship_tag TEXT DEFAULT 'Friend',
    avatar_color TEXT DEFAULT 'rose',
    is_pinned BOOLEAN DEFAULT false,
    likes_count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.guestbook_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view guestbook entries" ON public.guestbook_entries;
CREATE POLICY "Public can view guestbook entries" 
ON public.guestbook_entries FOR SELECT 
TO public 
USING (true);

DROP POLICY IF EXISTS "Public can insert guestbook entries" ON public.guestbook_entries;
CREATE POLICY "Public can insert guestbook entries" 
ON public.guestbook_entries FOR INSERT 
TO public 
WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update guestbook entries" ON public.guestbook_entries;
CREATE POLICY "Public can update guestbook entries" 
ON public.guestbook_entries FOR UPDATE 
TO public 
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Public can delete guestbook entries" ON public.guestbook_entries;
CREATE POLICY "Public can delete guestbook entries" 
ON public.guestbook_entries FOR DELETE 
TO public 
USING (true);

-- Seed initial greeting from Nyi Nyi
INSERT INTO public.guestbook_entries (sender_name, message, relationship_tag, avatar_color, is_pinned, likes_count)
SELECT 'ညီညီ (Nyi Nyi) ❤️', 'ချစ်ရတဲ့ မနှင်းလေး... မွေးနေ့မှာ စိတ်ချမ်းသာ ကိုယ်ကျန်းမာပြီး လိုအင်ဆန္ဒတွေအားလုံး ပြည့်ဝပါစေ။ မင်းဘေးမှာ ကိုယ်အမြဲတမ်း လက်တွဲပြီး ရှိနေပေးမယ်နော်။ ချစ်တယ် မနှင်းလေးရေ 💕', 'Boyfriend', 'rose', true, 899
WHERE NOT EXISTS (SELECT 1 FROM public.guestbook_entries);

