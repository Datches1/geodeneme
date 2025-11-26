import React from 'react';

const HUD = ({ 
  difficulty, 
  timeLeft, 
  score, 
  questionCount,
  currentPlayer,
  player1Score,
  player2Score 
}) => {
  return (
    <div className="game-hud">
      <div className="hud-item timer">
        <span className="icon">⏱️</span>
        <span>{timeLeft}s</span>
      </div>
      {difficulty === 'duo' ? (
        <>
          <div className="hud-item score" style={{background: currentPlayer === 1 ? 'rgba(40, 167, 69, 0.9)' : 'rgba(100, 100, 100, 0.7)'}}>
            <span className="icon">👤</span>
            <span>P1: {player1Score}</span>
          </div>
          <div className="hud-item score" style={{background: currentPlayer === 2 ? 'rgba(40, 167, 69, 0.9)' : 'rgba(100, 100, 100, 0.7)'}}>
            <span className="icon">👤</span>
            <span>P2: {player2Score}</span>
          </div>
        </>
      ) : (
        <div className="hud-item score">
          <span className="icon">🎯</span>
          <span>{score} points</span>
        </div>
      )}
      <div className="hud-item question-counter">
        <span className="icon">❓</span>
        <span>Question {questionCount}</span>
      </div>
    </div>
  );
};

export default HUD;

