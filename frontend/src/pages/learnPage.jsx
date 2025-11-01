
export default function LearnPage() {
    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const sections = [
        {
            id: 'definition',
            title: 'What is Reinforcement Learning?',
            subheadings: [],
            content: (
                <>
                    <p>Reinforcement learning is a class of artificial intelligence that teaches a machine to maximize an objective through its <span className="highlight">direct interaction</span> with the environment.
                        Unlike supervised learning where the machine learns from labeled input data (e.g., classification, regression) and unsupervised learning where the machine learns from unlabeled input data (e.g., clustering), RL learns from its own experience with no input data.
                        There are various RL algorithms but in this article, we will focus on a model-free and tabular method called <span className="highlight">Q-learning</span>.</p>
                </>
            )
        },
        {
            id: 'components',
            title: 'Key Components',
            subheadings: [
                { id: 'state-space', title: 'State Space' },
                { id: 'action-space', title: 'Action Space' },
                { id: 'reward-system', title: 'Reward System' }
            ],
            content: (
                <>
                    <img src="/snake_game_components.png" alt="Snake Game Components" style={{ maxWidth: '90%', marginTop: '1rem' }} />
                    <h3 id="state-space">Game State</h3>
                    <p>Game state is the complete information about the game at any given moment, which includes:</p>
                    <ul>
                        <li>Snake's head position</li>
                        <li>Snake's head direction</li>
                        <li>Snake's body segments</li>
                        <li>Food position</li>
                        <li>Game score</li>
                    </ul>
                    <p>At each step of the game, the snake will assess the best next action to take by looking up the Q-value for each possible next action in the current state.
                        As a result, we need to create a Q-table with all possible game states and actions. Let's start with enumerating the possible states.
                    </p>
                    <p>In order to do so, we start with the enumeration of all <span className="highlight">geometric patterns</span> of the snake's body. Then, we will count the number of possible directions that the snake's head can face in each pattern.
                        Finally, for each snake's body position, we count the number of ways to place the food that is non-overlapping with the body.
                    </p>
                    <figure style={{ margin: '1rem 0', textAlign: 'center' }}>
                        <img src="/1_length_snake.png" alt="1-length snake" style={{ maxWidth: '100%' }} />
                        <figcaption style={{ marginTop: '0.5rem', fontSize: '1rem', color: '#666', fontStyle: 'italic' }}>
                            <strong>Figure 1: All possible geometric pattern for a 1-length snake.</strong> This is the special case where the snake's head is also its body.
                            There are 9 possible head positions and for each position, there are 4 possible directions that the snake's head can face. When the snake is placed at a cell,
                            there are 8 ways to place the food. As a result, there are a total of <strong>9x4x8 = 288</strong> game states for a one-length snake.
                        </figcaption>
                    </figure>
                    <figure style={{ margin: '1rem 0', textAlign: 'center' }}>
                        <img src="/2_length_snake.png" alt="2-length snake" style={{ maxWidth: '70%' }} />
                        <figcaption style={{ marginTop: '0.5rem', fontSize: '1rem', color: '#666', fontStyle: 'italic' }}>
                            <strong>Figure 1: All possible geometric pattern for a 1-length snake.</strong> This is the special case where the snake's head is also its body.
                            There are 9 possible head positions and for each position, there are 4 possible directions that the snake's head can face. When the snake is placed at a cell,
                            there are 8 ways to place the food. As a result, there are a total of <strong>9x4x8 = 288</strong> game states for a one-length snake.
                        </figcaption>
                    </figure>

                    <h3 id="action-space">List of Actions</h3>
                    <p>The set of possible moves:</p>
                    <ul>
                        <li>Four directions of movement</li>
                        <li>Constraints based on current direction</li>
                    </ul>

                    <h3 id="reward-system">Reward System</h3>
                    <p>Feedback mechanism to guide learning:</p>
                    <ul>
                        <li>Positive reward for eating food</li>
                        <li>Negative reward for collisions</li>
                        <li>Small penalties for suboptimal moves</li>
                    </ul>
                </>
            )
        },
        {
            id: 'algorithm',
            title: 'Algorithm Design',
            subheadings: [
                { id: 'q-learning', title: 'Q-Learning Implementation' },
                { id: 'learning-process', title: 'Learning Process' }
            ],
            content: (
                <>
                    <h3 id="q-learning">Q-Learning Implementation</h3>
                    <p>The snake game uses Q-learning, where:</p>
                    <ul>
                        <li>Q-values represent the expected future rewards for actions in each state</li>
                        <li>The agent learns by updating these Q-values based on experience</li>
                        <li>Exploration vs exploitation is balanced using an epsilon-greedy strategy</li>
                    </ul>

                    <h3 id="learning-process">Learning Process</h3>
                    <p>The training process involves:</p>
                    <ul>
                        <li>Multiple episodes of gameplay</li>
                        <li>Gradual refinement of the Q-table</li>
                        <li>Decreasing exploration rate over time</li>
                    </ul>
                </>
            )
        }
    ];

    return (
        <div className="learn-page">
            <h1>teaching an ai snake using q-learning</h1>

            {/* Table of Contents */}
            <div className="toc">
                <h2>Table of Contents</h2>
                <ul>
                    {sections.map((section) => (
                        <li key={section.id}>
                            <div
                                onClick={() => scrollToSection(section.id)}
                                style={{ cursor: 'pointer' }}
                            >
                                {section.title}
                            </div>
                            {section.subheadings && section.subheadings.length > 0 && (
                                <ul className="toc-subheadings">
                                    {section.subheadings.map((sub) => (
                                        <li
                                            key={sub.id}
                                            onClick={() => scrollToSection(sub.id)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {sub.title}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Content Sections */}
            <div className="content-sections">
                {sections.map((section) => (
                    <section key={section.id} id={section.id} className="content-section">
                        <h2>{section.title}</h2>
                        {section.content}
                    </section>
                ))}
            </div>
        </div>
    );
}
