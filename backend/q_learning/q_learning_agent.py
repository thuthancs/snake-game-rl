import random
from typing import Dict, Tuple
from .generate_game_states import generate_all_valid_states


class QLearningAgent:
    REWARD_FOOD = 10
    REWARD_DEATH = -10
    REWARD_STEP = 0
    
    def __init__(self, 
                 actions: list,
                 learning_rate: float,
                 epsilon: float,
                 grid_size: int,
                 num_episodes: int):
        """Define the attributes of the learning agent

        Args:
            actions (list): a list of possible actions
            learning_rate (float): how much to update the q-values at each step
            epsilon (float): the probability of choosing a random action (exploration)
            grid_size (int): the size of the game grid
            num_episodes (int): the number of training episodes
        
        Returns: None
        """
        self.q_table = {}
        self.learning_rate = learning_rate
        self.epsilon = epsilon
        self.actions = actions
        self.grid_size = grid_size
        self.num_episodes = num_episodes
    
    def set_q_table(self) -> Dict:
        # Initialize the Q-table with all valid game states.
        self.q_table = generate_all_valid_states(self.grid_size, self.actions)
        
        # Create a Q-table with all the state-action pairs initialized to 0.0
        for action in self.actions:
            for state in self.q_table:
                self.q_table[state][action] = 0.0
        return self.q_table
    
    def get_q_value(self, state: Tuple, action: str) -> float:
        return self.q_table.get(state, {}).get(action, 0.0)
    
    def choose_action(self, state: Tuple, epsilon: float) -> str:
        # Epsilon-greedy action selection
        if random.uniform(0,1) < epsilon:
            return random.choice(self.actions)
        else:
            # Get all the q-values (state-action) for the current state
            state_actions = self.q_table.get(state, {})
            
            # Select the action with the highest q-value
            max_q = max(state_actions.values(), default=0.0)
            
            # In case of multiple actions with the same max q-value, choose randomly among them
            best_actions = [action for action, q in state_actions.items() if q == max_q]
            return random.choice(best_actions) if best_actions else random.choice(self.actions)
    
    def update_q_value(self, state: Tuple, action: str, reward: int, next_state: Tuple) -> float:
        """Update the Q-value for a given state-action pair based on the received reward and the maximum future Q-value.
        
        Args:
            state (Tuple): the current state
            action (str): the action taken
            reward (int): the reward received after taking the action
            next_state (Tuple): the state resulting from taking the action
        """
        # Initialize state in Q-table if not present
        if state not in self.q_table:
            self.q_table[state] = {a: 0.0 for a in self.actions}
        
        current_q_value = self.get_q_value(state, action)
        max_future_q = max(self.q_table.get(next_state, {}).values(), default=0.0)
    
        # Q-learning formula
        new_q_value = current_q_value + self.learning_rate * (reward + max_future_q - current_q_value)
        
        # Update the Q-table
        self.q_table[state][action] = new_q_value
        
        return self.q_table[state][action]
        
        
        