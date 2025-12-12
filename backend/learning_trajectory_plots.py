import random
from typing import List, Dict

import matplotlib.pyplot as plt
from tqdm import tqdm

from q_learning.q_learning_agent import QLearningAgent
from q_learning.get_game_state import (
    get_state_representation,
    get_current_direction,
    get_direction,
)
from game_logic import GameLogic


# Hyperparameters
ACTIONS = ["turn_left", "go_straight", "turn_right", "turn_around"]
LEARNING_RATE = 0.2
GRID_SIZE = 4
NUM_EPISODES = 20000
MAX_STEPS_PER_EPISODE = 200

# Moving-average window for smoothing the curves
MOVING_AVG_WINDOW = 50

def run_training(
    train_epsilon: float,
    num_episodes: int = NUM_EPISODES,
    grid_size: int = GRID_SIZE,
    learning_rate: float = LEARNING_RATE,
) -> List[float]:
    """
    Train a fresh Q-learning agent for a given training epsilon and,
    after each training episode, run a separate evaluation episode
    with epsilon = 0.0. Returns the per-episode evaluation scores
    over num_episodes.

    This mirrors the logic in train.py but without visualization or Q-table I/O.
    Training uses epsilon = train_epsilon, evaluation uses epsilon = 0.0
    (pure exploitation of the learned Q-table).
    """
    agent = QLearningAgent(
        actions=ACTIONS,
        learning_rate=learning_rate,
        epsilon=train_epsilon,
        grid_size=grid_size,
        num_episodes=num_episodes,
    )

    # Start from a fresh Q-table for each training run
    agent.set_q_table()

    eval_scores: List[float] = []

    for episode in tqdm(
        range(num_episodes), desc=f"Training (epsilon={train_epsilon})"
    ):
        # -------- Training episode (epsilon = train_epsilon) --------
        game = GameLogic(grid_size=agent.grid_size)
        game.place_food()

        steps = 0
        while True:
            steps += 1
            current_state = get_state_representation(game)
            action = agent.choose_action(current_state, train_epsilon)
            current_dir = get_current_direction(game.Snake.snake_positions)
            direction = get_direction(action, current_dir)

            try:
                old_score = game.GameEnvironment.score
                game.move(direction)
                new_score = game.GameEnvironment.score

                # Reward structure consistent with train.py
                if new_score > old_score:
                    reward = 10  # Ate food
                else:
                    reward = -0.1  # Normal step

                next_state = get_state_representation(game)

            except Exception as e:
                if "Wall" in str(e):
                    reward = -10
                elif "Self" in str(e):
                    reward = -10
                else:
                    reward = -10

                next_state = current_state  # Terminal state
                agent.update_q_value(current_state, action, reward, next_state)
                break

            # Update Q-value for non-terminal transition
            agent.update_q_value(current_state, action, reward, next_state)

            if steps >= MAX_STEPS_PER_EPISODE:
                break

        # -------- Evaluation episode (epsilon = 0.0, pure exploitation) --------
        eval_game = GameLogic(grid_size=agent.grid_size)
        eval_game.place_food()

        eval_steps = 0
        while True:
            eval_steps += 1
            eval_state = get_state_representation(eval_game)
            eval_action = agent.choose_action(eval_state, 0.0)
            eval_current_dir = get_current_direction(eval_game.Snake.snake_positions)
            eval_direction = get_direction(eval_action, eval_current_dir)

            try:
                eval_game.move(eval_direction)
            except Exception:
                # Game over; record evaluation score and stop this eval episode
                break

            if eval_steps >= MAX_STEPS_PER_EPISODE:
                break

        eval_scores.append(eval_game.GameEnvironment.score)

    return eval_scores


def moving_average(values: List[float], window_size: int) -> List[float]:
    """
    Compute a simple moving average over the given values.
    The output list has the same length as the input list.
    """
    if not values or window_size <= 1:
        return values

    averaged: List[float] = []
    cumulative_sum = 0.0

    for i, v in enumerate(values):
        cumulative_sum += v
        if i >= window_size:
            cumulative_sum -= values[i - window_size]
            averaged.append(cumulative_sum / window_size)
        else:
            averaged.append(cumulative_sum / (i + 1))

    return averaged


def plot_learning_trajectories(results: Dict[str, List[float]]) -> None:
    """
    Plot smoothed average score per episode for each epsilon regime.
    """
    episodes = list(range(1, NUM_EPISODES + 1))

    plt.figure(figsize=(10, 6))

    for label, scores in results.items():
        smoothed = moving_average(scores, MOVING_AVG_WINDOW)
        plt.plot(episodes, smoothed, label=label)

    plt.xlabel("Episode")
    plt.ylabel("Average score per episode (moving average)")
    plt.title(
        f"Snake Q-learning: Learning trajectories over {NUM_EPISODES} episodes\n"
        f"(window size = {MOVING_AVG_WINDOW})"
    )
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig("learning_trajectories.png", dpi=200)
    # Uncomment the next line if you want an interactive window when running locally
    # plt.show()


def main() -> None:
    # Make runs reproducible
    random.seed(42)

    epsilon_configs = {
        "Pure exploitation (epsilon=0.0)": 0.0,
        "Pure exploration (epsilon=1.0)": 1.0,
        "Mixed (epsilon=0.1)": 0.1,
    }

    results: Dict[str, List[float]] = {}

    for label, eps in epsilon_configs.items():
        scores = run_training(train_epsilon=eps, num_episodes=NUM_EPISODES)
        results[label] = scores

    plot_learning_trajectories(results)


if __name__ == "__main__":
    main()


