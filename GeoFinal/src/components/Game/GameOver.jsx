import React from 'react';

const GameOver = ({
  difficulty,
  score,
  player1Score,
  player2Score,
  winner,
  questionCount,
  correctAnswerCount,
  onRestart,
  onMainMenu
}) => {
  const successRate = questionCount > 0 ? Math.round((correctAnswerCount / questionCount) * 100) : 0;

  return (
    <div className="game-over">
      <h2>🎉 Game Over!</h2>
      <div className="final-stats">
        {difficulty === 'duo' ? (
          <>
            <p>Player 1 Score: <strong>{player1Score}</strong></p>
            <p>Player 2 Score: <strong>{player2Score}</strong></p>
            <p style={{fontSize: '24px', marginTop: '20px', color: '#007bff'}}>
              {winner === 1 ? '🏆 Player 1 Wins!' : winner === 2 ? '🏆 Player 2 Wins!' : '🤝 It\'s a Tie!'}
            </p>
          </>
        ) : (
          <>
            <p>Total Score: <strong>{score}</strong></p>
            <p>Questions Answered: <strong>{questionCount}</strong></p>
            <p>Correct Answers: <strong>{correctAnswerCount}</strong></p>
            <p>Success Rate: <strong>{successRate}%</strong></p>
          </>
        )}
      </div>
      <button className="play-again-button" onClick={onRestart}>
        🔄 Play Again
      </button>
      <button 
        className="play-again-button main-menu-button" 
        onClick={onMainMenu} 
        style={{background: '#6c757d', marginTop: '10px'}}
      >
        🏠 Main Menu
      </button>
    </div>
  );
};

export default GameOver;

