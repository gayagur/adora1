import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, LayoutDashboard, History } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const isLanding = location.pathname === '/' || location.pathname === '/Landing';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isLanding ? 'bg-transparent' : 'bg-white/80 backdrop-blur-xl border-b border-slate-100'
    }`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/Landing" className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isLanding ? 'bg-white/10' : 'bg-indigo-50'
          }`}>
            <Sparkles className={`w-4 h-4 ${isLanding ? 'text-white' : 'text-indigo-600'}`} />
          </div>
          <span className={`font-semibold text-lg ${isLanding ? 'text-white' : 'text-slate-900'}`}>
            AdForge
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            to="/Generator"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === '/Generator'
                ? 'bg-indigo-50 text-indigo-700'
                : isLanding
                  ? 'text-white/70 hover:text-white hover:bg-white/10'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Generator
          </Link>
          <Link
            to="/Campaigns"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === '/Campaigns'
                ? 'bg-indigo-50 text-indigo-700'
                : isLanding
                  ? 'text-white/70 hover:text-white hover:bg-white/10'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Campaigns
          </Link>
        </div>
      </div>
    </nav>
  );
}