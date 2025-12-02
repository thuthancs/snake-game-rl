import TrainPlayground from '../components/trainPlayground';

export default function TrainPage() {
  return (
    <div className="learn-page">
      <h1>Training playground</h1>
      <p>Adjust the learning rate and epsilon, start the simulation, and watch the agent learn on a 3×3 grid.</p>
      <TrainPlayground />
    </div>
  );
}

