import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const GRID_SIZE = 3;

// Match backend: relative actions and rewards from train.py / q_learning_agent.py
const ACTIONS = ['turn_left', 'go_straight', 'turn_right', 'turn_around'];
const REWARD_FOOD = 10;
const REWARD_DEATH = -10;
const REWARD_STEP = -0.1;
const GAMMA = 1.0;

const DIRECTIONS = {
  upward: [-1, 0],
  downward: [1, 0],
  leftward: [0, -1],
  rightward: [0, 1]
};

const TURNS = {
  upward: {
    turn_left: 'leftward',
    go_straight: 'upward',
    turn_right: 'rightward',
    turn_around: 'downward'
  },
  downward: {
    turn_left: 'rightward',
    go_straight: 'downward',
    turn_right: 'leftward',
    turn_around: 'upward'
  },
  leftward: {
    turn_left: 'downward',
    go_straight: 'leftward',
    turn_right: 'upward',
    turn_around: 'rightward'
  },
  rightward: {
    turn_left: 'upward',
    go_straight: 'rightward',
    turn_right: 'downward',
    turn_around: 'leftward'
  }
};

function randomFood(excludePositions) {
  while (true) {
    const r = Math.floor(Math.random() * GRID_SIZE);
    const c = Math.floor(Math.random() * GRID_SIZE);
    const conflict = excludePositions.some(([er, ec]) => er === r && ec === c);
    if (!conflict) return [r, c];
  }
}

function keyFor(env) {
  // Approximate Python get_state_representation:
  // (head_pos, head_dir, body_tuple, food_pos)
  const head = env.snake[0];
  const dir = env.direction;
  const bodySorted = [...env.snake].sort((a, b) => (a[0] - b[0]) || (a[1] - b[1]));
  const bodyStr = bodySorted.map(([r, c]) => `${r},${c}`).join(';');
  const foodStr = `${env.food[0]},${env.food[1]}`;
  return `${head[0]},${head[1]}|${dir}|${bodyStr}|${foodStr}`;
}

function initEnv() {
  // Match backend defaults: snake starts in center, heading right, food placed randomly off-snake
  const start = [Math.floor(GRID_SIZE / 2), Math.floor(GRID_SIZE / 2)];
  const snake = [start];
  const food = randomFood(snake);
  return {
    snake,
    direction: 'rightward',
    food,
    score: 0
  };
}

