import React, { useState } from 'react';
import { getPriorityById } from '../data/ontology';
import { sound } from '../services/sound';
import { Brain, ArrowRight, CheckCircle2, ChevronUp, ChevronDown } from 'lucide-react';

interface Props {
  declaredIds: string[];
  onComplete: (attentionRanks: string[]) => void;
}

interface Scenario {
  prompt: string;
  subtext: string;
}

const ATTENTION_SCENARIOS: Scenario[] = [
  {
    prompt: 'When taking a shower or standing in an elevator, what does your brain automatically drift to?',
    subtext: 'Your default cognitive gravitational pull',
  },
  {
    prompt: 'Which of these is most likely to keep you awake tossing and turning at midnight?',
    subtext: 'Where anxiety and unresolved mental loops lodge',
  },
  {
    prompt: 'Which of these can absorb your complete focus so thoroughly that hours vanish in minutes?',
    subtext: 'Effortless immersion and psychological absorption',
  },
];

export const AttentionGame: React.FC<Props> = ({ declaredIds, onComplete }) => {
  const [step, setStep] = useState<number>(0);
  const [scenarioVotes, setScenarioVotes] = useState<Record<string, number>>({});
  const [selectedInScenario, setSelectedInScenario] = useState<string | null>(null);
  const [rankedList, setRankedList] = useState<string[]>([]);
  const [isReviewing, setIsReviewing] = useState<boolean>(false);

  const currentScenario = ATTENTION_SCENARIOS[step];

  const handlePick = (priorityId: string) => {
    sound.playCardSelect();
    setSelectedInScenario(priorityId);
  };

  const handleNextScenario = () => {
    if (!selectedInScenario) return;
    const nextVotes = {
      ...scenarioVotes,
      [selectedInScenario]: (scenarioVotes[selectedInScenario] || 0) + 1,
    };
    setScenarioVotes(nextVotes);
    setSelectedInScenario(null);
    sound.playAscend();

    if (step + 1 < ATTENTION_SCENARIOS.length) {
      setStep(step + 1);
    } else {
      // Build attention ranking based on scenario picks and declared fallback
      const sorted = [...declaredIds].sort((a, b) => {
        const vB = nextVotes[b] || 0;
        const vA = nextVotes[a] || 0;
        if (vB !== vA) return vB - vA;
        return declaredIds.indexOf(a) - declaredIds.indexOf(b);
      });
      setRankedList(sorted);
      setIsReviewing(true);
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    sound.playTick();
    const copy = [...rankedList];
    const item = copy[index];
    copy[index] = copy[index - 1];
    copy[index - 1] = item;
    setRankedList(copy);
  };

  const moveDown = (index: number) => {
    if (index === rankedList.length - 1) return;
    sound.playTick();
    const copy = [...rankedList];
    const item = copy[index];
    copy[index] = copy[index + 1];
    copy[index + 1] = item;
    setRankedList(copy);
  };

  const handleConfirmFinal = () => {
    sound.playLockConfirm();
    onComplete(rankedList);
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      {/* Kicker & Title */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 text-xs text-violet-400 font-semibold tracking-wider uppercase mb-1">
          <Brain className="w-3.5 h-3.5" />
          <span>Behavioral Signal 3 of 3</span>
        </div>
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-100">
          YOUR MIND HAS A VOTE.
        </h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto mt-2">
          Where does your mental bandwidth actually live? Not where you wish it lived, but where thoughts wander when nobody is watching.
        </p>
      </div>

      {!isReviewing ? (
        /* Scenario Selection Screen */
        <div className="w-full space-y-4">
          <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-lg">
            <div className="text-xs font-semibold text-violet-400 tracking-wide mb-1">
              SCENARIO {step + 1} OF {ATTENTION_SCENARIOS.length}
            </div>
            <h3 className="font-display font-bold text-lg text-slate-100 leading-snug">
              {currentScenario.prompt}
            </h3>
            <p className="text-xs text-slate-400 mt-1">{currentScenario.subtext}</p>
          </div>

          <div className="space-y-2">
            {declaredIds.map(id => {
              const item = getPriorityById(id);
              if (!item) return null;
              const isSelected = selectedInScenario === id;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handlePick(id)}
                  className={`w-full p-3.5 rounded-xl border flex items-center justify-between text-left transition-all ${
                    isSelected
                      ? 'bg-violet-950/40 border-violet-400 ring-2 ring-violet-400/40'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                      {item.emoji}
                    </span>
                    <span className="font-semibold text-sm text-slate-100">{item.name}</span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? 'border-violet-400 bg-violet-400 text-slate-950'
                        : 'border-slate-700 bg-slate-950'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="w-full flex justify-end pt-2">
            <button
              type="button"
              disabled={!selectedInScenario}
              onClick={handleNextScenario}
              className={`px-6 py-3 rounded-xl font-display font-bold text-sm tracking-wide flex items-center gap-2 transition-all ${
                selectedInScenario
                  ? 'bg-violet-400 text-slate-950 hover:bg-violet-300 shadow-lg shadow-violet-500/20 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
              }`}
            >
              <span>{step + 1 === ATTENTION_SCENARIOS.length ? 'Review Attention Order' : 'Next Scenario'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Attention Ranking Confirmation Screen */
        <div className="w-full space-y-3">
          <div className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            Based on your scenarios, here is your estimated mental attention distribution. Adjust if needed:
          </div>

          {rankedList.map((id, index) => {
            const item = getPriorityById(id);
            if (!item) return null;

            return (
              <div
                key={item.id}
                className="w-full p-3.5 rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="font-display font-mono font-bold text-violet-400 text-base w-6">
                    #{index + 1}
                  </span>
                  <span className="text-2xl p-2 rounded-lg bg-slate-950 border border-slate-800">
                    {item.emoji}
                  </span>
                  <div>
                    <div className="font-semibold text-white text-sm sm:text-base">{item.name}</div>
                    <div className="text-xs sm:text-sm text-slate-300">
                      {index === 0
                        ? 'Highest mental occupation & daydream drift'
                        : index === rankedList.length - 1
                        ? 'Rarely crosses your mind unless prompted'
                        : `Attention rank #${index + 1}`}
                    </div>
                  </div>
                </div>

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
                    disabled={index === rankedList.length - 1}
                    onClick={() => moveDown(index)}
                    className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-20 transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          <div className="w-full flex justify-end pt-4">
            <button
              type="button"
              onClick={handleConfirmFinal}
              className="px-6 py-3 rounded-xl bg-violet-400 text-slate-950 font-display font-bold text-sm tracking-wide flex items-center gap-2 hover:bg-violet-300 shadow-lg shadow-violet-500/20 active:scale-95 transition-all"
            >
              <span>Generate Priority Universe</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
