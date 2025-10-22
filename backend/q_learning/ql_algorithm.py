import random
from typing import Dict
from .generate_game_states import generate_all_valid_states


class QLearningAlgorithm:
    def __init__(self, learning_rate: float, grid_size: int):
        self.q_table = {}
        self.learning_rate = learning_rate
        self.actions = ['turn_left', 'go_straight', 'turn_right']
        self.grid_size = grid_size
    
    def set_q_table(self) -> Dict:
        # Initialize the Q-table with all valid game states.
        self.q_table = generate_all_valid_states(self.grid_size, self.actions)
        return self.q_table
    
    def get_q_value(self, state, action):
        return self.q_table.get(state, {}).get(action, 0.0)
    
    def choose_action(self, state, epsilon: float):
        for action in self.actions:
            if (state not in self.q_table) or (action not in self.q_table[state]):
                return action
        if random.random() < epsilon:
            return random.choice(self.actions)
        else:
            return max(self.q_table[state], key=self.q_table[state].get())
    
    def update_q_value(self):
        pass
    
    def save_q_table(self, filename: str):
        pass
    
    def load_q_table(self, filename: str):
        pass