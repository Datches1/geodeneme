import React from 'react';
import { getCelebrityPhoto } from '../../data/celebrityData';

const QuestionPanel = ({
  currentQuestion,
  provinceOptions,
  difficulty,
  currentPlayer,
  isAnswerChecked,
  correctAnswerIndex,
  selectedAnswer,
  onAnswerSelect
}) => {
  if (!currentQuestion) return null;

  return (
    <div className="question-panel">
      {difficulty === 'duo' && (
        <div style={{textAlign: 'center', marginBottom: '10px', padding: '8px', background: currentPlayer === 1 ? '#4CAF50' : '#2196F3', borderRadius: '8px', color: 'white', fontWeight: '700', fontSize: '16px'}}>
          🎮 Player {currentPlayer}'s Turn
        </div>
      )}
      <div className="celebrity-info">
        <img 
          src={getCelebrityPhoto(currentQuestion)} 
          alt={currentQuestion.name} 
          className="celebrity-photo"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <div className="celebrity-details">
          <h2 className="celebrity-name">{currentQuestion.name}</h2>
          <span className="celebrity-category">{currentQuestion.category}</span>
        </div>
      </div>
      
      <h3 className="question-text">Select the province on the map!</h3>
      
      <div className="province-info-panel">
        <p className="info-text">Options:</p>
        <div className="province-chips">
          {provinceOptions.map((province, index) => (
            <div 
              key={index}
              className={`province-chip ${
                isAnswerChecked 
                  ? (index === correctAnswerIndex ? 'correct' : (selectedAnswer === index ? 'incorrect' : ''))
                  : ''
              }`}
              style={{
                cursor: 'default',
                backgroundColor: isAnswerChecked 
                  ? (index === correctAnswerIndex ? '#28a745' : (selectedAnswer === index ? '#dc3545' : '#FFA726'))
                  : '#FFA726',
                borderColor: isAnswerChecked 
                  ? (index === correctAnswerIndex ? '#28a745' : (selectedAnswer === index ? '#dc3545' : '#FF9800'))
                  : '#FF9800',
                color: 'white'
              }}
            >
              {province.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestionPanel;