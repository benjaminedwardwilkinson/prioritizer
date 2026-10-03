import { QuizQuestion } from '../types';

export const INITIAL_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1_windfall',
    kicker: 'SURPRISE OPPORTUNITY',
    scenario: 'You unexpectedly receive $500 cash with zero strings attached. Which sounds most satisfying right now?',
    options: [
      {
        emoji: '✈️',
        text: 'Book a spontaneous weekend trip to an unfamiliar town or coastal trail.',
        subtext: 'Novelty, scenery, and departure from routine',
        weights: { travel: 8, fun: 5 },
      },
      {
        emoji: '🎁',
        text: 'Take your closest people or family out for a lavish dinner with wine and dessert.',
        subtext: 'Laughter, shared memories, and generosity',
        weights: { family: 6, friendship: 7 },
      },
      {
        emoji: '🎨',
        text: 'Buy that dream tool, instrument, camera lens, or studio gear you’ve been eyeing.',
        subtext: 'Making things, crafting, and creative fuel',
        weights: { creativity: 8, learning: 5 },
      },
      {
        emoji: '🛡️',
        text: 'Drop it straight into your savings or high-yield vault. That peace of mind is gold.',
        subtext: 'Financial resilience and quiet sovereignty',
        weights: { financial: 9, wellbeing: 4 },
      },
    ],
  },
  {
    id: 'q2_saturday',
    kicker: 'RESOURCE DILEMMA',
    scenario: 'You wake up on a completely blank Saturday. No meetings, no errands, phone on silent. What does your heart gravitate toward?',
    options: [
      {
        emoji: '🌲',
        text: 'A long trail run or mountain hike deep in the woods, breaking a heavy sweat.',
        subtext: 'Fresh pine air, physical exhaustion, nature immersion',
        weights: { nature: 8, fitness: 7 },
      },
      {
        emoji: '🛋️',
        text: 'Brewing loose-leaf tea, lounging on the couch with a heavy book or favorite game.',
        subtext: 'Unapologetic quiet, restorative slow pace',
        weights: { rest: 8, wellbeing: 6, self_care: 8, fun: 4 },
      },
      {
        emoji: '💻',
        text: 'Locking into deep focus on an ambitious personal project or craft you love.',
        subtext: 'Entering flow state, building something great',
        weights: { career: 7, learning: 8, creativity: 5 },
      },
      {
        emoji: '🥞',
        text: 'Cooking an elaborate breakfast for loved ones, sitting around laughing for hours.',
        subtext: 'Warm kitchen, slow morning with people who matter',
        weights: { family: 8, romance: 6, home: 5 },
      },
    ],
  },
  {
    id: 'q3_protect',
    kicker: 'THE SHIELD TEST',
    scenario: 'Life enters an overwhelming storm for the next 6 months. If you could fiercely protect only ONE of these from compromise, which is non-negotiable?',
    options: [
      {
        emoji: '❤️',
        text: 'Unbroken daily presence and intimacy with my inner circle or family.',
        subtext: 'No career triumph compensates for disconnected relationships',
        weights: { family: 9, friendship: 6, romance: 6 },
      },
      {
        emoji: '💪',
        text: 'My physical health, clean fuel, daily movement, and solid 8-hour sleep.',
        subtext: 'Without biological vitality, everything else crumbles',
        weights: { fitness: 8, rest: 8, wellbeing: 6 },
      },
      {
        emoji: '⚡',
        text: 'My professional momentum, credibility, and career advancement trajectory.',
        subtext: 'Building security, capability, and long-term standing',
        weights: { career: 9, financial: 6 },
      },
      {
        emoji: '🕯️',
        text: 'My quiet inner sanctuary—stillness, creative spark, and peace of mind.',
        subtext: 'Preserving emotional sovereignty and mental calm',
        weights: { wellbeing: 9, self_care: 9, creativity: 6, purpose: 5 },
      },
    ],
  },
  {
    id: 'q4_regret',
    kicker: 'THE 80-YEAR REFLECTION',
    scenario: 'Looking back from age 85 in a rocking chair, which scenario would cause you the deepest sting of regret?',
    options: [
      {
        emoji: '🥀',
        text: 'Spending so much time working and grinding that I missed deep moments with people I loved.',
        subtext: 'Neglecting warmth, family milestones, and real intimacy',
        weights: { family: 9, friendship: 7, romance: 7 },
      },
      {
        emoji: '📦',
        text: 'Playing it safe and never taking creative risks, traveling widely, or building my own ideas.',
        subtext: 'Staying inside the safe box and letting potential gather dust',
        weights: { creativity: 8, travel: 8, learning: 5 },
      },
      {
        emoji: '💸',
        text: 'Living paycheck-to-paycheck with perpetual anxiety, never achieving sovereign independence.',
        subtext: 'Never having the financial footing to live freely',
        weights: { financial: 9, career: 6 },
      },
      {
        emoji: '🌍',
        text: 'Living a self-centered life without making a lasting contribution or helping those around me.',
        subtext: 'Leaving little trace of kindness, civic care, or purpose',
        weights: { community: 9, purpose: 8 },
      },
    ],
  },
  {
    id: 'q5_tradeoff',
    kicker: 'FORCED CHOICE',
    scenario: 'You are granted a magic boon, but can pick only one blessing for the next full year. Which do you grab?',
    options: [
      {
        emoji: '🧠',
        text: 'Instantly master any 3 complex crafts or skills (languages, coding, instruments).',
        subtext: 'Deep curiosity, intellectual superpowers, craftsmanship',
        weights: { learning: 9, creativity: 7 },
      },
      {
        emoji: '✈️',
        text: 'All-expenses-paid travel to any 4 continents with someone special.',
        subtext: 'Sensory thrills, world horizons, unforgettable memories',
        weights: { travel: 9, fun: 6, friendship: 4 },
      },
      {
        emoji: '🏡',
        text: 'A paid-off, breathtaking home surrounded by trees, quiet, and comfort.',
        subtext: 'Sanctuary, root-growing stability, and domestic bliss',
        weights: { home: 9, nature: 6, financial: 5 },
      },
      {
        emoji: '🕊️',
        text: 'Complete freedom from chronic stress, mental chatter, and hurry.',
        subtext: 'Equanimity, serene presence, and unshakeable calm',
        weights: { wellbeing: 9, rest: 7 },
      },
    ],
  },
  {
    id: 'q6_secret_wish',
    kicker: 'THE SECRET COMPASS',
    scenario: 'When you are alone in quiet thought, what do you secretly wish you had 10 more hours a week for?',
    options: [
      {
        emoji: '🎨',
        text: 'Pouring myself into painting, writing, music, or crafting without feeling guilty.',
        subtext: 'Pure expressive flow and generative creativity',
        weights: { creativity: 10, fun: 4 },
      },
      {
        emoji: '🌲',
        text: 'Being outside in real nature—hiking trails, paddling rivers, gardening under the sun.',
        subtext: 'Escaping digital screens and feeling the soil beneath feet',
        weights: { nature: 9, fitness: 6 },
      },
      {
        emoji: '🤝',
        text: 'Hosting dinners, helping a friend in need, mentoring, or giving back to community.',
        subtext: 'Prosocial connection and meaningful contribution',
        weights: { community: 8, friendship: 7 },
      },
      {
        emoji: '🚀',
        text: 'Accelerating my career, launching a venture, and building substantial wealth.',
        subtext: 'Dominating my craft and securing sovereign status',
        weights: { career: 8, financial: 8 },
      },
    ],
  },
  // Adaptive questions based on emerging domain signals:
  {
    id: 'q7_adaptive_rel',
    kicker: 'CONNECTION DEEP DIVE',
    scenario: 'When social battery and emotional connection are at their richest, where are you most fulfilled?',
    adaptiveFor: ['family', 'friendship', 'romance'],
    options: [
      {
        emoji: '👨‍👩‍👧',
        text: 'At the family dinner table, watching generations talk and feeling ancestral roots.',
        weights: { family: 10 },
      },
      {
        emoji: '👫',
        text: 'In raw, hilarious conversation late at night with your trusted friends.',
        weights: { friendship: 10 },
      },
      {
        emoji: '💕',
        text: 'One-on-one with your romantic partner in deep vulnerability and playful spark.',
        weights: { romance: 10 },
      },
      {
        emoji: '🤝',
        text: 'In a circle of community members uniting to lift up people who need support.',
        weights: { community: 10 },
      },
    ],
  },
  {
    id: 'q8_adaptive_ambition',
    kicker: 'AMBITION CALIBRATION',
    scenario: 'What does "making it" ultimately mean for your ambition and life energy?',
    adaptiveFor: ['career', 'financial', 'learning'],
    options: [
      {
        emoji: '📈',
        text: 'Leading high-stakes missions and having real industry impact and respect.',
        weights: { career: 10 },
      },
      {
        emoji: '💰',
        text: 'Financial autonomy where my investments pay for my life and no one tells me what to do.',
        weights: { financial: 10 },
      },
      {
        emoji: '🧠',
        text: 'Becoming a true virtuoso of knowledge and craft who understands the world deeply.',
        weights: { learning: 10 },
      },
      {
        emoji: '🎨',
        text: 'Creating work of such beauty and originality that it outlives me.',
        weights: { creativity: 10 },
      },
    ],
  },
];
