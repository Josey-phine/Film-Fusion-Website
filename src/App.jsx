import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import Favorites from './pages/Favorites';
import Navbar from './components/Navbar';
import PersonDetails from './pages/PersonDetails'; 

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-navy text-white">
        <Navbar />
        <main className="p-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/person/:id" element={<PersonDetails />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
