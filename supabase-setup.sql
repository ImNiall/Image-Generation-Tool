-- Create diagrams table for storing generated diagrams
CREATE TABLE IF NOT EXISTS public.diagrams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    original_image_url TEXT,
    diagram_image_url TEXT NOT NULL,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.diagrams ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own diagrams
CREATE POLICY "Users can view own diagrams" ON public.diagrams
    FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own diagrams
CREATE POLICY "Users can insert own diagrams" ON public.diagrams
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own diagrams
CREATE POLICY "Users can update own diagrams" ON public.diagrams
    FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own diagrams
CREATE POLICY "Users can delete own diagrams" ON public.diagrams
    FOR DELETE USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS diagrams_user_id_idx ON public.diagrams(user_id);
CREATE INDEX IF NOT EXISTS diagrams_created_at_idx ON public.diagrams(created_at DESC);
