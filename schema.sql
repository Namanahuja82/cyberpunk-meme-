-- Create memes table
CREATE TABLE IF NOT EXISTS memes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    upvotes INTEGER DEFAULT 0,
    owner_id VARCHAR(100) NOT NULL,
    current_bid INTEGER DEFAULT 0,
    current_bidder VARCHAR(100),
    caption TEXT,
    vibe TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bids table
CREATE TABLE IF NOT EXISTS bids (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    meme_id UUID REFERENCES memes(id) ON DELETE CASCADE,
    user_id VARCHAR(100) NOT NULL,
    credits INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_memes_upvotes ON memes(upvotes DESC);
CREATE INDEX IF NOT EXISTS idx_memes_created_at ON memes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memes_tags ON memes USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_bids_meme_id ON bids(meme_id);
CREATE INDEX IF NOT EXISTS idx_bids_user_id ON bids(user_id);

-- Enable Row Level Security (optional, but recommended)
ALTER TABLE memes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (for hackathon purposes)
-- In production, you'd want more restrictive policies
CREATE POLICY "Allow all operations on memes" ON memes
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on bids" ON bids
    FOR ALL USING (true) WITH CHECK (true);

-- Insert some sample data for testing
INSERT INTO memes (title, image_url, tags, upvotes, owner_id, caption, vibe) VALUES
('Doge HODL', 'https://picsum.photos/400/300?random=1', ARRAY['crypto', 'doge', 'hodl'], 42, 'cyberpunk420', 'Such crypto, much moon, very diamond hands!', 'Retro Crypto Nostalgia'),
('Stonks Only Go Up', 'https://picsum.photos/400/300?random=2', ARRAY['stonks', 'stocks', 'money'], 69, 'neonhacker', 'When you buy the dip but it keeps dipping', 'Neon Financial Chaos'),
('This is Fine AI', 'https://picsum.photos/400/300?random=3', ARRAY['ai', 'fine', 'chaos'], 33, 'memegod2077', 'AI taking over but hey, at least the memes are fire', 'Digital Dystopia Vibes'),
('Pepe in the Matrix', 'https://picsum.photos/400/300?random=4', ARRAY['pepe', 'matrix', 'cyberpunk'], 88, 'cyberpunk420', 'Rare Pepe enters the simulation', 'Glitch Reality Feels'),
('Cat Coding at 3AM', 'https://picsum.photos/400/300?random=5', ARRAY['cat', 'coding', 'tired'], 55, 'neonhacker', 'When the deadline is tomorrow but the cat wants attention', 'Late Night Hacker Energy');

-- Insert some sample bids
INSERT INTO bids (meme_id, user_id, credits) VALUES
((SELECT id FROM memes WHERE title = 'Doge HODL'), 'neonhacker', 500),
((SELECT id FROM memes WHERE title = 'Stonks Only Go Up'), 'memegod2077', 750),
((SELECT id FROM memes WHERE title = 'Pepe in the Matrix'), 'cyberpunk420', 1000);

-- Update current_bid and current_bidder for memes with bids
UPDATE memes SET 
    current_bid = 500, 
    current_bidder = 'neonhacker' 
WHERE title = 'Doge HODL';

UPDATE memes SET 
    current_bid = 750, 
    current_bidder = 'memegod2077' 
WHERE title = 'Stonks Only Go Up';

UPDATE memes SET 
    current_bid = 1000, 
    current_bidder = 'cyberpunk420' 
WHERE title = 'Pepe in the Matrix';