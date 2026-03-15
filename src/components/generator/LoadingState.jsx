import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Palette, PenTool, ImageIcon, CheckCircle2 } from 'lucide-react';

const steps = [
  { icon: Globe, label: 'Analyzing website...', detail: 'Extracting brand identity and content' },
  { icon: Palette, label: 'Identifying brand...', detail: 'Colors, tone, and visual style' },
  { icon: PenTool, label: 'Writing ad copy...', detail: 'Headlines, descriptions, and captions' },
  { icon: ImageIcon, label: 'Generating visuals...', detail: 'Creating platform-optimized creatives' },
];

export default function LoadingState({ status }) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (status === 'generating' && prev < 2) return 2;
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [status]);

  return (
    <div className="max-w-md mx-auto py-16">
      <div className="text-center mb-10">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-indigo-100 animate-ping opacity-30" />
          <div className="relative w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-slate-900">Creating your ads</h3>
        <p className="text-sm text-slate-500 mt-1">This usually takes 30-60 seconds</p>
      </div>

      <div className="space-y-4">
        {steps.map((step, i) => {
          const StepIcon = step.icon;
          const isActive = i === currentStep;
          const isComplete = i < currentStep;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0.4 }}
              animate={{ opacity: isComplete || isActive ? 1 : 0.4 }}
              className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-500 ${
                isActive ? 'bg-indigo-50 border border-indigo-100' :
                isComplete ? 'bg-slate-50' : ''
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                isComplete ? 'bg-green-100' :
                isActive ? 'bg-indigo-100' : 'bg-slate-100'
              }`}>
                {isComplete ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <StepIcon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                )}
              </div>
              <div>
                <p className={`text-sm font-medium ${isActive ? 'text-indigo-900' : isComplete ? 'text-slate-700' : 'text-slate-400'}`}>
                  {step.label}
                </p>
                <p className={`text-xs ${isActive ? 'text-indigo-500' : 'text-slate-400'}`}>
                  {step.detail}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}