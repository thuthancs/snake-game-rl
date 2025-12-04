import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GRID_SIZE = 3;

function neighbors(cell) {
  const [r, c] = cell;
  const out = [];
  if (r - 1 >= 0) out.push([r - 1, c]); // up
  if (r + 1 < GRID_SIZE) out.push([r + 1, c]); // down
  if (c - 1 >= 0) out.push([r, c - 1]); // left
  if (c + 1 < GRID_SIZE) out.push([r, c + 1]); // right
  return out;
}

function dirFrom(fromPos, toPos) {
  const dr = toPos[0] - fromPos[0];
  const dc = toPos[1] - fromPos[1];
  if (dr === -1) return 'upward';
  if (dr === 1) return 'downward';
  if (dc === 1) return 'rightward';
  return 'leftward';
}

function tupleKey(cells) {
  // Stable key for a placement: "r,c|r,c|..."
  return cells
    .slice()
    .sort((a, b) => (a[0] - b[0]) || (a[1] - b[1]))
    .map(([r, c]) => `${r},${c}`)
    .join('|');
}

function generateConnectedPlacements(length) {
  const cells = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      cells.push([r, c]);
    }
  }
  const placements = new Map(); // key -> array of [r,c]

  function dfs(path) {
    if (path.length === length) {
      placements.set(tupleKey(path), path.slice());
      return;
    }
    const tail = path[path.length - 1];
    for (const nb of neighbors(tail)) {
      if (!path.some(([r, c]) => r === nb[0] && c === nb[1])) {
        path.push(nb);
        dfs(path);
        path.pop();
      }
    }
  }

  for (const cell of cells) {
    dfs([cell]);
  }

  return Array.from(placements.values());
}

function headDirPairsForPlacement(shapeCells) {
  const cellSet = new Set(shapeCells.map(([r, c]) => `${r},${c}`));
  const pairs = new Set();

  if (shapeCells.length === 1) {
    const only = shapeCells[0];
    for (const d of ['upward', 'downward', 'rightward', 'leftward']) {
      pairs.add(`${only[0]},${only[1]}|${d}`);
    }
    return pairs;
  }

  function dfs(path) {
    if (path.length === cellSet.size) {
      const head = path[0];
      const second = path[1];
      const dir = dirFrom(head, second);
      pairs.add(`${head[0]},${head[1]}|${dir}`);
      return;
    }
    const tail = path[path.length - 1];
    for (const nb of neighbors(tail)) {
      const key = `${nb[0]},${nb[1]}`;
      const used = path.some(([r, c]) => r === nb[0] && c === nb[1]);
      if (cellSet.has(key) && !used) {
        path.push(nb);
        dfs(path);
        path.pop();
      }
    }
  }

  for (const start of shapeCells) {
    dfs([start]);
  }
  return pairs;
}

function normalizeShape(cells) {
  const minR = Math.min(...cells.map(([r]) => r));
  const minC = Math.min(...cells.map(([, c]) => c));
  const shifted = cells.map(([r, c]) => [r - minR, c - minC]);
  shifted.sort((a, b) => (a[0] - b[0]) || (a[1] - b[1]));
  return shifted;
}

function shapeKey(cells) {
  return normalizeShape(cells).map(([r, c]) => `${r},${c}`).join('|');
}

function uniqueShapesFromPlacements(placements) {
  const map = new Map(); // key -> normalized cells
  for (const p of placements) {
    const key = shapeKey(p);
    if (!map.has(key)) {
      map.set(key, normalizeShape(p));
    }
  }
  return Array.from(map.values());
}

function countValidStatesForLength(length) {
  const placements = generateConnectedPlacements(length);
  const shapes = uniqueShapesFromPlacements(placements);
  let totalStates = 0;
  const foodChoices = GRID_SIZE * GRID_SIZE - length;
  for (const placement of placements) {
    const headPairs = headDirPairsForPlacement(placement);
    totalStates += headPairs.size * foodChoices;
  }
  return { totalStates, placements, shapes };
}

