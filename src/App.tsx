import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storage';
import { sound } from './services/sound';
import { calculatePriorityDeltas, generateInsights, CalculatedDeltas } from './services/insightEngine';
import { getCurrentMonthOrbit } from './data/seasonalData';
import { FrictionRecord, LifeExperiment, PriorityInsight, ProfileSnapshot } from './types';
import { HeaderNav, ActiveTab } from './components/HeaderNav';
import { QuizGame } from './components/QuizGame';
import { TopFiveReveal } from './components/TopFiveReveal';
import { MoneyGame } from './components/MoneyGame';
import { TimeGame } from './components/TimeGame';
import { AttentionGame } from './components/AttentionGame';
import { UniverseScene } from './components/UniverseScene';
import { PriorityDiorama3D } from './components/PriorityDiorama3D';
import { Interactive3DSliderStudio } from './components/Interactive3DSliderStudio';
import { FrictionModal } from './components/FrictionModal';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { LifeExperimentsView } from './components/LifeExperimentsView';
import { OrbitSeasonView } from './components/OrbitSeasonView';
import { HistoryView } from './components/HistoryView';
import { AchievementsView } from './components/AchievementsView';
import { ShareModal } from './components/ShareModal';
import { EmailSaveModal } from './components/EmailSaveModal';
import { ResearchTrendsModal } from './components/ResearchTrendsModal';
import { ScienceOntologyModal } from './components/ScienceOntologyModal';
import { CommunityComparisonModal } from './components/CommunityComparisonModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { Hero3DCanvas } from './components/Hero3DCanvas';
import { DeepSpaceBackground3D } from './components/DeepSpaceBackground3D';
import { Sparkles, ArrowRight, Compass, ShieldAlert, Award, Sliders, Layers, Brain, BarChart2, Radio, Terminal } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from './types';

type FlowStage =
  | 'welcome'
  | 'quiz'
  | 'reveal_top5'
  | 'money_game'
  | 'time_game'
  | 'attention_game'
  | 'dashboard';

