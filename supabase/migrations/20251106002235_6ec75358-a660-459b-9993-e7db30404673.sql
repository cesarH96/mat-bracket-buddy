-- Create competitors table
CREATE TABLE public.competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  belt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create brackets table
CREATE TABLE public.brackets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  age_group TEXT NOT NULL,
  weight_group TEXT NOT NULL,
  belt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create matches table
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bracket_id UUID NOT NULL REFERENCES public.brackets(id) ON DELETE CASCADE,
  match_number INTEGER NOT NULL,
  round INTEGER NOT NULL,
  competitor1_id UUID REFERENCES public.competitors(id) ON DELETE SET NULL,
  competitor2_id UUID REFERENCES public.competitors(id) ON DELETE SET NULL,
  winner_id UUID REFERENCES public.competitors(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brackets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (tournament data is public)
CREATE POLICY "Anyone can view competitors"
  ON public.competitors FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert competitors"
  ON public.competitors FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update competitors"
  ON public.competitors FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete competitors"
  ON public.competitors FOR DELETE
  USING (true);

CREATE POLICY "Anyone can view brackets"
  ON public.brackets FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert brackets"
  ON public.brackets FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update brackets"
  ON public.brackets FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete brackets"
  ON public.brackets FOR DELETE
  USING (true);

CREATE POLICY "Anyone can view matches"
  ON public.matches FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert matches"
  ON public.matches FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update matches"
  ON public.matches FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete matches"
  ON public.matches FOR DELETE
  USING (true);

-- Create indexes for better performance
CREATE INDEX idx_matches_bracket_id ON public.matches(bracket_id);
CREATE INDEX idx_matches_competitor1_id ON public.matches(competitor1_id);
CREATE INDEX idx_matches_competitor2_id ON public.matches(competitor2_id);
CREATE INDEX idx_matches_winner_id ON public.matches(winner_id);