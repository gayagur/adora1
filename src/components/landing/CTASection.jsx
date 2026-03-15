import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CTASection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="relative rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-12 sm:p-16 overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '32px 32px'
            }}
          />
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Ready to generate your first campaign?
            </h2>
            <p className="mt-4 text-lg text-indigo-100 max-w-xl mx-auto">
              Paste a URL and watch AI create stunning, publish-ready ads in seconds.
            </p>
            <Link to="/Generator">
              <Button size="lg" className="mt-8 bg-white text-indigo-700 hover:bg-indigo-50 px-8 py-6 text-lg rounded-xl gap-2 shadow-xl transition-all hover:scale-[1.02]">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}