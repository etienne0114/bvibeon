// Past Continuous, split across four CEFR-aligned levels — same pattern as
// prisma/lessons/pastSimple.js.
const phrase = (target, translation, pronunciation) => ({ target, translation, pronunciation });

module.exports = [
  {
    title: 'Past Continuous Tense — Beginner',
    description: 'What was happening at a specific past moment — perfect for setting a scene.',
    duration: 20,
    content: {
      intro:
        "The past continuous describes what was in progress at a specific moment in the past — great for setting a scene, or explaining what one thing interrupted.",
      sections: [
        {
          type: 'rule',
          title: 'When do we use it?',
          points: [
            'An action in progress at a specific past time — "At 8pm, I was watching TV."',
            'A longer action interrupted by a shorter one — "I was cooking when the phone rang."',
            'Two parallel actions happening at the same past time — "While she was reading, he was cleaning."',
            'Setting the scene at the start of a story — "It was raining, and the wind was blowing."',
          ],
        },
        {
          type: 'structure',
          title: 'How to build it',
          structureItems: [
            { label: 'Affirmative', pattern: 'Subject + was/were + verb-ing', example: 'They were playing football.' },
            { label: 'Negative', pattern: 'Subject + was/were + not + verb-ing', example: "She wasn't listening." },
            { label: 'Question', pattern: 'Was/Were + subject + verb-ing?', example: 'Were you sleeping?' },
          ],
        },
        {
          type: 'table',
          title: 'Spelling rules for -ing (a quick reminder)',
          headers: ['Rule', 'Example'],
          rows: [
            ['Most verbs: add -ing', 'work → working, read → reading'],
            ['Silent -e: drop the e, add -ing', 'make → making, write → writing'],
            ['Short stressed verb: double the consonant', 'run → running, stop → stopping'],
          ],
        },
        {
          type: 'phrases',
          title: 'Signal words',
          items: [
            phrase('while', 'Marks a background action happening alongside another', ''),
            phrase('when', 'Often marks the moment something else interrupted', ''),
            phrase('at that exact moment', 'Pinpoints the instant', ''),
            phrase('at 8pm yesterday', 'A specific past time', ''),
            phrase('all day yesterday', 'An extended past period', ''),
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake',
          body:
            '"When I arrived, she was cooking" (she started before I arrived — background) is very different from "When I arrived, she cooked dinner" (she started after I arrived — sequence). Mixing these up changes the story\'s timeline, so choose past simple for what happened NEXT and past continuous for what was ALREADY happening.',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Memory trick',
          body:
            'Picture a video paused at one exact past moment. Whatever\'s caught mid-action in that freeze-frame — mid-cooking, mid-reading — is the past continuous.',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: 'At 9pm last night, I ___ (watch) a movie.', options: ['watch', 'watched', 'was watching', 'have watched'], correctIndex: 2, explanation: 'A specific past moment, action in progress → past continuous.' },
            { question: 'The lights ___ (go) out while we ___ (eat) dinner.', options: ['went / were eating', 'were going / ate', 'went / ate', 'was going / were eating'], correctIndex: 0, explanation: 'The interrupting event (went out) is past simple; the background action (eating) is past continuous.' },
            { question: '___ you sleeping when I called?', options: ['Did', 'Were', 'Was', 'Have'], correctIndex: 1, explanation: '"You" takes "were" in past continuous questions.' },
            { question: 'She ___ (not/listen) to me at all.', options: ["didn't listen", "wasn't listening", "isn't listening", "hasn't listened"], correctIndex: 1, explanation: 'Describing an ongoing state at a past time → past continuous negative.' },
            { question: 'It ___ (rain) heavily when we left the house.', options: ['rained', 'was raining', 'rains', 'has rained'], correctIndex: 1, explanation: 'Setting the scene — an action already in progress → past continuous.' },
          ],
        },
      ],
    },
  },
  {
    title: 'Past Continuous Tense — Elementary',
    description: '"What were you doing when...?" — short answers and telling a scene.',
    duration: 20,
    content: {
      intro:
        "\"What were you doing when...?\" is one of the most natural past continuous questions in everyday conversation. Let's build short answers and simple scene-setting.",
      sections: [
        {
          type: 'rule',
          title: 'Using it in real conversation',
          points: [
            'Short answers repeat "was/were", not the full verb — "Were you sleeping?" "Yes, I was." (not "Yes, I sleeping.")',
            '"What were you doing when...?" is a classic conversation-starter about a memorable past moment.',
            'Weather and atmosphere words set the scene at the start of a story — "The sun was shining, and birds were singing."',
            '"Meanwhile" and "at the time" connect a background scene to the main story.',
          ],
        },
        {
          type: 'table',
          title: 'Short answers',
          headers: ['Question', 'Short answer (yes)', 'Short answer (no)'],
          rows: [
            ['Were you working?', 'Yes, I was.', "No, I wasn't."],
            ['Was she sleeping?', 'Yes, she was.', "No, she wasn't."],
            ['Were they watching TV?', 'Yes, they were.', "No, they weren't."],
          ],
        },
        {
          type: 'phrases',
          title: 'Scene-setting words',
          items: [
            phrase('once upon a time', 'A classic story opener', ''),
            phrase('at the time', 'During that particular past period', ''),
            phrase('that day', 'Refers back to a day already mentioned', ''),
            phrase('meanwhile', 'At the same time, elsewhere', ''),
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake',
          body:
            'Watch subject-verb agreement: "I were" ✗ and "we was" ✗ are both wrong. Use "was" with I/he/she/it, and "were" with you/we/they — never mix them.',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Memory trick',
          body:
            'Practise answering "What were you doing at 7am today?" out loud — it forces you to use the short structure naturally, without overthinking the grammar.',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: '"Were you studying?" — "No, ___."', options: ["I wasn't", "I didn't", "I'm not", "I don't"], correctIndex: 0, explanation: 'Short answers for continuous questions repeat "was/were": "No, I wasn\'t."' },
            { question: 'What ___ you doing at midnight?', options: ['did', 'was', 'were', 'are'], correctIndex: 2, explanation: '"You" takes "were" in past continuous questions.' },
            { question: 'The birds ___ (sing) and the sun ___ (shine) — it was a beautiful morning.', options: ['sang / shone', 'were singing / was shining', 'sing / shines', 'was singing / were shining'], correctIndex: 1, explanation: 'Scene-setting descriptions typically use past continuous for both.' },
            { question: '"Was he waiting outside?" — "Yes, ___."', options: ['he was', 'he did', 'he is', 'he does'], correctIndex: 0, explanation: 'Short answer: "Yes, he was."' },
            { question: 'We ___ (be) very tired that day.', options: ['was', 'were', 'be', 'being'], correctIndex: 1, explanation: '"We" takes "were", not "was".' },
          ],
        },
      ],
    },
  },
  {
    title: 'Past Continuous Tense — Intermediate',
    description: 'Past continuous vs past simple, and softer, more polite requests.',
    duration: 20,
    content: {
      intro:
        "You can already set a scene — now let's sharpen the contrast with past simple, and pick up a genuinely useful polite phrase native speakers use constantly.",
      sections: [
        {
          type: 'rule',
          title: 'Level up your past continuous',
          points: [
            '"I was wondering if..." is a common, softer way to make a request than "I want" — "I was wondering if you could help me."',
            'Past continuous can describe a temporary situation surrounding a period, not just an instant — "I was living in Paris that year."',
            'Past simple confirms a completed action; past continuous doesn\'t confirm completion — "I read the book" (finished) vs "I was reading the book" (in progress, maybe unfinished).',
            'Past continuous rarely stands alone for a plain finished sequence — mixing "was going to the store and bought milk" ✗ sounds odd; a finished sequence just needs past simple throughout.',
          ],
        },
        {
          type: 'table',
          title: 'Past simple vs past continuous',
          headers: ['Past simple', 'Past continuous'],
          rows: [
            ['A completed, single action — "I read the book."', 'An action in progress, completion not confirmed — "I was reading the book."'],
            ['Events told in sequence — "He arrived, sat down, and ordered."', 'Background scene surrounding those events — "He was smiling as he sat down."'],
            ['A finished period, viewed as a whole — "I lived there for a year."', 'A temporary situation during a period — "I was living there at the time."'],
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake',
          body:
            'Don\'t use past continuous for a plain, finished sequence of actions: "I was going to the shop and was buying milk" ✗. If both actions simply happened one after another and are both finished, use past simple for both: "I went to the shop and bought milk" ✓.',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Memory trick',
          body:
            '"I was wondering if..." works precisely because it distances the request in time — sounding less direct than "I wonder" or "I want". The past tense itself does the politeness work.',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: 'I ___ (wonder) if you could send me the file.', options: ['wonder', 'was wondering', 'am wondering', 'wondered'], correctIndex: 1, explanation: '"I was wondering if..." is a common polite request pattern.' },
            { question: 'Which sentence confirms the book was finished?', options: ['I was reading the book.', 'I read the book.', 'I was reading the book when you called.', 'I have been reading the book.'], correctIndex: 1, explanation: 'Past simple "read" confirms a completed action; continuous does not confirm completion.' },
            { question: 'Correct the sentence: "I was going to the shop and was buying bread."', options: ['I was going to the shop and bought bread.', 'I went to the shop and bought bread.', 'I go to the shop and was buying bread.', 'I was go to the shop and buy bread.'], correctIndex: 1, explanation: 'A plain finished sequence needs past simple throughout, not continuous.' },
            { question: 'At that point in my life, I ___ (live) in a small flat.', options: ['lived', 'was living', 'live', 'have lived'], correctIndex: 1, explanation: 'A temporary situation during a specific past period → past continuous.' },
            { question: 'He was smiling as he ___ (walk) into the room.', options: ['was walking', 'walked', 'walks', 'has walked'], correctIndex: 1, explanation: 'The main sequential event (walking in) takes past simple; the background detail (smiling) took continuous.' },
          ],
        },
      ],
    },
  },
  {
    title: 'Past Continuous Tense — Advanced',
    description: 'Annoying repeated habits, literary technique, and the line between continuous and "used to".',
    duration: 20,
    content: {
      intro:
        "At this level, past continuous does real character work in storytelling — and knowing exactly where it stops being appropriate is just as important as knowing how to build it.",
      sections: [
        {
          type: 'rule',
          title: 'Where the rules bend on purpose',
          points: [
            '"Always/constantly" + past continuous expresses an annoying repeated habit — a character trait, not a literal 100% frequency: "He was always losing his keys."',
            'In literary narration, past continuous paints the background atmosphere while past simple drives the plot forward — a deliberate stylistic pairing.',
            'Past continuous doesn\'t confirm an action finished; "used to" describes a settled, repeated pattern over an extended period without that ambiguity.',
            'Overusing "always + continuous" for a genuinely neutral, non-annoying habit is a register mismatch — plain past simple or "used to" reads more naturally for a simple fact.',
          ],
        },
        {
          type: 'table',
          title: 'Annoyance vs neutral fact',
          headers: ['Register', 'Example', 'Meaning'],
          rows: [
            ['Annoyance (always + continuous)', 'She was always complaining.', 'Emphasizes irritation at a repeated trait.'],
            ['Neutral habit (used to / past simple)', 'She complained a lot back then.', 'A plain fact, no emotional colouring.'],
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake at this level',
          body:
            'Don\'t reach for "always + continuous" to describe a simple neutral routine — "He was always eating breakfast at 7am" sounds like a complaint about a rigid habit, when a neutral fact just needs "He used to eat breakfast at 7am" or plain past simple.',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Writer\'s technique',
          body:
            'A classic narrative opening pairs the two deliberately: "The rain was falling steadily [continuous, background] when the letter arrived [simple, the inciting event]." Read published fiction openings and you\'ll spot this pattern constantly.',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: 'He ___ (always/forget) his umbrella — so annoying!', options: ['always forgot', 'was always forgetting', 'always was forgetting', 'has always forgotten'], correctIndex: 1, explanation: '"Always" + past continuous expresses an annoyed reaction to a repeated habit.' },
            { question: 'Which version reads as a neutral fact, not a complaint?', options: ['She was always arriving early.', 'She used to arrive early.', 'She was always arriving early, which annoyed no one.', 'She was constantly arriving early.'], correctIndex: 1, explanation: '"Used to" states a plain fact with no emotional colouring, unlike "always + continuous".' },
            { question: 'The wind ___ (howl) when the door suddenly ___ (open).', options: ['howled / opened', 'was howling / opened', 'was howling / was opening', 'howled / was opening'], correctIndex: 1, explanation: 'Background atmosphere (howling) uses continuous; the sudden plot event (opened) uses past simple.' },
            { question: 'Which sentence best confirms the action is fully finished?', options: ['I was writing the report.', 'I wrote the report.', 'I was always writing the report.', 'I have been writing the report.'], correctIndex: 1, explanation: 'Plain past simple confirms completion; continuous forms leave it ambiguous or ongoing.' },
            { question: 'She ___ (constantly/interrupt) him during meetings — it drove him mad.', options: ['constantly interrupted', 'was constantly interrupting', 'constantly was interrupting', 'has constantly interrupted'], correctIndex: 1, explanation: '"Constantly" + past continuous conveys irritation at a repeated behaviour.' },
          ],
        },
      ],
    },
  },
];
