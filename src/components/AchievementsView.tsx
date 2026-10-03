import React, { useState } from 'react';
import { INITIAL_ACHIEVEMENTS } from '../data/achievements';
import { Achievement } from '../types';
import { sound } from '../services/sound';
import { Trophy, Lock, Sparkles, CheckCircle2, X } from 'lucide-react';

interface Props {
  unlockedIds: string[];
}

export const AchievementsView: React.FC<Props> = ({ unlockedIds }) => {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  const unlockedCount = unlockedIds.length;
  const totalCount = INITIAL_ACHIEVEMENTS.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  const handleCardClick = (ach: Achievement) => {
    sound.playChime(500, 'sine', 0.15);
    setSelectedAchievement(ach);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold tracking-wider uppercase mb-1">
          <Trophy className="w-3.5 h-3.5" />
          <span>Milestone Vault</span>
        </div>
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-100">
          YOUR COLLECTION
        </h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto mt-2">
          Milestones earned by exploring your truth, confronting time tradeoffs, and running life experiments.
        </p>

        {/* Global Progress Track */}
        <div className="w-full max-w-sm mx-auto mt-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>Unlocked</span>
            <span className="font-mono text-amber-400 font-bold">
              {unlockedCount} / {totalCount} ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid of Badges */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3">
        {INITIAL_ACHIEVEMENTS.map(ach => {
          const isUnlocked = unlockedIds.includes(ach.id);

          return (
            <button
              key={ach.id}
              type="button"
              onClick={() => handleCardClick(ach)}
              className={`p-4 rounded-2xl border text-center flex flex-col items-center transition-all ${
                isUnlocked
                  ? 'bg-slate-900 border-amber-400/50 shadow-lg shadow-amber-500/10 hover:border-amber-400 scale-100'
                  : 'bg-slate-950/60 border-slate-800/80 opacity-60 hover:opacity-85'
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-2.5 transition-all ${
                  isUnlocked
                    ? 'bg-slate-950 border border-amber-400/40 shadow-inner'
                    : 'bg-slate-900/80 border border-slate-800 grayscale'
                }`}
              >
                {isUnlocked ? ach.icon : <Lock className="w-6 h-6 text-slate-600" />}
              </div>

              <div className="font-display font-bold text-xs text-slate-100 line-clamp-1">
                {ach.title}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase tracking-wider">
                {ach.category}
              </div>
            </button>
          );
        })}
      </div>

      {/* Modal Detail */}
      {selectedAchievement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm p-6 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-center relative">
            <button
              type="button"
              onClick={() => setSelectedAchievement(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-20 h-20 mx-auto rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-4xl mb-4 shadow-xl">
              {unlockedIds.includes(selectedAchievement.id) ? (
                selectedAchievement.icon
              ) : (
                <Lock className="w-8 h-8 text-slate-600" />
              )}
            </div>

            <div className="text-[11px] font-mono font-semibold uppercase text-amber-400 tracking-wider mb-1">
              {selectedAchievement.category}
            </div>

            <h3 className="font-display font-extrabold text-xl text-slate-100">
              {selectedAchievement.title}
            </h3>

            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {selectedAchievement.description}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Rarity Score</span>
              <span className="font-mono text-cyan-400 font-bold">
                {selectedAchievement.rarityPercent}% of prioritizers
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
