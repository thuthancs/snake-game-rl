import random

class QLearningAlgorithm:
    def __init__(self, learning_rate: float, grid_size: int):
        self.q_table = {}
        self.learning_rate = learning_rate
        self.actions = ['turn_left', 'go_straight', 'turn_right']
        self.grid_size = grid_size
    
    def set_q_table(self):
        """Initialize the Q-table with default values."""
        HEAD_POSITIONS = [(x, y) for x in range(self.grid_size) for y in range(self.grid_size)]
        FOOD_POSITIONS = [(x, y) for x in range(self.grid_size) for y in range(self.grid_size)]
        
        def backtrack(head_position, 
                      head_direction, 
                      current_position,
                      body_so_far, 
                      remaining_length, 
                      food_position):
            
            directions = [(-1, 0), (1, 0), (0, -1), (0, 1)] 
            if remaining_length == 1:
                self.q_table[(head_position, head_direction, tuple(body_so_far), food_position)] = {action: 0.0 for action in self.actions}
                return
            else:
                if len(body_so_far) == 1:
                    if head_direction == "upward":
                        next_position = (current_position[0] + 1, current_position[1])  # Go DOWN/SOUTH
                    elif head_direction == 'downward':
                        next_position = (current_position[0] - 1, current_position[1])  # Go UP/NORTH
                    elif head_direction == 'rightward':
                        next_position = (current_position[0], current_position[1] - 1)
                    elif head_direction == 'leftward':
                        next_position = (current_position[0], current_position[1] + 1)
                        
                    if (0 <= next_position[0] < self.grid_size) \
                        and (0 <= next_position[1] < self.grid_size) \
                        and (next_position not in body_so_far) \
                        and (food_position != next_position):
                            
                        new_body = body_so_far + [next_position]
                        backtrack(head_position, head_direction, next_position, new_body, remaining_length - 1, food_position, self.q_table)
                else:
                    for dx, dy in directions:
                        next_position = (current_position[0] + dx, current_position[1] + dy)
                        
                        if (0 <= next_position[0] < self.grid_size) \
                            and (0 <= next_position[1] < self.grid_size) \
                            and (next_position not in body_so_far) \
                            and (food_position != next_position):
                                
                            new_body = body_so_far + [next_position]
                            backtrack(head_position, head_direction, next_position, new_body, remaining_length - 1, food_position, self.q_table)
        
        for head_pos in HEAD_POSITIONS:
            for head_dir in ['upward', 'downward', 'rightward', 'leftward']:
                for food_pos in FOOD_POSITIONS:
                    for length in range(1, self.grid_size * self.grid_size + 1):
                        if food_pos != head_pos:
                            backtrack(head_pos, head_dir, head_pos, [head_pos], length, food_pos)
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