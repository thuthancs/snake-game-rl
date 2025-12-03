import { useNavigate } from 'react-router-dom';

export default function AlgorithmPage() {
    const navigate = useNavigate();

    return (
        <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto', paddingLeft: '1.2rem', paddingRight: '1.2rem' }}>
            <h1>Q-learning Algorithm</h1>
            <p style={{ fontSize: '1.2em', marginBottom: '1.5rem' }}>
                After generating all the states for each snake length, we have a total of <span class="highlight">2032 valid game states</span>.
                The Q-table looks like the figure below. Each row corresponds to a game state, and each column corresponds to one of the four possible actions (up, down, left, right).
                This is equal to <span class="highlight">8128 Q-values</span> (2032 states × 4 actions) that the snake needs to update each step.
            </p>
            <img src="/q_table.svg" alt="Q-table visualization" style={{ width: "100%", height: "auto" }} />
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                <button
                    style={{ minWidth: '300px', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
                    onClick={() => navigate('/qlearning')}
                >
                    Mathematical Formula
                </button>
            </div>
        </div>
    );
}