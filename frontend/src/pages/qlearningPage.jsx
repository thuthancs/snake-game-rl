import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function QLearningPage() {
  const steps = useMemo(() => Array.from({ length: 12 }), []);

  const [activeStep, setActiveStep] = useState(0);
  const sectionsRef = useRef([]);
  sectionsRef.current = [];
  const navigate = useNavigate();

  // Preload images
  useEffect(() => {
    steps.forEach((_, idx) => {
      const img = new Image();
      img.src = `/math/${idx + 11}.svg`;
    });
  }, [steps]);

  // Scrollytelling logic
  useEffect(() => {
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
      { root: null, threshold: 0.5, rootMargin: '0px 0px -50% 0px' }
    );
    sectionsRef.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const setRefAtIndex = (index) => (el) => {
    sectionsRef.current[index] = el;
  };

  return (
    <>
      <div className="intro-grid q-learning-grid">
        <div className="intro-left">
          {steps.map((_, idx) => (
            <section
              key={idx}
              className="intro-section"
              ref={setRefAtIndex(idx)}
              data-step={idx}
              aria-current={activeStep === idx ? 'step' : undefined}
            />
          ))}
        </div>
        <div className="intro-right">
          <img
            className="intro-diagram"
            src={`/math/${activeStep + 11}.svg`}
            alt={`Diagram step ${activeStep + 1}`}
          />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        <button onClick={() => navigate('/train')}>Next</button>
      </div>
    </>
  );
}
