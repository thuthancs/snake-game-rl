import time
import pickle
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


def get_current_direction(snake_positions):
    if len(snake_positions) < 2:
        return 'rightward'
    head, neck = snake_positions[0], snake_positions[1]
    dr, dc = head[0] - neck[0], head[1] - neck[1]
    if dr == -1: return 'upward'
    if dr == 1: return 'downward'
    if dc == 1: return 'rightward'
    return 'leftward'


def get_state_representation(game):
    head_pos = game.Snake.snake_positions[0]
    head_dir = get_current_direction(game.Snake.snake_positions)
    body_tuple = tuple(sorted(game.Snake.snake_positions))
    food_pos = game.GameEnvironment.food_pos
    return (head_pos, head_dir, body_tuple, food_pos)


def get_direction(action, current_direction):
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


def main():
    # Load trained Q-table
    with open('trained_q_table.pkl', 'rb') as f:
        q_table = pickle.load(f)

    # Infer grid size from any state in the table if needed; otherwise set manually
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


