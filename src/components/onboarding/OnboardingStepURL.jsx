import React from 'react';
import { ArrowRight, Globe, Loader2 } from 'lucide-react';

export default function OnboardingStepURL({ url, setUrl, onAnalyze, analyzing }) {
  return (
    <div className="text-center">
      <div className="inline-flex w-12 h-12 rounded-2xl bg-violet-50 items-center justify-center mb-6">
        <Globe className="w-6 h-6 text-violet-600" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-3">
        What's the website?
      </h1>
      <p className="text-gray-500 mb-10 max-w-sm mx-auto text-sm leading-relaxed">
        Paste a URL and we'll extract brand identity, messaging, and audience — instantly.
      </p>

      <div className="max-w-md mx-auto">
        <div className="flex gap-2.5 p-1.5 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="relative flex-1 flex items-center">
            <Globe className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onAnalyze()}
              placeholder="https://yourbrand.com"
              className="w-full pl-9 pr-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-transparent outline-none"
              disabled={analyzing}
              autoFocus
            />
          </div>
          <button
            onClick={onAnalyze}
            disabled={analyzing || !url.trim()}
            className="flex items-center gap-2 h-10 px-5 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            {analyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>Analyze <ArrowRight className="w-3.5 h-3.5" /></>
            )}
          </button>
        </div>

        {analyzing && (
          <div className="mt-5 flex items-center justify-center gap-2.5 text-sm text-gray-500">
            <div className="flex gap-1">
              {[0,1,2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
            Analyzing brand identity...
          </div>
        )}
      </div>
    </div>
  );
}