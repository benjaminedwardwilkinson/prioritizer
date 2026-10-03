import { getPriorityById } from '../data/ontology';
import { PriorityInsight } from '../types';

export interface CalculatedDeltas {
  priorityId: string;
  name: string;
  emoji: string;
  color: string;
  declaredRank: number; // 1 to 5 (1 is highest)
  moneyRank: number;
  timeRank: number;
  attentionRank: number;
  deltaMoney: number; // positive = receives more money than declared
  deltaTime: number; // positive = receives more time than declared
  deltaAttention: number; // positive = receives more attention than declared
  totalDivergence: number; // sum of absolute differences
}

export function calculatePriorityDeltas(
  declared: string[],
  money: string[],
  time: string[],
  attention: string[]
): CalculatedDeltas[] {
  return declared.map((id, index) => {
    const item = getPriorityById(id);
    const declaredRank = index + 1;

    const totalCount = declared.length || 10;
    const mIdx = money.indexOf(id);
    const moneyRank = mIdx !== -1 ? mIdx + 1 : totalCount;

    const tIdx = time.indexOf(id);
    const timeRank = tIdx !== -1 ? tIdx + 1 : totalCount;

    const aIdx = attention.indexOf(id);
    const attentionRank = aIdx !== -1 ? aIdx + 1 : totalCount;

    // delta = declaredRank - actualRank (e.g. declared #5 - money #1 = +4, receives way more money)
    const deltaMoney = declaredRank - moneyRank;
    const deltaTime = declaredRank - timeRank;
    const deltaAttention = declaredRank - attentionRank;

    const totalDivergence =
      Math.abs(deltaMoney) + Math.abs(deltaTime) + Math.abs(deltaAttention);

    return {
      priorityId: id,
      name: item?.name || id,
      emoji: item?.emoji || '✨',
      color: item?.color || '#3b82f6',
      declaredRank,
      moneyRank,
      timeRank,
      attentionRank,
      deltaMoney,
      deltaTime,
      deltaAttention,
      totalDivergence,
    };
  });
}

export function generateInsights(deltas: CalculatedDeltas[]): PriorityInsight[] {
  const insights: PriorityInsight[] = [];

  deltas.forEach(d => {
    // 1. PRIORITY GAP: Highly declared (#1 or #2) but starved of time or money (#4 or #5)
    if (d.declaredRank <= 2 && (d.timeRank >= 4 || d.moneyRank >= 4)) {
      insights.push({
        id: `gap_${d.priorityId}`,
        priorityId: d.priorityId,
        priorityName: d.name,
        priorityEmoji: d.emoji,
        type: 'PRIORITY_GAP',
        title: `The ${d.name} Space Deficit`,
        description: `You declared ${d.name} as priority #${d.declaredRank}, yet your calendar places it at #${d.timeRank} and spending at #${d.moneyRank}. This suggests you hold it dear, but daily momentum may be squeezing it out.`,
        declaredRank: d.declaredRank,
        moneyRank: d.moneyRank,
        timeRank: d.timeRank,
        attentionRank: d.attentionRank,
        severity: 'high',
      });
    }

    // 2. HIDDEN PRIORITY: Declared low (#4 or #5), but receives high time or money (#1 or #2)
    else if (d.declaredRank >= 4 && (d.timeRank <= 2 || d.moneyRank <= 2)) {
      insights.push({
        id: `hidden_${d.priorityId}`,
        priorityId: d.priorityId,
        priorityName: d.name,
        priorityEmoji: d.emoji,
        type: 'HIDDEN_PRIORITY',
        title: `Quiet Anchor: ${d.name}`,
        description: `While ranked #${d.declaredRank} in your conscious list, your life votes heavily for it: #${d.timeRank} in time and #${d.moneyRank} in spending. Your actions reveal it functions as a core foundation.`,
        declaredRank: d.declaredRank,
        moneyRank: d.moneyRank,
        timeRank: d.timeRank,
        attentionRank: d.attentionRank,
        severity: 'medium',
      });
    }

    // 3. CROSS-SIGNAL SPLIT: High money but low time, or high time but low money
    else if (Math.abs(d.moneyRank - d.timeRank) >= 3) {
      const moreOf = d.moneyRank < d.timeRank ? 'financial investment' : 'calendar hours';
      const lessOf = d.moneyRank < d.timeRank ? 'calendar hours' : 'financial investment';
      insights.push({
        id: `split_${d.priorityId}`,
        priorityId: d.priorityId,
        priorityName: d.name,
        priorityEmoji: d.emoji,
        type: 'CROSS_SIGNAL_SPLIT',
        title: `The Resource Divergence in ${d.name}`,
        description: `Your money and your time tell opposing stories here. It receives heavy ${moreOf} (#${Math.min(d.moneyRank, d.timeRank)}) but minimal ${lessOf} (#${Math.max(d.moneyRank, d.timeRank)}).`,
        declaredRank: d.declaredRank,
        moneyRank: d.moneyRank,
        timeRank: d.timeRank,
        attentionRank: d.attentionRank,
        severity: 'medium',
      });
    }

    // 4. ATTENTION DRIFT: High mental attention, but low actual execution time
    else if (d.attentionRank <= 2 && d.timeRank >= 4) {
      insights.push({
        id: `att_${d.priorityId}`,
        priorityId: d.priorityId,
        priorityName: d.name,
        priorityEmoji: d.emoji,
        type: 'ATTENTION_SIGNAL',
        title: `Mental Orbit: ${d.name}`,
        description: `Your mind gravitates toward this (#${d.attentionRank} in attention), yet your actual schedule (#${d.timeRank}) gives it little room. You may be spending significant energy thinking about it without doing it.`,
        declaredRank: d.declaredRank,
        moneyRank: d.moneyRank,
        timeRank: d.timeRank,
        attentionRank: d.attentionRank,
        severity: 'medium',
      });
    }

    // 5. ALIGNED: Declared, money, and time are in tight harmony (distance <= 1)
    else if (d.totalDivergence <= 2) {
      insights.push({
        id: `aligned_${d.priorityId}`,
        priorityId: d.priorityId,
        priorityName: d.name,
        priorityEmoji: d.emoji,
        type: 'ALIGNED',
        title: `Harmonic Alignment: ${d.name}`,
        description: `What you say matters and where your resources flow are in rare sync. Declared #${d.declaredRank}, time #${d.timeRank}, and money #${d.moneyRank} move in tandem.`,
        declaredRank: d.declaredRank,
        moneyRank: d.moneyRank,
        timeRank: d.timeRank,
        attentionRank: d.attentionRank,
        severity: 'positive',
      });
    }
  });

  // Fallback if no specific condition hit
  if (insights.length === 0 && deltas.length > 0) {
    const top = deltas[0];
    insights.push({
      id: `lead_${top.priorityId}`,
      priorityId: top.priorityId,
      priorityName: top.name,
      priorityEmoji: top.emoji,
      type: 'ALIGNED',
      title: `North Star: ${top.name}`,
      description: `Your declared #1 priority sets the gravitational center for your choices and reflections.`,
      declaredRank: top.declaredRank,
      moneyRank: top.moneyRank,
      timeRank: top.timeRank,
      attentionRank: top.attentionRank,
      severity: 'positive',
    });
  }

  return insights;
}
