import { Route, BrowserRouter as Router, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import LearnPage from './pages/staticLearnPage';
import PlayPage from './pages/playPage';

function HomePage() {
  const navigate = useNavigate();

  const handlePlayClick = () => {
    navigate('/play');
  };

  const snakePixels = Array.from({ length: 20 }, (_, i) => {
    const style = {
      animation: `snakeMove ${20 + i * 2}s linear infinite`,
      top: `${Math.random() * 100}vh`,
      left: `${Math.random() * 100}vw`,
    };
    return <div key={i} className="snake-pixel" style={style} />;
  });

  return (
    <>
      {snakePixels}
      <div>
        <div className="typing-container">
          <h1 className="typing-effect">tinker and play_</h1>
        </div>
        <h2>a hands-on adventure in teaching machines to play</h2>
      </div>
      <button onClick={handlePlayClick}>Play</button>
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/play" element={<PlayPage />} />
        <Route path="/learn" element={<LearnPage />} />
      </Routes>
    </Router>
  )
}

export default App
