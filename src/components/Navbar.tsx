import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Hammer, ShieldAlert, LogOut, LayoutDashboard } from 'lucide-react';

interface NavbarProps {
  isAdmin?: boolean;
  onLogout?: () => void;
}

export default function Navbar({ isAdmin = false, onLogout }: NavbarProps) {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 bg-black/95 border-b border-yellow-500/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand/Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-yellow-400 p-2 rounded-lg text-black font-black transition-transform group-hover:rotate-6 duration-200">
              <Hammer className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-black tracking-wider text-white block leading-none">
                CHHOTAN RAM
              </span>
              <span className="text-xs font-bold tracking-widest text-yellow-400 block mt-1 uppercase">
                CONSTRUCTION
              </span>
            </div>
          </Link>

          {/* Navigation Actions */}
          <div className="flex items-center space-x-4">
            {isAdmin ? (
              <>
                <Link
                  to="/admin/dashboard"
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/20 transition duration-200"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/admin/login"
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-lg text-sm font-bold bg-yellow-400 hover:bg-yellow-500 text-black transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-yellow-400/20"
              >
                <ShieldAlert className="h-4 w-4" />
                <span>Admin Panel</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
