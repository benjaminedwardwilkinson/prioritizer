import React, { useState } from 'react';
import { X, BookOpen, Brain, Scale, Compass, CheckCircle2, AlertTriangle, Sparkles, HelpCircle, Layers, ArrowRight } from 'lucide-react';
import { sound } from '../services/sound';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ScienceOntologyModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'revealed' | 'vs_mbti' | 'currencies' | 'ontology'>('revealed');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl shadow-amber-500/10 overflow-hidden my-4 sm:my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 sm:px-8 py-4 sm:py-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20">
              <Brain className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-display font-bold text-white tracking-tight flex items-center gap-2">
                The Science & Behavioral Ontology
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Why Revealed Preference outperforms Myers-Briggs & pop-psychology quizzes
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.playCardSelect();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 sm:px-8 border-b border-slate-800 bg-slate-950/40 flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar shrink-0 py-2">
          <button
            type="button"
            onClick={() => {
              sound.playTick();
              setActiveTab('revealed');
            }}
            className={`px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'revealed'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            ⚖️ Revealed Preference
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playTick();
              setActiveTab('vs_mbti');
            }}
            className={`px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'vs_mbti'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            ⚡ Prioritizer vs. MBTI
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playTick();
              setActiveTab('currencies');
            }}
            className={`px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'currencies'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            💰 The 3 Currencies
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playTick();
              setActiveTab('ontology');
            }}
            className={`px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'ontology'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            📜 Schwartz & BLS Taxonomy
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-6 text-slate-300 text-sm sm:text-base leading-relaxed">
          {activeTab === 'revealed' && (
            <div className="space-y-6">
              <div className="p-4 sm:p-6 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-amber-400 font-mono text-xs uppercase tracking-wider font-semibold block mb-1">
                  Core Behavioral Economics Axiom
                </span>
                <p className="text-white text-base sm:text-lg font-medium italic">
                  "Actions are not merely evidence of what people want — actions are the only true proof of what people value under scarcity."
                </p>
                <span className="text-xs sm:text-sm text-slate-400 block mt-2">
                  — Paul Samuelson, Nobel Laureate in Economics (Theory of Revealed Preference, 1938)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 sm:p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="text-rose-400 font-bold flex items-center gap-2 text-sm sm:text-base">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    The Stated Preference Trap
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400">
                    When asked directly what matters, people describe an idealized self-image (aspirations, societal expectations, virtue signaling). We say "Health and Family are #1", but our bank account and calendar reveal 60 hours on spreadsheets and $300 on takeout.
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="text-emerald-400 font-bold flex items-center gap-2 text-sm sm:text-base">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    The Revealed Reality
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Prioritizer forces real-world tradeoff dilemmas, then measures actual binding votes across money, calendar time, and mental attention. Friction isn't moral failure — it's the exact gap between intention and habit.
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-xl bg-slate-950 border border-slate-800">
                <h3 className="font-bold text-white text-base mb-2 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-amber-400" />
                  Why Traditional Quizzes Lie to You
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-400 list-disc pl-5">
                  <li>
                    <strong className="text-slate-200">Social Desirability Bias:</strong> You unconsciously answer as the hero of your own movie.
                  </li>
                  <li>
                    <strong className="text-slate-200">The Barnum/Forer Effect:</strong> Generalities like "You value deep connection but need alone time" feel profound to everyone because they apply to literally everyone.
                  </li>
                  <li>
                    <strong className="text-slate-200">Zero Resource Scarcity:</strong> Quizzes let you claim you value 10 things equally because questions cost you zero hours and zero dollars.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'vs_mbti' && (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400">
                      <th className="py-3 px-3 sm:px-4 font-semibold">Evaluation Dimension</th>
                      <th className="py-3 px-3 sm:px-4 font-semibold text-rose-400">Myers-Briggs / Pop Quizzes</th>
                      <th className="py-3 px-3 sm:px-4 font-semibold text-amber-400">Prioritizer (Revealed Preference)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    <tr>
                      <td className="py-3 px-3 sm:px-4 font-semibold text-white">Scientific Status</td>
                      <td className="py-3 px-3 sm:px-4 text-slate-400">
                        Rejected by modern academic psychology. Low test-retest reliability (&gt;50% change type within 5 weeks).
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-emerald-300 font-medium">
                        Grounding in Behavioral Economics (Samuelson) & Shalom Schwartz's Basic Human Values (peer-reviewed in 82 countries).
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 sm:px-4 font-semibold text-white">Measurement Method</td>
                      <td className="py-3 px-3 sm:px-4 text-slate-400">
                        Passive self-assessment ratings ("Do you enjoy parties?").
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-emerald-300 font-medium">
                        Forced-tradeoff dilemma scenarios + 3-currency behavioral rank audit.
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 sm:px-4 font-semibold text-white">Psychological Target</td>
                      <td className="py-3 px-3 sm:px-4 text-slate-400">
                        Pigeonholes you into a rigid 4-letter static archetype (INTJ, ENFP).
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-emerald-300 font-medium">
                        Reveals dynamic allocation tension and actionable vectors of friction.
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 sm:px-4 font-semibold text-white">Actionable Outcome</td>
                      <td className="py-3 px-3 sm:px-4 text-slate-400">
                        Entertainment value, horoscope-like confirmation bias.
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-emerald-300 font-medium">
                        What-If Sandbox rebalancing, 30-day life experiments, 12-month orbit tracking.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-slate-400">
                <span className="font-bold text-white block mb-1">Takeaway</span>
                Myers-Briggs was written in 1942 without empirical data by two non-psychologists. Prioritizer treats you not as a fixed personality specimen, but as an active designer of your finite lifespan.
              </div>
            </div>
          )}

          {activeTab === 'currencies' && (
            <div className="space-y-6">
              <p className="text-slate-300 text-xs sm:text-base">
                You do not live in your thoughts; you live inside three binding resource constraints. Whenever these 3 signals point in different directions, chronic friction results.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-amber-500/20 flex flex-col justify-between">
                  <div>
                    <div className="text-2xl mb-2">⏱️</div>
                    <h4 className="text-white font-bold text-base mb-1">Time (The Fixed Supply)</h4>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      Exactly 168 hours per week. Cannot be saved, invested, or refunded. Where your waking calendar blocks fall is your undeniable primary life vote.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-amber-400 font-mono">
                    Non-fungible & finite
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-emerald-500/20 flex flex-col justify-between">
                  <div>
                    <div className="text-2xl mb-2">💰</div>
                    <h4 className="text-white font-bold text-base mb-1">Money (Crystallized Energy)</h4>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      Money is hours of life energy converted into abstract purchasing tokens. Your credit card statement is an unvarnished moral transcript of your choices.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-emerald-400 font-mono">
                    Fungible life tokens
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-cyan-500/20 flex flex-col justify-between">
                  <div>
                    <div className="text-2xl mb-2">🧠</div>
                    <h4 className="text-white font-bold text-base mb-1">Attention (Cognitive Drift)</h4>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      Where does your mind drift in the shower? What keeps you awake at 2 AM? Where your mental bandwidth lodges reveals what your nervous system truly prioritizes.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-cyan-400 font-mono">
                    Subconscious bandwidth
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <h4 className="font-bold text-amber-300 text-sm sm:text-base mb-1">
                  The Friction Equation:
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 font-mono">
                  Friction Gap = Stated Importance - Average Behavioral Allocation Rank
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  When Stated Rank is 1 (Top Priority) but Behavioral Rank is 5 (Bottom), the delta generates cognitive dissonance, self-reproach, and quiet despair.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'ontology' && (
            <div className="space-y-6">
              <div className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-amber-400" />
                  1. Schwartz's Refined Theory of Basic Human Values
                </h4>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Developed by social psychologist Dr. Shalom H. Schwartz, this framework is the global gold standard in cross-cultural value research. It identifies 19 universally recognized motivational value orientations that exist across every human society, organized along circular motivational axes:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-300">
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <strong className="text-amber-400">Openness to Change:</strong> Self-Direction, Stimulation, Hedonism.
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <strong className="text-cyan-400">Conservation:</strong> Security, Conformity, Tradition.
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <strong className="text-emerald-400">Self-Transcendence:</strong> Benevolence, Universalism, Nature.
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <strong className="text-violet-400">Self-Enhancement:</strong> Achievement, Power, Competence.
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-cyan-400" />
                  2. Bureau of Labor Statistics (BLS) American Time Use Survey
                </h4>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Prioritizer maps Schwartz's abstract motivational values to the concrete activity taxonomy tracked by the BLS: Sleep/Rest, Market Work, Educational Activities, Childcare & Caregiving, Domestic Sanctuary, Active Movement/Sports, and Socializing.
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  3. Pew Research Meaning Taxonomy
                </h4>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Synthesizing empirical surveys on where people report finding enduring life meaning: Family (69%), Career & Accomplishment (34%), Creative/Personal Hobbies (19%), Physical Vitality (11%), and Spiritual / Philosophical Reverence (15%).
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 sm:px-8 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-mono hidden sm:inline">
            Axiom: What is chosen under constraints constitutes true values.
          </span>
          <button
            type="button"
            onClick={() => {
              sound.playLevelUp();
              onClose();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-300 transition-all ml-auto"
          >
            Got It — Back to Game
          </button>
        </div>
      </div>
    </div>
  );
};
