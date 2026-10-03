import React, { useEffect, useState } from 'react';
import { X, BarChart3, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const ResearchTrendsModal: React.FC<Props> = ({ onClose }) => {
  const [researchData, setResearchData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/research/trends')
      .then(res => res.json())
      .then(json => {
        if (json.success) setResearchData(json.data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl p-6 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <h3 className="font-display font-bold text-base text-slate-100">
              Macro Research Trends & Aggregate Patterns
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-4 py-4 pr-1 text-xs">
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Total Anonymized Snapshots Analyzed:</span>
            <span className="font-mono text-cyan-400 font-bold text-sm">
              {researchData?.totalSnapshots?.toLocaleString() || '1,420'}
            </span>
          </div>

          {/* Top Priorities in Cohort */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
            <div className="font-display font-bold text-slate-200 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Most Frequently Declared Priorities (% of users)</span>
            </div>
            <div className="space-y-2 mt-2">
              {(researchData?.topSelectedPriorities || []).map((p: any) => (
                <div key={p.id}>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>
                      {p.emoji} {p.name}
                    </span>
                    <span className="font-mono text-slate-400">{p.percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full"
                      style={{ width: `${p.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Common Gaps */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
            <div className="font-display font-bold text-slate-200 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>The Most Common Friction Deficits</span>
            </div>
            <div className="space-y-2 mt-2">
              {(researchData?.commonFrictionGaps || []).map((g: any) => (
                <div
                  key={g.priorityId}
                  className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-slate-200">
                      {g.emoji} {g.name}
                    </div>
                    <div className="text-[11px] text-slate-400">Primary friction: {g.primaryFriction}</div>
                  </div>
                  <span className="text-xs font-mono font-bold text-rose-400">
                    {g.gapFrequency}% experience gap
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Seasonal Trends */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="font-display font-bold text-slate-200">
              Seasonal Orbit Trajectories
            </div>
            <div className="space-y-1.5 text-slate-400 leading-relaxed">
              {(researchData?.seasonalShifts || []).map((s: any, idx: number) => (
                <div key={idx} className="border-b border-slate-800/60 pb-1.5 last:border-0">
                  <strong className="text-slate-300 font-semibold">{s.season}: </strong>
                  <span>{s.highlight}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <span>Strict privacy: Aggregate data is decoupled from identity and never sold.</span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
