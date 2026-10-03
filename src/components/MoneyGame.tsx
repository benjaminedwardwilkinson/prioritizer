import React, { useState } from 'react';
import { getPriorityById } from '../data/ontology';
import { sound } from '../services/sound';
import { ChevronUp, ChevronDown, Coins, ArrowRight } from 'lucide-react';

interface Props {
  declaredIds: string[];
  onComplete: (moneyRanks: string[]) => void;
}

export const MoneyGame: React.FC<Props> = ({ declaredIds, onComplete }) => {
  const [rankedIds, setRankedIds] = useState<string[]>(declaredIds);

  const moveUp = (index: number) => {
    if (index === 0) return;
    sound.playTick();
    const copy = [...rankedIds];
    const item = copy[index];
    copy[index] = copy[index - 1];
    copy[index - 1] = item;
    setRankedIds(copy);
  };

  const moveDown = (index: number) => {
    if (index === rankedIds.length - 1) return;
    sound.playTick();
    const copy = [...rankedIds];
    const item = copy[index];
    copy[index] = copy[index + 1];
    copy[index + 1] = item;
    setRankedIds(copy);
  };

  const handleFinish = () => {
    sound.playLockConfirm();
    onComplete(rankedIds);
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      {/* Kicker & Title */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold tracking-wider uppercase mb-1">
          <Coins className="w-3.5 h-3.5" />
          <span>Behavioral Signal 1 of 3</span>
        </div>
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-100">
          YOUR MONEY HAS A VOTE.
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mt-2 leading-relaxed">
          Bank statements tell honest stories. Rank your 10 priorities from where you actually spend the <strong className="text-emerald-400">most money</strong> (#1) to the <strong className="text-slate-200">least</strong> (#10).
        </p>
      </div>

      {/* Stack with Up/Down buttons & Drag visual */}
      <div className="w-full space-y-2.5">
        <div className="flex items-center justify-between text-xs font-mono text-emerald-400 px-2 uppercase font-bold">
          <span>Most Capital (#1)</span>
          <span>Least Capital (#10)</span>
        </div>

        {rankedIds.map((id, index) => {
          const item = getPriorityById(id);
          if (!item) return null;

          return (
            <div
              key={item.id}
              className={`w-full p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                index === 0
                  ? 'bg-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-900/70 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-display font-mono font-bold text-emerald-400 text-base w-6">
                  #{index + 1}
                </span>
                <span className="text-2xl p-2 rounded-lg bg-slate-950 border border-slate-800">
                  {item.emoji}
                </span>
                <div>
                  <div className="font-semibold text-slate-100 text-sm">{item.name}</div>
                  <div className="text-[11px] text-slate-400">
                    {index === 0
                      ? 'Largest financial resource allocation'
                      : index === 4
                      ? 'Lowest relative expenditure'
                      : `Spending rank #${index + 1}`}
                  </div>
                </div>
              </div>

              {/* Move controls */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveUp(index)}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-20 transition-colors"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={index === rankedIds.length - 1}
                  onClick={() => moveDown(index)}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-20 transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="w-full flex justify-end mt-6">
        <button
          type="button"
          onClick={handleFinish}
          className="px-6 py-3 rounded-xl bg-emerald-400 text-slate-950 font-display font-bold text-sm tracking-wide flex items-center gap-2 hover:bg-emerald-300 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
        >
          <span>Confirm Money Ranking</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
