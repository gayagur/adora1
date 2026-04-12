import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Pencil } from 'lucide-react';

export default function CampaignHeader({ campaign, brandName, assetCount, onEdit, onEditBrand }) {
  return (
    <div style={{ borderBottom: '1px solid rgba(26,22,18,0.06)', background: '#fff' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 20px 20px' }}>
        <Link to="/Dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(26,22,18,0.3)', fontWeight: 500, textDecoration: 'none', marginBottom: 12 }}>
          <ArrowLeft style={{ width: 12, height: 12 }} /> Campaigns
        </Link>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(108,92,231,0.6)' }}>{campaign.strategy_angle}</span>
              <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(26,22,18,0.15)' }} />
              <span style={{ fontSize: 10, color: 'rgba(26,22,18,0.3)', fontWeight: 500 }}>{assetCount} asset{assetCount !== 1 ? 's' : ''}</span>
            </div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1A1612', letterSpacing: '-0.02em' }}>{campaign.title}</h1>
            {brandName && <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.35)', marginTop: 2 }}>{brandName}</p>}
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            {onEditBrand && (
              <button onClick={onEditBrand} style={{
                display: 'flex', alignItems: 'center', gap: 4, height: 28, padding: '0 10px', borderRadius: 8,
                border: '1px solid rgba(26,22,18,0.08)', background: 'transparent', cursor: 'pointer',
                fontSize: 11, fontWeight: 500, color: 'rgba(26,22,18,0.45)', fontFamily: 'inherit',
              }}><Pencil style={{ width: 12, height: 12 }} /> Brand</button>
            )}
            {onEdit && (
              <button onClick={onEdit} style={{
                display: 'flex', alignItems: 'center', gap: 4, height: 28, padding: '0 10px', borderRadius: 8,
                border: '1px solid rgba(26,22,18,0.08)', background: 'transparent', cursor: 'pointer',
                fontSize: 11, fontWeight: 500, color: 'rgba(26,22,18,0.45)', fontFamily: 'inherit',
              }}><Pencil style={{ width: 12, height: 12 }} /> Campaign</button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(26,22,18,0.04)' }}>
          {campaign.key_message && <Meta label="Message" value={campaign.key_message} />}
          {campaign.target_audience && <Meta label="Audience" value={campaign.target_audience} />}
          {campaign.tone && <Meta label="Tone" value={campaign.tone} />}
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div style={{ minWidth: 0 }}>
      <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(26,22,18,0.2)', marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</p>
    </div>
  );
}
