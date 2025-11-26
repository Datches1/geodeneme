import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GameMap from '../../components/Game/GameMap';
import HUD from '../../components/Game/HUD';
import QuestionPanel from '../../components/Game/QuestionPanel';
import GameOver from '../../components/Game/GameOver';
import WelcomeModal from '../../components/Game/WelcomeModal';
import './Game.css';
import { celebrityData } from '../../data/celebrityData';
import { turkeyProvinces } from '../../data/turkeyProvinces';

const Game = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const difficulty = location.state?.difficulty || 'normal';
  
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [provinceOptions, setProvinceOptions] = useState([]);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(null);
  const [correctlyAnsweredQuestions, setCorrectlyAnsweredQuestions] = useState([]);
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [askedCelebrities, setAskedCelebrities] = useState([]);
  const [clickedProvince, setClickedProvince] = useState(null);
  const [clickedProvinceCorrect, setClickedProvinceCorrect] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [winner, setWinner] = useState(null);

  const timerRef = useRef(null);
  const currentPlayerRef = useRef(1);
  const tickCounterRef = useRef(0);
  const player1ScoreRef = useRef(0);
  const player2ScoreRef = useRef(0);

  const startGame = () => {
    console.log('Starting game... Difficulty:', difficulty);
    setGameStarted(true);
    setShowWelcomeModal(false);
    setScore(0);
    setQuestionCount(0);
    setTimeLeft(difficulty === 'duo' ? 90 : (difficulty === 'normal' ? 90 : 60));
    setGameOver(false);
    setAskedCelebrities([]);
    setCorrectlyAnsweredQuestions([]);
    
    if (difficulty === 'duo') {
      setCurrentPlayer(1);
      currentPlayerRef.current = 1;
      setPlayer1Score(0);
      player1ScoreRef.current = 0;
      setPlayer2Score(0);
      player2ScoreRef.current = 0;
      setWinner(null);
    }
    
    startTimer();
    loadNextQuestion();
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    tickCounterRef.current = 0;
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
      
      if (difficulty === 'duo') {
        tickCounterRef.current += 1;
        
        if (tickCounterRef.current >= 2) {
          tickCounterRef.current = 0;
          
          if (currentPlayerRef.current === 1) {
            setPlayer1Score(prev => {
              const newScore = Math.max(0, prev - 1);
              player1ScoreRef.current = newScore;
              return newScore;
            });
          } else {
            setPlayer2Score(prev => {
              const newScore = Math.max(0, prev - 1);
              player2ScoreRef.current = newScore;
              return newScore;
            });
          }
        }
      }
    }, 1000);
  };

  const endGame = () => {
    setGameOver(true);
    setGameStarted(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
    if (difficulty === 'duo') {
      const p1 = player1ScoreRef.current;
      const p2 = player2ScoreRef.current;
      
      if (p1 > p2) {
        setWinner(1);
      } else if (p2 > p1) {
        setWinner(2);
      } else {
        setWinner(0);
      }
    }
  };

  const loadNextQuestion = () => {
    const availableCelebrities = celebrityData.filter(
      celeb => !askedCelebrities.includes(celeb.id)
    );
    
    if (availableCelebrities.length === 0) {
      endGame();
      return;
    }
    
    const randomIndex = Math.floor(Math.random() * availableCelebrities.length);
    const celebrity = availableCelebrities[randomIndex];
    
    setCurrentQuestion(celebrity);
    setAskedCelebrities(prev => [...prev, celebrity.id]);
    
    const correctProvince = celebrity.birthProvince;
    const correctProvinceData = turkeyProvinces.find(p => p.name === correctProvince);
    const correctCoords = correctProvinceData ? correctProvinceData.coordinates : null;
    
    const wrongOptions = [];
    const allProvinces = turkeyProvinces.filter(p => p.name !== correctProvince);
    
    if (correctCoords) {
      const provincesWithDistance = allProvinces.map(p => {
        const distance = Math.sqrt(
          Math.pow(p.coordinates[0] - correctCoords[0], 2) + 
          Math.pow(p.coordinates[1] - correctCoords[1], 2)
        );
        return { ...p, distance };
      });
      
      provincesWithDistance.sort((a, b) => b.distance - a.distance);
      
      const farProvinces = provincesWithDistance.slice(0, Math.floor(provincesWithDistance.length / 3));
      const midProvinces = provincesWithDistance.slice(Math.floor(provincesWithDistance.length / 3), Math.floor(provincesWithDistance.length * 2 / 3));
      const nearProvinces = provincesWithDistance.slice(Math.floor(provincesWithDistance.length * 2 / 3));
      
      if (farProvinces.length > 0) {
        wrongOptions.push(farProvinces[Math.floor(Math.random() * farProvinces.length)].name);
      }
      if (midProvinces.length > 0 && wrongOptions.length < 3) {
        const midOption = midProvinces[Math.floor(Math.random() * midProvinces.length)];
        if (!wrongOptions.includes(midOption.name)) {
          wrongOptions.push(midOption.name);
        }
      }
      if (nearProvinces.length > 0 && wrongOptions.length < 3) {
        const nearOption = nearProvinces[Math.floor(Math.random() * nearProvinces.length)];
        if (!wrongOptions.includes(nearOption.name)) {
          wrongOptions.push(nearOption.name);
        }
      }
    }
    
    while (wrongOptions.length < 3) {
      const randomProvince = allProvinces[Math.floor(Math.random() * allProvinces.length)];
      if (!wrongOptions.includes(randomProvince.name)) {
        wrongOptions.push(randomProvince.name);
      }
    }
    
    const allOptions = [correctProvince, ...wrongOptions];
    const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);
    
    const provinceObjects = shuffledOptions.map(provinceName => ({
      name: provinceName
    }));
    
    const correctIndex = shuffledOptions.findIndex(option => option === correctProvince);
    
    setProvinceOptions(provinceObjects);
    setCorrectAnswerIndex(correctIndex);
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    setClickedProvince(null);
    setClickedProvinceCorrect(null);
    
    setQuestionCount(prev => prev + 1);
  };

  const handleMapClick = (clickedProvinceName) => {
    if (!gameStarted || isAnswerChecked || gameOver) {
      console.log('Click ignored: Game not ready', { gameStarted, isAnswerChecked, gameOver });
      return;
    }
    
    console.log('Handling map click:', clickedProvinceName);
    console.log('Current Options:', provinceOptions);

    // Find which option was clicked using robust comparison
    const clickedIndex = provinceOptions.findIndex(option => {
      const optionName = (option.name || option).toLocaleLowerCase('tr-TR').trim();
      const clickedName = clickedProvinceName.toLocaleLowerCase('tr-TR').trim();
      
      // Direct match
      if (clickedName === optionName) return true;
      
      // Partial match
      if (clickedName.includes(optionName) || optionName.includes(clickedName)) return true;
      
      // Special cases
      if ((optionName === 'afyonkarahisar' || optionName === 'afyon') && 
          (clickedName.includes('afyon') || clickedName.includes('karahisar'))) return true;
      if ((optionName === 'sakarya' || optionName === 'adapazarı') && 
          (clickedName.includes('sakarya') || clickedName.includes('adapazar'))) return true;
      if ((optionName === 'kocaeli' || optionName === 'izmit') && 
          (clickedName.includes('kocaeli') || clickedName.includes('izmit'))) return true;
          
      return false;
    });

    if (clickedIndex === -1) {
      console.log('Clicked province is not among options! Clicked:', clickedProvinceName);
      return;
    }

    setIsAnswerChecked(true);
    setSelectedAnswer(clickedIndex);
    
    const isCorrect = clickedIndex === correctAnswerIndex;
    
    setClickedProvince(clickedProvinceName);
    setClickedProvinceCorrect(isCorrect);
    
    if (isCorrect) {
      if (difficulty === 'duo') {
        if (currentPlayer === 1) {
          setPlayer1Score(prev => {
            const newScore = prev + 10;
            player1ScoreRef.current = newScore;
            return newScore;
          });
        } else {
          setPlayer2Score(prev => {
            const newScore = prev + 10;
            player2ScoreRef.current = newScore;
            return newScore;
          });
        }
      } else {
        setScore(prev => prev + 10);
      }
      
      if (difficulty === 'hard') {
        setTimeLeft(prev => Math.min(prev + 1, 90));
      }
      
      if (currentQuestion) {
        setCorrectlyAnsweredQuestions(prev => [...prev, currentQuestion]);
      }
      
      // Ses yolunu güvenli hale getir
      const getAudioPath = (filename) => {
         // BASE_URL genellikle '/' veya '/repo-adi/' şeklinde gelir
         // Eğer BASE_URL '/' ise ve dosya yolu da '/' ile başlıyorsa '//' oluşabilir
         const baseUrl = import.meta.env.BASE_URL;
         const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
         return `${cleanBase}/sfx/${filename}`;
      };

      const correctAudio = new Audio(getAudioPath('true.mp3'));
      correctAudio.volume = 0.5;
      correctAudio.play().catch(error => console.log('Audio play failed:', error));
    } else {
      if (difficulty === 'hard') {
        setTimeLeft(prev => {
          const newTime = prev - 3;
          if (newTime <= 0) {
            endGame();
            return 0;
          }
          return newTime;
        });
      }
      
      // Ses yolunu güvenli hale getir
      const getAudioPath = (filename) => {
         const baseUrl = import.meta.env.BASE_URL;
         const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
         return `${cleanBase}/sfx/${filename}`;
      };

      const wrongAudio = new Audio(getAudioPath('false.mp3'));
      wrongAudio.volume = 0.5;
      wrongAudio.play().catch(error => console.log('Audio play failed:', error));
    }
    
    setTimeout(() => {
      if (difficulty === 'duo') {
        setCurrentPlayer(prev => {
          const newPlayer = prev === 1 ? 2 : 1;
          currentPlayerRef.current = newPlayer;
          return newPlayer;
        });
      }
      loadNextQuestion();
    }, 1500);
  };

  const handleHomeClick = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    navigate('/');
  };

  const handleWelcomeModalClose = (shouldStart) => {
    if (shouldStart) {
      startGame();
    } else {
      setShowWelcomeModal(false);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="main-page">
      <GameMap 
        provinceOptions={provinceOptions}
        clickedProvince={clickedProvince}
        clickedProvinceCorrect={clickedProvinceCorrect}
        correctProvince={currentQuestion?.birthProvince}
        onProvinceClick={handleMapClick}
        gameStarted={gameStarted}
      />

      {gameStarted && !gameOver && (
        <>
          <div className="top-controls">
            <button className="control-button back-button" onClick={handleHomeClick} title="Ana Menü">
              <span>🏠</span>
            </button>
          </div>

          <HUD 
            difficulty={difficulty}
            timeLeft={timeLeft}
            score={score}
            questionCount={questionCount}
            currentPlayer={currentPlayer}
            player1Score={player1Score}
            player2Score={player2Score}
          />
          
          {currentQuestion && (
            <QuestionPanel 
              currentQuestion={currentQuestion}
              provinceOptions={provinceOptions}
              difficulty={difficulty}
              currentPlayer={currentPlayer}
              isAnswerChecked={isAnswerChecked}
              correctAnswerIndex={correctAnswerIndex}
              selectedAnswer={selectedAnswer}
              onAnswerSelect={handleMapClick}
            />
          )}
        </>
      )}

      {!gameStarted && !gameOver && (
        <div className="start-screen-overlay">
          <div className="start-screen">
            <div className="turkey-welcome">
              <h1>Turkey Celebrity GeoGame</h1>
              <p className="game-description">
                Guess the birthplaces of Turkish celebrities!<br/>
                Answer correctly within 60 seconds and earn points.
              </p>
              <div className="game-features">
                <div className="feature-item">
                  <span className="feature-icon">⏱️</span>
                  <span>60 Seconds</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🎯</span>
                  <span>Earn Points</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🗺️</span>
                  <span>Interactive Map</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">⭐</span>
                  <span>100+ Celebrities</span>
                </div>
              </div>
              <button className="start-game-button" onClick={startGame}>
                🚀 Start Game
              </button>
            </div>
          </div>
        </div>
      )}

      <WelcomeModal 
        isOpen={showWelcomeModal}
        onClose={handleWelcomeModalClose}
        difficulty={difficulty}
      />

      {gameOver && (
        <GameOver 
          difficulty={difficulty}
          score={score}
          player1Score={player1Score}
          player2Score={player2Score}
          winner={winner}
          questionCount={questionCount}
          correctAnswerCount={correctlyAnsweredQuestions.length}
          onRestart={startGame}
          onMainMenu={() => navigate('/')}
        />
      )}
    </div>
  );
};

export default Game;

