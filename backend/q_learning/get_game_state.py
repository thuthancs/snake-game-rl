DIRECTIONS = {
    'upward': (-1, 0),
    'downward': (1, 0),
    'leftward': (0, -1),
    'rightward': (0, 1)
}

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