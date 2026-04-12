import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, LayoutGrid, Plus, Images } from 'lucide-react';

export default function AppShell({ children }) {
  const location = useLocation();
  const isLanding = location.pathname === '/Landing' || location.pathname === '/';

  if (isLanding) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="fixed top-0 left-0 right-0 z-50 h-[56px] bg-white border-b border-black/[0.05]">
        <div className="flex items-center h-full px-5 max-w-screen-xl mx-auto">
          <Link to="/Landing" className="flex items-center gap-2.5 mr-8 group">
            <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-sm shadow-violet-200/60">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-[15px] text-gray-900 tracking-tight">AdForge</span>
          </Link>

          <nav className="flex items-center gap-0.5">
            <NavLink to="/Dashboard" active={location.pathname === '/Dashboard'}>
              <LayoutGrid className="w-[15px] h-[15px]" />
              Campaigns
            </NavLink>
            <NavLink to="/Gallery" active={location.pathname === '/Gallery'}>
              <Images className="w-[15px] h-[15px]" />
              Gallery
            </NavLink>
          </nav>

          <div className="ml-auto">
            <Link
              to="/Onboarding"
              className="inline-flex items-center gap-1.5 h-[34px] px-4 rounded-[9px] bg-gradient-to-b from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white text-[13px] font-medium transition-all shadow-sm shadow-violet-200/50 active:scale-[0.97]"
            >
              <Plus className="w-3.5 h-3.5" />
              New Campaign
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-[56px]">
        {children}
      </main>
    </div>
  );
}

function NavLink({ to, active, children }) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-1.5 px-3 py-[6px] rounded-lg text-[13px] font-medium transition-all ${
        active
          ? 'bg-violet-50 text-violet-700'
          : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
      }`}
    >
      {children}
    </Link>
  );
}
