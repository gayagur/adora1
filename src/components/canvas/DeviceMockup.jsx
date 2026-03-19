import React from 'react';

// MacBook-style device mockup
export function MacbookMockup({ imageUrl, rotation = -2, shadowIntensity = 0.5 }) {
  return (
    <div
      className="relative w-full"
      style={{
        transform: `perspective(1200px) rotateY(${rotation}deg) rotateX(2deg)`,
        transformStyle: 'preserve-3d',
        filter: `drop-shadow(0 40px 80px rgba(0,0,0,${shadowIntensity}))`,
      }}
    >
      {/* Screen body */}
      <div
        className="relative w-full rounded-[8px] overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #3a3a3c 0%, #2d2d2f 100%)',
          padding: '2.5% 1.5% 0 1.5%',
          aspectRatio: '16/10',
        }}
      >
        {/* Camera dot */}
        <div
          className="absolute top-[1.2%] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#1a1a1a]"
          style={{ boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.1)' }}
        />
        {/* Screen */}
        <div className="w-full rounded-[3px] overflow-hidden bg-white" style={{ aspectRatio: '16/10' }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Screen"
              className="w-full h-full object-contain object-center"
              crossOrigin="anonymous"
              style={{ imageRendering: 'high-quality' }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#16213e]" />
          )}
        </div>
      </div>
      {/* Base */}
      <div
        className="w-full h-[3%] rounded-b-[3px]"
        style={{ background: 'linear-gradient(180deg, #4a4a4c 0%, #3d3d3f 100%)' }}
      />
      <div
        className="w-[40%] h-[2%] mx-auto rounded-b-[4px]"
        style={{ background: 'linear-gradient(180deg, #4a4a4c 0%, #3a3a3c 100%)' }}
      />
    </div>
  );
}

// iPhone-style device mockup
export function IphoneMockup({ imageUrl, rotation = 3, shadowIntensity = 0.4 }) {
  return (
    <div
      className="relative mx-auto"
      style={{
        width: '45%',
        transform: `perspective(1000px) rotateY(${rotation}deg) rotateX(1deg)`,
        transformStyle: 'preserve-3d',
        filter: `drop-shadow(0 40px 80px rgba(0,0,0,${shadowIntensity}))`,
      }}
    >
      <div
        className="relative rounded-[12%] overflow-hidden w-full"
        style={{
          aspectRatio: '9/19.5',
          background: 'linear-gradient(160deg, #2a2a2c 0%, #1a1a1c 100%)',
          padding: '3% 3% 3% 3%',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
        }}
      >
        {/* Dynamic island */}
        <div
          className="absolute top-[3%] left-1/2 -translate-x-1/2 rounded-full bg-black z-10"
          style={{ width: '28%', height: '3.5%' }}
        />
        {/* Screen */}
        <div className="w-full h-full rounded-[10%] overflow-hidden bg-white">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Screen"
              className="w-full h-full object-contain object-center"
              crossOrigin="anonymous"
              style={{ imageRendering: 'high-quality' }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-[#1a1a2e] to-[#16213e]" />
          )}
        </div>
      </div>
    </div>
  );
}

// Browser window mockup
export function BrowserMockup({ imageUrl, shadowIntensity = 0.3 }) {
  return (
    <div
      className="relative w-full rounded-lg overflow-hidden"
      style={{
        background: '#ffffff',
        boxShadow: `0 32px 80px rgba(0,0,0,${shadowIntensity}), 0 0 0 1px rgba(0,0,0,0.06)`,
      }}
    >
      {/* Browser chrome */}
      <div
        className="flex items-center gap-1.5 px-3 py-2.5"
        style={{ background: '#F0F0F0', borderBottom: '1px solid rgba(0,0,0,0.08)' }}
      >
        <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
        <div
          className="flex-1 mx-2 h-4 rounded-full flex items-center px-2"
          style={{ background: '#E0E0E0' }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#A0A0A0] mr-1" />
          <div className="h-1.5 w-24 rounded-full bg-[#C0C0C0]" />
        </div>
      </div>
      {/* Screenshot */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Browser content"
          className="w-full object-cover object-top"
          style={{ display: 'block', maxHeight: '240px' }}
          crossOrigin="anonymous"
        />
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200" />
      )}
    </div>
  );
}