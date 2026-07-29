// Present Continuous, split across three levels — same pattern as
// prisma/lessons/presentSimple.js.
const phrase = (target, translation, pronunciation) => ({ target, translation, pronunciation });

module.exports = [
  {
    title: 'Present Continuous Tense — Beginner',
    description: 'Actions happening right now, temporary situations, and fixed future plans.',
    duration: 20,
    content: {
      intro:
        "The present continuous describes actions in progress right now, temporary situations, and even fixed future plans. Its form is simple (am/is/are + -ing) — the real skill is knowing when NOT to use it.",
      sections: [
        {
          type: 'rule',
          title: 'When do we use it?',
          points: [
            'Actions happening right now — "I am writing an email."',
            "Temporary situations, true now but not permanent — \"I'm staying with my cousin this month.\"",
            'Changing or developing situations — "The weather is getting colder."',
            "Fixed future arrangements — \"We're meeting the doctor tomorrow at 10.\"",
            "With \"always\" for annoying repeated habits — \"He's always losing his keys!\"",
          ],
        },
        {
          type: 'structure',
          title: 'How to build it',
          structureItems: [
            { label: 'Affirmative', pattern: 'Subject + am/is/are + verb-ing', example: 'She is studying right now.' },
            { label: 'Negative', pattern: 'Subject + am/is/are + not + verb-ing', example: "I'm not working today." },
            { label: 'Question', pattern: 'Am/Is/Are + subject + verb-ing?', example: 'Are you listening?' },
          ],
        },
        {
          type: 'table',
          title: 'Spelling rules for -ing',
          headers: ['Rule', 'Example'],
          rows: [
            ['Most verbs: add -ing', 'work → working, read → reading'],
            ['Silent -e: drop the e, add -ing', 'make → making, write → writing'],
            ['Short stressed verb (vowel + consonant): double the consonant', 'run → running, stop → stopping'],
            ['Ends in -ie: change to -y', 'lie → lying, die → dying'],
          ],
        },
        {
          type: 'table',
          title: 'Present simple vs. present continuous',
          headers: ['Present simple', 'Present continuous'],
          rows: [
            ['A habit or routine — "I drink coffee every morning."', 'Happening right now — "I\'m drinking coffee right now."'],
            ['A permanent fact — "She works in a bank."', 'A temporary situation — "She\'s working from home this week."'],
            ['A fixed schedule/timetable — "The train leaves at 6."', 'A personal arrangement — "I\'m leaving at 6 to catch it."'],
          ],
        },
        {
          type: 'phrases',
          title: 'Signal words',
          items: [
            phrase('now', 'This exact moment', ''),
            phrase('right now', 'Emphasizes the present moment', ''),
            phrase('at the moment', 'Currently', ''),
            phrase('currently', 'At this time', ''),
            phrase('look! / listen!', 'Draws attention to something happening now', ''),
            phrase('these days', 'A temporary current period', ''),
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake',
          body:
            'State verbs don\'t usually take -ing. Don\'t say "I am knowing the answer" or "I am wanting coffee" — say "I know the answer" and "I want coffee." Verbs like know, like, love, hate, believe, understand, need, own and belong describe states, not actions.',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Memory trick',
          body:
            'If you can say "right now" and it still makes sense, it\'s probably present continuous: "I am eating (right now)" ✓ — but "I am knowing (right now)" ✗ sounds wrong, because knowing isn\'t something you actively "do" at a moment.',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: 'Listen! Someone ___ (knock) at the door.', options: ['knock', 'knocks', 'is knocking', 'knocked'], correctIndex: 2, explanation: '"Listen!" signals something happening right now → present continuous.' },
            { question: 'I ___ (not/understand) this exercise.', options: ['am not understanding', "don't understand", "doesn't understand", 'not understand'], correctIndex: 1, explanation: '"Understand" is a state verb — use present simple, not continuous.' },
            { question: 'We ___ (meet) James for lunch tomorrow.', options: ['meet', 'meets', 'are meeting', 'met'], correctIndex: 2, explanation: 'Present continuous can describe a fixed future plan.' },
            { question: 'Which spelling is correct for "run" + -ing?', options: ['runing', 'runeing', 'running', 'runnning'], correctIndex: 2, explanation: 'Short verb, one vowel + one consonant, stressed: double the "n" → running.' },
            { question: 'She ___ (always/lose) her umbrella!', options: ['always loses', 'is always losing', 'always is losing', 'always lose'], correctIndex: 1, explanation: '"Always" + present continuous expresses an annoying repeated habit.' },
          ],
        },
      ],
    },
  },
  {
    title: 'Present Continuous Tense — Intermediate',
    description: 'The passive continuous, developing trends, and how it splits from "going to" and "will".',
    duration: 20,
    content: {
      intro:
        "You can already say what's happening now — next comes the passive form, longer-running trends, and untangling present continuous from the other ways English talks about the future.",
      sections: [
        {
          type: 'rule',
          title: 'Level up your present continuous',
          points: [
            'Trends developing over a longer period, not just this second — "More people are working from home nowadays."',
            '"Always/constantly/continually" + continuous exaggerates an annoying habit for effect — it\'s not literally 100% of the time, unlike present simple "always".',
            'A fixed arrangement (present continuous) is different from an intention ("going to") and a prediction/on-the-spot decision ("will").',
            'A passive version exists too, for something being done TO the subject right now — "The bridge is being built."',
          ],
        },
        {
          type: 'structure',
          title: 'The passive form',
          structureItems: [
            { label: 'Passive present continuous', pattern: 'Subject + am/is/are + being + past participle', example: 'The bridge is being built. New rules are being introduced.' },
          ],
        },
        {
          type: 'table',
          title: 'Present continuous vs. other ways to talk about the future',
          headers: ['Form', 'Use', 'Example'],
          rows: [
            ['Present continuous', 'A fixed arrangement — time and place already decided', "I'm meeting Sara at 5pm."],
            ['going to', 'An intention or plan, not necessarily scheduled yet', "I'm going to call her later."],
            ['will', 'A prediction, or a decision made at the moment of speaking', "I think it will rain. / I'll get the phone!"],
          ],
        },
        {
          type: 'phrases',
          title: 'Signal words for trends',
          items: [
            phrase('nowadays', 'In contrast to how things used to be', ''),
            phrase('increasingly', 'More and more, over time', ''),
            phrase('day by day', 'Gradually, as time passes', ''),
            phrase('constantly', 'Repeatedly — often signals annoyance with continuous', ''),
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake',
          body:
            'Don\'t use present continuous for a general trait dressed up as a "trend": "Dogs are barking at strangers" ✗ describes a general truth about dogs, so it needs present simple — "Dogs bark at strangers" ✓. Continuous is for a real, observable CHANGE over time, like "Winters are getting shorter."',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Memory trick',
          body: 'The passive continuous is just "being" dropped into the middle: am/is/are + BEING + past participle. If you can already say "is happening", you can say "is being done" the same way.',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: 'A new hospital ___ (build) in the city centre.', options: ['builds', 'is building', 'is being built', 'has built'], correctIndex: 2, explanation: 'The subject (hospital) has the action done TO it → passive continuous: "is being built".' },
            { question: "I can't talk now — I ___ (meet) my boss at 3, and it's almost time.", options: ['meet', 'am meeting', 'am going to meet', 'will meet'], correctIndex: 1, explanation: 'A fixed, already-arranged plan → present continuous.' },
            { question: "Look at those clouds — I think it ___ (rain).", options: ['rains', 'is raining', "is going to rain", 'will rain'], correctIndex: 2, explanation: '"going to" for a prediction based on present evidence (those clouds).' },
            { question: 'He ___ (constantly/interrupt) me — it\'s so annoying!', options: ['constantly interrupts', 'is constantly interrupting', 'constantly is interrupting', 'has constantly interrupted'], correctIndex: 1, explanation: '"Constantly" + present continuous expresses irritation at a repeated habit.' },
            { question: 'Public transport ___ (use) more and more each year.', options: ['uses', 'is used', 'is being used', 'has used'], correctIndex: 2, explanation: 'A developing trend, passive (transport is used BY people) → "is being used".' },
          ],
        },
      ],
    },
  },
  {
    title: 'Present Continuous Tense — Advanced',
    description: 'When state verbs break the rules on purpose, and the "dramatic present" in storytelling.',
    duration: 20,
    content: {
      intro:
        "At this level, present continuous stops being just a grammar rule and becomes a register choice — the same verb can shift meaning, soften criticism, or paint a vivid scene, depending on whether you use it.",
      sections: [
        {
          type: 'rule',
          title: 'Where the rules bend on purpose',
          points: [
            'State verbs CAN take -ing when they shift meaning — "I\'m loving this" (informal, of-the-moment enthusiasm) vs "I love this" (a stable fact).',
            'The "dramatic present continuous" sets the SCENE in spoken storytelling — "So I\'m sitting there, minding my own business, when suddenly..." — contrast with the historic present SIMPLE, which drives the PLOT forward.',
            'Present continuous can soften criticism or feedback in professional contexts — "I\'m noticing a pattern of missed deadlines" reads less accusatory than a blunt present-simple statement.',
            'Live/developing news uses present continuous for events still unfolding — "Rescue teams are searching for survivors" — versus past simple once the event is over.',
          ],
        },
        {
          type: 'table',
          title: 'Dual-nature verbs in the continuous — shifted meanings',
          headers: ['Verb', 'Simple (stable/permanent)', 'Continuous (temporary/active/subjective)'],
          rows: [
            ['love / like', 'I love jazz. (general taste)', "I'm loving this playlist. (informal, this moment)"],
            ['see', 'I see what you mean. (understand)', "I'm seeing my dentist tomorrow. (appointment) / I'm seeing someone. (dating)"],
            ['think', "I think she's right. (opinion)", "I'm thinking about changing jobs. (considering, ongoing)"],
            ['have', 'I have a headache. (state)', "I'm having a great time! (experiencing)"],
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake at this level',
          body:
            '"I\'m loving it" and similar forms are informal/marketing register, not neutral formal English. Don\'t reach for -ing on a state verb in a formal report or exam essay just because it sounds more "dynamic" — "The data indicates..." not "The data is indicating..." in careful academic writing.',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Storytelling register',
          body:
            'Both the dramatic present continuous and the historic present simple make a story vivid, but they do different jobs: continuous paints the BACKGROUND/atmosphere ("I\'m walking down the street..."), while simple drives the ACTIONS/plot ("...and this guy comes up to me"). Skilled storytellers mix both.',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: '"___ this new album — it\'s all I\'ve listened to this week." (informal)', options: ["I love", "I'm loving", 'I am love', 'I loving'], correctIndex: 1, explanation: 'A state verb used informally for of-the-moment enthusiasm → "I\'m loving".' },
            { question: 'In your performance review, the softer way to raise a concern is:', options: ['"You always miss deadlines."', '"I\'m noticing a pattern of missed deadlines."', '"You miss deadlines."', '"You have missed deadlines."'], correctIndex: 1, explanation: 'Present continuous can soften criticism, sounding more observational than accusatory.' },
            { question: '"So I ___ down the street, and suddenly this dog just appears!" (spoken story)', options: ['walk', "'m walking", 'walked', 'have walked'], correctIndex: 1, explanation: 'The dramatic present continuous sets the scene in a spoken anecdote.' },
            { question: 'Formal report style: "The new data ___ a clear upward trend."', options: ['is indicating', 'indicates', 'is indicated', 'has indicating'], correctIndex: 1, explanation: 'Neutral formal register keeps state verbs in the simple form: "indicates".' },
            { question: '"I\'m sorry, could you repeat that? I ___ what you mean."', options: ["'m not seeing", "don't see", "'m not seeing to", 'not see'], correctIndex: 1, explanation: '"See" meaning "understand" stays in the simple form even in polite, softened speech.' },
          ],
        },
      ],
    },
  },
];
