import React, { useState } from 'react';
import { getPriorityById } from '../data/ontology';
import { FrictionFactor, FrictionRecord } from '../types';
import { sound } from '../services/sound';
import { X, Check, Sparkles, HelpCircle, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';

interface Props {
  priorityId: string;
  declaredRank: number;
  timeRank: number;
  moneyRank: number;
  onClose: () => void;
  onSave: (record: FrictionRecord) => void;
  onLaunchExperiment: (priorityId: string) => void;
}

const FRICTION_OPTIONS: { id: FrictionFactor; label: string; emoji: string }[] = [
  { id: 'time', label: 'Lack of uncommitted time / overscheduled', emoji: '⏱️' },
  { id: 'money', label: 'Financial cost or budget constraints', emoji: '💰' },
  { id: 'energy', label: 'Physical or emotional depletion / fatigue', emoji: '😴' },
  { id: 'fear', label: 'Fear of failure, vulnerability, or judgment', emoji: '😬' },
  { id: 'motivation', label: 'Inertia / high initial resistance to begin', emoji: '🧠' },
  { id: 'social', label: 'Social expectations / obligations to others', emoji: '👥' },
  { id: 'environment', label: 'Unfavorable physical space or household friction', emoji: '🏠' },
  { id: 'obligations', label: 'Work deadlines, family duties, or caregiving', emoji: '📋' },
  { id: 'convenience', label: 'Too many logistical hurdles or setup friction', emoji: '🚗' },
  { id: 'focus', label: 'Distractions & fractured cognitive bandwidth', emoji: '🎯' },
  { id: 'not_important', label: 'Maybe it isn’t as urgent as I initially thought', emoji: '🤷' },
  { id: 'unsure', label: 'Still investigating the underlying pattern', emoji: '❓' },
];

export const FrictionModal: React.FC<Props> = ({
  priorityId,
  declaredRank,
  timeRank,
  moneyRank,
  onClose,
  onSave,
  onLaunchExperiment,
}) => {
  const item = getPriorityById(priorityId);
  const [selectedFactors, setSelectedFactors] = useState<FrictionFactor[]>([]);
  const [reflectionText, setReflectionText] = useState('');

  if (!item) return null;

  // Behavioral Delta Analysis
  const timeDelta = timeRank - declaredRank; // positive = starved (declared #1, time #7 -> +6)
  const moneyDelta = moneyRank - declaredRank;
  const timeStarved = timeDelta >= 2;
  const moneyStarved = moneyDelta >= 2;
  const timeHonored = timeDelta <= 0;
  const moneyHonored = moneyDelta <= 0;
  const maxDivergence = Math.max(Math.abs(timeDelta), Math.abs(moneyDelta));

  // Determine actual state
  const isAligned = maxDivergence <= 1;
  const isTimeOnlyDeficit = timeStarved && !moneyStarved;
  const isMoneyOnlyDeficit = moneyStarved && timeHonored;
  const isDualDeficit = timeStarved && moneyStarved;
  const isStarved = isDualDeficit || isTimeOnlyDeficit || isMoneyOnlyDeficit;
  const isSurplus = (timeDelta <= -2 || moneyDelta <= -2) && !isAligned;

  const toggleFactor = (f: FrictionFactor) => {
    sound.playLcarsBeep();
    if (selectedFactors.includes(f)) {
      setSelectedFactors(selectedFactors.filter(x => x !== f));
    } else {
      setSelectedFactors([...selectedFactors, f]);
    }
  };

  const handleSaveFriction = () => {
    sound.playLcarsConfirm();
    onSave({
      priorityId,
      factors: selectedFactors,
      reflectionText,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className={`w-full max-w-xl p-5 sm:p-7 rounded-2xl bg-black border-2 shadow-2xl max-h-[92vh] flex flex-col font-sans ${
        isAligned ? 'border-emerald-500 shadow-emerald-500/20' : isStarved ? 'border-amber-500 shadow-amber-500/20' : 'border-cyan-500 shadow-cyan-500/20'
      }`}>
        
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl p-2.5 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
              {item.emoji}
            </span>
            <div>
              <div className="flex items-center gap-2">
                {isAligned ? (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs uppercase font-bold border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> High Coherence // Zero Friction
                  </span>
                ) : isStarved ? (
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-xs uppercase font-bold border border-rose-500/30 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Resource Deficit // Friction Detected
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-xs uppercase font-bold border border-cyan-500/30 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> Unconscious Surplus
                  </span>
                )}
              </div>
              <h3 className="font-display font-black text-xl sm:text-2xl text-white mt-1">
                {item.name} {isAligned && <span className="text-emerald-400 font-mono text-sm font-normal">· Harmonic Balance</span>}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto space-y-5 py-4 pr-1 text-slate-200">
          
          {/* Diagnostic Context with Accurate Logic */}
          <div className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed ${
            isAligned
              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-100'
              : isStarved
              ? 'bg-amber-950/20 border-amber-500/40 text-amber-100'
              : 'bg-cyan-950/20 border-cyan-500/40 text-cyan-100'
          }`}>
            {isAligned ? (
              <div>
                <strong className="font-bold text-white block text-sm sm:text-base mb-1">
                  ✨ Perfect Harmony Confirmed
                </strong>
                You declared <strong className="text-white">{item.name}</strong> as priority{' '}
                <strong className="text-emerald-400 font-mono font-bold">#{declaredRank}</strong>, and your
                calendar allocates it at{' '}
                <strong className="text-emerald-400 font-mono font-bold">#{timeRank}</strong> and spending at{' '}
                <strong className="text-emerald-400 font-mono font-bold">#{moneyRank}</strong>.
                <p className="mt-2 text-xs sm:text-sm text-slate-300">
                  Because your declared importance matches your actual resource allocation, there is <strong>zero behavioral friction</strong>. Your life resources are in genuine alignment with your declared intention.
                </p>
              </div>
            ) : isMoneyOnlyDeficit ? (
              <div>
                <strong className="font-bold text-cyan-300 block text-sm sm:text-base mb-1">
                  ⚖️ Time-Honored // Capital-Light Profile
                </strong>
                You declared <strong className="text-white">{item.name}</strong> as priority{' '}
                <strong className="text-amber-400 font-mono font-bold">#{declaredRank}</strong>, and your{' '}
                <strong className="text-cyan-400 font-mono font-bold">calendar actively honors it at #{timeRank}</strong>.
                Your financial allocation sits lower at{' '}
                <strong className="text-emerald-400 font-mono font-bold">#{moneyRank}</strong>.
                <p className="mt-2 text-xs sm:text-sm text-slate-300">
                  Because this priority receives your highest waking hours, it is <strong>not time-starved</strong>. Priorities like career craft, parenting, or self-reflection often require personal energy and focus rather than heavy direct spending. Ask yourself below if capital is truly needed, or if your current setup is already working.
                </p>
              </div>
            ) : isTimeOnlyDeficit ? (
              <div>
                <strong className="font-bold text-amber-300 block text-sm sm:text-base mb-1">
                  ⏱️ Calendar Deficit (Time Starvation)
                </strong>
                You declared <strong className="text-white">{item.name}</strong> as priority{' '}
                <strong className="text-amber-400 font-mono font-bold">#{declaredRank}</strong>, but your calendar schedule pushes it down to{' '}
                <strong className="text-rose-400 font-mono font-bold">#{timeRank}</strong>, while financial investment ranks at{' '}
                <strong className="text-emerald-400 font-mono font-bold">#{moneyRank}</strong>.
                <p className="mt-2 text-xs sm:text-sm text-slate-300">
                  Your intention is high, but your 168 weekly hours are being consumed by other demands, squeezing out the execution time this priority needs.
                </p>
              </div>
            ) : isDualDeficit ? (
              <div>
                <strong className="font-bold text-rose-300 block text-sm sm:text-base mb-1">
                  ⚠️ Resource Starvation Gap (Dual Deficit)
                </strong>
                You declared <strong className="text-white">{item.name}</strong> as a top priority ({' '}
                <strong className="text-amber-400 font-mono font-bold">#{declaredRank}</strong>), but your
                calendar drops it to <strong className="text-rose-400 font-mono font-bold">#{timeRank}</strong> and financial allocation to{' '}
                <strong className="text-rose-400 font-mono font-bold">#{moneyRank}</strong>.
                <p className="mt-2 text-xs sm:text-sm text-slate-300">
                  Both your hours and dollars are diverted away from this value. This stark divergence between what you declare and where life flows generates chronic psychological tension.
                </p>
              </div>
            ) : (
              <div>
                <strong className="font-bold text-cyan-300 block text-sm sm:text-base mb-1">
                  ⚡ Default / Habitual Drain
                </strong>
                You ranked <strong className="text-white">{item.name}</strong> at{' '}
                <strong className="text-amber-400 font-mono font-bold">#{declaredRank}</strong>, but your
                time is claimed at <strong className="text-cyan-400 font-mono font-bold">#{timeRank}</strong> and money at{' '}
                <strong className="text-emerald-400 font-mono font-bold">#{moneyRank}</strong>.
                <p className="mt-2 text-xs sm:text-sm text-slate-300">
                  You are dedicating substantial waking bandwidth here despite ranking it lower on your stated values.
                </p>
              </div>
            )}
          </div>

          {/* Conditional Options: Only show blocker checklist when there is real friction! */}
          {!isAligned ? (
            <div>
              <h4 className="font-mono font-bold text-xs sm:text-sm uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>
                  {isMoneyOnlyDeficit
                    ? 'Capital Assessment: What role does spending play here?'
                    : 'What is truly getting in the way? (Select all that apply)'}
                </span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {FRICTION_OPTIONS.map(opt => {
                  const isSelected = selectedFactors.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleFactor(opt.id)}
                      className={`p-3 rounded-xl border text-left text-xs sm:text-sm font-medium flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-rose-950/40 border-rose-400 text-rose-100 shadow'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{opt.emoji}</span>
                        <span className="leading-snug">{opt.label}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-rose-400 shrink-0 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs sm:text-sm font-mono font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Sustaining Strategy
              </span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Since this area is already flowing smoothly without chronic friction, you don't need to fix anything. Instead, notice what rituals or boundaries make this work so well for you.
              </p>
            </div>
          )}

          {/* Thoughtful Non-judgmental Reflective Prompts */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-mono font-bold text-slate-300 uppercase">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>{isAligned ? 'Coherence Reflection' : isMoneyOnlyDeficit ? 'Capital vs Time Reflection' : 'Reflective Inquiry'}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 italic">
              {isAligned
                ? '"What boundary or routine has been most effective in keeping this priority intact?"'
                : isMoneyOnlyDeficit
                ? '"Does this priority genuinely suffer from lack of financial investment, or does it thrive primarily through your presence and hours?"'
                : '"What are you protecting by keeping things the way they are right now? What would one small safe experiment look like?"'}
            </p>
            <textarea
              value={reflectionText}
              onChange={e => setReflectionText(e.target.value)}
              placeholder={isAligned ? 'Write down what keeps this area healthy...' : 'Jot down a quick personal reflection or honest note to yourself...'}
              rows={2}
              className="w-full text-xs sm:text-sm p-3 rounded-lg bg-black border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400 placeholder:text-slate-600 resize-none font-sans"
            />
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="pt-3.5 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              handleSaveFriction();
              onLaunchExperiment(priorityId);
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs sm:text-sm font-mono font-bold hover:bg-slate-800 hover:text-white transition-colors"
          >
            Design What-If Experiment →
          </button>
          <button
            type="button"
            onClick={handleSaveFriction}
            className="px-6 py-2.5 rounded-xl bg-amber-500 text-black font-mono font-black text-xs sm:text-sm uppercase tracking-wider hover:bg-amber-400 shadow-md transition-colors"
          >
            {isAligned ? 'Save Coherence Note' : 'Save Friction Note'}
          </button>
        </div>
      </div>
    </div>
  );
};
