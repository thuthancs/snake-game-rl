import { useEffect, useRef, useState } from 'react';

// Direction constants matching backend (row, column) format
const DOWN = [1, 0];   // row increases downward
const UP = [-1, 0];    // row decreases upward  
const LEFT = [0, -1];  // column decreases
const RIGHT = [0, 1];  // column increases

export default function SnakeGame({ gridSize, onNext, onGameOver, attemptsLeft }) {
    const canvasRef = useRef(null);
    const [gameStarted, setGameStarted] = useState(false);
    // Snake positions in (row, column) format, starting at (1, 1) like backend
    const [snake, setSnake] = useState([[1, 1]]);
    const [direction, setDirection] = useState(DOWN);
    // Food position in (row, column) format, initially at center like backend
    const [food, setFood] = useState([Math.floor(gridSize / 2), Math.floor(gridSize / 2)]);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const gameLoopRef = useRef(null);
    const directionRef = useRef(DOWN);
    const gameOverCalledRef = useRef(false);

    const CELL_SIZE = 50;
    const CANVAS_SIZE = CELL_SIZE * gridSize;

    // Place food at random position not occupied by snake (matching backend)
    const placeFood = (currentSnake) => {
        const empty = [];
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                // Check if position is not in snake
                if (!currentSnake.some(pos => pos[0] === r && pos[1] === c)) {
                    empty.push([r, c]);
                }
            }
        }
        return empty[Math.floor(Math.random() * empty.length)];
    };

    // Draw game
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Clear canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        // Draw grid
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        for (let i = 0; i <= gridSize; i++) {
            ctx.beginPath();
            ctx.moveTo(i * CELL_SIZE, 0);
            ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, i * CELL_SIZE);
            ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
            ctx.stroke();
        }

        // Draw snake (convert row, column to canvas x, y)
        ctx.fillStyle = '#213547';
        snake.forEach((segment, index) => {
            const [row, col] = segment;
            ctx.fillRect(
                col * CELL_SIZE + 2,
                row * CELL_SIZE + 2,
                CELL_SIZE - 4,
                CELL_SIZE - 4
            );

            // Draw eyes on head
            if (index === 0) {
                ctx.fillStyle = '#ffffff';
                const eyeSize = 4;
                const eyeOffset = 10;
                ctx.fillRect(col * CELL_SIZE + eyeOffset, row * CELL_SIZE + eyeOffset, eyeSize, eyeSize);
                ctx.fillRect(col * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, row * CELL_SIZE + eyeOffset, eyeSize, eyeSize);
                ctx.fillStyle = '#213547';
            }
        });

        // Draw food (convert row, column to canvas x, y)
        if (food) {
            const [foodRow, foodCol] = food;
            ctx.fillStyle = '#646cff';
            ctx.beginPath();
            ctx.arc(
                foodCol * CELL_SIZE + CELL_SIZE / 2,
                foodRow * CELL_SIZE + CELL_SIZE / 2,
                CELL_SIZE / 3,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    }, [snake, food, gridSize]);

    // Game loop - matches backend move() logic exactly
    useEffect(() => {
        if (!gameStarted || gameOver) return;

        const moveSnake = () => {
            setSnake(prevSnake => {
                // Get the snake's head position (row, column)
                const head = prevSnake[0];
                const dir = directionRef.current;

                // Calculate the new head position based on the direction
                const newHead = [head[0] + dir[0], head[1] + dir[1]];

                // Check self-collision (with body, not head)
                if (prevSnake.slice(1).some(pos => pos[0] === newHead[0] && pos[1] === newHead[1])) {
                    setGameOver(true);
                    if (onGameOver && !gameOverCalledRef.current) {
                        gameOverCalledRef.current = true;
                        onGameOver(prevSnake.length - 1);
                    }
                    return prevSnake;
                }

                // Check wall-collision
                if (!(newHead[0] >= 0 && newHead[0] < gridSize && newHead[1] >= 0 && newHead[1] < gridSize)) {
                    setGameOver(true);
                    if (onGameOver && !gameOverCalledRef.current) {
                        gameOverCalledRef.current = true;
                        onGameOver(prevSnake.length - 1);
                    }
                    return prevSnake;
                }

                // Add the new head position to the snake's positions
                const newSnake = [newHead, ...prevSnake];

                // Check if the snake has eaten food
                if (newHead[0] === food[0] && newHead[1] === food[1]) {
                    setScore(prev => prev + 1);
                    setFood(placeFood(newSnake));
                    // Keep tail (snake grows) - don't pop
                    return newSnake;
                }

                // If the snake has not eaten food, remove the last position
                newSnake.pop();

                return newSnake;
            });
        };

        gameLoopRef.current = setInterval(moveSnake, 400);

        return () => {
            if (gameLoopRef.current) {
                clearInterval(gameLoopRef.current);
            }
        };
    }, [gameStarted, gameOver, food, gridSize]);

    // Handle keyboard input
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (!gameStarted || gameOver) return;

            const key = e.key;
            const currentDir = directionRef.current;

            switch (key) {
                case 'ArrowUp':
                    // Can only turn up if not currently moving vertically
                    if (currentDir[0] === 0) {
                        directionRef.current = UP;
                        setDirection(UP);
                    }
                    break;
                case 'ArrowDown':
                    // Can only turn down if not currently moving vertically
                    if (currentDir[0] === 0) {
                        directionRef.current = DOWN;
                        setDirection(DOWN);
                    }
                    break;
                case 'ArrowLeft':
                    // Can only turn left if not currently moving horizontally
                    if (currentDir[1] === 0) {
                        directionRef.current = LEFT;
                        setDirection(LEFT);
                    }
                    break;
                case 'ArrowRight':
                    // Can only turn right if not currently moving horizontally
                    if (currentDir[1] === 0) {
                        directionRef.current = RIGHT;
                        setDirection(RIGHT);
                    }
                    break;
            }
            e.preventDefault();
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [gameStarted, gameOver]);

    const startGame = () => {
        setGameStarted(true);
        setGameOver(false);
        // Start at position (1, 1) like backend
        const initialSnake = [[1, 1]];
        setSnake(initialSnake);
        // Start moving down like backend default
        setDirection(DOWN);
        directionRef.current = DOWN;
        gameOverCalledRef.current = false;
        setScore(0);
        // Place food at center initially
        const initialFood = [Math.floor(gridSize / 2), Math.floor(gridSize / 2)];
        setFood(initialFood);
    };

    return (
        <div className="snake-game">
            <canvas
                ref={canvasRef}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                style={{
                    border: '2px solid #213547',
                    borderRadius: '8px',
                    marginTop: '1rem'
                }}
            />

            <div className="game-controls">
                {!gameStarted ? (
                    <div>
                        <button onClick={startGame}>Start</button>
                    </div>
                ) : gameOver ? (
                    <div className="game-over">
                        <p>Final Score: {score}</p>
                        <div className="grid-buttons">
                            {attemptsLeft > 0 ? (
                                <button onClick={startGame}>Play Again</button>
                            ) : null}
                            <button onClick={onNext}>Next</button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Score: {Math.floor(score / 2)}</p>
                        <p style={{ fontSize: '0.9rem', color: '#666' }}>Use arrow keys to move</p>
                    </div>
                )}
            </div>
        </div>
    );
}