import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Map from 'ol/Map';
import View from 'ol/View';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { fromLonLat } from 'ol/proj';
import { Style, Fill, Stroke } from 'ol/style';
import './Main-Geoguessr.css';
import { 
  celebrityData, 
  getRandomCelebrity, 
  getRandomCelebrities, 
  getCelebrityPhoto 
} from '../data/celebrityData';
import { turkeyProvinces, getNearbyProvinces, getProvinceByName } from '../data/turkeyProvinces';

const Main = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const difficulty = location.state?.difficulty || 'normal';
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tooltipRef = useRef(null);
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
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const vectorSourceRef = useRef(null);
  const vectorLayerRef = useRef(null);
  const tileLayerRef = useRef(null);
  const timerRef = useRef(null);
  const [clickedProvince, setClickedProvince] = useState(null);
  const [clickedProvinceCorrect, setClickedProvinceCorrect] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const currentPlayerRef = useRef(1);
  const tickCounterRef = useRef(0);
  const [player1Score, setPlayer1Score] = useState(0);
  const player1ScoreRef = useRef(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const player2ScoreRef = useRef(0);
  const [winner, setWinner] = useState(null);

  const highlightProvinceOnMap = (provinceName, hoveredProvince = null, options = []) => {
    if (!vectorLayerRef.current) return;

    const styleFunction = (feature) => {
      const featureName = feature.get('name') || feature.get('NAME') || feature.get('admin');
      const isHovered = hoveredProvince && featureName && 
        featureName.toLowerCase().includes(hoveredProvince.toLowerCase());
      
      const isOption = options.some(opt => {
        const optName = (opt.name || opt).toLowerCase().trim();
        const fname = (featureName || '').toLowerCase().trim();
        
        if (fname === optName) return true;
        if (fname.startsWith(optName) || optName.startsWith(fname)) return true;
        
        if ((optName === 'afyonkarahisar' || optName === 'afyon') && 
            (fname.includes('afyon') || fname.includes('karahisar'))) return true;
        if ((optName === 'sakarya' || optName === 'adapazarı') && 
            (fname.includes('sakarya') || fname.includes('adapazar'))) return true;
        if ((optName === 'kocaeli' || optName === 'izmit') && 
            (fname.includes('kocaeli') || fname.includes('izmit'))) return true;
        
        return fname.includes(optName) || optName.includes(fname);
      });
      
      let fillColor = '#9E9E9E';
      let strokeColor = 'rgba(255, 255, 255, 0.9)';
      let strokeWidth = 2;
      
      const isClicked = clickedProvince && featureName && 
        featureName.toLowerCase().includes(clickedProvince.toLowerCase());
      
      if (isClicked) {
        fillColor = clickedProvinceCorrect ? '#4CAF50' : '#F44336';
        strokeColor = '#FFFFFF';
        strokeWidth = 3;
      } else if (isOption) {
        fillColor = '#FFA726';
        strokeColor = 'rgba(255, 255, 255, 0.95)';
        strokeWidth = 2.5;
        
        if (isHovered) {
          fillColor = '#FFB74D';
          strokeColor = '#FFFFFF';
          strokeWidth = 3;
        }
      } else if (isHovered) {
        fillColor = '#ADADAD';
        strokeColor = '#FFFFFF';
        strokeWidth = 2.5;
      }
      
      return new Style({
        stroke: new Stroke({
          color: strokeColor,
          width: strokeWidth
        }),
        fill: new Fill({
          color: fillColor
        })
      });
    };

    vectorLayerRef.current.setStyle(styleFunction);
  };

  const startGame = () => {
    console.log('Oyun başlatılıyor... Zorluk:', difficulty);
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
    
    setTimeout(() => {
      highlightProvinceOnMap(correctProvince);
    }, 600);
  };

  const handleAnswerSelect = (optionIndex) => {
    if (isAnswerChecked) return;
    setSelectedAnswer(optionIndex);
  };

  const handleCheckClick = () => {
    if (selectedAnswer === null) return;
    
    setIsAnswerChecked(true);
    
    if (selectedAnswer === correctAnswerIndex) {
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
      
      if (currentQuestion) {
        setCorrectlyAnsweredQuestions(prev => [...prev, currentQuestion]);
        
        setTimeout(() => {
          highlightProvinceOnMap(currentQuestion.birthProvince);
        }, 100);
      }
      
      const correctAudio = new Audio('/sfx/true.mp3');
      correctAudio.volume = 0.5;
      correctAudio.play().catch(error => console.log('Audio play failed:', error));
    } else {
      const wrongAudio = new Audio('/sfx/false.mp3');
      wrongAudio.volume = 0.5;
      wrongAudio.play().catch(error => console.log('Audio play failed:', error));
    }
  };

  const handleMapClick = (clickedIndex) => {
    if (isAnswerChecked) return;
    
    setIsAnswerChecked(true);
    const clickedProvinceName = provinceOptions[clickedIndex]?.name;
    const isCorrect = clickedIndex === correctAnswerIndex;
    
    setClickedProvince(clickedProvinceName);
    setClickedProvinceCorrect(isCorrect);
    
    highlightProvinceOnMap(currentQuestion.birthProvince);
    
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
      
      const correctAudio = new Audio('/sfx/true.mp3');
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
      
      const wrongAudio = new Audio('/sfx/false.mp3');
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

  const handleContinueClick = () => {
    loadNextQuestion();
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const handleProvinceClick = (event) => {
      if (!gameStarted || isAnswerChecked || gameOver) {
        console.log('Oyun durumu uygun değil:', { gameStarted, isAnswerChecked, gameOver });
        return;
      }

      const clickedProvinceName = event.detail.provinceName;
      console.log('Province click event alındı:', clickedProvinceName);
      console.log('Mevcut seçenekler:', provinceOptions);
      
      if (clickedProvinceName && currentQuestion && provinceOptions.length > 0) {
        const clickedIndex = provinceOptions.findIndex(option => {
          const optionName = option.name || option;
          return clickedProvinceName.toLowerCase().includes(optionName.toLowerCase()) ||
                 optionName.toLowerCase().includes(clickedProvinceName.toLowerCase());
        });
        
        console.log('Bulunan index:', clickedIndex);
        
        if (clickedIndex !== -1) {
          setSelectedAnswer(clickedIndex);
          
          setTimeout(() => {
            handleMapClick(clickedIndex);
          }, 300);
        } else {
          console.log('Tıklanan il seçenekler arasında değil!');
        }
      }
    };

    const handleProvinceHover = (event) => {
      if (!gameStarted || isAnswerChecked || gameOver || !currentQuestion) return;
      
      const hoveredProvinceName = event.detail.provinceName;
      if (hoveredProvinceName && currentQuestion.birthProvince) {
        highlightProvinceOnMap(currentQuestion.birthProvince, hoveredProvinceName, provinceOptions);
      } else if (currentQuestion.birthProvince) {
        highlightProvinceOnMap(currentQuestion.birthProvince, null, provinceOptions);
      }
    };

    window.addEventListener('provinceClicked', handleProvinceClick);
    window.addEventListener('provinceHovered', handleProvinceHover);
    
    return () => {
      window.removeEventListener('provinceClicked', handleProvinceClick);
      window.removeEventListener('provinceHovered', handleProvinceHover);
    };
  }, [gameStarted, isAnswerChecked, gameOver, currentQuestion, provinceOptions, correctlyAnsweredQuestions]);

  useEffect(() => {
    if (clickedProvince && currentQuestion) {
      highlightProvinceOnMap(currentQuestion.birthProvince, null, provinceOptions);
    }
  }, [clickedProvince, clickedProvinceCorrect]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    console.log('Harita başlatılıyor...');

    const vectorSource = new VectorSource({
      url: '/databases/maps/turkey-full.geojson',
      format: new GeoJSON()
    });
    
    vectorSource.once('change', () => {
      if (vectorSource.getState() === 'ready') {
        const features = vectorSource.getFeatures();
        console.log(`✅ Harita yüklendi! Toplam ${features.length} il bulundu.`);
        console.log('İller:', features.map(f => f.get('name') || f.get('NAME') || f.get('admin')));
      } else if (vectorSource.getState() === 'error') {
        console.error('❌ Harita yüklenemedi!');
      }
    });
    
    vectorSourceRef.current = vectorSource;

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        stroke: new Stroke({
          color: 'rgba(255, 255, 255, 0.8)',
          width: 1.5
        }),
        fill: new Fill({
          color: '#9E9E9E'
        })
      })
    });
    vectorLayerRef.current = vectorLayer;

    const map = new Map({
      target: mapRef.current,
      layers: [
        vectorLayer
      ],
      view: new View({
        center: fromLonLat([35, 38]),
        zoom: 6,
        minZoom: 6,
        maxZoom: 6,
        enableRotation: false,
        constrainResolution: true
      }),
      controls: [],
      interactions: []
    });

    map.on('singleclick', (event) => {
      if (event.originalEvent) {
        event.originalEvent.preventDefault();
        event.originalEvent.stopPropagation();
      }
      
      console.log('Harita tıklandı! Pixel:', event.pixel);
      
      const coordinate = event.coordinate;
      console.log('Coordinate:', coordinate);
      
      const feature = map.forEachFeatureAtPixel(
        event.pixel, 
        (feature) => feature,
        { hitTolerance: 5 }
      );
      
      if (feature) {
        const clickedProvinceName = feature.get('name') || feature.get('NAME') || feature.get('admin');
        console.log('Tıklanan il:', clickedProvinceName);
        
        if (clickedProvinceName) {
          const customEvent = new CustomEvent('provinceClicked', { 
            detail: { provinceName: clickedProvinceName } 
          });
          window.dispatchEvent(customEvent);
        }
      }
    });

    map.on('pointermove', (event) => {
      if (event.dragging) {
        setTooltipVisible(false);
        return;
      }
      
      const feature = map.forEachFeatureAtPixel(
        event.pixel, 
        (feature) => feature,
        { hitTolerance: 5 }
      );
      
      const target = map.getTargetElement();
      
      if (feature) {
        const hoveredProvinceName = feature.get('name') || feature.get('NAME') || feature.get('admin');
        target.style.cursor = 'pointer';
        
        setTooltipContent(hoveredProvinceName);
        setTooltipPosition({ 
          x: event.originalEvent.clientX, 
          y: event.originalEvent.clientY 
        });
        setTooltipVisible(true);
        
        const hoverEvent = new CustomEvent('provinceHovered', { 
          detail: { provinceName: hoveredProvinceName } 
        });
        window.dispatchEvent(hoverEvent);
      } else {
        target.style.cursor = 'default';
        
        setTooltipVisible(false);
        
        const hoverEvent = new CustomEvent('provinceHovered', { 
          detail: { provinceName: null } 
        });
        window.dispatchEvent(hoverEvent);
      }
    });

    mapInstanceRef.current = map;
    
    console.log('Harita başlatıldı:', map);

    return () => {
      console.log('Harita temizleniyor...');
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(null);
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleHomeClick = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    navigate('/');
  };

  const closeWelcomeModal = () => {
    setShowWelcomeModal(false);
  };

  return (
    <div className="main-page">
      <div ref={mapRef} className="map-container"></div>

      {tooltipVisible && (
        <div 
          className="map-tooltip"
          style={{
            left: `${tooltipPosition.x + 10}px`,
            top: `${tooltipPosition.y - 30}px`
          }}
        >
          {tooltipContent}
        </div>
      )}

      {gameStarted && !gameOver && (
        <>
          <div className="top-controls">
            <button className="control-button back-button" onClick={handleHomeClick} title="Ana Menü">
              <span>🏠</span>
            </button>
          </div>

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
        </>
      )}

      {!gameStarted && !gameOver && (
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
      )}

      {gameStarted && !gameOver && currentQuestion && (
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
                <span 
                  key={index}
                  className={`province-chip ${
                    isAnswerChecked 
                      ? (index === correctAnswerIndex ? 'correct' : (selectedAnswer === index ? 'incorrect' : ''))
                      : ''
                  }`}
                  style={{
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
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {gameOver && (
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
                <p>Correct Answers: <strong>{correctlyAnsweredQuestions.length}</strong></p>
                <p>Success Rate: <strong>{questionCount > 0 ? Math.round((correctlyAnsweredQuestions.length / questionCount) * 100) : 0}%</strong></p>
              </>
            )}
          </div>
          <button className="play-again-button" onClick={startGame}>
            🔄 Play Again
          </button>
          <button 
            className="play-again-button main-menu-button" 
            onClick={() => navigate('/')} 
            style={{background: '#6c757d', marginTop: '10px'}}
          >
            🏠 Main Menu
          </button>
        </div>
      )}

      {showWelcomeModal && (
        <div className="welcome-modal-overlay" onClick={closeWelcomeModal}>
          <div className="welcome-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeWelcomeModal}>×</button>
            
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
              <button className="modal-start-button" onClick={() => { closeWelcomeModal(); startGame(); }}>
                🚀 Let's Start!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Main;
