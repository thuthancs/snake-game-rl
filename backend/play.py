import time
import pickle
from q_learning.q_learning_agent import QLearningAgent
from game_logic import GameLogic
from visualizer import GameVisualizer
from q_learning.get_game_state import get_state_representation, get_current_direction, get_direction


actions = ["turn_left", "go_straight", "turn_right", "turn_around"]


def main():
    # Load trained Q-table
    with open('trained_q_table.pkl', 'rb') as f:
        q_table = pickle.load(f)

    try:
        sample_state = next(iter(q_table.keys()))
        
        # Compute grid size from any coord in state
        coords = [sample_state[0]] + list(sample_state[2]) + [sample_state[3]]
        max_rc = max(max(r, c) for r, c in coords)
        grid_size = max_rc + 1
        
    except StopIteration:
        grid_size = 3

    agent = QLearningAgent(
        actions=actions,
        learning_rate=0.0,  # not used in play
        epsilon=0.0,        # greedy play
        grid_size=grid_size,
        num_episodes=1,
    )
    agent.q_table = q_table

    visualizer = GameVisualizer(grid_size=grid_size, cell_size=100)

    game = GameLogic(grid_size)
    game.place_food()

    steps = 0
    while True:
        steps += 1
        visualizer.draw(game, 0, game.GameEnvironment.score, steps, 0.0)
        time.sleep(0.1)

        state = get_state_representation(game)
        
        # Greedy action selection from Q-table
        action_values = agent.q_table.get(state, {})
        if not action_values:
            action = agent.choose_action(state, epsilon=0.0)
        else:
            max_q = max(action_values.values())
            best_actions = [a for a, q in action_values.items() if q == max_q]
            action = best_actions[0]

        current_dir = get_current_direction(game.Snake.snake_positions)
        direction = get_direction(action, current_dir)

        try:
            game.move(direction)
        except Exception:
            break

    time.sleep(1)
    visualizer.close()


if __name__ == "__main__":
    main()


