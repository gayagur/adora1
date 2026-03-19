import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Sparkles, Loader2, RefreshCw, Plus, X, Lightbulb, FileText, Target } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';

export default function OnboardingStepStrategy({ brandData, onBack, onConfirm }) {
  const [intent, setIntent] = useState('');
  const [content, setContent] = useState('');
  const [generating, setGenerating] = useState(false);
  const [hooks, setHooks] = useState([]);
  const [editingHookIdx, setEditingHookIdx] = useState(null);
  const [editingHookVal, setEditingHookVal] = useState('');
  const [newHookText, setNewHookText] = useState('');
  const [showAddHook, setShowAddHook] = useState(false);

  const generateHooks = async () => {
    setGenerating(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a world-class copywriter and campaign strategist.

Brand: ${brandData?.brand_name}
Description: ${brandData?.description}
Target Audience: ${brandData?.target_audience}
Tone: ${brandData?.tone_of_voice}
Key Messages: ${brandData?.key_messages?.join(', ')}

User's Campaign Intent (what they want to focus on):
"${intent || 'General brand campaign'}"

${content ? `Source Content (extract key benefits, differentiators, pain points, and features from this):
---
${content}
---` : ''}

Your job:
1. Extract the most powerful insights from the source content (if provided): benefits, differentiators, pain points, features, proof points
2. Combine those with the user's stated intent
3. Generate 8 hooks across 5 styles:
   - problem_based: Lead with the pain point (2 hooks)
   - benefit_driven: Lead with a tangible outcome (2 hooks)
   - curiosity_based: Open a loop, create intrigue (1 hook)
   - bold_controversial: Challenge assumptions, provoke (1 hook)
   - emotional: Human, story-driven, empathetic (2 hooks)

Each hook should be SHORT (3-8 words max), punchy, and immediately usable as a headline.

Also generate:
- extracted_insights: array of 5 key points extracted from the content + intent
- suggested_tone: based on intent and content, what tone should this campaign use?
- strategic_direction: 1-2 sentence strategic direction summary`,
      response_json_schema: {
        type: 'object',
        properties: {
          hooks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                text: { type: 'string' },
                style: { type: 'string' }
              }
            }
          },
          extracted_insights: { type: 'array', items: { type: 'string' } },
          suggested_tone: { type: 'string' },
          strategic_direction: { type: 'string' }
        }
      }
    });

    setHooks(result.hooks || []);
    setGenerating(false);
    return result;
  };

  const handleContinue = async () => {
    let result = null;
    if (hooks.length === 0) {
      setGenerating(true);
      result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a world-class copywriter and campaign strategist.

Brand: ${brandData?.brand_name}
Description: ${brandData?.description}
Target Audience: ${brandData?.target_audience}
Tone: ${brandData?.tone_of_voice}
Key Messages: ${brandData?.key_messages?.join(', ')}

User's Campaign Intent:
"${intent || 'General brand campaign'}"

${content ? `Source Content:\n---\n${content}\n---` : ''}

Generate 8 hooks across styles: problem_based (2), benefit_driven (2), curiosity_based (1), bold_controversial (1), emotional (2).
Each hook: 3-8 words, punchy headline.
Also: extracted_insights (5 points), suggested_tone, strategic_direction.`,
        response_json_schema: {
          type: 'object',
          properties: {
            hooks: { type: 'array', items: { type: 'object', properties: { text: { type: 'string' }, style: { type: 'string' } } } },
            extracted_insights: { type: 'array', items: { type: 'string' } },
            suggested_tone: { type: 'string' },
            strategic_direction: { type: 'string' }
          }
        }
      });
      setGenerating(false);
    }

    const finalHooks = hooks.length > 0 ? hooks : (result?.hooks || []);
    onConfirm({
      intent,
      content,
      hooks: finalHooks,
      extracted_insights: result?.extracted_insights || [],
      suggested_tone: result?.suggested_tone || '',
      strategic_direction: result?.strategic_direction || ''
    });
  };

  const deleteHook = (idx) => setHooks(prev => prev.filter((_, i) => i !== idx));

  const startEdit = (idx) => {
    setEditingHookIdx(idx);
    setEditingHookVal(hooks[idx].text);
  };

  const saveEdit = () => {
    setHooks(prev => prev.map((h, i) => i === editingHookIdx ? { ...h, text: editingHookVal } : h));
    setEditingHookIdx(null);
  };

  const addHook = () => {
    if (!newHookText.trim()) return;
    setHooks(prev => [...prev, { text: newHookText.trim(), style: 'custom' }]);
    setNewHookText('');
    setShowAddHook(false);
  };

  const STYLE_LABELS = {
    problem_based: { label: 'Problem', color: 'bg-orange-50 text-orange-600 border-orange-100' },
    benefit_driven: { label: 'Benefit', color: 'bg-green-50 text-green-600 border-green-100' },
    curiosity_based: { label: 'Curiosity', color: 'bg-blue-50 text-blue-600 border-blue-100' },
    bold_controversial: { label: 'Bold', color: 'bg-red-50 text-red-600 border-red-100' },
    emotional: { label: 'Emotional', color: 'bg-pink-50 text-pink-600 border-pink-100' },
    custom: { label: 'Custom', color: 'bg-violet-50 text-violet-600 border-violet-100' },
  };

  const canContinue = intent.trim().length > 0 || content.trim().length > 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-2">
          Direct your campaign
        </h1>
        <p className="text-gray-400 text-sm">
          Tell the AI what to focus on. The more you give, the sharper the output.
        </p>
      </div>

      <div className="space-y-5">
        {/* Intent */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
              <Target className="w-3.5 h-3.5 text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Campaign intent</p>
              <p className="text-xs text-gray-400">What should this campaign focus on?</p>
            </div>
          </div>
          <textarea
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all resize-none"
            rows={3}
            value={intent}
            onChange={e => setIntent(e.target.value)}
            placeholder="e.g. Focus on why competitors are expensive and we're the smarter alternative. Highlight automation that saves time."
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {[
              'Focus on cost vs competitors',
              'Highlight automation & savings',
              'Emotional founder story',
              'Target small startups',
              'Problem-led urgency',
            ].map(hint => (
              <button
                key={hint}
                onClick={() => setIntent(hint)}
                className="px-2.5 py-1 rounded-lg bg-gray-50 hover:bg-violet-50 border border-gray-200 hover:border-violet-200 text-xs text-gray-500 hover:text-violet-600 transition-colors"
              >
                {hint}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Source content <span className="text-gray-400 font-normal">(optional)</span></p>
              <p className="text-xs text-gray-400">Paste anything: landing page copy, product description, notes, previous ads</p>
            </div>
          </div>
          <textarea
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all resize-none"
            rows={6}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Paste your landing page text, product features, pricing copy, testimonials, founder story — anything the AI should use as raw material."
          />
        </div>

        {/* Generate hooks button */}
        {hooks.length === 0 && (
          <button
            onClick={generateHooks}
            disabled={generating || !canContinue}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating hooks…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Hooks
              </>
            )}
          </button>
        )}

        {/* Hooks */}
        <AnimatePresence>
          {hooks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-200 p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
                    <Lightbulb className="w-3.5 h-3.5 text-violet-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{hooks.length} Hooks generated</p>
                </div>
                <button
                  onClick={generateHooks}
                  disabled={generating}
                  className="flex items-center gap-1.5 h-7 px-3 rounded-lg bg-gray-50 hover:bg-violet-50 border border-gray-200 hover:border-violet-200 text-xs font-medium text-gray-500 hover:text-violet-600 transition-colors disabled:opacity-50"
                >
                  {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  Regenerate
                </button>
              </div>

              <div className="space-y-2">
                {hooks.map((hook, idx) => {
                  const styleMeta = STYLE_LABELS[hook.style] || STYLE_LABELS.custom;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 group transition-colors"
                    >
                      {editingHookIdx === idx ? (
                        <>
                          <input
                            autoFocus
                            className="flex-1 bg-white border border-violet-300 rounded-lg px-2.5 py-1.5 text-sm text-gray-900 outline-none"
                            value={editingHookVal}
                            onChange={e => setEditingHookVal(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingHookIdx(null); }}
                          />
                          <button onClick={saveEdit} className="text-xs font-semibold text-violet-600 hover:text-violet-800 px-2 shrink-0">Save</button>
                        </>
                      ) : (
                        <>
                          <span className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold shrink-0 ${styleMeta.color}`}>{styleMeta.label}</span>
                          <span className="flex-1 text-sm font-medium text-gray-800">{hook.text}</span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEdit(idx)} className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button onClick={() => deleteHook(idx)} className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Add custom hook */}
              {showAddHook ? (
                <div className="flex items-center gap-2 mt-3">
                  <input
                    autoFocus
                    className="flex-1 bg-gray-50 border border-violet-300 rounded-xl px-3 py-2 text-sm text-gray-900 outline-none"
                    value={newHookText}
                    onChange={e => setNewHookText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addHook(); if (e.key === 'Escape') setShowAddHook(false); }}
                    placeholder="Write your own hook…"
                  />
                  <button onClick={addHook} className="h-8 px-3 rounded-xl bg-violet-600 text-white text-xs font-semibold shrink-0">Add</button>
                  <button onClick={() => setShowAddHook(false)} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddHook(true)}
                  className="flex items-center gap-1.5 mt-3 h-8 px-3 rounded-xl border border-dashed border-gray-300 text-xs text-gray-400 hover:text-violet-600 hover:border-violet-300 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add custom hook
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between mt-8">
        <button onClick={onBack} className="flex items-center gap-1.5 h-9 px-4 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <button
          onClick={handleContinue}
          disabled={generating || !canContinue}
          className="flex items-center gap-2 h-9 px-5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
        >
          {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
          Generate Campaigns
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}