function ShapeThumb({ cells, headCandidates }) {
  const active = new Set(cells.map(([r, c]) => `${r},${c}`));
  const size = 28; // bigger cells
  const gap = 1; // inner-cell gap
  const thumb = size * GRID_SIZE + gap * (GRID_SIZE - 1);
  const boxStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: thumb,
    height: thumb,
  };
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${GRID_SIZE}, ${size}px)`,
    gridTemplateRows: `repeat(${GRID_SIZE}, ${size}px)`,
    gap: `${gap}px`,
  };
  return (
    <div style={boxStyle}>
      <div style={gridStyle}>
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const r = Math.floor(i / GRID_SIZE);
          const c = i % GRID_SIZE;
          const on = active.has(`${r},${c}`);
          const isHeadCandidate = headCandidates?.has?.(`${r},${c}`);
          return (
            <div
              key={i}
              style={{
                width: size,
                height: size,
                background: on ? (isHeadCandidate ? '#2ecc71' : '#213547') : '#f1f5f9',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function StateGenerationPage() {
  const [length, setLength] = useState(1);
  const navigate = useNavigate();

  const { placements, shapes, totalStates } = useMemo(() => countValidStatesForLength(length), [length]);

  // Precompute all lengths once for fast switching
  const cache = useMemo(() => {
    const out = {};
    for (let L = 1; L <= GRID_SIZE * GRID_SIZE; L++) {
      out[L] = countValidStatesForLength(L);
    }
    return out;
  }, []);

  useEffect(() => {
    // warm cache by referencing it (already computed in useMemo)
    void cache;
  }, [cache]);

  const lengths = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => i + 1);

  return (
    <div className="learn-page state-page">
      <div className="state-header">
        <h1 className="state-title" style={{ fontFamily: "'Pixelify Sans', sans-serif" }}>
          Compute All Valid Game States
        </h1>
        <div style={{ marginBottom: '1.5rem' }}>
          <ol style={{ fontSize: '1em', paddingLeft: '1.5em' }}>
            <li>
              For each snake length, compute the possible number of <strong>shapes</strong>.<br />
              <span style={{ color: '#888' }}>
                (A shape is defined by the cells occupied by the snake, regardless of its orientation or head position.)
              </span>
            </li>
            <li>
              For each shape, enumerate all valid <strong>placements</strong>.<br />
              <span style={{ color: '#888' }}>
                (A placement is a specific arrangement of the snake on the grid.)
              </span>
            </li>
            <li>
              For each placement, consider all possible <strong>head positions and orientations</strong>, as well as all valid <strong>food placements</strong>.
            </li>
            <li>
              Calculate the total number of valid states as:<br />
              <span style={{ color: '#888' }}>
                (number of shapes) × (number of placements per shape) × (number of head positions and orientations per placement) × (number of food placements)
              </span>
            </li>
            <li>
              The <strong>green cells</strong> in the grids below indicate possible head positions for each placement.
            </li>
          </ol>
        </div>
        <div className="state-controls">
          <label htmlFor="snake-length">Length</label>
          <select
            id="snake-length"
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value, 10))}
            className="state-select"
          >
            {lengths.map((L) => (
              <option key={L} value={L}>{L}</option>
            ))}
          </select>
          <div className="stat-badge">
            <strong style={{ marginRight: '0.4rem' }}>Total shapes:</strong>
            <span className="stat-number">
              {cache[length]?.shapes?.length ?? shapes.length}
            </span>
          </div>
          <div className="stat-badge">
            <strong style={{ marginRight: '0.4rem' }}>Total placements:</strong>
            <span className="stat-number">
              {cache[length]?.placements?.length ?? placements.length}
            </span>
          </div>
          <div className="stat-badge stat-badge--wide">
            <strong style={{ marginRight: '0.4rem' }}>Total valid states:</strong>
            <span className="stat-number">
              {cache[length]?.totalStates ?? totalStates}
            </span>
          </div>
        </div>
      </div>

      <div className="placements-grid">
        {(cache[length]?.placements ?? placements).map((cells, idx) => {
          const headPairs = headDirPairsForPlacement(cells);
          const headSet = new Set(Array.from(headPairs).map((s) => s.split('|')[0]));
          return (
            <ShapeThumb key={idx} cells={cells} headCandidates={headSet} />
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        <button onClick={() => navigate('/algorithm')}>Next</button>
      </div>
    </div>
  );
}

