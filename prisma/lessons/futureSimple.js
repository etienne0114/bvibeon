// Future Simple ("will"), split across four CEFR-aligned levels — same
// pattern as prisma/lessons/pastSimple.js.
const phrase = (target, translation, pronunciation) => ({ target, translation, pronunciation });

module.exports = [
  {
    title: 'Future Simple Tense — Beginner',
    description: 'Decisions made right now, predictions, and promises — "will" in its most common jobs.',
    duration: 20,
    content: {
      intro:
        "\"Will\" is the future tense you'll reach for most — for decisions you make on the spot, predictions, and promises. Its close cousin \"going to\" handles a different job, and telling them apart is the real skill here.",
      sections: [
        {
          type: 'rule',
          title: 'When do we use "will"?',
          points: [
            'A decision made at the moment of speaking, with no earlier plan — "The phone\'s ringing — I\'ll answer it."',
            'A prediction based on opinion or general belief, not present evidence — "I think it will rain tomorrow."',
            'Promises, offers, and threats — "I\'ll help you." / "I\'ll call you back." / "Do that again and I\'ll be angry."',
            'General facts about the future — "The sun will rise at 6am."',
          ],
        },
        {
          type: 'structure',
          title: 'How to build it',
          structureItems: [
            { label: 'Affirmative', pattern: "Subject + will ('ll) + base verb", example: "I'll help you carry that." },
            { label: 'Negative', pattern: "Subject + will not (won't) + base verb", example: "She won't be late." },
            { label: 'Question', pattern: 'Will + subject + base verb?', example: 'Will you be there?' },
          ],
        },
        {
          type: 'table',
          title: '"Will" vs "going to"',
          headers: ['Will', 'Going to'],
          rows: [
            ['A decision made right now — "I\'ll get it!" (phone starts ringing)', 'A plan already decided before now — "I\'m going to visit my grandma this weekend."'],
            ['A prediction based on opinion — "I think she\'ll win."', 'A prediction based on present evidence — "Look at those clouds — it\'s going to rain."'],
          ],
        },
        {
          type: 'phrases',
          title: 'Signal words',
          items: [
            phrase('tomorrow', 'The day after today', ''),
            phrase('next week / month / year', 'The one coming after this one', ''),
            phrase('soon', 'In the near future', ''),
            phrase('I think / I\'m sure', 'Signals an opinion-based prediction with "will"', ''),
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake',
          body:
            'Don\'t use "will" for a plan you already decided before now: "I will visit my grandma this weekend" (if it was already planned) sounds like you\'re deciding this second. Use "going to" or the present continuous instead: "I\'m going to visit my grandma this weekend" ✓.',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Memory trick',
          body:
            '"Will" = a lightbulb moment, decided right now. "Going to" = a plan you already had in your pocket before the conversation started.',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: "I'm cold. I ___ (close) the window.", options: ['close', 'am closing', 'will close', 'am going to close'], correctIndex: 2, explanation: 'A decision made on the spot → "will".' },
            { question: 'Look at those dark clouds — it ___ (rain).', options: ['will rain', 'is going to rain', 'rains', 'is raining'], correctIndex: 1, explanation: 'A prediction based on present evidence → "going to".' },
            { question: 'I already booked the tickets — we ___ (go) to the concert on Friday.', options: ['will go', 'are going to go', 'go', 'went'], correctIndex: 1, explanation: 'A plan decided before now → "going to".' },
            { question: '"I promise I ___ (call) you tonight."', options: ['call', 'am calling', 'will call', 'am going to call'], correctIndex: 2, explanation: 'A promise → "will".' },
            { question: 'I think Brazil ___ (win) the tournament.', options: ['wins', 'will win', 'is going to win', 'is winning'], correctIndex: 1, explanation: 'An opinion-based prediction, no hard evidence → "will".' },
          ],
        },
      ],
    },
  },
  {
    title: 'Future Simple Tense — Elementary',
    description: '"Going to" for plans and evidence, and the many uses of "won\'t".',
    duration: 20,
    content: {
      intro:
        "Let's go deeper on \"going to\" — the future you'll use for plans and obvious predictions — and pick up \"won't\", which does more jobs than just being the negative of \"will\".",
      sections: [
        {
          type: 'rule',
          title: 'Building on the basics',
          points: [
            '"Going to" covers both prior plans/intentions and predictions based on something you can see or know right now.',
            '"Won\'t" isn\'t just "will not" — it very often expresses refusal: "He won\'t listen to me" means he refuses to, not just that he\'s predicted not to.',
            'The first conditional pairs present simple with "will" — "If it rains, we\'ll stay inside." (You\'ll study this fully as its own topic soon.)',
            'Wh-questions about the future follow the same word order as any other "will" question — "What will you do?" / "Where will you go?"',
          ],
        },
        {
          type: 'table',
          title: '"Going to": plan vs evidence',
          headers: ['Job', 'Example'],
          rows: [
            ['A prior intention/plan', "I'm going to study medicine."],
            ['A prediction from present evidence', 'She\'s about to fall — she\'s going to trip!'],
          ],
        },
        {
          type: 'phrases',
          title: 'Signal phrases',
          items: [
            phrase("I'm planning to...", 'Signals an intention, similar to "going to"', ''),
            phrase('in the near future', 'Sometime soon, not specified exactly', ''),
            phrase("won't", 'Refusal, or a simple future negative', ''),
            phrase('probably', 'Softens a prediction — "I\'ll probably be late."', ''),
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake',
          body:
            'Don\'t confuse "won\'t" (future negative/refusal) with "don\'t" (present habit negative). "He won\'t eat vegetables" (he refuses to / never will) is different from "He doesn\'t eat vegetables" (a simple present fact about his diet).',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Memory trick',
          body:
            'If a sentence could be rephrased "...and he refuses," it\'s "won\'t" — refusal is baked into the word, not just "will" + "not".',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: 'The car ___ (not/start) — I\'ve tried five times!', options: ["doesn't start", "won't start", "isn't starting", "hasn't started"], correctIndex: 1, explanation: '"Won\'t" here expresses stubborn refusal to work, not just a future prediction.' },
            { question: 'If it rains tomorrow, we ___ (cancel) the picnic.', options: ['cancel', 'will cancel', 'are cancelling', 'cancelled'], correctIndex: 1, explanation: 'First conditional: if + present simple, will + base verb.' },
            { question: '___ will you do after you graduate?', options: ['Who', 'What', 'Will', 'Do'], correctIndex: 1, explanation: '"What will you do?" — standard wh-question word order with "will".' },
            { question: 'She\'s wearing running shoes — she ___ (go) for a jog.', options: ['will go', 'is going to go', 'goes', 'went'], correctIndex: 1, explanation: 'A prediction based on visible present evidence → "going to".' },
            { question: 'I ___ (probably/be) a few minutes late.', options: ["probably will be", "will probably be", "am probably", "probably am"], correctIndex: 1, explanation: '"Probably" usually sits right after "will": "will probably be".' },
          ],
        },
      ],
    },
  },
  {
    title: 'Future Simple Tense — Intermediate',
    description: 'Future time clauses, "shall" for offers, and habitual "will".',
    duration: 20,
    content: {
      intro:
        "Time to fix the classic future-tense trap (never say \"will\" in a time clause), pick up the polite British \"shall\", and notice how \"will\" can describe a stubborn present habit.",
      sections: [
        {
          type: 'rule',
          title: 'Level up your future simple',
          points: [
            'Time clauses about the future (after when/before/after/as soon as/until) use the PRESENT simple, never "will" — "I\'ll call you when I arrive" (not "when I will arrive").',
            '"Shall" offers or suggests, mainly with I/we, and is more common in British English — "Shall I open the window?" / "Shall we dance?"',
            '"Will" can describe a stubborn or characteristic present habit, not the future at all — "She\'ll sit there for hours without moving."',
            'The future passive follows the same pattern as any passive — "will be + past participle" — "The results will be announced tomorrow."',
          ],
        },
        {
          type: 'table',
          title: '"Will" vs "shall" for offers',
          headers: ['Will', 'Shall'],
          rows: [
            ['A plain future statement — "I will finish this today."', 'An offer or suggestion, usually I/we — "Shall I help you?" / "Shall we begin?"'],
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake',
          body:
            'Never put "will" inside a future time clause: "I\'ll text you when I will arrive" ✗ is wrong. The time clause itself stays in the present simple even though the whole sentence is about the future: "I\'ll text you when I arrive" ✓.',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Memory trick',
          body:
            'The main clause carries the future marker ("I\'ll text you"); the time clause just needs to say WHEN, in plain present simple — one "future" marker per sentence is enough.',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: "I'll let you know as soon as I ___ (hear) anything.", options: ['will hear', 'hear', 'am hearing', 'heard'], correctIndex: 1, explanation: 'The time clause after "as soon as" stays in the present simple, not "will".' },
            { question: '___ I carry that bag for you?', options: ['Will', 'Shall', 'Do', 'Am'], correctIndex: 1, explanation: '"Shall I...?" is the standard polite offer.' },
            { question: 'He\'ll ___ (sit) in that same chair every single evening — it\'s just how he is.', options: ['sit', 'sits', 'be sitting', 'have sat'], correctIndex: 0, explanation: '"Will" + base verb describing a stubborn, characteristic habit (not a future event).' },
            { question: 'The winners ___ (announce) at the end of the ceremony.', options: ['will announce', 'will be announced', 'are announcing', 'announce'], correctIndex: 1, explanation: 'Future passive: will be + past participle.' },
            { question: 'Before you ___ (leave), please turn off the lights.', options: ['will leave', 'leave', 'are leaving', 'left'], correctIndex: 1, explanation: 'Time clauses about the future use the present simple, never "will".' },
          ],
        },
      ],
    },
  },
  {
    title: 'Future Simple Tense — Advanced',
    description: 'Degrees of certainty, formal scheduled future, and "future in the past".',
    duration: 20,
    content: {
      intro:
        "At this level, the future isn't just \"will\" or \"won't\" — it has a whole spectrum of certainty, a formal register for schedules, and a special form for plans that never happened.",
      sections: [
        {
          type: 'rule',
          title: 'Where the future gets nuanced',
          points: [
            'Modals express different degrees of certainty about the future: will (very certain), should (fairly confident), may/might/could (less certain).',
            '"Be to" and "be due to" express a formal, scheduled future — common in news, itineraries, and official announcements: "The minister is to visit next week." / "The flight is due to depart at 9am."',
            '"Was/were going to" describes a past intention that never happened — "future in the past" — "I was going to call you, but I forgot."',
            'Modals of certainty never combine with "will" — you choose ONE marker of future certainty per verb, not two.',
          ],
        },
        {
          type: 'table',
          title: 'Degrees of certainty about the future',
          headers: ['Modal', 'Certainty', 'Example'],
          rows: [
            ['will', 'Very confident', "I'll be there at 9."],
            ['should', 'Fairly confident, expects it', 'The package should arrive tomorrow.'],
            ['may / might / could', 'Less certain, a real possibility', 'It might rain later.'],
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake at this level',
          body:
            'Don\'t stack two future/certainty markers: "It will might rain" ✗ is wrong — pick one: "It will rain" or "It might rain", never both together.',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Register tip',
          body:
            '"Be to" and "be due to" sound formal and impersonal on purpose — perfect for news writing or official schedules, but oddly stiff in casual conversation, where "will" or "going to" reads far more natural.',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: 'The president ___ (be to) address the nation tonight. (formal news style)', options: ['will', 'is to', 'is going', 'shall'], correctIndex: 1, explanation: '"Be to" signals a formal, scheduled future event — typical news register.' },
            { question: 'I ___ (be going to) email you yesterday, but I completely forgot.', options: ['was going to', 'will', 'am going to', 'went to'], correctIndex: 0, explanation: '"Was going to" expresses a past intention that never happened — future in the past.' },
            { question: 'Which shows the LEAST certainty?', options: ['It will rain.', 'It should rain.', 'It might rain.', 'It is due to rain.'], correctIndex: 2, explanation: '"Might" expresses the weakest degree of certainty among these options.' },
            { question: 'Correct the error: "It will could be difficult."', options: ['It will can be difficult.', 'It could be difficult.', 'It will difficult be.', 'It will be could difficult.'], correctIndex: 1, explanation: 'Never stack two future/certainty markers — pick one modal: "It could be difficult."' },
            { question: 'The train ___ (due) to arrive at platform 4.', options: ['is', 'will', 'is going', 'shall'], correctIndex: 0, explanation: '"Is due to" is the fixed formal-schedule pattern.' },
          ],
        },
      ],
    },
  },
];
