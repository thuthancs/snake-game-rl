import pygame
import sys

class GameVisualizer:
    def __init__(self, grid_size, cell_size=100):
        """Initialize pygame visualizer for snake game.
        
        Args:
            grid_size: Size of the game grid (n x n)
            cell_size: Size of each cell in pixels
        """
        pygame.init()
        self.grid_size = grid_size
        self.cell_size = cell_size
        self.width = grid_size * cell_size
        self.height = grid_size * cell_size + 60  # Extra space for stats
        
        self.screen = pygame.display.set_mode((self.width, self.height))
        pygame.display.set_caption("Snake Q-Learning Training")
        
        # Colors
        self.BLACK = (0, 0, 0)
        self.WHITE = (255, 255, 255)
        self.GREEN = (0, 255, 0)
        self.RED = (255, 0, 0)
        self.BLUE = (0, 100, 255)
        self.GRAY = (50, 50, 50)
        
        # Font
        self.font = pygame.font.Font(None, 28)
        self.small_font = pygame.font.Font(None, 22)
        
    def draw(self, game, episode, score, steps, epsilon):
        """Draw the current game state.
        
        Args:
            game: GameLogic instance
            episode: Current episode number
            score: Current score
            steps: Number of steps in current episode
            epsilon: Current exploration rate
        """
        # Handle pygame events
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
        
        # Clear screen
        self.screen.fill(self.BLACK)
        
        # Draw grid lines
        for i in range(self.grid_size + 1):
            pygame.draw.line(self.screen, self.GRAY, 
                           (0, i * self.cell_size), 
                           (self.width, i * self.cell_size), 1)
            pygame.draw.line(self.screen, self.GRAY, 
                           (i * self.cell_size, 0), 
                           (i * self.cell_size, self.width), 1)
        
        # Draw food
        food_r, food_c = game.GameEnvironment.food_pos
        pygame.draw.circle(self.screen, self.RED,
                          (food_c * self.cell_size + self.cell_size // 2,
                           food_r * self.cell_size + self.cell_size // 2),
                          self.cell_size // 3)
        
        # Draw snake
        for idx, (snake_r, snake_c) in enumerate(game.Snake.snake_positions):
            color = self.GREEN if idx == 0 else self.BLUE  # Head is green
            rect = pygame.Rect(snake_c * self.cell_size + 5,
                              snake_r * self.cell_size + 5,
                              self.cell_size - 10,
                              self.cell_size - 10)
            pygame.draw.rect(self.screen, color, rect, border_radius=8)
        
        # Draw stats at the bottom
        stats_y = self.width + 10
        episode_text = self.font.render(f"Episode: {episode}", True, self.WHITE)
        score_text = self.font.render(f"Score: {score}", True, self.WHITE)
        steps_text = self.small_font.render(f"Steps: {steps}", True, self.WHITE)
        epsilon_text = self.small_font.render(f"ε: {epsilon:.3f}", True, self.WHITE)
        
        self.screen.blit(episode_text, (10, stats_y))
        self.screen.blit(score_text, (10, stats_y + 28))
        self.screen.blit(steps_text, (self.width - 100, stats_y))
        self.screen.blit(epsilon_text, (self.width - 100, stats_y + 28))
        
        pygame.display.flip()
    
    def close(self):
        """Close the pygame window."""
        pygame.quit()

