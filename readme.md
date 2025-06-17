# 🌈 CYBERPUNK MEME BAZAAR 🚀

A neon-drenched, AI-powered meme marketplace built for the matrix! Trade memes, place bids, and let AI generate epic captions in this cyberpunk paradise.

## 🔥 Features

- **Meme Creation**: Upload memes with AI-generated captions
- **Real-time Bidding**: Live auction system with WebSockets
- **Upvote/Downvote**: Community-driven meme ranking
- **AI Integration**: Google Gemini API for captions & vibes
- **Cyberpunk UI**: Glitchy, neon-soaked terminal aesthetics
- **Leaderboard**: Track the most viral memes

## 🛠️ Tech Stack

- **Frontend**: React, Socket.IO Client, CSS3 (Cyberpunk styling)
- **Backend**: Node.js, Express, Socket.IO
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini 2.0 Flash API
- **Deployment**: Vercel/Render ready

## 🚀 Quick Setup

### 1. Supabase Setup
1. Go to [supabase.com](https://supabase.com) and create a free project
2. In the SQL Editor, run the schema from `schema.sql`
3. Get your project URL and anon key from Settings > API

### 2. Gemini API Setup
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create an API key for Gemini 2.0 Flash

### 3. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
echo "SUPABASE_URL=your_supabase_url_here" > .env
echo "SUPABASE_ANON_KEY=your_supabase_anon_key_here" >> .env
echo "GEMINI_API_KEY=your_gemini_api_key_here" >> .env

# Update server.js with your actual keys (replace YOUR_SUPABASE_URL, etc.)

# Start server
npm run dev
```

### 4. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start React app
npm start
```

### 5. Access the App
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 📁 File Structure

```
cyberpunk-meme-bazaar/
├── backend/
│   ├── server.js           # Express server with Socket.IO
│   ├── package.json        # Backend dependencies
│   └── .env               # Environment variables
├── frontend/
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── App.css        # Cyberpunk styling
│   │   └── index.js       # React entry point
│   ├── public/
│   │   └── index.html     # HTML template
│   └── package.json       # Frontend dependencies
├── schema.sql             # Supabase database schema
└── README.md             # This file
```

## 🎮 Usage

### Creating Memes
1. Click "HACK NEW MEME"
2. Enter title, image URL (optional), and tags
3. AI generates captions and vibes automatically
4. Meme appears in the gallery with real-time updates

### Bidding & Voting
- **Upvote/Downvote**: Click arrows to vote on memes
- **Place Bids**: Click "PLACE BID" and enter credit amount
- **Real-time Updates**: All changes broadcast live via WebSockets

### AI Features
- **Auto Captions**: AI generates cyberpunk-style captions
- **Vibe Analysis**: AI describes the meme's aesthetic
- **Manual Generation**: Click "🤖 AI CAPTION" to regenerate

## 🌟 Cyberpunk Features

### UI/UX
- **Glitch Effects**: CSS animations for text and elements
- **Neon Colors**: Pink, cyan, and green color scheme
- **Terminal Aesthetic**: Monospace fonts and hacker vibes
- **Binary Background**: Animated scrolling binary code
- **Hover Effects**: Glowing buttons and cards

### Real-time Features
- **Live Bidding**: See bids update across all clients
- **Vote Streaming**: Upvotes/downvotes sync in real-time
- **New Meme Alerts**: Instant gallery updates

## 🚀 Deployment

### Vercel (Frontend)
```bash
# In frontend directory
npm run build
# Deploy to Vercel
```

### Render (Backend)
1. Connect your GitHub repo to Render
2. Set environment variables in Render dashboard
3. Deploy as Node.js service

## 🔧 Environment Variables

### Backend (.env)
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

## 🎯 Hackathon Notes

### Hacky Shortcuts (By Design!)
- **Mock Auth**: Hardcoded user IDs for speed
- **Simple Validation**: Minimal error handling
- **In-Memory Cache**: AI responses cached temporarily
- **Fallback Responses**: Hardcoded captions if AI fails
- **Default Images**: Auto-generated placeholder images

### AI-Assisted Development
This project was built using:
- **Cursor/Windsurf**: For component generation and API integration
- **AI Prompts**: "Generate neon button component", "Create WebSocket handlers"
- **Speed Coding**: Leveraged AI for rapid prototyping

## 🐛 Known Issues (Hackathon Style!)

- No user authentication (it's a feature!)
- No bid validation (negative bids allowed!)
- Limited error handling (fail fast, debug faster!)
- Mobile responsiveness is basic (desktop-first approach)

## 🎉 Demo Features

Test these features in your demo:
1. **Create a meme** → Watch AI generate caption
2. **Place competing bids** → See real-time updates
3. **Vote on memes** → Watch leaderboard change
4. **Open multiple tabs** → Experience real-time sync

## 💫 Future Enhancements

- Meme duels (head-to-head voting)
- Generative art placeholders
- Fake "hacker HUD" overlay
- More glitch effects and animations
- User profiles and credit systems

---

**Built with ⚡ and lots of ☕ during a cyberpunk coding session!**

*Remember: This is hackathon code - it's meant to be wild, hacky, and functional. Ship it fast, debug it later!* 🚀