export default function TrainPlayground() {
  const [learningRate, setLearningRate] = useState(0.2);
  const [epsilon, setEpsilon] = useState(0.1);
  const [isRunning, setIsRunning] = useState(false);
  const [speedMs, setSpeedMs] = useState(200);
  const [episode, setEpisode] = useState(0);
  const [score, setScore] = useState(0);
  const [scores, setScores] = useState([]);
  const [env, setEnv] = useState(() => initEnv());

  const timerRef = useRef(null);
  const qTableRef = useRef(new Map());

  const gridCells = useMemo(
    () => Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => [Math.floor(i / GRID_SIZE), i % GRID_SIZE]),
    []
  );

  function getQRow(stateKey) {
    if (!qTableRef.current.has(stateKey)) {
      const row = Object.fromEntries(ACTIONS.map(a => [a, 0]));
      qTableRef.current.set(stateKey, row);
    }
    return qTableRef.current.get(stateKey);
  }

  const chooseAction = useCallback((stateKey, eps) => {
    const row = getQRow(stateKey);
    if (Math.random() < eps) {
      return ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
    }
    const maxQ = Math.max(...ACTIONS.map(a => row[a]));
    const best = ACTIONS.filter(a => row[a] === maxQ);
    return best[Math.floor(Math.random() * best.length)];
  }, []);

  function stepEnv(curEnv, action) {
    const currentDir = curEnv.direction;
    const newDirName = TURNS[currentDir][action];
    const [dr, dc] = DIRECTIONS[newDirName];

    const [hr, hc] = curEnv.snake[0];
    const nr = hr + dr;
    const nc = hc + dc;

    // Wall collision
    const hitWall = nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE;
    if (hitWall) {
      return { nextEnv: curEnv, reward: REWARD_DEATH, done: true };
    }

    // Self collision
    const hitsSelf = curEnv.snake.some(([sr, sc], idx) => idx > 0 && sr === nr && sc === nc);
    if (hitsSelf) {
      return { nextEnv: curEnv, reward: REWARD_DEATH, done: true };
    }

    const reachedFood = nr === curEnv.food[0] && nc === curEnv.food[1];

    let newSnake = [[nr, nc], ...curEnv.snake];
    let newFood = curEnv.food;
    let newScore = curEnv.score;

    if (reachedFood) {
      newScore += 1;
      newFood = randomFood(newSnake);
      // Keep full length (no tail removal) to grow
    } else {
      // Normal move: remove tail
      newSnake.pop();
    }

    const reward = reachedFood ? REWARD_FOOD : REWARD_STEP;

    return {
      nextEnv: {
        ...curEnv,
        snake: newSnake,
        direction: newDirName,
        food: newFood,
        score: newScore
      },
      reward,
      done: false
    };
  }

  const qUpdate = useCallback((prevKey, action, reward, nextKey, alpha) => {
    const row = getQRow(prevKey);
    const currentQ = row[action];
    const nextRow = getQRow(nextKey);
    const maxFuture = Math.max(...ACTIONS.map(a => nextRow[a]));
    const updated = currentQ + alpha * (reward + GAMMA * maxFuture - currentQ);
    row[action] = updated;
  }, []);

  function resetEpisode() {
    const next = initEnv();
    setEnv(next);
    setScore(0);
  }

  const tick = useCallback(() => {
    setEnv(prev => {
      const sKey = keyFor(prev);
      const action = chooseAction(sKey, epsilon);
      const { nextEnv, reward, done } = stepEnv(prev, action);
      const nKey = keyFor(nextEnv);
      qUpdate(sKey, action, reward, nKey, learningRate);
      setScore(nextEnv.score);
      if (done) {
        setEpisode(e => e + 1);
        setScores(arr => [...arr, nextEnv.score]);
        return initEnv();
      }
      return nextEnv;
    });
  }, [epsilon, learningRate, chooseAction, qUpdate]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(tick, speedMs);
      return () => clearInterval(timerRef.current);
    }
    return () => {};
  }, [isRunning, speedMs, tick]);

  function handleStart() {
    if (!isRunning) setIsRunning(true);
  }
  function handleStop() {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }
  function handleReset() {
    handleStop();
    qTableRef.current = new Map();
    setEpisode(0);
    setScores([]);
    resetEpisode();
  }

  const avgLast50 = useMemo(() => {
    const slice = scores.slice(-50);
    return slice.length ? (slice.reduce((a, b) => a + b, 0) / slice.length).toFixed(2) : '0.00';
  }, [scores]);

  // Sparkline points
  const spark = useMemo(() => {
    const w = 680, h = 200;
    const margin = { left: 44, right: 12, top: 12, bottom: 28 };
    const innerW = w - margin.left - margin.right;
    const innerH = h - margin.top - margin.bottom;
    if (scores.length === 0) {
      return { w, h, margin, innerW, innerH, points: '', xTicks: [], yTicks: [], y0: margin.top + innerH / 2, maxAbs: 10 };
    }
    const maxAbs = Math.max(10, ...scores.map(s => Math.abs(s)));
    const step = innerW / Math.max(1, scores.length - 1);
    const yFromVal = (v) => margin.top + innerH / 2 - (v / maxAbs) * (innerH / 2 - 4);
    const pts = scores.map((s, i) => {
      const x = margin.left + i * step;
      const y = yFromVal(s);
      return `${x},${y}`;
    }).join(' ');
    const yTicksVals = [-maxAbs, 0, maxAbs];
    const yTicks = yTicksVals.map(v => ({ v, y: yFromVal(v) }));
    const xtCount = Math.min(5, scores.length);
    const xTicks = Array.from({ length: xtCount }, (_, i) => {
      const idx = Math.round((i / (xtCount - 1)) * (scores.length - 1));
      const x = margin.left + (idx / Math.max(1, scores.length - 1)) * innerW;
      return { idx, x };
    });
    return { w, h, margin, innerW, innerH, points: pts, xTicks, yTicks, y0: yFromVal(0), maxAbs };
  }, [scores]);

  return (
    <div style={{ fontFamily: '"Raleway", sans-serif' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'nowrap', marginBottom: '1rem' }}>
        <label style={{ fontFamily: '"Raleway", sans-serif', fontWeight: 500 }}>Learning rate</label>
        <input
          type="number"
          step="0.05"
          min="0.01"
          max="1"
          value={learningRate}
          onChange={(e) => setLearningRate(parseFloat(e.target.value))}
          style={{ width: 80 }}
        />
        <label style={{ fontFamily: '"Raleway", sans-serif', fontWeight: 500 }}>Epsilon</label>
        <input
          type="number"
          step="0.01"
          min="0"
          max="1"
          value={epsilon}
          onChange={(e) => setEpsilon(parseFloat(e.target.value))}
          style={{ width: 80 }}
        />
        <label style={{ fontFamily: '"Raleway", sans-serif', fontWeight: 500 }}>Speed</label>
        <input
          type="range"
          min="50"
          max="600"
          value={speedMs}
          onChange={(e) => setSpeedMs(parseInt(e.target.value, 10))}
        />
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'nowrap' }}>
          <button onClick={handleStart}>Start</button>
          <button onClick={handleStop}>Stop</button>
          <button onClick={handleReset}>Reset</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_SIZE}, 60px)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, 60px)`,
            gap: '4px',
            background: '#fff'
          }}>
            {gridCells.map(([r, c], idx) => {
              const isHead = env.snake[0][0] === r && env.snake[0][1] === c;
              const isBody = env.snake.some(([sr, sc], i) => i > 0 && sr === r && sc === c);
              const isFood = env.food[0] === r && env.food[1] === c;
              let background = '#e6eef5';
              if (isFood) background = '#e74c3c';
              if (isBody) background = '#1d4ed8';
              if (isHead) background = '#2ecc71';
              return (
                <div key={idx} style={{
                  width: 60,
                  height: 60,
                  background,
                  border: '1px solid #c7d2e0',
                  borderRadius: 4
                }} />
              );
            })}
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <span>Episode: {episode}</span>{' '}
            <span style={{ marginLeft: 12 }}>Score (ep): {score}</span>
          </div>
        </div>

        <div>
          <svg width={spark.w} height={spark.h} style={{ background: '#fff', border: '1px solid #c7d2e0', borderRadius: 4 }}>
            {/* Axes */}
            <line
              x1={spark.margin.left}
              y1={spark.margin.top}
              x2={spark.margin.left}
              y2={spark.margin.top + spark.innerH}
              stroke="#94a3b8"
            />
            <line
              x1={spark.margin.left}
              y1={spark.margin.top + spark.innerH}
              x2={spark.margin.left + spark.innerW}
              y2={spark.margin.top + spark.innerH}
              stroke="#94a3b8"
            />
            {/* Y ticks */}
            {spark.yTicks.map((t, i) => (
              <g key={i}>
                <line
                  x1={spark.margin.left}
                  y1={t.y}
                  x2={spark.margin.left + spark.innerW}
                  y2={t.y}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                />
                <text x={spark.margin.left - 8} y={t.y + 4} fontSize="10" textAnchor="end" fill="#475569">
                  {Math.round(t.v)}
                </text>
              </g>
            ))}
            {/* X ticks */}
            {spark.xTicks.map((t, i) => (
              <g key={i}>
                <line
                  x1={t.x}
                  y1={spark.margin.top + spark.innerH}
                  x2={t.x}
                  y2={spark.margin.top + spark.innerH + 4}
                  stroke="#94a3b8"
                />
                <text x={t.x} y={spark.margin.top + spark.innerH + 14} fontSize="10" textAnchor="middle" fill="#475569">
                  {t.idx}
                </text>
              </g>
            ))}
            {/* Polyline */}
            <polyline fill="none" stroke="#213547" strokeWidth="2" points={spark.points} />
            {/* Axis labels */}
            <text
              x={spark.margin.left + spark.innerW / 2}
              y={spark.h - 6}
              fontSize="11"
              textAnchor="middle"
              fill="#1f2937"
            >
              Episodes
            </text>
            <text
              x={12}
              y={spark.margin.top + spark.innerH / 2}
              transform={`rotate(-90, 12, ${spark.margin.top + spark.innerH / 2})`}
              fontSize="11"
              textAnchor="middle"
              fill="#1f2937"
            >
              Score per episode
            </text>
          </svg>
          <div style={{ marginTop: 6 }}>Avg last 50: {avgLast50}</div>
        </div>
      </div>
    </div>
  );
}

