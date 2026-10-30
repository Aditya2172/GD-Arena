-- ====================================================================
-- GD ARENA — SUPABASE POSTGRESQL SCHEMA WITH ROW LEVEL SECURITY (RLS)
-- ====================================================================

-- 1. PROFILES TABLE (Linked with Supabase Auth auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    email TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 2. DISCUSSION SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.discussion_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes IN (5, 10, 15)),
    participant_count INTEGER NOT NULL CHECK (participant_count BETWEEN 2 AND 4),
    discussion_style TEXT NOT NULL DEFAULT 'Placement preparation',
    language TEXT NOT NULL DEFAULT 'English',
    selected_personalities JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Index on user_id and created_at for fast history and analytics queries
CREATE INDEX IF NOT EXISTS idx_discussion_sessions_user_id ON public.discussion_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_discussion_sessions_created_at ON public.discussion_sessions(created_at DESC);

ALTER TABLE public.discussion_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own discussion sessions"
    ON public.discussion_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own discussion sessions"
    ON public.discussion_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own discussion sessions"
    ON public.discussion_sessions FOR UPDATE
    USING (auth.uid() = user_id);

-- 3. DISCUSSION MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.discussion_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.discussion_sessions(id) ON DELETE CASCADE,
    speaker_type TEXT NOT NULL CHECK (speaker_type IN ('user', 'ai', 'system')),
    speaker_name TEXT NOT NULL,
    personality TEXT,
    message_text TEXT NOT NULL,
    sequence_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Index on session_id and sequence for ordering
CREATE INDEX IF NOT EXISTS idx_discussion_messages_session_seq ON public.discussion_messages(session_id, sequence_number ASC);

ALTER TABLE public.discussion_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages from their own sessions"
    ON public.discussion_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.discussion_sessions s
            WHERE s.id = discussion_messages.session_id
            AND s.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages into their own sessions"
    ON public.discussion_messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.discussion_sessions s
            WHERE s.id = discussion_messages.session_id
            AND s.user_id = auth.uid()
        )
    );

-- 4. SESSION REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.session_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID UNIQUE NOT NULL REFERENCES public.discussion_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    overall_score INTEGER NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
    communication_clarity INTEGER NOT NULL CHECK (communication_clarity BETWEEN 0 AND 100),
    topic_relevance INTEGER NOT NULL CHECK (topic_relevance BETWEEN 0 AND 100),
    logical_reasoning INTEGER NOT NULL CHECK (logical_reasoning BETWEEN 0 AND 100),
    vocabulary INTEGER NOT NULL CHECK (vocabulary BETWEEN 0 AND 100),
    argument_structure INTEGER NOT NULL CHECK (argument_structure BETWEEN 0 AND 100),
    critical_thinking INTEGER NOT NULL CHECK (critical_thinking BETWEEN 0 AND 100),
    participation INTEGER NOT NULL CHECK (participation BETWEEN 0 AND 100),
    confidence_indicators INTEGER NOT NULL CHECK (confidence_indicators BETWEEN 0 AND 100),
    strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
    areas_for_improvement JSONB NOT NULL DEFAULT '[]'::jsonb,
    missed_opportunities JSONB NOT NULL DEFAULT '[]'::jsonb,
    improved_argument_examples JSONB NOT NULL DEFAULT '[]'::jsonb,
    recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
    next_session_goals JSONB NOT NULL DEFAULT '[]'::jsonb,
    discussion_summary TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Indexes for report lookup and analytics aggregation
CREATE INDEX IF NOT EXISTS idx_session_reports_user_id ON public.session_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_session_reports_created_at ON public.session_reports(created_at DESC);

ALTER TABLE public.session_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own session reports"
    ON public.session_reports FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own session reports"
    ON public.session_reports FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 5. AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, email)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
        new.email
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
