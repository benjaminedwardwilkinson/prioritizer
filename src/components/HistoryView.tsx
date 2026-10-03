import React, { useState } from 'react';
import { ProfileSnapshot } from '../types';
import { getPriorityById } from '../data/ontology';
import { sound } from '../services/sound';
import { History, TrendingUp, TrendingDown, Minus, Calendar, Sparkles } from 'lucide-react';

interface Props {
  snapshots: ProfileSnapshot[];
  onTakeNewSnapshot: () => void;
}

export const HistoryView: React.FC<Props> = ({ snapshots, onTakeNewSnapshot }) => {
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string>(
    snapshots[0]?.id || ''
  );

  const activeSnapshot = snapshots.find(s => s.id === selectedSnapshotId) || snapshots[0];
  const previousSnapshot = snapshots.length > 1 ? snapshots[1] : null;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold tracking-wider uppercase mb-1">
            <History className="w-3.5 h-3.5" />
            <span>Temporal Drift</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-100">
            HOW YOU CHANGED
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Human priorities are fluid. Track how your declared focus and resource investments migrate across seasons.
          </p>
        </div>

        <button
          type="button"
          onClick={onTakeNewSnapshot}
          className="px-3.5 py-2 rounded-xl bg-amber-400 text-slate-950 font-display font-bold text-xs hover:bg-amber-300 shadow transition-colors"
        >
          Retake Quiz / Refresh
        </button>
      </div>

      {/* Snapshot Timeline Selector */}
      <div className="w-full flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-4">
        {snapshots.map((snap, idx) => {
          const isSelected = snap.id === (activeSnapshot?.id || '');
          return (
            <button
              key={snap.id}
              type="button"
              onClick={() => {
                sound.playTick();
                setSelectedSnapshotId(snap.id);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-amber-400 border-amber-400 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{snap.dateLabel || snap.seasonName}</span>
              {idx === 0 && (
                <span className="text-[10px] bg-slate-950/30 px-1.5 py-0.5 rounded font-mono">
                  Latest
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Trajectory Table / Cards */}
      {activeSnapshot && (
        <div className="w-full p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-display font-bold text-base text-slate-100">
                {activeSnapshot.seasonName} Snapshot
              </h3>
              <p className="text-xs text-slate-400">
                Recorded on {new Date(activeSnapshot.timestamp).toLocaleDateString()}
              </p>
            </div>
            {activeSnapshot.dominantInsight && (
              <span className="text-xs text-cyan-400 font-medium max-w-xs text-right">
                {activeSnapshot.dominantInsight}
              </span>
            )}
          </div>

          <div className="space-y-2.5">
            {activeSnapshot.declaredRanks.map((id, index) => {
              const item = getPriorityById(id);
              if (!item) return null;

              const currRank = index + 1;
              const prevIndex = previousSnapshot
                ? previousSnapshot.declaredRanks.indexOf(id)
                : -1;
              const prevRank = prevIndex >= 0 ? prevIndex + 1 : null;
              const shift = prevRank ? prevRank - currRank : 0; // positive means climbed

              return (
                <div
                  key={id}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-display font-mono font-bold text-amber-400 text-base w-6">
                      #{currRank}
                    </span>
                    <span className="text-2xl p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                      {item.emoji}
                    </span>
                    <div>
                      <div className="font-semibold text-sm text-slate-100">{item.name}</div>
                      <div className="text-[11px] text-slate-400">{item.domainName}</div>
                    </div>
                  </div>

                  {/* Shift trajectory indicator */}
                  <div className="flex items-center gap-2">
                    {prevRank !== null ? (
                      shift > 0 ? (
                        <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-500/30">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>+{shift} Climbed</span>
                        </div>
                      ) : shift < 0 ? (
                        <div className="flex items-center gap-1 text-xs font-semibold text-rose-400 bg-rose-950/40 px-2 py-1 rounded border border-rose-500/30">
                          <TrendingDown className="w-3.5 h-3.5" />
                          <span>{shift} Declined</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                          <Minus className="w-3.5 h-3.5" />
                          <span>Stable</span>
                        </div>
                      )
                    ) : (
                      <span className="text-xs text-slate-500">First recorded</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
