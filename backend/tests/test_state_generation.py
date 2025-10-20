from typing import Dict

GRID_SIZE = 3
HEAD_DIRECTIONS = ['upward', 'downward', 'rightward', 'leftward']
HEAD_POSITIONS = [(x, y) for x in range(GRID_SIZE) for y in range(GRID_SIZE)]
FOOD_POSITIONS = [(x, y) for x in range(GRID_SIZE) for y in range(GRID_SIZE)]

def helper(head_position, 
           head_direction, 
           current_position,
           body_so_far,
           remaining_length, 
           food_position,
           game_states):
    
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)] 
    if remaining_length == 1:
        game_states[(head_position, head_direction, tuple(body_so_far), food_position)] = 0
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
                
            if (0 <= next_position[0] < GRID_SIZE) \
                and (0 <= next_position[1] < GRID_SIZE) \
                and (next_position not in body_so_far) \
                and (food_position != next_position):
                    
                new_body = body_so_far + [next_position]
                helper(head_position, head_direction, next_position, new_body, remaining_length - 1, food_position, game_states)
        else:
            for dx, dy in directions:
                next_position = (current_position[0] + dx, current_position[1] + dy)
                if (0 <= next_position[0] < GRID_SIZE) \
                    and (0 <= next_position[1] < GRID_SIZE) \
                    and (next_position not in body_so_far) \
                    and (food_position != next_position):
                    new_body = body_so_far + [next_position]
                    helper(head_position, head_direction, next_position, new_body, remaining_length - 1, food_position, game_states)

def generate_states(grid_size, head_directions, head_positions, food_positions) -> Dict:
    game_states = {}
    
    for head_pos in head_positions:
        for head_dir in head_directions:
            for food_pos in food_positions:
                for length in range(1, grid_size * grid_size + 1):
                    if food_pos != head_pos:
                        helper(head_pos, head_dir, head_pos, [head_pos], length, food_pos, game_states)
    return game_states

def visualize_snake_state(body, food_pos, title=""):
    """Visualize a snake state on a 3x3 grid"""
    print(f"\n{title}")
    print("-" * 20)
    
    # Create empty grid
    grid = [['.' for _ in range(GRID_SIZE)] for _ in range(GRID_SIZE)]
    
    # Place snake body segments
    for i, (row, col) in enumerate(body):
        if i == 0:
            grid[row][col] = 'H'  # Head
        else:
            grid[row][col] = 'S'  # Body segment
    
    # Place food
    food_row, food_col = food_pos
    grid[food_row][food_col] = 'F'
    
    # Print grid
    for row in grid:
        print(' '.join(row))
    
    # Print coordinates
    print(f"Body: {body}")
    print(f"Food: {food_pos}")

def analyze_states_by_length():
    """Analyze and print total configurations for each snake length"""
    print("Snake State Analysis by Length:")
    print("=" * 40)
    
    all_states = generate_states(GRID_SIZE, HEAD_DIRECTIONS, HEAD_POSITIONS, FOOD_POSITIONS)
    
    # Count states by snake length
    length_counts = {}
    for state_key, value in all_states.items():
        head_pos, head_dir, body, food_pos = state_key
        snake_length = len(body)
        length_counts[snake_length] = length_counts.get(snake_length, 0) + 1
    
    # Print results sorted by length
    print(f"{'Length':<8} {'Configurations':<15} {'Percentage':<12}")
    print("-" * 40)
    
    total_states = len(all_states)
    for length in sorted(length_counts.keys()):
        count = length_counts[length]
        percentage = (count / total_states) * 100
        print(f"{length:<8} {count:<15} {percentage:.1f}%")
    
    print("-" * 40)
    print(f"{'Total':<8} {total_states:<15} {'100.0%':<12}")
    
    return length_counts

def analyze_states_detailed():
    """Detailed analysis showing breakdown by head position, direction, and length"""
    print("\nDetailed Snake State Analysis:")
    print("=" * 50)
    
    all_states = generate_states(GRID_SIZE, HEAD_DIRECTIONS, HEAD_POSITIONS, FOOD_POSITIONS)
    
    # Count by head position and direction
    position_direction_counts = {}
    for state_key, value in all_states.items():
        head_pos, head_dir, body, food_pos = state_key
        snake_length = len(body)
        key = (head_pos, head_dir, snake_length)
        position_direction_counts[key] = position_direction_counts.get(key, 0) + 1
    
    # Group by head position
    print("Breakdown by Head Position and Direction:")
    print("-" * 50)
    
    for head_pos in HEAD_POSITIONS:
        print(f"\nHead Position {head_pos}:")
        for head_dir in HEAD_DIRECTIONS:
            print(f"  Direction '{head_dir}':")
            for length in range(1, GRID_SIZE * GRID_SIZE + 1):
                key = (head_pos, head_dir, length)
                count = position_direction_counts.get(key, 0)
                if count > 0:
                    print(f"    Length {length}: {count} configurations")
    
    return position_direction_counts

def generate_3cell_snakes_upward():
    """Generate and visualize all 3-cell snakes with head at (1,1) facing upward"""
    print("3-cell snakes with head at (1,1) facing upward:")
    print("=" * 50)
    print("Legend: H = Head, S = Body, F = Food, . = Empty")
    
    head_pos = (0,2)
    head_dir = 'upward'
    length = 8
    
    # Generate states for this specific configuration
    temp_states = {}
    for food_pos in FOOD_POSITIONS:
        if food_pos != head_pos:
            helper(head_pos, head_dir, head_pos, [head_pos], length, food_pos, temp_states)
    
    # Visualize each state
    for i, (state_key, value) in enumerate(temp_states.items()):
        head_pos_key, head_dir_key, body, food_pos = state_key
        visualize_snake_state(body, food_pos, f"Snake Configuration {i+1}")
    
    print(f"\nTotal 3-cell snakes found: {len(temp_states)}")

# Run the analysis
analyze_states_by_length()
analyze_states_detailed()