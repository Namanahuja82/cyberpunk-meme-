import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';

// Configuration for different environments
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const socket = io(API_BASE_URL);

function App() {
  const [memes, setMemes] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [view, setView] = useState('gallery'); // 'gallery', 'create', 'leaderboard'
  const [newMeme, setNewMeme] = useState({ title: '', image_url: '', tags: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [terminalText, setTerminalText] = useState('');
  const terminalRef = useRef(null);

  // Terminal typing effect
  useEffect(() => {
    const text = 'INITIATING MEME MATRIX... LOADING NEON PROTOCOLS... READY TO HACK THE VIBE! ⚡';
    let i = 0;
    const typeWriter = () => {
      if (i < text.length) {
        setTerminalText(prev => prev + text.charAt(i));
        i++;
        setTimeout(typeWriter, 50);
      }
    };
    typeWriter();
  }, []);

  // Fetch memes on load
  useEffect(() => {
    fetchMemes();
    fetchLeaderboard();
  }, []);

  // Socket event listeners
  useEffect(() => {
    socket.on('new_meme', (meme) => {
      setMemes(prev => [meme, ...prev]);
    });

    socket.on('vote_update', ({ memeId, upvotes }) => {
      setMemes(prev => prev.map(meme => 
        meme.id === memeId ? { ...meme, upvotes } : meme
      ));
      fetchLeaderboard(); // Update leaderboard
    });

    socket.on('bid_update', ({ memeId, credits, bidder }) => {
      setMemes(prev => prev.map(meme => 
        meme.id === memeId ? { ...meme, current_bid: credits, current_bidder: bidder } : meme
      ));
    });

    return () => {
      socket.off('new_meme');
      socket.off('vote_update');
      socket.off('bid_update');
    };
  }, []);

  const fetchMemes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/memes`);
      const data = await response.json();
      setMemes(data);
    } catch (error) {
      console.error('Error fetching memes:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/leaderboard?top=10`);
      const data = await response.json();
      setLeaderboard(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const createMeme = async (e) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/memes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMeme),
      });

      if (response.ok) {
        setNewMeme({ title: '', image_url: '', tags: '' });
        setView('gallery');
      }
    } catch (error) {
      console.error('Error creating meme:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const vote = async (memeId, type) => {
    try {
      await fetch(`${API_BASE_URL}/api/memes/${memeId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const bid = async (memeId, credits) => {
    const creditAmount = prompt('Enter bid amount (credits):');
    if (!creditAmount || isNaN(creditAmount)) return;

    try {
      await fetch(`${API_BASE_URL}/api/memes/${memeId}/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credits: parseInt(creditAmount) }),
      });
    } catch (error) {
      console.error('Error bidding:', error);
    }
  };

  const generateCaption = async (memeId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/memes/${memeId}/caption`, {
        method: 'POST',
      });
      const data = await response.json();
      
      setMemes(prev => prev.map(meme => 
        meme.id === memeId ? { ...meme, caption: data.caption } : meme
      ));
    } catch (error) {
      console.error('Error generating caption:', error);
    }
  };

  // Rest of your component remains the same...
  return (
    <div className="app">
      {/* Terminal Header */}
      <div className="terminal-header">
        <div className="terminal-text" ref={terminalRef}>
          {terminalText}
        </div>
      </div>

      {/* Navigation */}
      <nav className="nav">
        <button 
          className={`nav-btn ${view === 'gallery' ? 'active' : ''}`}
          onClick={() => setView('gallery')}
        >
          MEME MATRIX
        </button>
        <button 
          className={`nav-btn ${view === 'create' ? 'active' : ''}`}
          onClick={() => setView('create')}
        >
          HACK NEW MEME
        </button>
        <button 
          className={`nav-btn ${view === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setView('leaderboard')}
        >
          VIRAL BOARD
        </button>
      </nav>

      <div className="container">
        {/* Gallery View */}
        {view === 'gallery' && (
          <div className="gallery">
            <h1 className="title glitch" data-text="CYBERPUNK MEME BAZAAR">
              CYBERPUNK MEME BAZAAR
            </h1>
            <div className="meme-grid">
              {memes.map(meme => (
                <div key={meme.id} className="meme-card">
                  <div className="meme-header">
                    <h3 className="meme-title">{meme.title}</h3>
                    <div className="meme-tags">
                      {meme.tags?.map((tag, index) => (
                        <span key={index} className="tag">#{tag}</span>
                      ))}
                    </div>
                  </div>
                  
                  <img 
                    src={meme.image_url} 
                    alt={meme.title}
                    className="meme-image"
                    onError={(e) => {
                      e.target.src = `https://picsum.photos/400/300?random=${meme.id}`;
                    }}
                  />
                  
                  {meme.caption && (
                    <div className="meme-caption">"{meme.caption}"</div>
                  )}
                  
                  {meme.vibe && (
                    <div className="meme-vibe">✨ {meme.vibe}</div>
                  )}
                  
                  <div className="meme-stats">
                    <div className="votes">
                      <button 
                        className="vote-btn up"
                        onClick={() => vote(meme.id, 'up')}
                      >
                        ⬆️ {meme.upvotes || 0}
                      </button>
                      <button 
                        className="vote-btn down"
                        onClick={() => vote(meme.id, 'down')}
                      >
                        ⬇️
                      </button>
                    </div>
                    
                    <div className="bid-section">
                      <div className="current-bid">
                        💰 {meme.current_bid || 0} credits
                        {meme.current_bidder && (
                          <small> by {meme.current_bidder}</small>
                        )}
                      </div>
                      <button 
                        className="bid-btn"
                        onClick={() => bid(meme.id)}
                      >
                        PLACE BID
                      </button>
                    </div>
                  </div>
                  
                  <div className="meme-actions">
                    <button 
                      className="action-btn"
                      onClick={() => generateCaption(meme.id)}
                    >
                      🤖 AI CAPTION
                    </button>
                    <small className="owner">by {meme.owner_id}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create View */}
        {view === 'create' && (
          <div className="create-section">
            <h2 className="section-title">HACK A NEW MEME INTO THE MATRIX</h2>
            <form onSubmit={createMeme} className="create-form">
              <div className="form-group">
                <label>MEME TITLE</label>
                <input
                  type="text"
                  value={newMeme.title}
                  onChange={(e) => setNewMeme({...newMeme, title: e.target.value})}
                  placeholder="e.g., Doge HODL To The Moon"
                  required
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label>IMAGE URL (optional - we'll gen one if empty)</label>
                <input
                  type="url"
                  value={newMeme.image_url}
                  onChange={(e) => setNewMeme({...newMeme, image_url: e.target.value})}
                  placeholder="https://example.com/epic-meme.jpg"
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label>TAGS (comma-separated)</label>
                <input
                  type="text"
                  value={newMeme.tags}
                  onChange={(e) => setNewMeme({...newMeme, tags: e.target.value})}
                  placeholder="crypto, funny, stonks, doge"
                  required
                  className="form-input"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isCreating}
                className="submit-btn"
              >
                {isCreating ? 'HACKING INTO MATRIX...' : '🚀 LAUNCH MEME'}
              </button>
            </form>
          </div>
        )}

        {/* Leaderboard View */}
        {view === 'leaderboard' && (
          <div className="leaderboard-section">
            <h2 className="section-title">VIRAL MEME LEADERBOARD</h2>
            <div className="leaderboard">
              {leaderboard.map((meme, index) => (
                <div key={meme.id} className="leaderboard-item">
                  <div className="rank">#{index + 1}</div>
                  <img 
                    src={meme.image_url} 
                    alt={meme.title}
                    className="leaderboard-image"
                  />
                  <div className="leaderboard-info">
                    <h4>{meme.title}</h4>
                    <div className="leaderboard-stats">
                      <span>⬆️ {meme.upvotes} votes</span>
                      <span>💰 {meme.current_bid || 0} credits</span>
                    </div>
                    {meme.vibe && <div className="vibe">✨ {meme.vibe}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Binary Background */}
      <div className="binary-bg">
        {Array.from({length: 20}).map((_, i) => (
          <div key={i} className="binary-line">
            {Array.from({length: 50}).map((_, j) => (
              <span key={j}>{Math.random() > 0.5 ? '1' : '0'}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;