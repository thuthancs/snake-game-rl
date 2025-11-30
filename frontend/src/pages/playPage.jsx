import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SnakeGame from '../components/snakeGame';

export default function PlayPage() {
    const navigate = useNavigate();
    const [selectedGrid, setSelectedGrid] = useState(3);
    const [hasSelectedGrid, setHasSelectedGrid] = useState(false);
    const [attemptsLeft, setAttemptsLeft] = useState(3);

    const handleGridSelect = (size) => {
        setSelectedGrid(size);
        setHasSelectedGrid(true);
    };

    const handleNext = () => {
        navigate('/intro');
    };

    return (
        <div className="play-page">
            <div className="intro-text">
                <h1>Play it yourself</h1>
                <p>Choose a grid size and see how far you can go.</p>
                <p>You have <span className="highlight">{attemptsLeft} {attemptsLeft === 1 ? 'attempt' : 'attempts'}</span> left.</p>
                <p>Use arrow keys ↑ ↓ → ← to control the snake</p>
            </div>

            <div className="game-area">
                {!hasSelectedGrid ? (
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
                        key={selectedGrid}
                        size={selectedGrid}
                        onAttemptChange={setAttemptsLeft}
                        onNext={handleNext}
                    />
                )}
            </div>
        </div>
    );
}