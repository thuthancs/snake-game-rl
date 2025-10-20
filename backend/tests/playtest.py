import pygame
from time import sleep
from game_logic import GameLogic

pygame.init()

CELL_SIZE = 20 # size of each cell
FPS = 5        # snake speed (frames per second)

# initialize game
SIZE = 30
game = GameLogic(SIZE)
screen = pygame.display.set_mode((CELL_SIZE*SIZE, CELL_SIZE*SIZE))
pygame.display.set_caption("Snake Logic Test")

# colors
BG_COLOR = (0, 0, 0)
SNAKE_COLOR = (0, 255, 0)
FOOD_COLOR = (255, 0, 0)

# initial direction
direction = game.RIGHT

running = True
clock = pygame.time.Clock()
history = []

while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_UP:
                direction = game.UP
            elif event.key == pygame.K_DOWN:
                direction = game.DOWN
            elif event.key == pygame.K_LEFT:
                direction = game.LEFT
            elif event.key == pygame.K_RIGHT:
                direction = game.RIGHT

    try:
        game.move(direction)
    except Exception as e:
        print(e)
        print("Final score:", game.stop_game())
        print("Highest score:", game.highest_score)
        sleep(2)
        running = False

    # render
    screen.fill(BG_COLOR)

    # draw snake
    for r, c in game.Snake.snake_positions:
        pygame.draw.rect(screen, SNAKE_COLOR, (c*CELL_SIZE, r*CELL_SIZE, CELL_SIZE, CELL_SIZE))

    # draw food
    fr, fc = game.GameEnvironment.food_pos
    pygame.draw.rect(screen, FOOD_COLOR, (fc*CELL_SIZE, fr*CELL_SIZE, CELL_SIZE, CELL_SIZE))

    pygame.display.flip()
    clock.tick(FPS)

pygame.quit()
