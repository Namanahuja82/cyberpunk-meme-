const dotenv = require('dotenv')
dotenv.config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Supabase setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Gemini API setup
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// In-memory cache for AI responses
const aiCache = {};

// Mock users for hacky auth
const mockUsers = ['cyberpunk420', 'neonhacker', 'memegod2077'];

// Gemini API call function
async function callGeminiAPI(prompt) {
  if (aiCache[prompt]) {
    return aiCache[prompt];
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    const data = await response.json();
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || 'HODL the vibes!';
    
    aiCache[prompt] = result;
    return result;
  } catch (error) {
    console.error('Gemini API error:', error);
    // Fallback responses
    const fallbacks = [
      'To the MOON! 🚀',
      'Diamond hands forever! 💎',
      'This is the way! 🔥',
      'Stonks only go up! 📈',
      'HODL strong, memers! ⚡'
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}

// Routes
app.get('/api/memes', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('memes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching memes:', error);
    res.status(500).json({ error: 'Failed to fetch memes' });
  }
});

app.post('/api/memes', async (req, res) => {
  try {
    const { title, image_url, tags } = req.body;
    const owner_id = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    
    // Default image if none provided
    const finalImageUrl = image_url || `https://picsum.photos/400/300?random=${Date.now()}`;
    
    const { data, error } = await supabase
      .from('memes')
      .insert([{
        title,
        image_url: finalImageUrl,
        tags: Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()),
        owner_id,
        upvotes: 0,
        current_bid: 0
      }])
      .select();

    if (error) throw error;
    
    const newMeme = data[0];
    
    // Generate caption and vibe with AI
    try {
      const captionPrompt = `Generate a funny, cyberpunk-style caption for a meme titled "${title}" with tags: ${tags}. Make it edgy and internet culture focused.`;
      const vibePrompt = `Describe the vibe of a meme with title "${title}" and tags: ${tags}. Make it sound cyberpunk and trendy (e.g., "Neon Crypto Chaos").`;
      
      const [caption, vibe] = await Promise.all([
        callGeminiAPI(captionPrompt),
        callGeminiAPI(vibePrompt)
      ]);
      
      const { error: updateError } = await supabase
        .from('memes')
        .update({ caption, vibe })
        .eq('id', newMeme.id);
      
      newMeme.caption = caption;
      newMeme.vibe = vibe;
    } catch (aiError) {
      console.error('AI generation error:', aiError);
    }
    
    // Broadcast new meme to all clients
    io.emit('new_meme', newMeme);
    
    res.json(newMeme);
  } catch (error) {
    console.error('Error creating meme:', error);
    res.status(500).json({ error: 'Failed to create meme' });
  }
});

app.post('/api/memes/:id/vote', async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body; // 'up' or 'down'
    
    const { data: meme, error: fetchError } = await supabase
      .from('memes')
      .select('upvotes')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;
    
    const newUpvotes = type === 'up' ? meme.upvotes + 1 : meme.upvotes - 1;
    
    const { error } = await supabase
      .from('memes')
      .update({ upvotes: Math.max(0, newUpvotes) })
      .eq('id', id);
    
    if (error) throw error;
    
    // Broadcast vote update
    io.emit('vote_update', { memeId: id, upvotes: Math.max(0, newUpvotes) });
    
    res.json({ upvotes: Math.max(0, newUpvotes) });
  } catch (error) {
    console.error('Error voting:', error);
    res.status(500).json({ error: 'Failed to vote' });
  }
});

app.post('/api/memes/:id/bid', async (req, res) => {
  try {
    const { id } = req.params;
    const { credits } = req.body;
    const user_id = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    
    // Save bid
    const { error: bidError } = await supabase
      .from('bids')
      .insert([{ meme_id: id, user_id, credits }]);
    
    if (bidError) throw bidError;
    
    // Update meme's current bid
    const { error: updateError } = await supabase
      .from('memes')
      .update({ current_bid: credits, current_bidder: user_id })
      .eq('id', id);
    
    if (updateError) throw updateError;
    
    // Broadcast bid update
    io.emit('bid_update', { memeId: id, credits, bidder: user_id });
    
    res.json({ success: true, credits, bidder: user_id });
  } catch (error) {
    console.error('Error bidding:', error);
    res.status(500).json({ error: 'Failed to place bid' });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const limit = req.query.top || 10;
    
    const { data, error } = await supabase
      .from('memes')
      .select('*')
      .order('upvotes', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

app.post('/api/memes/:id/caption', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: meme, error: fetchError } = await supabase
      .from('memes')
      .select('title, tags')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;
    
    const prompt = `Generate a hilarious, cyberpunk-style caption for a meme titled "${meme.title}" with tags: ${meme.tags?.join(', ')}. Make it edgy and meme-worthy.`;
    const caption = await callGeminiAPI(prompt);
    
    const { error } = await supabase
      .from('memes')
      .update({ caption })
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ caption });
  } catch (error) {
    console.error('Error generating caption:', error);
    res.status(500).json({ error: 'Failed to generate caption' });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Cyberpunk Meme Server running on port ${PORT}`);
  console.log('💫 Ready to hack the meme matrix!');
});