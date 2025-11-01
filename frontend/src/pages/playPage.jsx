// This is the first page that the reader is navigated to after clicking play

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SnakeGame from '../components/snakeGame';

export default function PlayPage() {
    const [selectedGrid, setSelectedGrid] = useState(3);
    const [gameStarted, setGameStarted] = useState(false);
    const [attemptsLeft, setAttemptsLeft] = useState(3);
    const [scores, setScores] = useState([]);
    const navigate = useNavigate();

    const handleGridSelect = (size) => {
        setSelectedGrid(size);
        setGameStarted(true);
    };

    const handleGameOver = (score) => {
        const newScores = [...scores, score];
        setScores(newScores);
        setAttemptsLeft(prev => prev - 1);
    };

    const handleNext = () => {
        navigate('/learn');
    };

    return (
        <div className="play-page">
            <h1>let's start with the classic - snake game</h1>
            <p>play the game on your grid of choice and see how far you can go. you have <span className="highlight">{attemptsLeft} {attemptsLeft === 1 ? 'attempt' : 'attempts'}</span> left</p>
            <p>Use arrow keys ↑ ↓ → ← to control the snake</p>

            {!gameStarted ? (
                <div className="grid-selection">
                    <div className="grid-buttons">
                        {[3, 4, 5].map(size => (
                            <button
                                key={size}
                                onClick={() => handleGridSelect(size)}
                                className={selectedGrid === size ? 'selected' : ''}
                            >
                                {size}x{size}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <SnakeGame
                    gridSize={selectedGrid}
                    onNext={handleNext}
                    onGameOver={handleGameOver}
                    attemptsLeft={attemptsLeft}
                />
            )}
        </div>
    );
}
