import time
import pickle
from tqdm import tqdm
from q_learning.q_learning_agent import QLearningAgent
from game_logic import GameLogic
from visualizer import GameVisualizer
from q_learning.get_game_state import get_state_representation, get_current_direction, get_direction

actions = ["turn_left", "go_straight", "turn_right", "turn_around"]

LEARNING_RATE = 0.2
EPSILON = 0.1
GRID_SIZE = 3
NUM_EPISODES = 1000

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

VISUALIZE = True
FRAME_DELAY = 0.1  # Seconds between frames (lower = faster)
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
                reward = 10  # The agent ate food
            else:
                reward = -0.1  # Normal step without collision
            
            next_state = get_state_representation(game)
            
        except Exception as e:
            if "Wall" in str(e):
                reward = -10
            elif "Self" in str(e):
                reward = -10
            
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
print("\nClose the pygame window to exit.")
time.sleep(3)
visualizer.close()