export default function App() {
  // Primary state
  const [stage, setStage] = useState<FlowStage>('welcome');
  const [activeTab, setActiveTab] = useState<ActiveTab>('universe');

  // Resource Signals data
  const [declaredIds, setDeclaredIds] = useState<string[]>([]);
  const [moneyRanks, setMoneyRanks] = useState<string[]>([]);
  const [timeRanks, setTimeRanks] = useState<string[]>([]);
  const [attentionRanks, setAttentionRanks] = useState<string[]>([]);

  // Calculated insights & universe data
  const [deltas, setDeltas] = useState<CalculatedDeltas[]>([]);
  const [insights, setInsights] = useState<PriorityInsight[]>([]);
  const [selectedPriorityId, setSelectedPriorityId] = useState<string | null>(null);
  const [mode3D, setMode3D] = useState<'slider' | 'celestial'>('slider');

  // Modals & Secondary state
  const [frictionTargetId, setFrictionTargetId] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isResearchModalOpen, setIsResearchModalOpen] = useState(false);
  const [isScienceModalOpen, setIsScienceModalOpen] = useState(false);
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);
  const [isProfileResetModalOpen, setIsProfileResetModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(StorageService.getUserProfile());
  const [experiments, setExperiments] = useState<LifeExperiment[]>([]);
  const [snapshots, setSnapshots] = useState<ProfileSnapshot[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [isSoundMuted, setIsSoundMuted] = useState(sound.getMuted());

  // Load existing session data on mount
  useEffect(() => {
    const savedDeclared = StorageService.getDeclaredPriorities();
    const savedMoney = StorageService.getResourceRanks('money');
    const savedTime = StorageService.getResourceRanks('time');
    const savedAttention = StorageService.getResourceRanks('attention');

    setExperiments(StorageService.getExperiments());
    setSnapshots(StorageService.getSnapshots());
    setUnlockedAchievements(StorageService.getUnlockedAchievementIds());

    if (savedDeclared.length >= 5 && savedMoney.length >= 5 && savedTime.length >= 5 && savedAttention.length >= 5) {
      setDeclaredIds(savedDeclared);
      setMoneyRanks(savedMoney);
      setTimeRanks(savedTime);
      setAttentionRanks(savedAttention);

      const d = calculatePriorityDeltas(savedDeclared, savedMoney, savedTime, savedAttention);
      const ins = generateInsights(d);
      setDeltas(d);
      setInsights(ins);
      setStage('dashboard');
    }
  }, []);

  const handleStartFlow = () => {
    sound.enableAudioOnFirstTouch();
    sound.playCardSelect();
    setStage('quiz');
  };

  const handleQuizComplete = (inferredTop5: string[]) => {
    setDeclaredIds(inferredTop5);
    unlockAchievementWithFeedback('first_step');
    setStage('reveal_top5');
  };

  const handleConfirmDeclared = (confirmedIds: string[]) => {
    setDeclaredIds(confirmedIds);
    StorageService.setDeclaredPriorities(confirmedIds);
    setStage('money_game');
  };

  const handleMoneyComplete = (money: string[]) => {
    setMoneyRanks(money);
    StorageService.setResourceRanks('money', money);
    unlockAchievementWithFeedback('money_talks');
    setStage('time_game');
  };

  const handleTimeComplete = (time: string[]) => {
    setTimeRanks(time);
    StorageService.setResourceRanks('time', time);
    unlockAchievementWithFeedback('time_talks');
    setStage('attention_game');
  };

  const handleAttentionComplete = (attention: string[]) => {
    setAttentionRanks(attention);
    StorageService.setResourceRanks('attention', attention);
    unlockAchievementWithFeedback('mind_reader');

    // Calculate universe & insights
    const d = calculatePriorityDeltas(declaredIds, moneyRanks, timeRanks, attention);
    const ins = generateInsights(d);
    setDeltas(d);
    setInsights(ins);

    // Save initial snapshot
    const currentMonth = getCurrentMonthOrbit();
    const newSnapshot: ProfileSnapshot = {
      id: `snap_${Date.now()}`,
      timestamp: new Date().toISOString(),
      dateLabel: `${currentMonth.fullName} ${new Date().getFullYear()}`,
      seasonId: currentMonth.season,
      seasonName: `${currentMonth.fullName} (${currentMonth.theme})`,
      declaredRanks: declaredIds,
      moneyRanks: moneyRanks,
      timeRanks: timeRanks,
      attentionRanks: attention,
      frictions: StorageService.getFrictions(),
      activeExperimentsCount: experiments.length,
      dominantInsight: ins[0]?.title || 'Universe harmonized',
    };
    StorageService.saveSnapshot(newSnapshot);
    setSnapshots(StorageService.getSnapshots());

    unlockAchievementWithFeedback('first_reveal');
    sound.playBigReveal();
    setStage('dashboard');
    setActiveTab('universe');
  };

  const unlockAchievementWithFeedback = (achId: string) => {
    const isNew = StorageService.unlockAchievement(achId);
    if (isNew) {
      setUnlockedAchievements(StorageService.getUnlockedAchievementIds());
      sound.playAchievement();
    }
  };

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsSoundMuted(muted);
  };

  const handleFullReset = () => {
    sound.playBuzz();
    setDeclaredIds([]);
    setMoneyRanks([]);
    setTimeRanks([]);
    setAttentionRanks([]);
    setDeltas([]);
    setInsights([]);
    setSelectedPriorityId(null);
    setFrictionTargetId(null);
    setExperiments(StorageService.getExperiments());
    setSnapshots([]);
    setUnlockedAchievements([]);
    setUserProfile(StorageService.getUserProfile());
    setIsProfileResetModalOpen(false);
    setStage('welcome');
    setActiveTab('universe');
  };

  const handleSaveFriction = (record: FrictionRecord) => {
    StorageService.saveFriction(record);
    unlockAchievementWithFeedback('friction_spotter');
  };

  const handleCommitExperiment = (exp: LifeExperiment) => {
    StorageService.saveExperiment(exp);
    setExperiments(StorageService.getExperiments());
    unlockAchievementWithFeedback('maker');
    setActiveTab('experiments');
  };

  const handleUpdateExperiment = (exp: LifeExperiment) => {
    StorageService.saveExperiment(exp);
    setExperiments(StorageService.getExperiments());
  };

  const handleRecordSeasonalSnapshot = (seasonLabel: string, selectedIds: string[]) => {
    const snapshot: ProfileSnapshot = {
      id: `snap_${Date.now()}`,
      timestamp: new Date().toISOString(),
      dateLabel: seasonLabel,
      seasonId: 'SEASONAL',
      seasonName: seasonLabel,
      declaredRanks: selectedIds.length >= 5 ? selectedIds.slice(0, 5) : declaredIds,
      moneyRanks: moneyRanks,
      timeRanks: timeRanks,
      attentionRanks: attentionRanks,
      frictions: StorageService.getFrictions(),
      activeExperimentsCount: experiments.length,
      dominantInsight: `Seasonal check-in: ${seasonLabel}`,
    };
    StorageService.saveSnapshot(snapshot);
    setSnapshots(StorageService.getSnapshots());
    unlockAchievementWithFeedback('seasonal_pulse');
    unlockAchievementWithFeedback('orbital');
  };

  const handleRebalanceIn3D = (
    updatedDeclared: string[],
    updatedMoney?: string[],
    updatedTime?: string[],
    updatedAttention?: string[],
    changeDesc?: string
  ) => {
    setDeclaredIds(updatedDeclared);
    if (updatedMoney) setMoneyRanks(updatedMoney);
    if (updatedTime) setTimeRanks(updatedTime);
    if (updatedAttention) setAttentionRanks(updatedAttention);

    const mRanks = updatedMoney || moneyRanks;
    const tRanks = updatedTime || timeRanks;
    const aRanks = updatedAttention || attentionRanks;

    const newDeltas = calculatePriorityDeltas(updatedDeclared, mRanks, tRanks, aRanks);
    const newInsights = generateInsights(newDeltas);
    setDeltas(newDeltas);
    setInsights(newInsights);

    // Record change to persistent storage & audit trail
    const note = changeDesc || '3D Diorama Real-Time Rebalance';
    const snapshot: ProfileSnapshot = {
      id: `snap_${Date.now()}`,
      timestamp: new Date().toISOString(),
      dateLabel: `3D Rebalance · ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      seasonId: '3D_ADJUSTMENT',
      seasonName: note,
      declaredRanks: updatedDeclared,
      moneyRanks: mRanks,
      timeRanks: tRanks,
      attentionRanks: aRanks,
      frictions: StorageService.getFrictions(),
      activeExperimentsCount: experiments.length,
      dominantInsight: note,
    };
    StorageService.saveSnapshot(snapshot);
    setSnapshots(StorageService.getSnapshots());

    StorageService.setDeclaredPriorities(updatedDeclared);
    StorageService.setResourceRanks('money', mRanks);
    StorageService.setResourceRanks('time', tRanks);
    StorageService.setResourceRanks('attention', aRanks);
  };

  const handleResetQuiz = () => {
    sound.playTick();
    setStage('quiz');
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950 relative">
      {/* Animated Three.js WebGL Deep Space Background */}
      <DeepSpaceBackground3D />

      {/* Top Header / Navigation */}
      <HeaderNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenShare={() => {
          unlockAchievementWithFeedback('first_share');
          setIsShareModalOpen(true);
        }}
        onResetQuiz={handleResetQuiz}
        onOpenResearch={() => setIsResearchModalOpen(true)}
        onOpenScience={() => setIsScienceModalOpen(true)}
        onOpenCommunity={() => setIsCommunityModalOpen(true)}
        onOpenProfileReset={() => setIsProfileResetModalOpen(true)}
        userProfile={userProfile}
        hasCompletedFlow={stage === 'dashboard'}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8 flex flex-col items-center">
        {/* STAGE 1: Welcome & Onboarding Screen */}
        {stage === 'welcome' && (
          <div className="w-full max-w-3xl text-center py-4 sm:py-8 animate-in fade-in duration-300 font-sans">
            
            {/* Diagnostic Header Bar */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 rounded-lg bg-black border-2 border-amber-500/70 text-amber-400 font-mono text-xs sm:text-sm font-bold mb-4 tracking-wider uppercase shadow-md shadow-amber-500/10">
              <Terminal className="w-4 h-4 text-amber-400" />
              <span>REVEALED PREFERENCE DIAGNOSTIC // 10-DIMENSIONAL AUDIT</span>
            </div>

            <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight leading-[1.15]">
              What do you say matters? <br />
              <span className="bg-gradient-to-r from-amber-400 via-[#FF9900] to-cyan-400 bg-clip-text text-transparent">
                Where does your life actually go?
              </span>
            </h1>

            <p className="text-xs sm:text-base text-slate-300 max-w-xl mx-auto mt-3 sm:mt-4 leading-relaxed font-medium">
              Prioritizer maps your top 10 values, tests them against your real-world money, calendar hours, and mental bandwidth, and uncovers actionable friction without moral judgment.
            </p>

            {/* Quick Science & Ontology Link Button */}
            <div className="mt-3 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  sound.playLcarsBeep();
                  setIsScienceModalOpen(true);
                }}
                className="px-4 py-1.5 rounded-lg bg-slate-900 border border-amber-500/50 text-amber-300 font-mono text-xs sm:text-sm font-bold hover:bg-amber-500 hover:text-black transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Brain className="w-4 h-4 text-amber-400" />
                <span>Why Revealed Preference beats Myers-Briggs & pop quizzes →</span>
              </button>
            </div>

            {/* Interactive 3D Cosmic Gyroscope */}
            <Hero3DCanvas />

            {/* 4-Stage Visual Path with Accessible Mobile Fonts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6 sm:my-8 text-left">
              <div className="p-3.5 rounded-xl bg-black border-2 border-amber-500/40">
                <span className="text-xs font-mono font-black text-amber-400">01 / DISCOVER</span>
                <div className="font-bold text-sm sm:text-base text-white mt-1">Top 10 Values</div>
                <div className="text-xs sm:text-sm text-slate-300 mt-1">Tactile tradeoff dilemmas</div>
              </div>
              <div className="p-3.5 rounded-xl bg-black border-2 border-emerald-500/40">
                <span className="text-xs font-mono font-black text-emerald-400">02 / COMPARE</span>
                <div className="font-bold text-sm sm:text-base text-white mt-1">Resource Votes</div>
                <div className="text-xs sm:text-sm text-slate-300 mt-1">Money, time, & attention</div>
              </div>
              <div className="p-3.5 rounded-xl bg-black border-2 border-cyan-500/40">
                <span className="text-xs font-mono font-black text-cyan-400">03 / EXPLORE</span>
                <div className="font-bold text-sm sm:text-base text-white mt-1">3D Universe</div>
                <div className="text-xs sm:text-sm text-slate-300 mt-1">10-orbit celestial system</div>
              </div>
              <div className="p-3.5 rounded-xl bg-black border-2 border-purple-500/40">
                <span className="text-xs font-mono font-black text-purple-400">04 / EXPERIMENT</span>
                <div className="font-bold text-sm sm:text-base text-white mt-1">Life Design</div>
                <div className="text-xs sm:text-sm text-slate-300 mt-1">What-If sandbox & 30d tests</div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartFlow}
              className="px-8 sm:px-10 py-4 sm:py-4.5 rounded-xl bg-amber-500 text-black font-mono font-black text-sm sm:text-base uppercase tracking-wider flex items-center justify-center gap-2.5 mx-auto hover:bg-amber-400 shadow-xl shadow-amber-500/30 active:scale-95 transition-all"
            >
              <span>BEGIN 10-PRIORITY REVEALED AUDIT</span>
              <ArrowRight className="w-5 h-5 stroke-[3]" />
            </button>
            <div className="text-xs sm:text-sm text-slate-400 font-mono mt-3">
              Takes ~5 minutes · Individualized & cookie-synced · Zero external AI required
            </div>
          </div>
        )}

        {/* STAGE 2: Dilemma Quiz */}
        {stage === 'quiz' && <QuizGame onComplete={handleQuizComplete} />}

        {/* STAGE 3: Top 5 Reveal & Confirmation */}
        {stage === 'reveal_top5' && (
          <TopFiveReveal initialTop5Ids={declaredIds} onConfirm={handleConfirmDeclared} />
        )}

        {/* STAGE 4: Money Ranking Game */}
        {stage === 'money_game' && (
          <MoneyGame declaredIds={declaredIds} onComplete={handleMoneyComplete} />
        )}

        {/* STAGE 5: Calendar Time Ranking Game */}
        {stage === 'time_game' && (
          <TimeGame declaredIds={declaredIds} onComplete={handleTimeComplete} />
        )}

        {/* STAGE 6: Mind Attention Game */}
        {stage === 'attention_game' && (
          <AttentionGame declaredIds={declaredIds} onComplete={handleAttentionComplete} />
        )}

        {/* STAGE 7: Full Dashboard & Exploration Mode */}
        {stage === 'dashboard' && (
          <div className="w-full flex flex-col items-center">
            {/* TAB: PRIORITY UNIVERSE */}
            {activeTab === 'universe' && (
              <div className="w-full space-y-6">
                {/* 3D Representation Switcher: Tactile Slider Studio vs Celestial Orbits */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300 font-display uppercase tracking-wide">
                      3D World View:
                    </span>
                    <div className="flex items-center bg-slate-900 border-2 border-slate-800 rounded-xl p-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          sound.playTick();
                          setMode3D('slider');
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                          mode3D === 'slider'
                            ? 'bg-amber-400 text-slate-950 shadow-md scale-100'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        🎚️ 3D Tactile Slider Studio
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          sound.playTick();
                          setMode3D('celestial');
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                          mode3D === 'celestial'
                            ? 'bg-amber-400 text-slate-950 shadow-md scale-100'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        🌌 3D Celestial Orbits (10 Orbits)
                      </button>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Physically drag the 3D slider to project vector rebalance & alignment in real time
                  </span>
                </div>

                {/* Main 3D Interactive Canvas */}
                {mode3D === 'slider' ? (
                  <Interactive3DSliderStudio
                    deltas={deltas}
                    declaredIds={declaredIds}
                    moneyRanks={moneyRanks}
                    timeRanks={timeRanks}
                    attentionRanks={attentionRanks}
                    onSelectPriority={id => {
                      unlockAchievementWithFeedback('explorer');
                      setSelectedPriorityId(id);
                    }}
                    selectedPriorityId={selectedPriorityId}
                    onExploreFriction={id => {
                      setFrictionTargetId(id);
                    }}
                    onUpdatePriorities={handleRebalanceIn3D}
                  />
                ) : (
                  <UniverseScene
                    deltas={deltas}
                    onSelectPriority={id => {
                      unlockAchievementWithFeedback('explorer');
                      setSelectedPriorityId(id);
                    }}
                    selectedPriorityId={selectedPriorityId}
                    onExploreFriction={id => {
                      setFrictionTargetId(id);
                    }}
                  />
                )}

                {/* Behavioral Reveal Engine & Insight Cards */}
                <div className="w-full space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-extrabold text-lg text-slate-100 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Behavioral Signal Revelations</span>
                    </h3>
                    <span className="text-xs text-slate-400 font-medium">
                      Comparing Declared vs Money, Time & Attention
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {insights.map(ins => {
                      const isGap = ins.type === 'PRIORITY_GAP';
                      const isAligned = ins.type === 'ALIGNED';
                      const isSplit = ins.type === 'CROSS_SIGNAL_SPLIT';

                      return (
                        <div
                          key={ins.id}
                          className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                            isGap
                              ? 'bg-rose-950/20 border-rose-500/40'
                              : isAligned
                              ? 'bg-emerald-950/20 border-emerald-500/40'
                              : isSplit
                              ? 'bg-amber-950/20 border-amber-500/40'
                              : 'bg-slate-900/80 border-slate-800'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                                {ins.type.replace('_', ' ')}
                              </span>
                              <span className="text-2xl">{ins.priorityEmoji}</span>
                            </div>
                            <h4 className="font-display font-bold text-base text-slate-100 mt-1">
                              {ins.title}
                            </h4>
                            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                              {ins.description}
                            </p>
                          </div>

                          <div className="mt-4 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                            <div className="text-[11px] text-slate-400 font-mono">
                              Declared #{ins.declaredRank} · Time #{ins.timeRank} · Money #{ins.moneyRank}
                            </div>
                            {isGap && (
                              <button
                                type="button"
                                onClick={() => setFrictionTargetId(ins.priorityId)}
                                className="px-2.5 py-1 rounded bg-rose-500/20 border border-rose-500/50 text-rose-200 text-xs font-semibold hover:bg-rose-500/30 transition-colors"
                              >
                                Explore Friction →
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Action Navigation Strip */}
                <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('whatif')}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-400/80 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between text-cyan-400 mb-1">
                      <Sliders className="w-5 h-5" />
                      <span className="text-xs font-bold">Simulator →</span>
                    </div>
                    <div className="font-display font-bold text-sm text-slate-100">The What-If Sandbox</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Shift monthly hours or dollars and calculate compound impacts.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('experiments')}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-400/80 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between text-emerald-400 mb-1">
                      <Sparkles className="w-5 h-5" />
                      <span className="text-xs font-bold">{experiments.length} Active →</span>
                    </div>
                    <div className="font-display font-bold text-sm text-slate-100">Life Experiments</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Check in on lightweight 30-day life experiments.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('orbit')}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-400/80 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between text-amber-400 mb-1">
                      <Compass className="w-5 h-5" />
                      <span className="text-xs font-bold">12 Months →</span>
                    </div>
                    <div className="font-display font-bold text-sm text-slate-100">Priority Orbit Calendar</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Check seasonal themes and record in-season snapshots.
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* TAB: WHAT-IF SIMULATOR */}
            {activeTab === 'whatif' && (
              <WhatIfSimulator
                declaredIds={declaredIds}
                onCommitExperiment={handleCommitExperiment}
              />
            )}

            {/* TAB: LIFE EXPERIMENTS */}
            {activeTab === 'experiments' && (
              <LifeExperimentsView
                experiments={experiments}
                onUpdateExperiment={handleUpdateExperiment}
                onOpenNewExperiment={() => setActiveTab('whatif')}
              />
            )}

            {/* TAB: ANNUAL ORBIT & SEASONS */}
            {activeTab === 'orbit' && (
              <OrbitSeasonView onRecordSeasonalSnapshot={handleRecordSeasonalSnapshot} />
            )}

            {/* TAB: HISTORY */}
            {activeTab === 'history' && (
              <HistoryView snapshots={snapshots} onTakeNewSnapshot={handleResetQuiz} />
            )}

            {/* TAB: TROPHY COLLECTION */}
            {activeTab === 'achievements' && (
              <AchievementsView unlockedIds={unlockedAchievements} />
            )}
          </div>
        )}
      </main>

      {/* Friction / Blocker Exploration Modal */}
      {frictionTargetId && (
        <FrictionModal
          priorityId={frictionTargetId}
          declaredRank={declaredIds.indexOf(frictionTargetId) + 1}
          timeRank={timeRanks.indexOf(frictionTargetId) + 1}
          moneyRank={moneyRanks.indexOf(frictionTargetId) + 1}
          onClose={() => setFrictionTargetId(null)}
          onSave={handleSaveFriction}
          onLaunchExperiment={id => {
            setFrictionTargetId(null);
            setActiveTab('whatif');
          }}
        />
      )}

      {/* Social Share Card Modal */}
      {isShareModalOpen && (
        <ShareModal
          declaredIds={declaredIds}
          insights={insights}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}

      {/* Email Value Exchange Modal */}
      {isEmailModalOpen && (
        <EmailSaveModal
          onClose={() => setIsEmailModalOpen(false)}
          onSaved={email => {
            setIsEmailModalOpen(false);
          }}
        />
      )}

      {/* Macro Research Trends Modal */}
      {isResearchModalOpen && (
        <ResearchTrendsModal onClose={() => setIsResearchModalOpen(false)} />
      )}

      {/* Science & Behavioral Economics Ontology Modal */}
      <ScienceOntologyModal
        isOpen={isScienceModalOpen}
        onClose={() => setIsScienceModalOpen(false)}
      />

      {/* Community Normative Benchmark Modal */}
      <CommunityComparisonModal
        isOpen={isCommunityModalOpen}
        onClose={() => setIsCommunityModalOpen(false)}
        deltas={deltas}
        declaredIds={declaredIds.length > 0 ? declaredIds : ['family', 'fitness', 'career', 'creativity', 'financial']}
        userProfile={userProfile}
      />

      {/* Individualized Profile Management & Command Purge Modal */}
      <ResetConfirmModal
        isOpen={isProfileResetModalOpen}
        onClose={() => setIsProfileResetModalOpen(false)}
        userProfile={userProfile}
        onProfileUpdated={setUserProfile}
        onFullReset={handleFullReset}
        isSoundMuted={isSoundMuted}
        onToggleSound={handleToggleSound}
        onOpenEmail={() => setIsEmailModalOpen(true)}
      />
    </div>
  );
}
