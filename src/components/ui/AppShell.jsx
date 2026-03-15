import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, LayoutGrid, Plus } from 'lucide-react';

export default function AppShell({ children }) {
  const location = useLocation();
  const isLanding = location.pathname === '/Landing' || location.pathname === '/';

  if (isLanding) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      {/* Top nav */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white/80 backdrop-blur-xl border-b border-black/[0.06] flex items-center px-5">
        <div className="flex items-center gap-6 w-full max-w-screen-xl mx-auto">
          <Link to="/Landing" className="flex items-center gap-2 mr-4">
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-[15px] text-gray-900 tracking-tight">AdForge</span>
          </Link>

          <nav className="flex items-center gap-1">
            <NavLink to="/Dashboard" active={location.pathname === '/Dashboard'}>
              <LayoutGrid className="w-4 h-4" />
              Campaigns
            </NavLink>
          </nav>

          <div className="ml-auto">
            <Link
              to="/Onboarding"
              className="inline-flex items-center gap-2 h-8 px-4 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Campaign
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-14">
        {children}
      </main>
    </div>
  );
}

function NavLink({ to, active, children }) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-gray-100 text-gray-900'
          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      {children}
    </Link>
  );
}