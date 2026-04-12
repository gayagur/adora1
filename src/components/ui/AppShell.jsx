import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Images, Plus } from 'lucide-react';
import logoImg from '@/assets/logo.png';

export default function AppShell({ children }) {
  const location = useLocation();
  const isLanding = location.pathname === '/Landing' || location.pathname === '/';

  if (isLanding) return <>{children}</>;

  return (
    <div className="min-h-screen" style={{ background: '#F8F8F7' }}>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        height: 52, display: 'flex', alignItems: 'center',
        background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(26,22,18,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: 1400, margin: '0 auto', padding: '0 20px' }}>
          <Link to="/Landing" style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 28, textDecoration: 'none' }}>
            <img src={logoImg} alt="Adora" style={{ width: 28, height: 28, objectFit: 'contain' }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1612', letterSpacing: '-0.01em' }}>Adora</span>
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <NavItem to="/Dashboard" active={location.pathname === '/Dashboard' || location.pathname.startsWith('/Campaign')}>
              <LayoutGrid style={{ width: 14, height: 14 }} /> Campaigns
            </NavItem>
            <NavItem to="/Gallery" active={location.pathname === '/Gallery'}>
              <Images style={{ width: 14, height: 14 }} /> Gallery
            </NavItem>
          </nav>

          <div style={{ marginLeft: 'auto' }}>
            <Link to="/Onboarding" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              height: 32, padding: '0 16px', borderRadius: 999,
              background: '#1A1612', color: '#fff',
              fontSize: 12, fontWeight: 600, textDecoration: 'none',
            }}>
              <Plus style={{ width: 12, height: 12 }} /> New
            </Link>
          </div>
        </div>
      </header>
      <main style={{ paddingTop: 52 }}>{children}</main>
    </div>
  );
}

function NavItem({ to, active, children }) {
  return (
    <Link to={to} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '6px 12px', borderRadius: 8,
      fontSize: 12, fontWeight: 500, textDecoration: 'none',
      background: active ? 'rgba(26,22,18,0.05)' : 'transparent',
      color: active ? '#1A1612' : 'rgba(26,22,18,0.35)',
      transition: 'all 0.15s ease',
    }}>
      {children}
    </Link>
  );
}
