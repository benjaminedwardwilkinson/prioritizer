import { Achievement, FrictionRecord, LifeExperiment, ProfileSnapshot, UserProfile } from '../types';

const STORAGE_KEYS = {
  USER_ID: 'prioritizer_user_id',
  USER_PROFILE: 'prioritizer_user_profile',
  DECLARED_PRIORITIES: 'prioritizer_declared',
  MONEY_RANKS: 'prioritizer_money',
  TIME_RANKS: 'prioritizer_time',
  ATTENTION_RANKS: 'prioritizer_attention',
  FRICTIONS: 'prioritizer_frictions',
  EXPERIMENTS: 'prioritizer_experiments',
  ACHIEVEMENTS: 'prioritizer_achievements',
  SNAPSHOTS: 'prioritizer_snapshots',
  USER_EMAIL: 'prioritizer_email',
  OPT_IN_RESEARCH: 'prioritizer_opt_in_research',
};

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

function setCookie(name: string, value: string, days: number = 365) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export class StorageService {
  public static getUserId(): string {
    if (typeof window === 'undefined') return 'guest';
    let id = localStorage.getItem(STORAGE_KEYS.USER_ID) || getCookie(STORAGE_KEYS.USER_ID);
    if (!id) {
      id = 'usr_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem(STORAGE_KEYS.USER_ID, id);
      setCookie(STORAGE_KEYS.USER_ID, id);
    } else {
      setCookie(STORAGE_KEYS.USER_ID, id);
    }
    return id;
  }

  public static getUserProfile(): UserProfile {
    const id = this.getUserId();
    if (typeof window === 'undefined') {
      return {
        id,
        name: 'Explorer',
        avatar: '🚀',
        title: 'Cosmic Seeker',
        level: 1,
        xp: 100,
        alignmentScore: 75,
        createdAt: new Date().toISOString(),
      };
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (saved) return JSON.parse(saved);
    } catch {}

    const defaultProfile: UserProfile = {
      id,
      name: 'Explorer ' + id.slice(-4).toUpperCase(),
      avatar: '🧭',
      title: 'Revealed Preference Pioneer',
      level: 1,
      xp: 150,
      alignmentScore: 78,
      createdAt: new Date().toISOString(),
    };
    this.saveUserProfile(defaultProfile);
    return defaultProfile;
  }

  public static saveUserProfile(profile: UserProfile) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    setCookie('prioritizer_name', profile.name);
    setCookie('prioritizer_avatar', profile.avatar);
  }

  public static getDeclaredPriorities(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DECLARED_PRIORITIES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  public static setDeclaredPriorities(ids: string[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.DECLARED_PRIORITIES, JSON.stringify(ids));
  }

  public static getResourceRanks(type: 'money' | 'time' | 'attention'): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const key =
        type === 'money'
          ? STORAGE_KEYS.MONEY_RANKS
          : type === 'time'
          ? STORAGE_KEYS.TIME_RANKS
          : STORAGE_KEYS.ATTENTION_RANKS;
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  public static setResourceRanks(type: 'money' | 'time' | 'attention', ids: string[]) {
    if (typeof window === 'undefined') return;
    const key =
      type === 'money'
        ? STORAGE_KEYS.MONEY_RANKS
        : type === 'time'
        ? STORAGE_KEYS.TIME_RANKS
        : STORAGE_KEYS.ATTENTION_RANKS;
    localStorage.setItem(key, JSON.stringify(ids));
  }

  public static getFrictions(): FrictionRecord[] {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FRICTIONS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  public static saveFriction(friction: FrictionRecord) {
    if (typeof window === 'undefined') return;
    const existing = this.getFrictions();
    const updated = existing.filter(f => f.priorityId !== friction.priorityId);
    updated.push(friction);
    localStorage.setItem(STORAGE_KEYS.FRICTIONS, JSON.stringify(updated));
  }

  public static getExperiments(): LifeExperiment[] {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXPERIMENTS);
      if (saved) return JSON.parse(saved);
      // Sensible initial demo experiment
      const demo: LifeExperiment[] = [
        {
          id: 'exp_creativity_sundays',
          priorityId: 'creativity',
          priorityName: 'Creative Expression & Art',
          priorityEmoji: '🎨',
          title: 'Sunday Morning Studio Hour',
          action: '90 uninterrupted minutes every Sunday morning dedicated strictly to painting, writing, or playing music.',
          resource: 'TIME',
          deltaDescription: '+90 mins/week (+78 hrs/year)',
          durationDays: 30,
          startDate: new Date(Date.now() - 6 * 86400000).toISOString(),
          status: 'ACTIVE',
          outcome: 'better',
          notes: 'Felt surprisingly refreshing. Disconnected Wi-Fi during the hour.',
        },
      ];
      localStorage.setItem(STORAGE_KEYS.EXPERIMENTS, JSON.stringify(demo));
      return demo;
    } catch {
      return [];
    }
  }

  public static saveExperiment(exp: LifeExperiment) {
    if (typeof window === 'undefined') return;
    const existing = this.getExperiments();
    const idx = existing.findIndex(e => e.id === exp.id);
    if (idx >= 0) {
      existing[idx] = exp;
    } else {
      existing.unshift(exp);
    }
    localStorage.setItem(STORAGE_KEYS.EXPERIMENTS, JSON.stringify(existing));

    // Try background sync to backend
    fetch('/api/experiments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exp),
    }).catch(() => {});
  }

  public static getUnlockedAchievementIds(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  public static unlockAchievement(id: string): boolean {
    if (typeof window === 'undefined') return false;
    const list = this.getUnlockedAchievementIds();
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(list));
      return true;
    }
    return false;
  }

  public static getSnapshots(): ProfileSnapshot[] {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SNAPSHOTS);
      if (saved) return JSON.parse(saved);
      // Pre-seed an earlier historical snapshot for rich historical comparison
      const historicSeed: ProfileSnapshot[] = [
        {
          id: 'snap_oct2026',
          timestamp: new Date(Date.now() - 90 * 86400000).toISOString(),
          dateLabel: 'July 2026 (Summer Solstice)',
          seasonId: 'SUMMER',
          seasonName: 'Summer Solstice & Freedom',
          declaredRanks: ['career', 'family', 'travel', 'fitness', 'financial'],
          moneyRanks: ['career', 'financial', 'travel', 'family', 'fitness'],
          timeRanks: ['career', 'family', 'financial', 'fitness', 'travel'],
          attentionRanks: ['career', 'financial', 'family', 'travel', 'fitness'],
          frictions: [],
          activeExperimentsCount: 0,
          dominantInsight: 'Career and Financial Security anchored your summer focus.',
        },
      ];
      localStorage.setItem(STORAGE_KEYS.SNAPSHOTS, JSON.stringify(historicSeed));
      return historicSeed;
    } catch {
      return [];
    }
  }

  public static saveSnapshot(snapshot: ProfileSnapshot) {
    if (typeof window === 'undefined') return;
    const existing = this.getSnapshots();
    existing.unshift(snapshot);
    localStorage.setItem(STORAGE_KEYS.SNAPSHOTS, JSON.stringify(existing));

    // Sync to backend
    fetch('/api/profile/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: this.getUserId(), snapshot }),
    }).catch(() => {});
  }

  public static getSavedEmail(): string {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(STORAGE_KEYS.USER_EMAIL) || '';
  }

  public static saveEmail(email: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.USER_EMAIL, email);

    fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: this.getUserId(), email }),
    }).catch(() => {});
  }

  public static resetAllData() {
    if (typeof window === 'undefined') return;
    const userId = this.getUserId();

    // Reset on server
    fetch('/api/profile/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    }).catch(() => {});

    const keysToRemove = [
      STORAGE_KEYS.USER_ID,
      STORAGE_KEYS.USER_PROFILE,
      STORAGE_KEYS.DECLARED_PRIORITIES,
      STORAGE_KEYS.MONEY_RANKS,
      STORAGE_KEYS.TIME_RANKS,
      STORAGE_KEYS.ATTENTION_RANKS,
      STORAGE_KEYS.FRICTIONS,
      STORAGE_KEYS.EXPERIMENTS,
      STORAGE_KEYS.ACHIEVEMENTS,
      STORAGE_KEYS.SNAPSHOTS,
      STORAGE_KEYS.USER_EMAIL,
    ];
    keysToRemove.forEach(k => localStorage.removeItem(k));

    // Clear cookies
    if (typeof document !== 'undefined') {
      document.cookie = `${STORAGE_KEYS.USER_ID}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `prioritizer_name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `prioritizer_avatar=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
  }
}
