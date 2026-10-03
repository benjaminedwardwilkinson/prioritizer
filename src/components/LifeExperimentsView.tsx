import React, { useState } from 'react';
import { LifeExperiment } from '../types';
import { sound } from '../services/sound';
import { FlaskConical, CheckCircle2, Plus, Clock, Smile, Meh, Frown, Sparkles, BookOpen } from 'lucide-react';

interface Props {
  experiments: LifeExperiment[];
  onUpdateExperiment: (exp: LifeExperiment) => void;
  onOpenNewExperiment: () => void;
}

export const LifeExperimentsView: React.FC<Props> = ({
  experiments,
  onUpdateExperiment,
  onOpenNewExperiment,
}) => {
  const [selectedExpId, setSelectedExpId] = useState<string | null>(null);

  const handleOutcomeChange = (
    exp: LifeExperiment,
    outcome: 'better' | 'same' | 'not_working' | 'huge_difference' | 'learned'
  ) => {
    sound.playChime(600, 'sine', 0.2);
    onUpdateExperiment({
      ...exp,
      outcome,
      status: outcome === 'huge_difference' || outcome === 'better' ? 'COMPLETED' : exp.status,
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold tracking-wider uppercase mb-1">
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Self-Design Lab</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-100">
            YOUR LIFE EXPERIMENTS
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Low-pressure, high-curiosity 30-day probes. Not a rigid habit tracker.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewExperiment}
          className="px-3.5 py-2 rounded-xl bg-amber-400 text-slate-950 font-display font-bold text-xs flex items-center gap-1.5 hover:bg-amber-300 shadow transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Experiment</span>
        </button>
      </div>

      {/* Experiments List */}
      {experiments.length === 0 ? (
        <div className="w-full p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center">
          <FlaskConical className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="font-display font-bold text-base text-slate-300">No active experiments yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Use the What-If Simulator or Friction Explorer to commit your first 30-day life experiment.
          </p>
          <button
            type="button"
            onClick={onOpenNewExperiment}
            className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold hover:border-amber-400 hover:text-white transition-colors"
          >
            Launch What-If Sandbox
          </button>
        </div>
      ) : (
        <div className="w-full space-y-3.5">
          {experiments.map(exp => {
            return (
              <div
                key={exp.id}
                className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl p-2 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
                      {exp.priorityEmoji}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold text-cyan-400">
                          {exp.resource} PROBE
                        </span>
                        <span className="text-xs text-slate-500">·</span>
                        <span className="text-xs text-slate-400">{exp.deltaDescription}</span>
                      </div>
                      <h4 className="font-display font-bold text-base text-slate-100 mt-0.5">
                        {exp.title}
                      </h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{exp.action}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-mono px-2.5 py-1 rounded-md font-semibold shrink-0 border ${
                      exp.status === 'COMPLETED'
                        ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                        : 'bg-amber-950/60 border-amber-500/40 text-amber-300 animate-pulse'
                    }`}
                  >
                    {exp.status}
                  </span>
                </div>

                {/* Check-In Row */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                  <div className="text-xs text-slate-400 font-medium">
                    How is this experiment feeling so far?
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleOutcomeChange(exp, 'huge_difference')}
                      className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1 transition-all ${
                        exp.outcome === 'huge_difference'
                          ? 'bg-amber-400 border-amber-400 text-slate-950 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Huge difference</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOutcomeChange(exp, 'better')}
                      className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1 transition-all ${
                        exp.outcome === 'better'
                          ? 'bg-emerald-500 border-emerald-500 text-slate-950 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <Smile className="w-3.5 h-3.5" />
                      <span>Better</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOutcomeChange(exp, 'same')}
                      className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1 transition-all ${
                        exp.outcome === 'same'
                          ? 'bg-slate-300 border-slate-300 text-slate-950 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <Meh className="w-3.5 h-3.5" />
                      <span>Same</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOutcomeChange(exp, 'learned')}
                      className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1 transition-all ${
                        exp.outcome === 'learned'
                          ? 'bg-violet-400 border-violet-400 text-slate-950 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Learned</span>
                    </button>
                  </div>
                </div>

                {exp.notes && (
                  <div className="mt-2 text-xs text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800/60 italic">
                    "{exp.notes}"
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
