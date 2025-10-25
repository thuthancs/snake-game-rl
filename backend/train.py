import time
import pickle
from tqdm import tqdm
from q_learning.q_learning_agent import QLearningAgent
from game_logic import GameLogic
from visualizer import GameVisualizer

actions = ["turn_left", "go_straight", "turn_right", "turn_around"]

DIRECTIONS = {
    'upward': (-1, 0),
    'downward': (1, 0),
    'leftward': (0, -1),
    'rightward': (0, 1)
}
LEARNING_RATE = 0.2
EPSILON = 0.1
GRID_SIZE = 3
NUM_EPISODES = 1000


def get_current_direction(snake_positions):
    """Determine snake's current direction from head and neck position."""
    if len(snake_positions) < 2:
        return 'rightward'  # Default
    
    head, neck = snake_positions[0], snake_positions[1]
    dr, dc = head[0] - neck[0], head[1] - neck[1]
    
    if dr == -1: return 'upward'
    if dr == 1: return 'downward'
    if dc == 1: return 'rightward'
    return 'leftward'

def get_state_representation(game):
    """Convert GameLogic to state tuple: (head_pos, head_dir, body_tuple, food_pos)."""
    head_pos = game.Snake.snake_positions[0]
    head_dir = get_current_direction(game.Snake.snake_positions)
    
    body_tuple = tuple(sorted(game.Snake.snake_positions))
    food_pos = game.GameEnvironment.food_pos
    
    return (head_pos, head_dir, body_tuple, food_pos)

def get_direction(action, current_direction):
    """Convert relative action to absolute direction tuple."""
    turns = {
        'upward': {
            'turn_left': 'leftward',
            'go_straight': 'upward',
            'turn_right': 'rightward',
            'turn_around': 'downward',
        },
        'downward': {
            'turn_left': 'rightward',
            'go_straight': 'downward',
            'turn_right': 'leftward',
            'turn_around': 'upward',
        },
        'leftward': {
            'turn_left': 'downward',
            'go_straight': 'leftward',
            'turn_right': 'upward',
            'turn_around': 'rightward',
        },
        'rightward': {
            'turn_left': 'upward',
            'go_straight': 'rightward',
            'turn_right': 'downward',
            'turn_around': 'leftward',
        },
    }
    new_dir = turns[current_direction][action]
    return DIRECTIONS[new_dir]

agent = QLearningAgent(actions=actions,
                       learning_rate=LEARNING_RATE, 
                       epsilon=EPSILON,
                       grid_size=GRID_SIZE, 
                       num_episodes=NUM_EPISODES)

# Load existing Q-table if available to continue training; otherwise initialize a new one
try:
    with open('trained_q_table.pkl', 'rb') as f:
        agent.q_table = pickle.load(f)
        print(f"Loaded existing Q-table with {len(agent.q_table)} states. Continuing training for {agent.num_episodes} episodes...")
except FileNotFoundError:
    agent.set_q_table()
    print(f"Initialized new Q-table with {len(agent.q_table)} states. Training for {agent.num_episodes} episodes...")

# Initialize visualizer
VISUALIZE = True  # Set to False to train without visualization
FRAME_DELAY = 0.1  # Seconds between frames (lower = faster)

if VISUALIZE:
    visualizer = GameVisualizer(grid_size=agent.grid_size, cell_size=100)

# Track training progress
scores = []
steps_per_episode = []

for episode in tqdm(range(agent.num_episodes)):
    game = GameLogic(grid_size=agent.grid_size)
    game.place_food()
    steps = 0
    
    while True:
        steps += 1
        
        # Visualize current state
        if VISUALIZE:
            visualizer.draw(game, episode + 1, game.GameEnvironment.score, steps, agent.epsilon)
            time.sleep(FRAME_DELAY)
        current_state = get_state_representation(game)
        action = agent.choose_action(current_state, agent.epsilon)
        current_dir = get_current_direction(game.Snake.snake_positions)
        direction = get_direction(action, current_dir)
        
        # Take action and get reward
        try:
            old_score = game.GameEnvironment.score
            game.move(direction)
            new_score = game.GameEnvironment.score
            
            # Determine reward
            if new_score > old_score:
                reward = 10  # Ate food
            else:
                reward = -0.1  # Normal step
            
            next_state = get_state_representation(game)
            
        except Exception as e:
            # Game over (wall or self collision)
            if "Wall" in str(e):
                reward = -10  # Hit wall
            elif "Self" in str(e):
                reward = -10  # Hit self
            
            next_state = current_state  # Terminal state
            agent.update_q_value(current_state, action, reward, next_state)
            break
        
        # Update Q-value
        agent.update_q_value(current_state, action, reward, next_state)
    
    # Record episode results
    scores.append(game.GameEnvironment.score)
    steps_per_episode.append(steps)
    
    # Print progress every 100 episodes
    if (episode + 1) % 100 == 0:
        avg_score = sum(scores[-100:]) / min(100, len(scores))
        highest_score = max(scores[-100:])
        avg_steps = sum(steps_per_episode[-100:]) / min(100, len(steps_per_episode))
        print(f"Episode {episode + 1}/{agent.num_episodes} | Avg Score: {avg_score:.2f} | Highest Score: {highest_score} | Avg Steps: {avg_steps:.1f}")

print("\n=== Training Complete ===")
print(f"Total Episodes: {agent.num_episodes}")
print(f"Final Avg Score (last 100): {sum(scores[-100:]) / min(100, len(scores)):.2f}")
print(f"Best Score: {max(scores)}")

print("\nSaving Q-table...")
with open('trained_q_table.pkl', 'wb') as f:
    pickle.dump(agent.q_table, f)
print(f"Q-table saved! ({len(agent.q_table)} states)")

if VISUALIZE:
    print("\nClose the pygame window to exit.")
    time.sleep(3)
    visualizer.close()
