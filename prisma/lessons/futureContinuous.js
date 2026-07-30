// Future Continuous, split across four CEFR-aligned levels — same pattern
// as prisma/lessons/pastSimple.js.
const phrase = (target, translation, pronunciation) => ({ target, translation, pronunciation });

module.exports = [
  {
    title: 'Future Continuous Tense — Beginner',
    description: 'What will be in progress at a specific future moment.',
    duration: 20,
    content: {
      intro:
        "The future continuous describes what will be in progress at a specific future moment — imagine pausing a video at that future point and seeing what's happening.",
      sections: [
        {
          type: 'rule',
          title: 'When do we use it?',
          points: [
            'An action in progress at a specific future time — "This time tomorrow, I\'ll be flying to Paris."',
            'A fixed arrangement viewed as already in motion, without emphasizing the decision — "I\'ll be seeing him at the meeting anyway."',
            'A polite question about someone\'s plans, without pressuring them — "Will you be using the car later?"',
          ],
        },
        {
          type: 'structure',
          title: 'How to build it',
          structureItems: [
            { label: 'Affirmative', pattern: 'Subject + will be + verb-ing', example: 'They will be traveling all week.' },
            { label: 'Negative', pattern: "Subject + won't be + verb-ing", example: "I won't be working tomorrow." },
            { label: 'Question', pattern: 'Will + subject + be + verb-ing?', example: 'Will you be joining us?' },
          ],
        },
        {
          type: 'phrases',
          title: 'Signal words',
          items: [
            phrase('this time tomorrow', 'The exact same moment, one day ahead', ''),
            phrase('at this time next week', 'The exact same moment, one week ahead', ''),
            phrase('at 8pm tomorrow', 'A specific future time', ''),
            phrase('by then', 'By the future moment already mentioned', ''),
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake',
          body:
            'Don\'t confuse a single completed future action ("I\'ll finish the report") with an ongoing one at a specific moment ("I\'ll be finishing the report at 5pm" — still in progress then, not necessarily done).',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Memory trick',
          body:
            'If you can say "at that exact moment" and picture a scene mid-action, it\'s future continuous — the future version of the past continuous\'s "frozen frame" trick.',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: 'This time tomorrow, I ___ (lie) on a beach!', options: ['lie', 'will lie', 'will be lying', 'am lying'], correctIndex: 2, explanation: 'In progress at a specific future moment → future continuous.' },
            { question: '___ you be using the printer in the next few minutes?', options: ['Do', 'Will', 'Are', 'Have'], correctIndex: 1, explanation: 'A polite question about someone\'s near-future plans → future continuous.' },
            { question: 'At 9am tomorrow, she ___ (attend) a meeting.', options: ['attends', 'will attend', 'will be attending', 'is attending'], correctIndex: 2, explanation: 'A specific future moment, in progress → future continuous.' },
            { question: 'I ___ (not/work) this weekend, so I\'m free.', options: ["don't work", "won't work", "won't be working", "am not working"], correctIndex: 2, explanation: 'A state true across a specific future period → future continuous negative.' },
            { question: 'Don\'t call at 3pm — I ___ (drive).', options: ['drive', 'will drive', 'will be driving', 'am driving'], correctIndex: 2, explanation: 'In progress at that specific future time → future continuous.' },
          ],
        },
      ],
    },
  },
  {
    title: 'Future Continuous Tense — Elementary',
    description: 'Short answers and asking what someone will be doing.',
    duration: 20,
    content: {
      intro:
        "\"What will you be doing at...?\" is a natural everyday question. Let's build short answers and simple parallel-plan sentences.",
      sections: [
        {
          type: 'rule',
          title: 'Using it in real conversation',
          points: [
            'Short answers repeat "will", not the full verb — "Will you be coming?" "Yes, I will." (not "Yes, I coming.")',
            '"What will you be doing at [time]?" is the classic way to ask about someone\'s plans at a specific future moment.',
            'You can describe two parallel future plans with "while" — "While I\'m cooking, you\'ll be setting the table."',
          ],
        },
        {
          type: 'table',
          title: 'Short answers',
          headers: ['Question', 'Short answer (yes)', 'Short answer (no)'],
          rows: [
            ['Will you be coming?', 'Yes, I will.', "No, I won't."],
            ['Will she be working?', 'Yes, she will.', "No, she won't."],
            ['Will they be traveling?', 'Yes, they will.', "No, they won't."],
          ],
        },
        {
          type: 'phrases',
          title: 'Signal phrases',
          items: [
            phrase('at that time', 'Refers back to a future moment already mentioned', ''),
            phrase('all day tomorrow', 'An extended future period', ''),
            phrase('while', 'Marks a parallel plan happening at the same future time', ''),
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake',
          body:
            'Don\'t drop "be": "I will working tomorrow" ✗ is missing a piece — the full form always needs all three parts: will + BE + verb-ing — "I will be working tomorrow" ✓.',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Memory trick',
          body:
            'Practise answering "What will you be doing this time next Sunday?" out loud — it forces the full structure naturally, without overthinking.',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: '"Will you be joining us for dinner?" — "Yes, ___."', options: ['I will', 'I do', 'I am', "I'll"], correctIndex: 0, explanation: 'Short answer: "Yes, I will."' },
            { question: 'What ___ you be doing this time next week?', options: ['do', 'are', 'will', 'have'], correctIndex: 2, explanation: '"What will you be doing...?" is the standard question form.' },
            { question: 'While I\'m cooking, you ___ (set) the table.', options: ['set', 'will set', 'will be setting', 'are setting'], correctIndex: 2, explanation: 'A parallel plan happening at the same future time → future continuous.' },
            { question: 'Complete: I will ___ working late tonight. (missing word)', options: ['is', 'be', 'been', 'being'], correctIndex: 1, explanation: 'The full form always needs "be": will + be + verb-ing.' },
            { question: '"Will they be arriving soon?" — "No, ___."', options: ["they won't", "they don't", "they aren't", "they haven't"], correctIndex: 0, explanation: 'Short answer for future continuous: "No, they won\'t."' },
          ],
        },
      ],
    },
  },
  {
    title: 'Future Continuous Tense — Intermediate',
    description: 'The politest way to ask about plans, and softening a direct request.',
    duration: 20,
    content: {
      intro:
        "One of the most genuinely useful things about the future continuous: it lets you ask about someone's plans without sounding like you're asking a favor of them.",
      sections: [
        {
          type: 'rule',
          title: 'Level up your future continuous',
          points: [
            '"Will you be coming to the party?" sounds like a neutral question about a plan; "Will you come to the party?" can sound more like a direct invitation or request — the continuous form is genuinely softer and less pushy.',
            'This softening effect is why future continuous is common in polite, semi-formal questions — "Will you be needing anything else?" (a waiter, a hotel receptionist).',
            'It also describes a longer state true across a whole future period, not one instant — "I\'ll be living abroad next year."',
            'Compare with "going to be doing" — both work, but "will be doing" reads slightly more natural/neutral in most everyday contexts.',
          ],
        },
        {
          type: 'table',
          title: 'Neutral question vs direct request',
          headers: ['Future continuous (neutral)', 'Future simple (can sound like a request)'],
          rows: [
            ['Will you be using the car tonight?', 'Will you lend me the car tonight?'],
            ['Will you be attending the meeting?', 'Will you attend the meeting (for me)?'],
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake',
          body:
            'Don\'t reach for future continuous when you actually mean a decision or promise — "I will be helping you" for a spontaneous offer sounds oddly indirect; a plain "I\'ll help you" is the natural choice there.',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Politeness tip',
          body:
            'Next time you need to ask about someone\'s plans without sounding demanding, try the continuous form first — "Will you be free later?" instead of "Are you free later?" or "Will you be free?" both work, but the continuous often lands as the least pressuring.',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: 'Which sounds like a neutral question about plans, not a request?', options: ['Will you drive me to the airport?', 'Will you be driving to the airport?', 'Can you drive me to the airport?', 'Drive me to the airport, will you?'], correctIndex: 1, explanation: 'Future continuous asks about an existing plan neutrally, without requesting a favor.' },
            { question: '"Will you be needing anything else, sir?" is typical of...', options: ['A casual chat between friends', 'Polite service language (waiter, receptionist)', 'An angry complaint', 'A spontaneous decision'], correctIndex: 1, explanation: 'This softened, neutral question style is common in polite service contexts.' },
            { question: 'I ___ (live) abroad for the whole of next year.', options: ['will live', 'will be living', 'am living', 'live'], correctIndex: 1, explanation: 'A state true across an extended future period → future continuous.' },
            { question: 'The phone is ringing right now — which is the natural response?', options: ["I'll be answering it.", "I'll answer it.", "I'm going to be answering it.", "I will have answered it."], correctIndex: 1, explanation: 'A spontaneous decision needs plain future simple, not the softer continuous form.' },
            { question: 'Will you ___ (attend) the conference next month?', options: ['attend', 'be attending', 'attended', 'have attended'], correctIndex: 1, explanation: 'A neutral question about an existing future plan → future continuous.' },
          ],
        },
      ],
    },
  },
  {
    title: 'Future Continuous Tense — Advanced',
    description: 'Assuming what\'s happening right now, and a genuinely neutral professional register.',
    duration: 20,
    content: {
      intro:
        "At this level, the future continuous does one surprising job: describing an assumption about what's probably happening RIGHT NOW, based on routine — plus its real value in careful professional writing.",
      sections: [
        {
          type: 'rule',
          title: 'Where the rules bend on purpose',
          points: [
            'Future continuous can express a confident assumption about the present, based on a known routine — "Don\'t call him now, he\'ll be sleeping" (it\'s probably true right now, based on his usual schedule).',
            'In professional emails, "I will be sending the report by Friday" reads as a neutral statement of fact about a plan, without the assertiveness of "I will send" or the informality of "I\'m going to send".',
            'This assumption-about-now use only works with routines or predictable patterns — it doesn\'t work for a one-off, unpredictable situation.',
            'Because it\'s inherently softer and less direct, future continuous is a useful tool for hedging in careful, diplomatic writing.',
          ],
        },
        {
          type: 'table',
          title: 'Assumption about now vs genuine future',
          headers: ['Use', 'Example'],
          rows: [
            ['Assumption about right now (based on routine)', "Don't disturb her — she'll be working."],
            ['A genuine statement about the future', "She'll be working late tonight, so don't wait for her."],
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake at this level',
          body:
            'Don\'t use the "assumption about now" reading for a one-off, unpredictable event — "He\'ll be crossing the road right now" ✗ makes little sense unless there\'s a known, predictable pattern behind it. This use is reserved for routine-based assumptions.',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Professional register tip',
          body:
            'In careful business writing, future continuous often reads as the most neutral, least confrontational way to state a plan — useful when you want to inform, not assert or promise.',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: "Don't call the office now — everyone ___ (have) lunch.", options: ['has', 'will have', 'will be having', 'is having'], correctIndex: 2, explanation: 'An assumption about right now, based on a known routine → future continuous.' },
            { question: 'Which reads as the most neutral, least assertive professional statement?', options: ['I will send the invoice tomorrow.', "I'm going to send the invoice tomorrow.", 'I will be sending the invoice tomorrow.', 'I send the invoice tomorrow.'], correctIndex: 2, explanation: 'Future continuous often reads as the softest, most neutral way to state a plan in professional writing.' },
            { question: 'Which sentence is a poor fit for the "assumption about now" use?', options: ["Don't worry, he'll be sleeping by now.", 'He\'ll be crossing the street exactly now, I bet.', "She'll be commuting home around this time.", "They'll be having dinner right now, as usual."], correctIndex: 1, explanation: 'This use needs a known, predictable routine — a one-off unpredictable moment doesn\'t fit.' },
            { question: 'At this hour, the shop ___ (probably/close) already.', options: ['probably closes', 'will probably be closing', 'is probably closing', 'has probably closed'], correctIndex: 1, explanation: 'An assumption about the present based on routine timing → future continuous with "probably".' },
            { question: 'In a diplomatic email, which is the softest way to state you\'ll review something?', options: ['I will review it.', "I'm going to review it.", 'I will be reviewing it.', 'I review it.'], correctIndex: 2, explanation: 'The continuous form reads as the least confrontational, most neutral option.' },
          ],
        },
      ],
    },
  },
];
