import { useState } from 'react';

DIRECTIONS = ["up", "down", "left", "right"]

export default function SnakeGame(size) {
    // Initialize the game environment as a 2D array filled with empty objects
	const [gameEnv, setGameEnv] = useState([...Array(size)].map(() => Array(size).fill({})));

    // Initialize the game state with 4 key-value pairs
    const [gameState, setGameState] = useState({
        snakeHead: (null, null),
        snakeHeadDirection: null,
        snakeBodySegment: [],
        foodPosition: (null, null)
    })

    // Keep track of the score and attempts
    const [score, setScore] = useState(0)
    const [attempt, setAttempt] = useState(3)
    
    // Function to handle food placement
    const handleFoodPlacement = () => {
        // Filter all the cells that are not occupied by the snake
        const cellsToPlaceFood = gameEnv.filter(cell => cell == {})

        // Get a random row index
        const randomRowIndex = Math.floor(Math.random() * gameEnv.length);

        // Get a random column index within that row
        const randomColumnIndex = Math.floor(Math.random() * gameEnv[randomRowIndex].length);
        
        // Select a random cell from the valid empty cells
        const randomCell = cellsToPlaceFood[randomRowIndex][randomColumnIndex];

        // Update the game state with the new food position
        setGameState({
            ...gameState,
            foodPosition: randomCell
        })
    }
    
    const handleScoreChange = (gameState) => {
        if (gameState.snakeHead == foodPosition) {
            setScore(score + 1) 
        }
    }
    
    const handleChange = () => {
        // How can we define the keyboard controller?
        const newGameState = [...gameState]

        // If the head is in the new position (when the snake eats the food and when it's just pure movement)
        const newHeadPosition = (newRow, newCol)
        newGameState.snakeHead = newHeadPosition
        newGameState.snakeHeadDirection = newDirection
        snakeBodySegment.unshift(newHeadPosition)
        
        // If the snake does not eat food, remove the tail
        if (newGameState.snakeHead != gameState.foodPosition) {
            snakeBodySegment.pop()
        }
        
        // Check for edge collision and self-collision
        if (newRow >= size or newRow < 0) {
            gameOver()
        } else if (newCol >= size or newCol < 0) {
            gameOver()
        } else if ((newRow, newCol) in gameState.snakeBodySegment) {
            gameOver()
        }
        // Define the function to trigger the state change of the game
        setGameState(newGameState)
        setGameEnv([...gameEnv, newGameState])
    }
    
    return (
        <>
                /*Render the 2D grid*/
        </>
    )
}