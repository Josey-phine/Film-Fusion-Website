import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-slate/40 backdrop-blur-md border-b border-slate/50 sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan to-pink">
        FilmFusion
      </Link>
      <div className="flex gap-6 font-medium">
        <Link to="/" className="hover:text-cyan transition-colors">
          Home
        </Link>
        <Link to="/favorites" className="hover:text-pink transition-colors">
          Favorites
        </Link>
      </div>
    </nav>
  );
}