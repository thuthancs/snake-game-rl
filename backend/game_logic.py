import random
import os

class Snake:
    def __init__(self, initial_length = 1) -> None:
        """Define the snake's properties
        
        Args:
            initial_length (int): the initial length of the snake
            
        Return: None
        """
        self.length = initial_length
        
        # whether the snake has just eaten food
        self.just_ate_food = False
        
        # the snake's initial position - its head and tail are at the same cell
        self.snake_positions = [(1, 1)]
  
class GameEnvironment:
    def __init__(self, size: int, initial_length = 1) -> None:
        """Define the game environment's properties
        
        Args:
            size (int): the size of the n x n grid (square matrix)
            initial_length (int): the initial length of the snake
            score (int): the score of the game
            grid (list): the n x n grid representing the game environment
            
        Return: None
        """
        self.length = initial_length
        self.size = size
        self.score = 0
        
        # create an n x n grid initialized with 0 values
        self.grid = [[0] * size for _ in range(size)]
        
        # place the food (value = 1) in the central cell initially
        self.food_pos = (size // 2, size // 2)

class GameLogic():
    # make sure that the down is 1 and up is -1 for the row index
    DOWN = (1, 0)
    UP = (-1, 0)
    LEFT = (0, -1)
    RIGHT = (0, 1)
    
    def __init__(self, size, score_history = []) -> None:
        """Define the game logic's properties
        
        Args:
            GameEnvironment (GameEnvironment): the game environment
            Snake (Snake): the snake
            directions (list): the possible directions the snake can move
        """
        self.GameEnvironment = GameEnvironment(size)
        self.Snake = Snake()
        self.directions = [self.DOWN, self.UP, self.LEFT, self.RIGHT]
        self.highest_score = self.load_high_score()

    def load_high_score(self):
        if os.path.exists("highscore.txt"):
            with open("highscore.txt", "r") as f:
                try:
                    return int(f.read().strip())
                except ValueError:
                    return 0
        return 0

    def save_high_score(self):
        if self.GameEnvironment.score > self.highest_score:
            self.highest_score = self.GameEnvironment.score
            with open("highscore.txt", "w") as f:
                f.write(str(self.highest_score))
    
    def place_food(self):
        # place food at a random position in the grid where the snake is not located
        empty = [
            (r, c)
            for r in range(self.GameEnvironment.size)
            for c in range(self.GameEnvironment.size)
            if (r, c) not in self.Snake.snake_positions
        ]
        self.GameEnvironment.food_pos = random.choice(empty)
        
    def move(self, direction):
        # get the snake's head position (row, column)
        head = self.Snake.snake_positions[0]
        
        # calculate the new head position based on the direction
        new_head = (head[0] + direction[0], head[1] + direction[1])
        
        # check self-collision
        if new_head in self.Snake.snake_positions[1:]:
            raise Exception("Game Over: Self-collision")
        
        # check wall-collision
        if not (0 <= new_head[0] < self.GameEnvironment.size and 0 <= new_head[1] < self.GameEnvironment.size):
            raise Exception("Game Over: Wall-collision")
        
        # add the new head position to the snake's positions
        self.Snake.snake_positions.insert(0, new_head)
        
        # check if the snake has eaten food
        if new_head == self.GameEnvironment.food_pos:
            self.Snake.just_ate_food = True
            self.GameEnvironment.score += 1
            self.place_food()
        
        # if the snake has not just eaten food, remove the last position
        if not self.Snake.just_ate_food:
            self.Snake.snake_positions.pop()
        else:
            self.Snake.just_ate_food = False
            
    def stop_game(self) -> int:
        """Stop the game and return the score
        
        Args: None
        
        Return: int: the score of the game
        """
        # update the highest score
        self.save_high_score()
        return self.GameEnvironment.score
    
    def get_state(self):
        return {
            "snake": self.Snake.snake_positions,
            "food": self.GameEnvironment.food_pos,
            "score": self.GameEnvironment.score,
            "grid_size": self.GameEnvironment.size
        }

    def render(self):
        size = self.GameEnvironment.size
        grid = [['.'] * size for _ in range(size)]
        
        for r, c in self.Snake.snake_positions:
            grid[r][c] = 'S'
            
        fr, fc = self.GameEnvironment.food_pos
        grid[fr][fc] = 'F'
        
        for row in grid:
            print(' '.join(row))
        print()