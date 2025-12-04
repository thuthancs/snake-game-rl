import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function IntroPage() {
  const steps = useMemo(() => [
    {
      text: 'Reinforcement learning is a class of artificial intelligence that teaches a machine (agent) to maximize an objective through its direct interaction with the environment in a feedback loop without labeled input data.',
      highlights: ['Reinforcement learning', 'direct interaction', 'without labeled input data'],
    },
    { 
      text: "In the snake game, the agent is simply the snake itself, controlled by the learning algorithm. The snake's goal is to maximize its score. The snake starts with no knowledge about the environment and has to learn from its own experience through trial and error.",
      highlights: ['snake itself', 'maximize its score', 'trial and error'],
    },
    { 
      text: 'To this end, the snake interacts with the 2D grid (environment) where the it moves, eats food, and grows. The larger the grid, the harder it is for the snake to learn.',
      highlights: ['interacts', '2D grid'],
    },
    { 
      text: 'At each step, the snake has to make a decision of where to go next: up, down, left, or right. Each action (i.e., eating food, colliding with walls or itself, or simply moving forward.) is associated with a consequence (reward or penalty).',
      highlights: ['decision', 'consequence'],
    },
    { 
      text: "The information about the snake (learning agent) and its environment is called game state (a 'snapshot' of the game at a particular moment). The state includes the snake's position, the food's position, and the snake's current direction. Given the current state, the snake evaluates possible future actions it can take and selects the one that maximizes its expected future reward.",
      highlights: ['snapshot', 'possible future actions', 'maximizes its expected future reward'],
    },
    { 
      text: 'The reward is a feedback signal that tells the snake how well it is doing. In our case, the snake receives a positive reward (+10) for eating food and a negative reward (-10) for colliding with walls or itself. No reward (0) is given for other actions.',
      highlights: ['trained', 'higher scores'],
    },
  ], []);

  const [activeStep, setActiveStep] = useState(0);
  const sectionsRef = useRef([]);
  sectionsRef.current = [];
  const navigate = useNavigate();

  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const renderWithHighlights = (text, highlights) => {
    if (!highlights || highlights.length === 0) return text;
    const regex = new RegExp(`(${highlights.map(escapeRegExp).join('|')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, idx) => {
      const isMatch = highlights.some((h) => h.toLowerCase() === part.toLowerCase());
      return isMatch ? (
        <span key={idx} className="highlight">{part}</span>
      ) : (
        <span key={idx}>{part}</span>
      );
    });
  };

  // Preload images to avoid flicker
  useEffect(() => {
    steps.forEach((_, idx) => {
      const img = new Image();
      img.src = `/diagram/${idx + 1}.svg`;
    });
  }, [steps]);

  // Scrollytelling: prefer Scrollama if available; fallback to IntersectionObserver
  useEffect(() => {
    if (typeof window !== 'undefined' && window.scrollama) {
      const scroller = window.scrollama();
      scroller
        .setup({
          step: '.intro-section',
          offset: 0.6,
          debug: false,
        })
        .onStepEnter(({ index }) => {
          if (typeof index === 'number') setActiveStep(index);
        });
      return () => scroller.destroy();
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const stepIndex = Number(visible.target.dataset.step);
          if (!Number.isNaN(stepIndex)) setActiveStep(stepIndex);
        }
      },
      { root: null, threshold: [0.25, 0.5, 0.75], rootMargin: '0px 0px -20% 0px' }
    );
    sectionsRef.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const setRefAtIndex = (index) => (el) => {
    sectionsRef.current[index] = el;
  };

  return (
    <>
      <div className="intro-grid">
        <div className="intro-left">
          {steps.map((step, idx) => (
            <section
              key={idx}
              className="intro-section"
              ref={setRefAtIndex(idx)}
              data-step={idx}
              aria-current={activeStep === idx ? 'step' : undefined}
            >
              <p>{renderWithHighlights(step.text, step.highlights)}</p>
            </section>
          ))}
        </div>
        <div className="intro-right">
          <img
            className="intro-diagram"
            src={`/diagram/${activeStep + 1}.svg`}
            alt={`Diagram step ${activeStep + 1}`}
          />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        <button onClick={() => navigate('/state-generation')}>Next</button>
      </div>
    </>
  );
}

