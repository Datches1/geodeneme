import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './IntroNew.css';

const Intro = () => {
  const [showTitle, setShowTitle] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState('normal'); 
  const navigate = useNavigate();

  useEffect(() => {
    // Fade in animations
    setTimeout(() => setShowTitle(true), 100);
    setTimeout(() => setShowSubtitle(true), 800);
    setTimeout(() => setShowButton(true), 1400);
  }, []);

  const handleStartGame = () => {
    navigate('/main', { state: { difficulty: selectedDifficulty } });
  };

  return (
    <div className="intro-container">
      <div className="intro-content">
        <div className="geoguessr-header">
          <div className="brand-badge" style={{color: '#FFFFFF !important', filter: 'brightness(1)'}}>FAMOUSGUESSR</div>
        </div>
        
        <h1 className={`intro-title ${showTitle ? 'fade-in' : ''}`} style={{color: '#FFFFFF', WebkitTextFillColor: '#FFFFFF'}}>
          FIND THE HOMETOWNS OF CELEBRITIES 
        </h1>
        
                <p className={`intro-description ${showSubtitle ? 'fade-in' : ''}`} style={{color: '#FFFFFF', WebkitTextFillColor: '#FFFFFF'}}>
          Find Turkish celebrities' hometowns on Turkey map.
        </p>

                <div className={`difficulty-selection ${showButton ? 'fade-in' : ''}`}>
          <h3 style={{color: '#FFFFFF', marginBottom: '15px', fontSize: '16px'}}>SELECT MODE</h3>
          <div className="difficulty-buttons">
            <button 
              className={`difficulty-btn ${selectedDifficulty === 'normal' ? 'selected' : ''}`}
              onClick={() => setSelectedDifficulty('normal')}
            >
              <span className="diff-icon">⏱️</span>
              <span className="diff-name">Normal</span>
              <span className="diff-desc">90 seconds</span>
            </button>
            <button 
              className={`difficulty-btn ${selectedDifficulty === 'hard' ? 'selected' : ''}`}
              onClick={() => setSelectedDifficulty('hard')}
            >
              <span className="diff-icon">🔥</span>
              <span className="diff-name">Hard</span>
              <span className="diff-desc">60s | -3s wrong | +1s correct</span>
            </button>
            <button 
              className={`difficulty-btn ${selectedDifficulty === 'duo' ? 'selected' : ''}`}
              onClick={() => setSelectedDifficulty('duo')}
            >
              <span className="diff-icon">👥</span>
              <span className="diff-name">Duo</span>
              <span className="diff-desc">90s | 2 Players | Highest score wins</span>
            </button>
          </div>
        </div>

        <button 
          className={`start-button geoguessr-style ${showButton ? 'fade-in' : ''}`}
          onClick={handleStartGame}
        >
          START GAME
        </button>

        <div className={`game-info ${showButton ? 'fade-in' : ''}`}>
          <div className="info-item" style={{color: '#FFFFFF'}}>
            <span className="info-icon">🗺️</span>
            <span style={{color: '#FFFFFF', WebkitTextFillColor: '#FFFFFF'}}>Interactive Map</span>
          </div>
          <div className="info-item" style={{color: '#FFFFFF'}}>
            <span className="info-icon">⏱️</span>
            <span style={{color: '#FFFFFF', WebkitTextFillColor: '#FFFFFF'}}>
              {selectedDifficulty === 'normal' ? '90 Seconds' : selectedDifficulty === 'hard' ? '60 Seconds + Bonus' : '90 Seconds (2 Players)'}
            </span>
          </div>
          <div className="info-item" style={{color: '#FFFFFF'}}>
            <span className="info-icon">⭐</span>
            <span style={{color: '#FFFFFF', WebkitTextFillColor: '#FFFFFF'}}>100+ Celebrities</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Intro;
