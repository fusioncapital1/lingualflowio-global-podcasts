
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  company_name TEXT,
  subscription_tier TEXT DEFAULT 'starter' CHECK (subscription_tier IN ('starter', 'professional', 'enterprise')),
  subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'expired')),
  trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '14 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create podcasts table
CREATE TABLE public.podcasts (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  original_language TEXT NOT NULL DEFAULT 'en',
  audio_file_url TEXT,
  audio_file_size BIGINT,
  duration_seconds INTEGER,
  status TEXT DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create translations table
CREATE TABLE public.translations (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  podcast_id UUID NOT NULL REFERENCES public.podcasts(id) ON DELETE CASCADE,
  target_language TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  translated_audio_url TEXT,
  transcript_original TEXT,
  transcript_translated TEXT,
  voice_clone_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for podcasts
CREATE POLICY "Users can view their own podcasts" ON public.podcasts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own podcasts" ON public.podcasts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own podcasts" ON public.podcasts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own podcasts" ON public.podcasts
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for translations
CREATE POLICY "Users can view translations of their podcasts" ON public.translations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.podcasts 
      WHERE podcasts.id = translations.podcast_id 
      AND podcasts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create translations for their podcasts" ON public.translations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.podcasts 
      WHERE podcasts.id = translations.podcast_id 
      AND podcasts.user_id = auth.uid()
    )
  );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$;

-- Trigger to create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('podcast-audio', 'podcast-audio', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for podcast audio
CREATE POLICY "Users can upload their own audio files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'podcast-audio' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own audio files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'podcast-audio' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
