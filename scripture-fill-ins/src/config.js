export const BUILD_VERSION = '20251112';

export const VERSES = [
  {
    id: 'ps23-1',
    reference: 'Psalm 23:1',
    template: [
      'The Lord is my ',
      { blankId: 'shepherd' },
      '; I shall not ',
      { blankId: 'want' },
      '.',
    ],
    blanks: [
      {
        id: 'shepherd',
        label: 'Blank 1',
        answer: 'shepherd',
        options: ['shield', 'shepherd', 'fortress'],
      },
      {
        id: 'want',
        label: 'Blank 2',
        answer: 'want',
        options: ['fear', 'want', 'wander'],
      },
    ],
  },
  {
    id: 'prov3-5',
    reference: 'Proverbs 3:5',
    template: [
      'Trust in the ',
      { blankId: 'lord' },
      ' with all your ',
      { blankId: 'heart' },
      ', and do not lean on your own understanding.',
    ],
    blanks: [
      {
        id: 'lord',
        label: 'Blank 1',
        answer: 'Lord',
        options: ['world', 'Lord', 'wisdom'],
      },
      {
        id: 'heart',
        label: 'Blank 2',
        answer: 'heart',
        options: ['heart', 'strength', 'mind'],
      },
    ],
  },
  {
    id: 'john3-16',
    reference: 'John 3:16',
    template: [
      'For God so loved the ',
      { blankId: 'world' },
      ', that he gave his only ',
      { blankId: 'son' },
      ', that whoever believes in him should not ',
      { blankId: 'perish' },
      ' but have eternal life.',
    ],
    blanks: [
      {
        id: 'world',
        label: 'Blank 1',
        answer: 'world',
        options: ['world', 'church', 'nations'],
      },
      {
        id: 'son',
        label: 'Blank 2',
        answer: 'Son',
        options: ['prophet', 'Son', 'teacher'],
      },
      {
        id: 'perish',
        label: 'Blank 3',
        answer: 'perish',
        options: ['perish', 'doubt', 'wander'],
      },
    ],
  },
  {
    id: 'phil4-13',
    reference: 'Philippians 4:13',
    template: [
      'I can do all things through ',
      { blankId: 'christ' },
      ' who gives me ',
      { blankId: 'strength' },
      '.',
    ],
    blanks: [
      {
        id: 'christ',
        label: 'Blank 1',
        answer: 'Christ',
        options: ['Christ', 'friends', 'discipline'],
      },
      {
        id: 'strength',
        label: 'Blank 2',
        answer: 'strength',
        options: ['wisdom', 'strength', 'peace'],
      },
    ],
  },
  {
    id: 'isa40-31',
    reference: 'Isaiah 40:31',
    template: [
      'But they who wait for the ',
      { blankId: 'lord' },
      ' shall renew their ',
      { blankId: 'strength' },
      '; they shall mount up with wings like ',
      { blankId: 'eagles' },
      '.',
    ],
    blanks: [
      {
        id: 'lord',
        label: 'Blank 1',
        answer: 'Lord',
        options: ['Lord', 'river', 'promise'],
      },
      {
        id: 'strength',
        label: 'Blank 2',
        answer: 'strength',
        options: ['strength', 'vision', 'song'],
      },
      {
        id: 'eagles',
        label: 'Blank 3',
        answer: 'eagles',
        options: ['sparrows', 'eagles', 'doves'],
      },
    ],
  },
  {
    id: 'jer29-11',
    reference: 'Jeremiah 29:11',
    template: [
      '“For I know the ',
      { blankId: 'plans' },
      ' I have for you,” declares the Lord, “plans to prosper you and not to harm you, plans to give you a ',
      { blankId: 'future' },
      ' and a ',
      { blankId: 'hope' },
      '.”',
    ],
    blanks: [
      {
        id: 'plans',
        label: 'Blank 1',
        answer: 'plans',
        options: ['songs', 'plans', 'trials'],
      },
      {
        id: 'future',
        label: 'Blank 2',
        answer: 'future',
        options: ['future', 'warning', 'burden'],
      },
      {
        id: 'hope',
        label: 'Blank 3',
        answer: 'hope',
        options: ['hope', 'doubt', 'secret'],
      },
    ],
  },
  {
    id: 'rom8-28',
    reference: 'Romans 8:28',
    template: [
      'And we ',
      { blankId: 'know' },
      ' that in all things God works for the ',
      { blankId: 'good' },
      ' of those who love him, who have been ',
      { blankId: 'called' },
      ' according to his purpose.',
    ],
    blanks: [
      {
        id: 'know',
        label: 'Blank 1',
        answer: 'know',
        options: ['doubt', 'know', 'imagine'],
      },
      {
        id: 'good',
        label: 'Blank 2',
        answer: 'good',
        options: ['good', 'change', 'loss'],
      },
      {
        id: 'called',
        label: 'Blank 3',
        answer: 'called',
        options: ['called', 'warned', 'ignored'],
      },
    ],
  },
  {
    id: 'josh1-9',
    reference: 'Joshua 1:9',
    template: [
      '“Have I not commanded you? Be ',
      { blankId: 'strong' },
      ' and ',
      { blankId: 'courageous' },
      '. Do not be ',
      { blankId: 'afraid' },
      ', and do not be dismayed, for the Lord your God is with you wherever you go.”',
    ],
    blanks: [
      {
        id: 'strong',
        label: 'Blank 1',
        answer: 'strong',
        options: ['quiet', 'strong', 'timid'],
      },
      {
        id: 'courageous',
        label: 'Blank 2',
        answer: 'courageous',
        options: ['courageous', 'hesitant', 'restless'],
      },
      {
        id: 'afraid',
        label: 'Blank 3',
        answer: 'afraid',
        options: ['afraid', 'silent', 'forgetful'],
      },
    ],
  },
  {
    id: 'mat11-28',
    reference: 'Matthew 11:28',
    template: [
      '“',
      { blankId: 'come' },
      ' to me, all you who are ',
      { blankId: 'weary' },
      ' and burdened, and I will give you ',
      { blankId: 'rest' },
      '.”',
    ],
    blanks: [
      {
        id: 'come',
        label: 'Blank 1',
        answer: 'Come',
        options: ['Listen', 'Come', 'Hurry'],
      },
      {
        id: 'weary',
        label: 'Blank 2',
        answer: 'weary',
        options: ['weary', 'joyful', 'silent'],
      },
      {
        id: 'rest',
        label: 'Blank 3',
        answer: 'rest',
        options: ['rest', 'instruction', 'payment'],
      },
    ],
  },
  {
    id: 'lam3-22',
    reference: 'Lamentations 3:22-23',
    template: [
      'The steadfast love of the Lord never ceases; his ',
      { blankId: 'mercies' },
      ' never come to an end; they are new every ',
      { blankId: 'morning' },
      '; great is your ',
      { blankId: 'faithfulness' },
      '.',
    ],
    blanks: [
      {
        id: 'mercies',
        label: 'Blank 1',
        answer: 'mercies',
        options: ['warnings', 'mercies', 'storms'],
      },
      {
        id: 'morning',
        label: 'Blank 2',
        answer: 'morning',
        options: ['evening', 'season', 'morning'],
      },
      {
        id: 'faithfulness',
        label: 'Blank 3',
        answer: 'faithfulness',
        options: ['faithfulness', 'silence', 'mystery'],
      },
    ],
  },
];

export const STORAGE_KEYS = {
  STREAK: 'scripture-fill-ins:streak',
  TOTAL_PLAYED: 'scripture-fill-ins:total-played',
  CORRECT_ANSWERS: 'scripture-fill-ins:correct-answers',
  TOTAL_BLANKS: 'scripture-fill-ins:total-blanks',
};
