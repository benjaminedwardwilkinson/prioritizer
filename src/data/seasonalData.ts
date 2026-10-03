import { MonthOrbit } from '../types';

export const MONTH_ORBITS: MonthOrbit[] = [
  {
    monthIndex: 0,
    shortName: 'JAN',
    fullName: 'January',
    emoji: '🎆',
    season: 'WINTER',
    theme: 'Threshold & Intention',
    headline: 'The Clean Horizon',
    prompt: 'What deserves first claim on your calendar before the momentum of the year takes over?',
    miniQuiz: [
      {
        question: 'What is the one commitment you want to protect when January chaos hits?',
        options: [
          { text: 'Morning physical movement & clean biological rhythm', emoji: '💪', priorityId: 'fitness' },
          { text: 'Setting clear career milestones and promotion roadmap', emoji: '💻', priorityId: 'career' },
          { text: 'Slow, peaceful weekends with immediate loved ones', emoji: '❤️', priorityId: 'family' },
          { text: 'Automating high-yield savings & investment discipline', emoji: '💰', priorityId: 'financial' },
        ],
      },
      {
        question: 'Which ambition excites your spirit most for this fresh orbit?',
        options: [
          { text: 'Mastering a rigorous new skill or reading 20 books', emoji: '🧠', priorityId: 'learning' },
          { text: 'Booking an adventure somewhere foreign', emoji: '✈️', priorityId: 'travel' },
          { text: 'Creating an inspiring, clutter-free home space', emoji: '🏡', priorityId: 'home' },
          { text: 'Developing deep daily equanimity and calm', emoji: '🧘', priorityId: 'wellbeing' },
        ],
      },
    ],
  },
  {
    monthIndex: 1,
    shortName: 'FEB',
    fullName: 'February',
    emoji: '💕',
    season: 'WINTER',
    theme: 'Intimacy & Heart',
    headline: 'Deep Winter Warmth',
    prompt: 'When frost sits outside, who warms the room from within?',
    miniQuiz: [
      {
        question: 'What kind of connection does your life most crave right now?',
        options: [
          { text: 'Vulnerable romantic spark and slow date nights', emoji: '💕', priorityId: 'romance' },
          { text: 'Unfiltered laughter and dinner parties with dear friends', emoji: '👫', priorityId: 'friendship' },
          { text: 'Reconnecting with parents or extended family roots', emoji: '❤️', priorityId: 'family' },
          { text: 'Quiet solitude to fall back in love with your own craft', emoji: '🎨', priorityId: 'creativity' },
        ],
      },
    ],
  },
  {
    monthIndex: 2,
    shortName: 'MAR',
    fullName: 'March',
    emoji: '🌱',
    season: 'SPRING',
    theme: 'Awakening & Green Shoots',
    headline: 'The First Thaw',
    prompt: 'What dormant seed is ready to break through frozen ground?',
    miniQuiz: [
      {
        question: 'Where is fresh life stirring in your mind?',
        options: [
          { text: 'Starting a new creative or artistic endeavor', emoji: '🎨', priorityId: 'creativity' },
          { text: 'Getting outdoors as sunlight hours lengthen', emoji: '🌲', priorityId: 'nature' },
          { text: 'Spring cleaning, reorganizing, and redesigning home', emoji: '🏡', priorityId: 'home' },
          { text: 'Levelling up energy through endurance and nutrition', emoji: '💪', priorityId: 'fitness' },
        ],
      },
    ],
  },
  {
    monthIndex: 3,
    shortName: 'APR',
    fullName: 'April',
    emoji: '🌷',
    season: 'SPRING',
    theme: 'Renewal & Growth',
    headline: 'The Rain & Bloom',
    prompt: 'What old baggage are you ready to compost into soil?',
    miniQuiz: [
      {
        question: 'If you could prune one drain on your energy this spring, what would you feed?',
        options: [
          { text: 'Unstructured time for daydreaming and art', emoji: '🎨', priorityId: 'creativity' },
          { text: 'Digging hands in soil, planting gardens, hiking trails', emoji: '🌱', priorityId: 'nature' },
          { text: 'Financial auditing and clearing away debt or clutter', emoji: '💰', priorityId: 'financial' },
          { text: 'Serving neighbors or volunteering in the community', emoji: '🤝', priorityId: 'community' },
        ],
      },
    ],
  },
  {
    monthIndex: 4,
    shortName: 'MAY',
    fullName: 'May',
    emoji: '🌸',
    season: 'SPRING',
    theme: 'Vitality & Open Air',
    headline: 'The Golden Canopy',
    prompt: 'The days are long. How will you spend the bonus daylight?',
    miniQuiz: [
      {
        question: 'What gives you the highest surge of living energy in May?',
        options: [
          { text: 'Long outdoor bike rides, swims, and morning runs', emoji: '💪', priorityId: 'fitness' },
          { text: 'Spontaneous weekend road trips and camping under stars', emoji: '✈️', priorityId: 'travel' },
          { text: 'Barbecues and backyard laughter with friends', emoji: '👫', priorityId: 'friendship' },
          { text: 'Gardening, potting plants, and living in fresh air', emoji: '🌲', priorityId: 'nature' },
        ],
      },
    ],
  },
  {
    monthIndex: 5,
    shortName: 'JUN',
    fullName: 'June',
    emoji: '☀️',
    season: 'SUMMER',
    theme: 'Solstice & Horizon',
    headline: 'The Peak Light',
    prompt: 'Midway through the year. Does your life match what you dreamed in January?',
    miniQuiz: [
      {
        question: 'Which mid-year recalibration feels most urgent?',
        options: [
          { text: 'Taking real time off to travel and unplug completely', emoji: '✈️', priorityId: 'travel' },
          { text: 'Doubling down on a major career breakthrough', emoji: '💻', priorityId: 'career' },
          { text: 'Focusing on physical vitality and feeling great in your body', emoji: '💪', priorityId: 'fitness' },
          { text: 'Deepening intimate partnerships without distraction', emoji: '💕', priorityId: 'romance' },
        ],
      },
    ],
  },
  {
    monthIndex: 6,
    shortName: 'JUL',
    fullName: 'July',
    emoji: '🏖️',
    season: 'SUMMER',
    theme: 'Play & Freedom',
    headline: 'The Ocean Breeze',
    prompt: 'Unapologetic play. When was the last time you lost track of time laughing?',
    miniQuiz: [
      {
        question: 'What is your summer recipe for pure joy?',
        options: [
          { text: 'Swimming in cold water and basking under sunlight', emoji: '🌊', priorityId: 'nature' },
          { text: 'Video games, board game marathons, and total play', emoji: '🎉', priorityId: 'fun' },
          { text: 'Boarding a flight to somewhere you’ve never been', emoji: '✈️', priorityId: 'travel' },
          { text: 'Doing absolutely nothing on a hammock with iced coffee', emoji: '🌙', priorityId: 'rest' },
        ],
      },
    ],
  },
  {
    monthIndex: 7,
    shortName: 'AUG',
    fullName: 'August',
    emoji: '🎒',
    season: 'SUMMER',
    theme: 'Late Warmth & Gathering',
    headline: 'The Firefly Twilight',
    prompt: 'Summer is winding down. What memories do you want to hold onto?',
    miniQuiz: [
      {
        question: 'Before autumn arrives, what must you prioritize?',
        options: [
          { text: 'Cherished time with family and kids before school routines', emoji: '❤️', priorityId: 'family' },
          { text: 'One last unforgettable expedition or music festival', emoji: '🎉', priorityId: 'fun' },
          { text: 'Reflecting on personal growth and spiritual peace', emoji: '🕯️', priorityId: 'purpose' },
          { text: 'Prepping your home sanctuary for cozy autumn nights', emoji: '🏡', priorityId: 'home' },
        ],
      },
    ],
  },
  {
    monthIndex: 8,
    shortName: 'SEP',
    fullName: 'September',
    emoji: '📚',
    season: 'AUTUMN',
    theme: 'Focus & New Chapters',
    headline: 'The Sharpened Pencil',
    prompt: 'Crisp morning air and the urge to build, learn, and master.',
    miniQuiz: [
      {
        question: 'What appetite is strongest as routines tighten?',
        options: [
          { text: 'Diving into an intensive course or intellectual obsession', emoji: '🧠', priorityId: 'learning' },
          { text: 'Executing high-impact work and career breakthroughs', emoji: '💻', priorityId: 'career' },
          { text: 'Building a bulletproof daily workout and meal prep habit', emoji: '💪', priorityId: 'fitness' },
          { text: 'Cultivating inner serenity and defensive boundaries', emoji: '🧘', priorityId: 'wellbeing' },
        ],
      },
    ],
  },
  {
    monthIndex: 9,
    shortName: 'OCT',
    fullName: 'October',
    emoji: '🎃',
    season: 'AUTUMN',
    theme: 'Harvest & Mystery',
    headline: 'The Amber Lantern',
    prompt: 'The leaves turn amber. What have you harvested from your efforts, and what is ready to be released?',
    miniQuiz: [
      {
        question: 'What is the most rewarding way to spend a brisk October evening?',
        options: [
          { text: 'Cozy creative flow—writing, painting, or making music with tea', emoji: '🎨', priorityId: 'creativity' },
          { text: 'Walking through golden foliage and breathing crisp forest air', emoji: '🌲', priorityId: 'nature' },
          { text: 'Sharing a hearty autumn stew with family around a glowing table', emoji: '❤️', priorityId: 'family' },
          { text: 'Immersing in spooky games, classic films, and playful fun', emoji: '🎉', priorityId: 'fun' },
        ],
      },
    ],
  },
  {
    monthIndex: 10,
    shortName: 'NOV',
    fullName: 'November',
    emoji: '🦃',
    season: 'AUTUMN',
    theme: 'Gratitude & Hearth',
    headline: 'The Gathering Table',
    prompt: 'Who deserves your presence, your apology, or your unhurried gratitude?',
    miniQuiz: [
      {
        question: 'When you sit at the table of your life, who gets your prime hours?',
        options: [
          { text: 'Core family and elders who shaped my story', emoji: '❤️', priorityId: 'family' },
          { text: 'Feeding and lifting up those in need in my community', emoji: '🤝', priorityId: 'community' },
          { text: 'Deepening loyal friendships through thick and thin', emoji: '👫', priorityId: 'friendship' },
          { text: 'Protecting my own peace of mind and resting deeply', emoji: '🌙', priorityId: 'rest' },
        ],
      },
    ],
  },
  {
    monthIndex: 11,
    shortName: 'DEC',
    fullName: 'December',
    emoji: '🎄',
    season: 'WINTER',
    theme: 'Solstice & Reflection',
    headline: 'The Annual Accounting',
    prompt: 'Where did your life actually go this year? What do you want to do differently?',
    miniQuiz: [
      {
        question: 'As the year closes, what leaves you feeling truly whole?',
        options: [
          { text: 'Peace of mind with my financial foundation and savings', emoji: '💰', priorityId: 'financial' },
          { text: 'Quiet reflection, spiritual contemplation, and ethical purpose', emoji: '🕯️', priorityId: 'purpose' },
          { text: 'Uninterrupted slow holidays with the people who matter most', emoji: '❤️', priorityId: 'family' },
          { text: 'Resting, sleeping without an alarm, and hitting reset', emoji: '🌙', priorityId: 'rest' },
        ],
      },
    ],
  },
];

export function getCurrentMonthOrbit(): MonthOrbit {
  const currentMonth = new Date().getMonth();
  return MONTH_ORBITS[currentMonth] || MONTH_ORBITS[9]; // default October
}
