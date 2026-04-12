import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Images, Plus } from 'lucide-react';
import logoImg from '@/assets/logo.png';

export default function AppShell({ children }) {
  const location = useLocation();
  const isLanding = location.pathname === '/Landing' || location.pathname === '/';

  if (isLanding) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="fixed top-0 left-0 right-0 z-50 h-12 bg-white border-b border-black/[0.04]">
        <div className="flex items-center h-full px-4 max-w-[1400px] mx-auto">
          <Link to="/Landing" className="flex items-center gap-2 mr-6">
            <img src={logoImg} alt="Adora" className="w-7 h-7 object-contain" />
            <span className="text-[14px] font-semibold text-gray-900 tracking-tight">Adora</span>
          </Link>

          <nav className="flex items-center gap-0.5">
            <NavItem to="/Dashboard" active={location.pathname === '/Dashboard' || location.pathname.startsWith('/Campaign')}>
              <LayoutGrid className="w-3.5 h-3.5" /> Campaigns
            </NavItem>
            <NavItem to="/Gallery" active={location.pathname === '/Gallery'}>
              <Images className="w-3.5 h-3.5" /> Gallery
            </NavItem>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link to="/Onboarding"
              className="inline-flex items-center gap-1.5 h-[30px] px-3.5 rounded-lg bg-[#6c5ce7] hover:bg-[#5f4dd6] text-white text-[12px] font-medium transition-colors">
              <Plus className="w-3 h-3" /> New
            </Link>
          </div>
        </div>
      </header>
      <main className="pt-12">{children}</main>
    </div>
  );
}

function NavItem({ to, active, children }) {
  return (
    <Link to={to}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
        active ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
      }`}>
      {children}
    </Link>
  );
}
