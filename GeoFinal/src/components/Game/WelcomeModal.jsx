import React from 'react';

const WelcomeModal = ({ isOpen, onClose, difficulty }) => {
  if (!isOpen) return null;

  return (
    <div className="welcome-modal-overlay" onClick={() => onClose(false)}>
      <div className="welcome-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={() => onClose(false)}>×</button>
        
        <div className="developer-section">
          <div className="brand-badge" style={{background: '#ff4444', color: 'white', padding: '12px 35px', borderRadius: '30px', fontSize: '24px', fontWeight: '900', letterSpacing: '3px', marginBottom: '20px'}}>FAMOUSGUESSR</div>
          <h3 className="developer-name">Turkish Celebrity GeoGame</h3>
        </div>

        <div className="welcome-content">
          <h2 className="welcome-title">🎮 Ready to Guess Turkish Celebrities?</h2>
          <p className="welcome-description">
            In this game, you will guess the birthplaces of 100 Turkish celebrities.
            Earn points for each correct answer and discover the correct provinces on the interactive map!
          </p>
          <div className="game-rules">
            <h3>📋 Game Rules</h3>
            <ul>
              {difficulty === 'normal' ? (
                <>
                  <li>⏱️ You have <strong>90 seconds</strong></li>
                  <li>🎯 Each correct answer <strong>+10 points</strong></li>
                  <li>🗺️ Correct provinces are marked <strong>green</strong> on the map</li>
                  <li>🟠 Answer options are highlighted in <strong>orange</strong></li>
                  <li>🎵 Sound effects play for correct/wrong answers</li>
                </>
              ) : difficulty === 'hard' ? (
                <>
                  <li>⏱️ <strong>60 seconds</strong> starting time</li>
                  <li>✅ Each correct answer: <strong>+10 points</strong> and <strong>+1 second</strong></li>
                  <li>❌ Each wrong answer: <strong>-3 seconds</strong></li>
                  <li>🗺️ Correct provinces are marked <strong>green</strong> on the map</li>
                  <li>🟠 Answer options are highlighted in <strong>orange</strong></li>
                </>
              ) : (
                <>
                  <li>👥 <strong>2 Players</strong> take turns</li>
                  <li>⏱️ <strong>90 seconds</strong> total time</li>
                  <li>🎯 Each correct answer: <strong>+10 points</strong></li>
                  <li>⏳ <strong>-1 point per 2 seconds</strong> while waiting</li>
                  <li>🏆 <strong>Highest score wins</strong> when time runs out</li>
                  <li>🗺️ Click provinces on the map to answer</li>
                </>
              )}
            </ul>
          </div>
          <button className="modal-start-button" onClick={() => onClose(true)}>
            🚀 Let's Start!
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;

