import React from 'react';
import { Check } from 'lucide-react';

const steps = [
  { label: 'Website URL' },
  { label: 'Brand Setup' },
  { label: 'Your Ads' },
];

export default function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((step, i) => {
        const isDone = i < currentStep;
        const isActive = i === currentStep;
        return (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                isDone ? 'bg-indigo-600 text-white' :
                isActive ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' :
                'bg-slate-100 text-slate-400'
              }`}>
                {isDone ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`mt-2 text-xs font-medium whitespace-nowrap ${
                isActive ? 'text-indigo-700' : isDone ? 'text-slate-600' : 'text-slate-400'
              }`}>{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-16 sm:w-24 mx-1 mb-5 transition-all duration-300 ${
                i < currentStep ? 'bg-indigo-600' : 'bg-slate-200'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}