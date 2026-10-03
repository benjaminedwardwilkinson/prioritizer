import React from 'react';
import { Share2, RotateCcw, Brain, BarChart2 } from 'lucide-react';
import { sound } from '../services/sound';
import { UserProfile } from '../types';

export type ActiveTab = 'universe' | 'whatif' | 'experiments' | 'orbit' | 'history' | 'achievements';

interface Props {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenShare: () => void;
  onResetQuiz: () => void;
  onOpenResearch: () => void;
  onOpenScience: () => void;
  onOpenCommunity: () => void;
  onOpenProfileReset: () => void;
  userProfile: UserProfile;
  hasCompletedFlow: boolean;
}

export const HeaderNav: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  onOpenShare,
  onResetQuiz,
  onOpenResearch,
  onOpenScience,
  onOpenCommunity,
  onOpenProfileReset,
  userProfile,
  hasCompletedFlow,
}) => {
  return (
    <header className="w-full border-b-2 border-amber-500/80 bg-black/95 backdrop-blur-md sticky top-0 z-40 font-sans shadow-lg shadow-black/80">
      {/* Top Console Frame */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left Console Identity Block */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center">
            <div className="h-9 sm:h-10 w-9 sm:w-11 bg-amber-500 rounded-l-2xl flex items-center justify-center text-black font-mono font-black text-xs sm:text-sm tracking-tighter shadow-sm shadow-amber-500/40">
              P10
            </div>
            <div className="h-9 sm:h-10 w-3 bg-[#FF9900]/80 mr-1" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-base sm:text-xl tracking-wider text-amber-400 uppercase">
                PRIORITIZER
              </span>
            </div>
            <div className="text-xs text-slate-300 font-mono tracking-wide hidden sm:block">
              BEHAVIORAL RESOURCE AUDIT & TENSION DIAGNOSTIC
            </div>
          </div>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Science & Ontology (Why Revealed Preference > MBTI) */}
          <button
            type="button"
            onClick={() => {
              sound.playLcarsBeep();
              onOpenScience();
            }}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-900 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-mono font-bold hover:bg-amber-500 hover:text-black transition-colors flex items-center gap-1.5 shadow-sm"
            title="Science & Behavioral Economics: Why Revealed Preference outperforms Myers-Briggs"
          >
            <Brain className="w-4 h-4 text-amber-400 group-hover:text-black shrink-0" />
            <span className="hidden md:inline">SCIENCE & ONTOLOGY</span>
            <span className="md:hidden">SCIENCE</span>
          </button>

          {/* Community Cohort Benchmark */}
          <button
            type="button"
            onClick={() => {
              sound.playLcarsBeep();
              onOpenCommunity();
            }}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-900 border border-cyan-500/40 text-cyan-300 text-xs sm:text-sm font-mono font-bold hover:bg-cyan-400 hover:text-black transition-colors flex items-center gap-1.5 shadow-sm"
            title="Comparative Norms: Compare your friction and allocations to 1,420+ adult profiles"
          >
            <BarChart2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="hidden md:inline">COHORT NORMS (1,420+)</span>
            <span className="md:hidden">NORMS</span>
          </button>

          {/* Individualized Profile Settings Button */}
          <button
            type="button"
            onClick={() => {
              sound.playLcarsBeep();
              onOpenProfileReset();
            }}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-900 border border-purple-500/40 text-purple-300 text-xs sm:text-sm font-mono font-bold hover:bg-purple-400 hover:text-black transition-colors flex items-center gap-1.5"
            title="Personal Profile & System Settings (Sound, Backup, Export, Reset)"
          >
            <span className="text-base">{userProfile.avatar}</span>
            <span className="max-w-[100px] truncate">{userProfile.name}</span>
          </button>

          {hasCompletedFlow && (
            <>
              <button
                type="button"
                onClick={() => {
                  sound.playLcarsBeep();
                  onOpenShare();
                }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs sm:text-sm font-mono font-semibold hover:border-amber-400 hover:text-white flex items-center gap-1.5 transition-colors"
                title="Share Priority Card"
              >
                <Share2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden sm:inline">SHARE</span>
              </button>

              <button
                type="button"
                onClick={onResetQuiz}
                className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
                title="Retake Tradeoff Diagnostic"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Segmented Architectural Nav Ribbon */}
      {hasCompletedFlow && (
        <div className="w-full border-t border-amber-500/30 bg-black overflow-x-auto no-scrollbar">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 flex items-center gap-1.5 py-1.5">
            
            {/* Console Bar 1: Universe */}
            <button
              type="button"
              onClick={() => {
                sound.playLcarsBeep();
                onSelectTab('universe');
              }}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-mono font-bold rounded-lg whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'universe'
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30 scale-102 font-black'
                  : 'text-amber-400/80 hover:text-amber-300 hover:bg-slate-900'
              }`}
            >
              <span>🌌</span>
              <span>PRIORITY CONSTELLATION</span>
            </button>

            {/* Console Bar 2: What-If Simulator */}
            <button
              type="button"
              onClick={() => {
                sound.playLcarsBeep();
                onSelectTab('whatif');
              }}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-mono font-bold rounded-lg whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'whatif'
                  ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-400/30 scale-102 font-black'
                  : 'text-cyan-400/80 hover:text-cyan-300 hover:bg-slate-900'
              }`}
            >
              <span>🧪</span>
              <span>WHAT-IF SIMULATOR</span>
            </button>

            {/* Console Bar 3: Life Experiments */}
            <button
              type="button"
              onClick={() => {
                sound.playLcarsBeep();
                onSelectTab('experiments');
              }}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-mono font-bold rounded-lg whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'experiments'
                  ? 'bg-emerald-400 text-black shadow-lg shadow-emerald-400/30 scale-102 font-black'
                  : 'text-emerald-400/80 hover:text-emerald-300 hover:bg-slate-900'
              }`}
            >
              <span>📋</span>
              <span>BEHAVIORAL EXPERIMENTS</span>
            </button>

            {/* Console Bar 4: Current Seasonal Orbit */}
            <button
              type="button"
              onClick={() => {
                sound.playLcarsBeep();
                onSelectTab('orbit');
              }}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-mono font-bold rounded-lg whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'orbit'
                  ? 'bg-[#FF9966] text-black shadow-lg shadow-[#FF9966]/30 scale-102 font-black'
                  : 'text-[#FF9966]/80 hover:text-[#FF9966] hover:bg-slate-900'
              }`}
            >
              <span>🌎</span>
              <span>CURRENT SEASON</span>
            </button>

            {/* Console Bar 5: History */}
            <button
              type="button"
              onClick={() => {
                sound.playLcarsBeep();
                onSelectTab('history');
              }}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-mono font-bold rounded-lg whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'bg-[#CC99CC] text-black shadow-lg shadow-[#CC99CC]/30 scale-102 font-black'
                  : 'text-[#CC99CC]/80 hover:text-[#CC99CC] hover:bg-slate-900'
              }`}
            >
              <span>🗓️</span>
              <span>LONGITUDINAL HISTORY</span>
            </button>

            {/* Console Bar 6: Milestones */}
            <button
              type="button"
              onClick={() => {
                sound.playLcarsBeep();
                onSelectTab('achievements');
              }}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-mono font-bold rounded-lg whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'achievements'
                  ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/30 scale-102 font-black'
                  : 'text-amber-400/80 hover:text-amber-300 hover:bg-slate-900'
              }`}
            >
              <span>🏆</span>
              <span>INSIGHT MILESTONES</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
