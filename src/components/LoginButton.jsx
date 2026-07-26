import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginButton() {
  const { user, loginWithGoogle, logout } = useAuth();

  return (
    <div className="flex items-center gap-4">
      {user ? (
        <div className="flex items-center gap-3">
          <img 
            src={user.photoURL} 
            alt={user.displayName} 
            className="w-8 h-8 rounded-full border border-gray-600" 
          />
          <span className="text-white text-sm hidden md:inline">{user.displayName}</span>
          <button 
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <button 
          onClick={loginWithGoogle}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
        >
          Sign In with Google
        </button>
      )}
    </div>
  );
}