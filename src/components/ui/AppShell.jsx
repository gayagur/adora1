import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Images, Plus } from 'lucide-react';
import logoImg from '@/assets/logo.png';

export default function AppShell({ children }) {
  const location = useLocation();
  const isLanding = location.pathname === '/Landing' || location.pathname === '/';

  if (isLanding) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <header className="fixed top-0 left-0 right-0 z-50 h-[48px] bg-white border-b border-black/[0.04]">
        <div className="flex items-center h-full px-5 max-w-[1400px] mx-auto">
          <Link to="/Landing" className="flex items-center gap-2.5 mr-7">
            <img src={logoImg} alt="Adora" className="w-7 h-7 object-contain" />
            <span className="text-[14px] font-semibold text-[#1a1a1a] tracking-[-0.01em]">Adora</span>
          </Link>

          <nav className="flex items-center gap-0.5">
            <NavItem to="/Dashboard" active={location.pathname === '/Dashboard' || location.pathname.startsWith('/Campaign')}>
              <LayoutGrid className="w-3.5 h-3.5" /> Campaigns
            </NavItem>
            <NavItem to="/Gallery" active={location.pathname === '/Gallery'}>
              <Images className="w-3.5 h-3.5" /> Gallery
            </NavItem>
          </nav>

          <div className="ml-auto">
            <Link to="/Onboarding"
              className="inline-flex items-center gap-1.5 h-[32px] px-4 rounded-full bg-[#1a1a1a] hover:bg-[#333] text-white text-[12px] font-medium transition-colors">
              <Plus className="w-3 h-3" /> New
            </Link>
          </div>
        </div>
      </header>
      <main className="pt-[48px]">{children}</main>
    </div>
  );
}

function NavItem({ to, active, children }) {
  return (
    <Link to={to}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
        active ? 'bg-[#f5f5f4] text-[#1a1a1a]' : 'text-[#1a1a1a]/35 hover:text-[#1a1a1a]/60 hover:bg-[#fafafa]'
      }`}>
      {children}
    </Link>
  );
}
