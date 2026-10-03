export type ResourceSignalType = 'declared' | 'money' | 'time' | 'attention';

export interface PriorityItem {
  id: string;
  name: string;
  emoji: string;
  domainId: string;
  domainName: string;
  description: string;
  schwartzValue: string;
  researchBasis: string;
  subPriorities: {
    id: string;
    name: string;
    emoji: string;
    description: string;
  }[];
  tags: string[];
  seasonalRelevance: string[];
  color: string;
  ambientFreq: number; // Hz for sound synthesizer
}

export interface QuizOption {
  text: string;
  emoji?: string;
  subtext?: string;
  weights: Record<string, number>; // priorityId -> weight (0 to 10)
}

export interface QuizQuestion {
  id: string;
  scenario: string;
  kicker: string;
  options: QuizOption[];
  adaptiveFor?: string[]; // show if certain domain scores high
}

export interface ResourceRanks {
  declared: string[]; // priority IDs in ranked order 1..5
  money: string[];
  time: string[];
  attention: string[];
}

export type InsightType =
  | 'ALIGNED'
  | 'MONEY_SIGNAL'
  | 'TIME_SIGNAL'
  | 'ATTENTION_SIGNAL'
  | 'HIDDEN_PRIORITY'
  | 'PRIORITY_GAP'
  | 'CROSS_SIGNAL_SPLIT'
  | 'SURPRISE';

export interface PriorityInsight {
  id: string;
  priorityId: string;
  priorityName: string;
  priorityEmoji: string;
  type: InsightType;
  title: string;
  description: string;
  declaredRank: number;
  moneyRank: number;
  timeRank: number;
  attentionRank: number;
  severity: 'high' | 'medium' | 'positive';
}

export type FrictionFactor =
  | 'time'
  | 'money'
  | 'energy'
  | 'fear'
  | 'motivation'
  | 'social'
  | 'environment'
  | 'obligations'
  | 'convenience'
  | 'focus'
  | 'not_important'
  | 'unsure';

export interface FrictionRecord {
  priorityId: string;
  factors: FrictionFactor[];
  reflectionText?: string;
  chosenExperiment?: string;
}

export interface LifeExperiment {
  id: string;
  priorityId: string;
  priorityName: string;
  priorityEmoji: string;
  title: string;
  action: string;
  resource: 'TIME' | 'MONEY' | 'ATTENTION' | 'HABIT';
  deltaDescription: string;
  durationDays: number;
  startDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED';
  outcome?: 'better' | 'same' | 'not_working' | 'huge_difference' | 'learned';
  notes?: string;
}

export interface ProfileSnapshot {
  id: string;
  timestamp: string;
  dateLabel: string;
  seasonId: string;
  seasonName: string;
  declaredRanks: string[];
  moneyRanks: string[];
  timeRanks: string[];
  attentionRanks: string[];
  frictions: FrictionRecord[];
  activeExperimentsCount: number;
  dominantInsight?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'DISCOVERY' | 'EXPLORATION' | 'INSIGHT' | 'EXPERIMENTS' | 'SEASONS' | 'HISTORY';
  unlockedAt?: string;
  rarityPercent: number;
}

export interface MonthOrbit {
  monthIndex: number; // 0..11
  shortName: string;
  fullName: string;
  emoji: string;
  season: 'WINTER' | 'SPRING' | 'SUMMER' | 'AUTUMN';
  theme: string;
  headline: string;
  prompt: string;
  miniQuiz: {
    question: string;
    options: { text: string; emoji: string; priorityId: string }[];
  }[];
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  title: string;
  level: number;
  xp: number;
  alignmentScore: number;
  createdAt: string;
}

