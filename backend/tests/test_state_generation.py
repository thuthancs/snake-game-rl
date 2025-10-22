from typing import Dict, List, Tuple

GRID_SIZE = 3
HEAD_DIRECTIONS = ['upward', 'downward', 'rightward', 'leftward']
HEAD_POSITIONS = [(x, y) for x in range(GRID_SIZE) for y in range(GRID_SIZE)]
FOOD_POSITIONS = [(x, y) for x in range(GRID_SIZE) for y in range(GRID_SIZE)]

def neighbors(cell: Tuple[int, int]):
    # Unpack the row and column coordinate from the current cell
    r, c = cell
    
    # Loop through all possible movements: up, down, left, right (in this order)
    for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
        nr, nc = r + dr, c + dc
        
        # Check if the new position is within the grid boundaries
        if 0 <= nr < GRID_SIZE and 0 <= nc < GRID_SIZE:
            yield (nr, nc)

def _dir_from(from_pos: Tuple, to_pos: Tuple) -> str:
    """Determine direction from one position to another.

    Args:
        from_pos (tuple): the coordinates of the starting position
        to_pos (tuple): the coordinates of the target position

    Returns:
        str: the direction from from_pos to to_pos ('upward', 'downward', 'rightward', 'leftward')
    """
    dr, dc = to_pos[0] - from_pos[0], to_pos[1] - from_pos[1]
    
    # For example, if the snake moves from (1,0) to (0,0) then 0-1=-1, meaning the direction is 'upward'
    if dr == -1:
        return 'upward'
    if dr == 1:
        return 'downward'
    if dc == 1:
        return 'rightward'
    return 'leftward'

def generate_connected_placements(length):
    """Generate all connected placements of a snake (geometric pattern) of given length on the grid.
    The shapes are represented as unordered sets of cells with not head or directions.
    To avoid duplicates, each shape is stored as a sorted tuple of cells.
    """
    cells = [(r, c) for r in range(GRID_SIZE) for c in range(GRID_SIZE)]
    placements = set()

    def dfs(path):
        # If the path has reached the desired length, record it
        if len(path) == length:
            placements.add(tuple(sorted(path)))
            return
        
        # If the path is not yet complete, extend it
        tail = path[-1]
        for nb in neighbors(tail):
            if nb not in path:
                dfs(path + [nb])

    # Start DFS from each cell in the grid
    for cell in cells:
        dfs([cell])

    return [tuple(p) for p in placements]

def head_dir_pairs_for_placement(shape_cells: List[Tuple[int, int]]) -> set:
    """Generate all valid (head_pos, head_dir) pairs for a given snake shape.

    Args:
        shape_cells (List[Tuple[int, int]]): a list of (r, c) tuples representing the snake's body cells

    Returns:
        set: a set of (head_pos, head_dir) pairs
    """
    shape_cells = set(shape_cells)
    pairs = set()

    # Special-case single cell: any facing is valid
    if len(shape_cells) == 1:
        # Get the first item from the set
        only = next(iter(shape_cells))
        for d in ['upward', 'downward', 'rightward', 'leftward']:
            pairs.add((only, d))
        return pairs

    def dfs(path):
        """Recursive DFS to build paths through the shape cells.

        Args:
            path (List[Tuple[int, int]]): current path of cells
        
        Returns:
            None
        """
        # If the path covers all shape cells, record the head and direction
        if len(path) == len(shape_cells):
            # Unpack the head and second cell to determine direction
            head, second = path[0], path[1]
            
            # Add the (head, direction) pair to the set
            pairs.add((head, _dir_from(head, second)))
            return
        
        # If not complete, extend the path
        tail = path[-1]
        for nb in neighbors(tail):
            # Only consider neighbors that are part of the shape and not already in the path
            if nb in shape_cells and nb not in path:
                dfs(path + [nb])

    # Start DFS from each cell in the shape
    for start in shape_cells:
        dfs([start])
    return pairs

def generate_all_valid_states() -> Dict:
    """Generate all valid game states as a dictionary.
    
    Returns:
        Dict: {(head_pos, head_dir, body_tuple, food_pos): 0, ...}
    """
    game_states = {}
    
    for length in range(1, GRID_SIZE * GRID_SIZE + 1):
        placements = generate_connected_placements(length)
        
        for placement in placements:
            pairs = head_dir_pairs_for_placement(placement)
            
            for head_pos, head_dir in pairs:
                body_tuple = tuple(placement)
                
                for food_pos in FOOD_POSITIONS:
                    if food_pos not in placement:
                        game_states[(head_pos, head_dir, body_tuple, food_pos)] = 0
    
    return game_states

def count_states_by_length() -> Dict[int, int]:
    """Count the number of valid states for each snake length.
    
    Returns:
        Dict[int, int]: {length: count, ...}
    """
    game_states = generate_all_valid_states()
    length_counts = {}
    
    for (head_pos, head_dir, body_tuple, food_pos) in game_states.keys():
        length = len(body_tuple)
        length_counts[length] = length_counts.get(length, 0) + 1
    
    return length_counts

GAME_STATES = generate_all_valid_states()
length_counts = count_states_by_length()
print(f"Generated {len(GAME_STATES)} valid game states.")
print("\nValid states by snake length:")
print("=" * 40)
for length in sorted(length_counts.keys()):
    print(f"Length {length}: {length_counts[length]} states")
print("=" * 40)
print(f"Total: {sum(length_counts.values())} states")