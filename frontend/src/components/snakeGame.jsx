import { useCallback, useEffect, useRef, useState } from 'react';

const DIRECTIONS = {
  up: { row: -1, col: 0 },
  down: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
  right: { row: 0, col: 1 },
};

const getNewFoodPosition = (size, snakeBody) => {
  let newFood;
  do {
    newFood = {
      row: Math.floor(Math.random() * size),
      col: Math.floor(Math.random() * size),
    };
  } while (snakeBody.some(segment => segment.row === newFood.row && segment.col === newFood.col));
  return newFood;
};

const getInitialState = (size) => {
  const startPos = { row: Math.floor(size / 2), col: Math.floor(size / 2) };
  return {
    snakeBody: [startPos],
    direction: 'right',
    food: getNewFoodPosition(size, [startPos]),
    score: 0,
    attempts: 3,
    maxScore: 0,
    isGameRunning: false,
    isGameOver: false,
  };
};

export default function SnakeGame({ size = 3, onAttemptChange, onNext }) {
  const [game, setGame] = useState(() => getInitialState(size));
  const intervalRef = useRef(null);

  const handleMove = useCallback(() => {
    setGame(prev => {
      if (!prev.isGameRunning) {
        return prev;
      }

      const head = prev.snakeBody[0];
      const move = DIRECTIONS[prev.direction];
      const newHead = { row: head.row + move.row, col: head.col + move.col };

      const wallCollision = newHead.row < 0 || newHead.row >= size || newHead.col < 0 || newHead.col >= size;
      const selfCollision = prev.snakeBody.slice(1).some(segment => segment.row === newHead.row && segment.col === newHead.col);

      if (wallCollision || selfCollision) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        const newAttempts = prev.attempts - 1;
        return {
          ...prev,
          isGameRunning: false,
          maxScore: Math.max(prev.maxScore, prev.score),
          attempts: newAttempts,
          isGameOver: newAttempts === 0,
          // Reset for the next attempt
          snakeBody: [{ row: Math.floor(size / 2), col: Math.floor(size / 2) }],
          direction: 'right',
          score: 0,
        };
      }

      const ateFood = newHead.row === prev.food.row && newHead.col === prev.food.col;
      const newSnakeBody = [newHead, ...prev.snakeBody];
      if (!ateFood) {
        newSnakeBody.pop();
      }

      const newScore = ateFood ? prev.score + 1 : prev.score;
      if (newSnakeBody.length === size * size) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        return {
          ...prev,
          snakeBody: newSnakeBody,
          score: newScore,
          maxScore: Math.max(prev.maxScore, newScore),
          isGameRunning: false,
          isGameOver: true,
        };
      }

      return {
        ...prev,
        snakeBody: newSnakeBody,
        score: newScore,
        food: ateFood ? getNewFoodPosition(size, newSnakeBody) : prev.food,
      };
    });
  }, [size]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      const keyMap = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
      const newDirection = keyMap[e.key];
      if (!newDirection) return;

      setGame(prev => {
        if (!prev.isGameRunning) return prev;
        const opposite = { up: 'down', down: 'up', left: 'right', right: 'left' };
        if (prev.direction === opposite[newDirection]) return prev;
        return { ...prev, direction: newDirection };
      });
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Game loop manager
  useEffect(() => {
    if (game.isGameRunning) {
      intervalRef.current = setInterval(handleMove, 500);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [game.isGameRunning, handleMove]);
  
  // Effect to report attempt changes to parent
  useEffect(() => {
    onAttemptChange?.(game.attempts);
  }, [game.attempts, onAttemptChange]);
  
  const startGame = () => {
    setGame(prev => {
      const isFullReset = prev.isGameOver || prev.attempts === 0;
      if (isFullReset) {
        return { ...getInitialState(size), isGameRunning: true };
      }
      // This is a restart after losing a life
      return {
        ...prev,
        snakeBody: [{ row: Math.floor(size / 2), col: Math.floor(size / 2) }],
        direction: 'right',
        score: 0,
        isGameRunning: true,
      };
    });
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      {game.isGameOver ? (
        <div>
          <h2>Game Over!</h2>
          <p>Your maximum score was: {game.maxScore}</p>
        </div>
      ) : (
        <>
          <p>Score: {game.score}</p>
          <div style={{ display: 'inline-block', border: '2px solid black', marginTop: '10px' }}>
            {[...Array(size)].map((_, row) => (
              <div key={row} style={{ display: 'flex' }}>
                {[...Array(size)].map((_, col) => {
                  const isFood = game.food && game.food.row === row && game.food.col === col;
                  const isHead = game.snakeBody[0].row === row && game.snakeBody[0].col === col;
                  const isSnakeBody = game.snakeBody.slice(1).some(segment => segment.row === row && segment.col === col);
                  
                  let backgroundColor = '#f0f0f0';
                  if (isHead) backgroundColor = '#2ecc71';
                  else if (isSnakeBody) backgroundColor = '#27ae60';
                  else if (isFood) backgroundColor = '#e74c3c';

                  return (
                    <div
                      key={col}
                      style={{
                        width: '50px',
                        height: '50px',
                        backgroundColor,
                        border: '1px solid #ddd',
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </>
      )}
      <div>
        <button 
          onClick={game.isGameOver ? onNext : startGame} 
          style={{ margin: '10px' }}
        >
          {game.isGameOver ? 'Next' : (game.isGameRunning ? 'Restart' : 'Start Game')}
        </button>
      </div>
    </div>
  );
}