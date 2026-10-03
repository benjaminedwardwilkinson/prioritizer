import { PriorityItem } from '../types';

/**
 * PRIORITIZER RESEARCH-GROUNDED ONTOLOGY
 *
 * Conceptual Foundation:
 * 1. Shalom H. Schwartz's Refined Theory of Basic Human Values (19 motivational value types):
 *    - Self-Direction (Thought & Action)
 *    - Stimulation & Hedonism
 *    - Achievement & Power (Resources & Dominance)
 *    - Security (Personal & Societal)
 *    - Conformity & Tradition
 *    - Benevolence (Care & Dependability)
 *    - Universalism (Concern, Nature, Tolerance)
 * 2. Pew Research Center - Where Americans Find Meaning in Life:
 *    - Core findings indicate Family (69%), Career (34%), Friends (20%), Hobbies (19%), Health (11%), Faith (15%).
 * 3. U.S. Bureau of Labor Statistics - American Time Use Survey (ATUS):
 *    - Resource-tracking behavioral taxonomy: Working, Leisure/Sports, Caregiving, Housework, Sleep/Rest.
 *
 * Note: Research constructs are mapped into accessible, emotionally resonant consumer language.
 */

export interface PriorityDomain {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export const PRIORITY_DOMAINS: PriorityDomain[] = [
  {
    id: 'relationships',
    name: 'Relationships & Connection',
    emoji: '❤️',
    description: 'Human warmth, mutual support, kinship, and companionship.',
  },
  {
    id: 'mastery',
    name: 'Craft, Career & Ambition',
    emoji: '⚡',
    description: 'Professional impact, financial strength, skill building, and capability.',
  },
  {
    id: 'vitality',
    name: 'Vitality & Sanctuary',
    emoji: '🌿',
    description: 'Physical health, mental peace, rest, and domestic restoration.',
  },
  {
    id: 'experiences',
    name: 'Exploration & Joy',
    emoji: '✨',
    description: 'Adventure, creative expression, playful engagement, and discovery.',
  },
  {
    id: 'meaning',
    name: 'Purpose, Nature & Spirit',
    emoji: '🧭',
    description: 'Greater meaning, ecological reverence, community service, and inner grounding.',
  },
];

export const PRIORITIES: PriorityItem[] = [
  // --- DOMAIN: Relationships & Connection ---
  {
    id: 'family',
    name: 'Family & Kinship',
    emoji: '❤️',
    domainId: 'relationships',
    domainName: 'Relationships & Connection',
    description: 'Deep dedication to immediate loved ones, parents, children, and lifelong blood bonds.',
    schwartzValue: 'Benevolence-Dependability & Tradition',
    researchBasis: 'Pew Research #1 source of life meaning (69% global consensus)',
    subPriorities: [
      { id: 'family_core', name: 'Core Household & Partner', emoji: '🏡', description: 'Daily intimacy and companionship with immediate home partners and dependents' },
      { id: 'family_kids', name: 'Parenting & Nurturing', emoji: '🧒', description: 'Raising, teaching, and being present for children' },
      { id: 'family_extended', name: 'Parents & Extended Kin', emoji: '👵', description: 'Caring for aging parents, siblings, and ancestral connections' },
      { id: 'family_rituals', name: 'Family Traditions', emoji: '🕯️', description: 'Holiday gatherings, shared meals, and recurring family memories' },
    ],
    tags: ['social', 'caregiving', 'roots', 'loyalty'],
    seasonalRelevance: ['November', 'December', 'May'],
    color: '#ef4444',
    ambientFreq: 261.63, // C4
  },
  {
    id: 'friendship',
    name: 'Friendship & Camaraderie',
    emoji: '👫',
    domainId: 'relationships',
    domainName: 'Relationships & Connection',
    description: 'Chosen bonds of trust, laughter, deep conversation, and reliable companions.',
    schwartzValue: 'Benevolence-Care & Hedonism',
    researchBasis: 'Pew Research & Harvard Study of Adult Development (key longevity predictor)',
    subPriorities: [
      { id: 'friends_close', name: 'Inner Circle Confidants', emoji: '🫂', description: '1-3 ride-or-die friends you can call at 3am' },
      { id: 'friends_gatherings', name: 'Group Hangouts & Socials', emoji: '🍻', description: 'Dinners, game nights, group trips, and social circles' },
      { id: 'friends_new', name: 'Making New Connections', emoji: '👋', description: 'Welcoming new people, networking with warmth, expanding your circle' },
    ],
    tags: ['social', 'joy', 'support', 'trust'],
    seasonalRelevance: ['June', 'July', 'August', 'February'],
    color: '#f97316',
    ambientFreq: 293.66, // D4
  },
  {
    id: 'romance',
    name: 'Romance & Intimacy',
    emoji: '💕',
    domainId: 'relationships',
    domainName: 'Relationships & Connection',
    description: 'Passionate connection, reciprocal vulnerability, erotic chemistry, and deep romantic partnership.',
    schwartzValue: 'Benevolence-Care & Hedonism',
    researchBasis: 'Sternberg Triangular Theory of Love & Schwartz Affective Bonding',
    subPriorities: [
      { id: 'romance_dating', name: 'Courtship & Spark', emoji: '🕯️', description: 'Date nights, playful tension, and romantic renewal' },
      { id: 'romance_partnership', name: 'Life Partnership & Teamwork', emoji: '💍', description: 'Building an intertwined life, mutual support, shared goals' },
      { id: 'romance_intimacy', name: 'Vulnerability & Deep Affection', emoji: '✨', description: 'Emotional honesty, physical affection, feeling truly seen' },
    ],
    tags: ['intimacy', 'passion', 'partnership', 'closeness'],
    seasonalRelevance: ['February', 'October', 'June'],
    color: '#ec4899',
    ambientFreq: 329.63, // E4
  },

  // --- DOMAIN: Craft, Career & Ambition ---
  {
    id: 'career',
    name: 'Career & Professional Impact',
    emoji: '💻',
    domainId: 'mastery',
    domainName: 'Craft, Career & Ambition',
    description: 'Meaningful work, professional achievement, leadership, and leaving a tangible mark.',
    schwartzValue: 'Achievement & Power-Dominance',
    researchBasis: 'Pew Research (34% cite career as prime meaning); ATUS #1 waking activity',
    subPriorities: [
      { id: 'career_leadership', name: 'Leadership & Influence', emoji: '👑', description: 'Leading teams, directing strategy, and making decisive calls' },
      { id: 'career_craft', name: 'Excellence in Execution', emoji: '🔨', description: 'Mastering the technical tools and craft of your trade' },
      { id: 'career_growth', name: 'Advancement & Recognition', emoji: '📈', description: 'Promotions, milestones, industry reputation, and awards' },
    ],
    tags: ['work', 'ambition', 'purpose', 'mastery'],
    seasonalRelevance: ['January', 'September', 'March'],
    color: '#3b82f6',
    ambientFreq: 349.23, // F4
  },
  {
    id: 'financial',
    name: 'Financial Independence & Security',
    emoji: '💰',
    domainId: 'mastery',
    domainName: 'Craft, Career & Ambition',
    description: 'Sovereignty over money, freedom from financial anxiety, investments, and abundance.',
    schwartzValue: 'Security-Personal & Power-Resources',
    researchBasis: 'Kahneman & Deaton Well-being thresholds; Schwartz Material Autonomy',
    subPriorities: [
      { id: 'fin_peace', name: 'Peace of Mind & Emergency Buffer', emoji: '🛡️', description: 'Zero debt distress, cash reserves, and resilient buffers' },
      { id: 'fin_freedom', name: 'Wealth & Early Independence', emoji: '🔓', description: 'Passive income, ownership, and freedom to say "no"' },
      { id: 'fin_generosity', name: 'Providing & Gifting', emoji: '🎁', description: 'Being able to spoil loved ones and support worthy causes' },
    ],
    tags: ['money', 'security', 'freedom', 'stability'],
    seasonalRelevance: ['January', 'April', 'December'],
    color: '#10b981',
    ambientFreq: 392.00, // G4
  },
  {
    id: 'learning',
    name: 'Learning, Mastery & Curiosity',
    emoji: '🧠',
    domainId: 'mastery',
    domainName: 'Craft, Career & Ambition',
    description: 'Continuous intellectual expansion, acquiring new skills, reading, and deep understanding.',
    schwartzValue: 'Self-Direction Thought',
    researchBasis: 'Deci & Ryan Self-Determination Theory (Competence); Schwartz Epistemic Drive',
    subPriorities: [
      { id: 'learn_books', name: 'Reading & Theory', emoji: '📚', description: 'Books, essays, podcasts, and philosophical foundations' },
      { id: 'learn_skills', name: 'Hands-on Skill Acquisition', emoji: '🛠️', description: 'Coding, languages, woodworking, cooking, practical techniques' },
      { id: 'learn_curiosity', name: 'Intellectual Rabbit Holes', emoji: '🔬', description: 'Exploring fascinating weird questions purely for the joy of knowing' },
    ],
    tags: ['growth', 'intellect', 'books', 'skills'],
    seasonalRelevance: ['September', 'October', 'January'],
    color: '#8b5cf6',
    ambientFreq: 440.00, // A4
  },

  // --- DOMAIN: Vitality & Sanctuary ---
  {
    id: 'fitness',
    name: 'Physical Vitality & Movement',
    emoji: '💪',
    domainId: 'vitality',
    domainName: 'Vitality & Sanctuary',
    description: 'Strength, cardiovascular health, energetic resilience, somatic vitality, and clean food.',
    schwartzValue: 'Security-Personal & Hedonism',
    researchBasis: 'ATUS Physical Activity & Health Psychology Biomarkers',
    subPriorities: [
      { id: 'fit_strength', name: 'Strength & Conditioning', emoji: '🏋️', description: 'Lifting, stamina, muscle tone, and athletic performance' },
      { id: 'fit_nourish', name: 'Nourishment & Nutrition', emoji: '🥗', description: 'Whole vibrant foods, hydration, and mindful eating' },
      { id: 'fit_longevity', name: 'Long-term Mobility & Energy', emoji: '⚡', description: 'Staying agile, injury-free, and energetic into old age' },
    ],
    tags: ['health', 'body', 'energy', 'longevity'],
    seasonalRelevance: ['January', 'May', 'June'],
    color: '#06b6d4',
    ambientFreq: 493.88, // B4
  },
  {
    id: 'wellbeing',
    name: 'Mental Sanctuary & Serenity',
    emoji: '🧘',
    domainId: 'vitality',
    domainName: 'Vitality & Sanctuary',
    description: 'Emotional calm, inner composure, meditation, stress defense, and psychological boundaries.',
    schwartzValue: 'Security-Personal & Self-Direction',
    researchBasis: 'Mindfulness & Psychological Equanimity literature (Davidson & Kabat-Zinn)',
    subPriorities: [
      { id: 'wb_calm', name: 'Quiet Mind & Space to Breathe', emoji: '🕯️', description: 'Mornings without screens, meditation, stillness' },
      { id: 'wb_boundaries', name: 'Protective Boundaries', emoji: '🛑', description: 'The ability to say no and protect your nervous system' },
      { id: 'wb_clarity', name: 'Self-Reflection & Journaling', emoji: '📝', description: 'Untangling thoughts, processing emotions, inner clarity' },
    ],
    tags: ['peace', 'mind', 'calm', 'boundaries'],
    seasonalRelevance: ['November', 'February', 'April'],
    color: '#14b8a6',
    ambientFreq: 523.25, // C5
  },
  {
    id: 'rest',
    name: 'Rest, Sleep & Slowness',
    emoji: '🌙',
    domainId: 'vitality',
    domainName: 'Vitality & Sanctuary',
    description: 'Unapologetic deep sleep, leisurely recovery, restorative naps, and doing absolutely nothing.',
    schwartzValue: 'Hedonism & Security-Personal',
    researchBasis: 'Matthew Walker Sleep Science & Circadian Biology',
    subPriorities: [
      { id: 'rest_sleep', name: 'Consistent 8-Hour Sleep', emoji: '🛌', description: 'Deep REM and restorative cycles without alarm dread' },
      { id: 'rest_slowness', name: 'Unscheduled Afternoons', emoji: '☕', description: 'Zero calendar obligations, staring out the window, easy pace' },
      { id: 'rest_detox', name: 'Digital Disconnect', emoji: '📴', description: 'Putting the smartphone away and letting the senses decompress' },
    ],
    tags: ['sleep', 'recovery', 'slowness', 'pause'],
    seasonalRelevance: ['December', 'January', 'July'],
    color: '#6366f1',
    ambientFreq: 587.33, // D5
  },
  {
    id: 'self_care',
    name: 'Self-Care & Personal Restoration',
    emoji: '🛁',
    domainId: 'vitality',
    domainName: 'Vitality & Sanctuary',
    description: 'Somatic replenishment, personal therapy, unhurried body care, emotional decompression, and guilt-free restoration.',
    schwartzValue: 'Security-Personal & Hedonism',
    researchBasis: 'Kristin Neff Self-Compassion Research & Polyvagal Somatic Regulation (Porges)',
    subPriorities: [
      { id: 'sc_somatic', name: 'Somatic Replenishment & Body Care', emoji: '🧖', description: 'Warm baths, massage, skincare, grooming rituals, and releasing physical tension' },
      { id: 'sc_therapy', name: 'Therapy & Nervous System Regulation', emoji: '🧠', description: 'Professional counseling, emotional processing, and calming hyper-vigilance' },
      { id: 'sc_solitude', name: 'Guilt-Free Solitude & Sanctuary', emoji: '☕', description: 'Sacred solo hours without caregiving, work pings, or social demands' },
      { id: 'sc_boundaries', name: 'Protective Self-Preserving Boundaries', emoji: '🛑', description: 'Saying no to energy drainers, stopping people-pleasing, guarding your reserve' },
    ],
    tags: ['self-care', 'therapy', 'healing', 'replenishment', 'boundaries'],
    seasonalRelevance: ['February', 'November', 'January', 'July'],
    color: '#0ea5e9',
    ambientFreq: 554.37, // C#5
  },
  {
    id: 'home',
    name: 'Home Sanctuary & Comfort',
    emoji: '🏡',
    domainId: 'vitality',
    domainName: 'Vitality & Sanctuary',
    description: 'Creating an inspiring, organized, warm, and beautiful domestic haven.',
    schwartzValue: 'Security-Personal & Tradition',
    researchBasis: 'Environmental Psychology & Domestic Cohesion studies',
    subPriorities: [
      { id: 'home_aesthetic', name: 'Beauty & Interior Design', emoji: '🪴', description: 'Lighting, plants, textiles, art that lifts your spirits' },
      { id: 'home_order', name: 'Declutter & Organization', emoji: '🧹', description: 'Clarity of space, cleanliness, tidy surfaces' },
      { id: 'home_hospitality', name: 'Warm Hosting & Cooking', emoji: '🍲', description: 'A welcoming kitchen, comforting scents, feeding people you love' },
    ],
    tags: ['home', 'sanctuary', 'order', 'comfort'],
    seasonalRelevance: ['October', 'November', 'March'],
    color: '#d97706',
    ambientFreq: 659.25, // E5
  },

  // --- DOMAIN: Exploration & Joy ---
  {
    id: 'creativity',
    name: 'Creative Expression & Art',
    emoji: '🎨',
    domainId: 'experiences',
    domainName: 'Exploration & Joy',
    description: 'Making original things: painting, writing, music, designing, crafting, and artistic play.',
    schwartzValue: 'Self-Direction Action & Stimulation',
    researchBasis: 'Csikszentmihalyi Flow State Research; Schwartz Expressive Autonomy',
    subPriorities: [
      { id: 'create_projects', name: 'Original Making & Art', emoji: '🖌️', description: 'Painting, sculpting, composing, woodworking, ceramics' },
      { id: 'create_writing', name: 'Storytelling & Writing', emoji: '✍️', description: 'Essays, fiction, poetry, lyrics, sharing your inner world' },
      { id: 'create_taste', name: 'Aesthetic Curation', emoji: '🎶', description: 'Loving music, architecture, cinema, and design' },
    ],
    tags: ['art', 'expression', 'flow', 'making'],
    seasonalRelevance: ['October', 'April', 'November'],
    color: '#ec4899',
    ambientFreq: 698.46, // F5
  },
  {
    id: 'travel',
    name: 'Adventure & Travel',
    emoji: '✈️',
    domainId: 'experiences',
    domainName: 'Exploration & Joy',
    description: 'Exploring distant places, sensory novelty, unfamiliar cultures, and daring experiences.',
    schwartzValue: 'Stimulation & Universalism-Tolerance',
    researchBasis: 'Experiential Happiness studies (Gilovich & Kumar); Schwartz Stimulation',
    subPriorities: [
      { id: 'travel_cultural', name: 'Immersive World Cultures', emoji: '🗺️', description: 'Street food in foreign alleys, historic cities, living differently' },
      { id: 'travel_wilderness', name: 'Wild Expeditions', emoji: '🏔️', description: 'Backpacking trails, mountain summits, remote ocean shores' },
      { id: 'travel_weekend', name: 'Spontaneous Escapes', emoji: '🚗', description: 'Road trips, weekend getaways, discovering nearby hidden gems' },
    ],
    tags: ['adventure', 'world', 'discovery', 'freedom'],
    seasonalRelevance: ['June', 'July', 'August', 'May'],
    color: '#0284c7',
    ambientFreq: 783.99, // G5
  },
  {
    id: 'fun',
    name: 'Play, Humor & Gaming',
    emoji: '🎉',
    domainId: 'experiences',
    domainName: 'Exploration & Joy',
    description: 'Unserious delight, video games, board games, belly laughs, parties, and playful leisure.',
    schwartzValue: 'Hedonism & Stimulation',
    researchBasis: 'Stuart Brown Institute of Play; Huizinga Homo Ludens',
    subPriorities: [
      { id: 'fun_games', name: 'Gaming & Virtual Worlds', emoji: '🎮', description: 'Video games, RPGs, board games, competitive fun' },
      { id: 'fun_festivity', name: 'Parties & Celebrations', emoji: '🪩', description: 'Dancing, festivals, concerts, spontaneous merriment' },
      { id: 'fun_humor', name: 'Humor & Goofiness', emoji: '😂', description: 'Comedy, playful banter, not taking life too solemnly' },
    ],
    tags: ['games', 'laughter', 'play', 'delight'],
    seasonalRelevance: ['October', 'December', 'July'],
    color: '#f59e0b',
    ambientFreq: 880.00, // A5
  },

  // --- DOMAIN: Purpose, Nature & Spirit ---
  {
    id: 'nature',
    name: 'Nature & Wilderness Connection',
    emoji: '🌲',
    domainId: 'meaning',
    domainName: 'Purpose, Nature & Spirit',
    description: 'Time beneath tall trees, ocean waves, mountain air, gardening, and grounding in the earth.',
    schwartzValue: 'Universalism-Nature',
    researchBasis: 'Shinrin-yoku (forest bathing) & Biophilia hypothesis (E.O. Wilson)',
    subPriorities: [
      { id: 'nature_forest', name: 'Forests, Trails & Oceans', emoji: '🌊', description: 'Hiking, camping, breathing pine air, swimming in natural water' },
      { id: 'nature_garden', name: 'Gardening & Cultivation', emoji: '🌱', description: 'Growing food, potting plants, hands in soil' },
      { id: 'nature_animals', name: 'Animals & Companions', emoji: '🐕', description: 'Bonding with pets, watching birds, animal empathy' },
    ],
    tags: ['earth', 'wild', 'peace', 'ecology'],
    seasonalRelevance: ['April', 'May', 'September', 'October'],
    color: '#15803d',
    ambientFreq: 987.77, // B5
  },
  {
    id: 'community',
    name: 'Community & Helping Others',
    emoji: '🤝',
    domainId: 'meaning',
    domainName: 'Purpose, Nature & Spirit',
    description: 'Civic contribution, mentoring, volunteering, mutual aid, and uplifting your neighbors.',
    schwartzValue: 'Universalism-Concern & Benevolence-Care',
    researchBasis: 'Prosocial spending and helper high research (Dunn & Aknin)',
    subPriorities: [
      { id: 'comm_service', name: 'Direct Volunteering & Aid', emoji: '🤲', description: 'Food shelters, crisis support, hands-on community service' },
      { id: 'comm_neighborhood', name: 'Local Neighborhood Fabric', emoji: '🏘️', description: 'Knowing your neighbors, community gardens, local civic care' },
      { id: 'comm_mentorship', name: 'Teaching & Mentoring', emoji: '💡', description: 'Guiding younger folks, passing down wisdom, opening doors' },
    ],
    tags: ['service', 'civic', 'kindness', 'generosity'],
    seasonalRelevance: ['November', 'December', 'August'],
    color: '#059669',
    ambientFreq: 1046.50, // C6
  },
  {
    id: 'purpose',
    name: 'Spirituality, Faith & Meaning',
    emoji: '🕯️',
    domainId: 'meaning',
    domainName: 'Purpose, Nature & Spirit',
    description: 'Contemplation of the sacred, existential clarity, ethical legacy, and philosophical grounding.',
    schwartzValue: 'Tradition & Humility',
    researchBasis: 'Viktor Frankl Logotherapy & Schwartz Transcendent Motivations',
    subPriorities: [
      { id: 'purpose_transcendence', name: 'Sacred Ritual & Prayer', emoji: '✨', description: 'Spiritual practice, faith tradition, connection to the divine' },
      { id: 'purpose_philosophy', name: 'Ethics & Philosophical Life', emoji: '🧭', description: 'Living by principled integrity, stoic reflection, existential contemplation' },
      { id: 'purpose_legacy', name: 'Legacy & Long-term Meaning', emoji: '🌳', description: 'Leaving the world a bit better than you found it' },
    ],
    tags: ['spirit', 'faith', 'meaning', 'legacy'],
    seasonalRelevance: ['December', 'January', 'April'],
    color: '#a855f7',
    ambientFreq: 1174.66, // D6
  },
];

export function getPriorityById(id: string): PriorityItem | undefined {
  return PRIORITIES.find(p => p.id === id);
}
