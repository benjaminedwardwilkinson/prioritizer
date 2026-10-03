import React, { useState, useEffect } from 'react';
import { CalculatedDeltas } from '../services/insightEngine';
import { PRIORITIES, getPriorityById } from '../data/ontology';
import { sound } from '../services/sound';
import { Tactile3DSliderBar } from './Tactile3DSliderBar';
import {
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Clock,
  Coins,
  Brain,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Check,
  ShieldCheck,
  Layers,
  X,
} from 'lucide-react';

interface Props {
  deltas: CalculatedDeltas[];
  declaredIds: string[];
  moneyRanks: string[];
  timeRanks: string[];
  attentionRanks: string[];
  onSelectPriority: (priorityId: string) => void;
  selectedPriorityId: string | null;
  onExploreFriction: (priorityId: string) => void;
  onUpdatePriorities: (
    updatedDeclared: string[],
    updatedMoney?: string[],
    updatedTime?: string[],
    updatedAttention?: string[],
    changeDesc?: string
  ) => void;
}

export const Interactive3DSliderStudio: React.FC<Props> = ({
  deltas,
  declaredIds,
  moneyRanks,
  timeRanks,
  attentionRanks,
  onSelectPriority,
  selectedPriorityId,
  onExploreFriction,
  onUpdatePriorities,
}) => {
  // Default to first priority if none selected
  const activeId = selectedPriorityId || (declaredIds.length > 0 ? declaredIds[0] : PRIORITIES[0].id);
  const activeItem = getPriorityById(activeId);
  const activeDelta = deltas.find(d => d.priorityId === activeId);

  // Derive initial hours from time rank (Rank 1 = ~35 hrs, Rank 10 = ~3 hrs)
  const initialHoursFromRank = (rank: number) => Math.max(2, Math.round(40 - rank * 3.7));
  const currentRank = timeRanks.indexOf(activeId) !== -1 ? timeRanks.indexOf(activeId) + 1 : 5;

  const [sliderHours, setSliderHours] = useState<number>(initialHoursFromRank(currentRank));
  const [lastCommitNotice, setLastCommitNotice] = useState<{ msg: string; time: string } | null>(null);
  const [showSubFacetsModal, setShowSubFacetsModal] = useState<boolean>(false);

  useEffect(() => {
    setSliderHours(initialHoursFromRank(currentRank));
  }, [activeId, currentRank]);

  if (!activeItem) return null;

  // Calculate dynamic projected rank based on slider hours
  // More hours = higher rank (closer to #1)
  const calculateProjectedRank = (hours: number): number => {
    if (hours >= 32) return 1;
    if (hours >= 26) return 2;
    if (hours >= 20) return 3;
    if (hours >= 16) return 4;
    if (hours >= 12) return 5;
    if (hours >= 9) return 6;
    if (hours >= 6) return 7;
    if (hours >= 4) return 8;
    if (hours >= 2) return 9;
    return 10;
  };

  const projectedRank = calculateProjectedRank(sliderHours);
  const declaredRank = declaredIds.indexOf(activeId) + 1;
  const originalTimeRank = currentRank;

  // Divergence calculation
  const originalGap = Math.abs(originalTimeRank - declaredRank);
  const projectedGap = Math.abs(projectedRank - declaredRank);
  const isNowHarmonized = projectedGap <= 1;

  // Waking life calculation (16 waking hours * 7 days = 112 hours)
  const wakingLifePct = Math.min(100, Math.round((sliderHours / 112) * 100));

  const handleApplyPreset = (hours: number) => {
    sound.playTick();
    sound.haptic(20);
    setSliderHours(hours);
  };

  const handleCommitRebalance = () => {
    sound.playLockConfirm();
    sound.haptic(35);

    // Reorder timeRanks based on new position
    const copy = [...timeRanks];
    const currentIndex = copy.indexOf(activeId);
    if (currentIndex !== -1) {
      copy.splice(currentIndex, 1);
    }
    const targetIndex = Math.min(copy.length, Math.max(0, projectedRank - 1));
    copy.splice(targetIndex, 0, activeId);

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const logDesc = `Rebalanced ${activeItem.name}: ${sliderHours}h/wk (Ranked #${projectedRank})`;

    setLastCommitNotice({
      msg: logDesc,
      time: timeStr,
    });

    onUpdatePriorities(declaredIds, undefined, copy, undefined, logDesc);
  };

  return (
    <div className="w-full bg-black border-2 border-amber-500 rounded-3xl shadow-2xl overflow-hidden font-sans select-none">
      
      {/* Top Telemetry Header */}
      <div className="bg-slate-950 border-b border-amber-500/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-12 bg-amber-500 rounded-l-2xl flex items-center justify-center text-black font-mono font-black text-sm shadow-md shadow-amber-500/30">
            3D
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs uppercase tracking-widest text-amber-400">
                TACTILE RESOURCE ENGINE
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[11px] border border-amber-500/40 font-bold">
                REAL-TIME VECTOR SIMULATION
              </span>
            </div>
            <h3 className="font-display font-black text-lg sm:text-xl text-white tracking-tight">
              Interactive 3D Resource Allocation Bar
            </h3>
          </div>
        </div>

        {/* Live Notification Banner */}
        {lastCommitNotice && (
          <div className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs font-mono flex items-center gap-2 animate-in fade-in duration-200">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-bold">{lastCommitNotice.msg}</span>
            <span className="text-emerald-400/80">({lastCommitNotice.time})</span>
          </div>
        )}
      </div>

      {/* Priority Selector Tabs (All 10 Priorities) */}
      <div className="bg-slate-950/90 border-b border-slate-800 p-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 min-w-max px-2">
          {declaredIds.map((id, index) => {
            const item = getPriorityById(id);
            if (!item) return null;
            const isSelected = id === activeId;
            const itemDelta = deltas.find(d => d.priorityId === id);
            const isCoherent = itemDelta ? itemDelta.totalDivergence <= 2 : false;

            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  sound.playTick();
                  sound.haptic(10);
                  onSelectPriority(id);
                }}
                className={`px-3 py-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg shadow-amber-500/20 ring-1 ring-amber-400'
                    : 'bg-black border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <span className="font-mono font-bold text-xs text-amber-400">
                  #{index + 1}
                </span>
                <span className="text-lg">{item.emoji}</span>
                <span className="text-xs font-bold whitespace-nowrap">{item.name}</span>
                {isCoherent ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="p-4 sm:p-7 space-y-6">
        
        {/* Selected Priority Diagnostic Strip */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="flex items-center gap-3.5">
            <span
              style={{ backgroundColor: `${activeItem.color}25`, borderColor: `${activeItem.color}60` }}
              className="text-4xl p-3 rounded-2xl border shadow-inner shrink-0"
            >
              {activeItem.emoji}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                  DECLARED PRIORITY #{declaredRank}
                </span>
                <span className="text-xs text-slate-500 font-mono">·</span>
                <span className="text-xs font-mono text-cyan-400">
                  CURRENT TIME: #{originalTimeRank}
                </span>
              </div>
              <h4 className="font-display font-black text-xl sm:text-2xl text-white">
                {activeItem.name}
              </h4>
              <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">
                {activeItem.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                sound.playTick();
                setShowSubFacetsModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono font-bold hover:bg-slate-800 hover:border-amber-400 transition-colors flex items-center gap-1.5 shadow"
              title="Inspect hierarchical sub-priorities"
            >
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Hierarchical Sub-Facets</span>
            </button>
            <button
              type="button"
              onClick={() => onExploreFriction(activeId)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold hover:bg-rose-500 hover:text-black transition-colors flex items-center gap-1.5 shadow"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Diagnose Friction</span>
            </button>
          </div>
        </div>

        {/* 3D Tactile Slider Module */}
        <div className="p-4 sm:p-6 rounded-2xl bg-black border-2 border-amber-500/70 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>3D Tactile Slider // Drag Thumb to Reallocate Waking Hours</span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Interactive WebGL 3D Control
            </span>
          </div>

          {/* Embedded WebGL 3D Slider */}
          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-[#030712] shadow-inner">
            <Tactile3DSliderBar
              priorityId={activeId}
              initialHours={sliderHours}
              minHours={0}
              maxHours={48}
              onChange={newHours => setSliderHours(newHours)}
              onCommit={newHours => {
                setSliderHours(newHours);
              }}
            />
          </div>

          {/* Quick Presets & Hours Readout */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 uppercase">Presets:</span>
              <button
                type="button"
                onClick={() => handleApplyPreset(4)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-colors ${
                  sliderHours === 4 ? 'bg-amber-500 text-black border-amber-400' : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                4h / wk (Light)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(12)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-colors ${
                  sliderHours === 12 ? 'bg-amber-500 text-black border-amber-400' : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                12h / wk (Balanced)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(25)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-colors ${
                  sliderHours === 25 ? 'bg-amber-500 text-black border-amber-400' : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                25h / wk (High Impact)
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-slate-400 font-mono block">Weekly Waking Life</span>
                <span className="text-base font-mono font-black text-amber-400">
                  {sliderHours} hrs/wk ({wakingLifePct}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Vector Tension & Rebalance Impact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Tension Vector Card */}
          <div className={`p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
            isNowHarmonized
              ? 'bg-emerald-950/20 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
              : 'bg-rose-950/20 border-rose-500/60 shadow-lg shadow-rose-500/10'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  Vector Alignment Prognosis
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                  isNowHarmonized
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {isNowHarmonized ? '✨ COHERENT' : '⚠️ MISALIGNED'}
                </span>
              </div>

              <div className="flex items-center gap-4 my-3">
                <div className="text-center p-3 rounded-xl bg-black border border-slate-800 flex-1">
                  <span className="text-[11px] font-mono text-slate-400 block uppercase">Original Time Rank</span>
                  <span className="text-2xl font-mono font-black text-rose-400">#{originalTimeRank}</span>
                </div>
                <ArrowRight className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="text-center p-3 rounded-xl bg-black border border-slate-800 flex-1">
                  <span className="text-[11px] font-mono text-slate-400 block uppercase">Projected Rank</span>
                  <span className="text-2xl font-mono font-black text-emerald-400">#{projectedRank}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-2">
                {isNowHarmonized ? (
                  <span>
                    Allocating <strong>{sliderHours} hours/week</strong> promotes this to rank <strong>#{projectedRank}</strong>, matching your declared priority <strong>#{declaredRank}</strong> and eliminating cognitive tension.
                  </span>
                ) : (
                  <span>
                    At <strong>{sliderHours} hours/week</strong>, this priority sits at rank <strong>#{projectedRank}</strong>, still <strong>{projectedGap} ranks</strong> away from your declared intention (#{declaredRank}).
                  </span>
                )}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Target Ideal:</span>
              <span className="text-amber-400 font-bold">Declared Rank #{declaredRank}</span>
            </div>
          </div>

          {/* Commit Rebalance Action Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Authoritative System Update
              </span>
              <h5 className="font-display font-bold text-base sm:text-lg text-white">
                Commit & Log Reallocation
              </h5>
              <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
                Applying this change updates your revealed preference record, adjusts your celestial orbital radius, recalculates your cross-signal insights, and logs a verified timestamped snapshot to your history.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCommitRebalance}
              className="w-full py-3.5 rounded-xl bg-amber-500 text-black font-mono font-black text-xs sm:text-sm uppercase tracking-wider hover:bg-amber-400 shadow-xl shadow-amber-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Lock In {sliderHours}h/wk Allocation</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hierarchical Sub-Facets Breakdown Modal */}
      {showSubFacetsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-lg p-5 sm:p-6 rounded-2xl bg-black border-2 border-amber-500/70 shadow-2xl flex flex-col font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 rounded-xl bg-slate-900 border border-slate-800">
                  {activeItem.emoji}
                </span>
                <div>
                  <span className="font-mono text-xs text-amber-400 font-bold uppercase tracking-wider block">
                    HIERARCHICAL SUB-FACET BREAKDOWN
                  </span>
                  <h3 className="font-display font-black text-lg sm:text-xl text-white">
                    {activeItem.name}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSubFacetsModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 py-4 overflow-y-auto max-h-[60vh]">
              <p className="text-xs text-slate-300">
                Every priority in the architecture breaks down into granular behavioral sub-components:
              </p>
              {activeItem.subPriorities.map((sub, idx) => (
                <div
                  key={sub.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3 hover:border-amber-500/40 transition-colors"
                >
                  <span className="text-2xl p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                    {sub.emoji}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-amber-400 font-bold">#{idx + 1}</span>
                      <h5 className="font-bold text-sm text-white">{sub.name}</h5>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{sub.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSubFacetsModal(false)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-black font-mono font-bold text-xs uppercase hover:bg-amber-400 transition-colors"
              >
                Close Sub-Facets
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
