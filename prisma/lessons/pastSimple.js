// Past Simple, split across four CEFR-aligned levels — same pattern as
// prisma/lessons/presentSimple.js (A1 Beginner, A2 Elementary, B1
// Intermediate, C1 Advanced).
const phrase = (target, translation, pronunciation) => ({ target, translation, pronunciation });

module.exports = [
  {
    title: 'Past Simple Tense — Beginner',
    description: "Finished actions — yesterday, last year, or a thousand years ago.",
    duration: 20,
    content: {
      intro:
        "The past simple is how you talk about anything that's finished — yesterday, last year, or a thousand years ago. Its biggest challenge isn't the rule (add -ed) but the many irregular verbs that break it.",
      sections: [
        {
          type: 'rule',
          title: 'When do we use it?',
          points: [
            'Completed actions at a specific or implied past time — "I visited Paris last year."',
            'A sequence of finished past actions — "She woke up, brushed her teeth, and left."',
            'Past habits and repeated actions — "I played football every weekend as a kid."',
            'Facts about the past that are no longer true — "He worked as a teacher before he retired."',
          ],
        },
        {
          type: 'structure',
          title: 'How to build it',
          structureItems: [
            { label: 'Affirmative', pattern: 'Subject + verb-ed (or irregular past form)', example: 'She walked home. He went home.' },
            { label: 'Negative', pattern: "Subject + didn't + base verb", example: "I didn't see him." },
            { label: 'Question', pattern: 'Did + subject + base verb?', example: 'Did you call her?' },
          ],
        },
        {
          type: 'table',
          title: 'Spelling rules for -ed',
          headers: ['Rule', 'Example'],
          rows: [
            ['Most verbs: add -ed', 'walk → walked, play → played'],
            ['Ends in -e: just add -d', 'live → lived, hope → hoped'],
            ['Consonant + y: change y → ied', 'study → studied, try → tried'],
            ['Short stressed verb (vowel + consonant): double the consonant', 'stop → stopped, plan → planned'],
          ],
        },
        {
          type: 'phrases',
          title: 'Signal words',
          items: [
            phrase('yesterday', 'The day before today', ''),
            phrase('last night / week / month / year', 'The most recent one that has ended', ''),
            phrase('ago', 'Counting back from now — "two days ago"', ''),
            phrase('in 2020', 'A specific past year', ''),
            phrase('when I was a child', 'A past period of life', ''),
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake',
          body:
            'Never add -ed after "did". "Did you went?" ✗ is wrong — once "did" appears, the main verb goes back to its base form: "Did you go?" ✓. The same applies to negatives: "didn\'t go", not "didn\'t went".',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Memory trick',
          body:
            '"Did" already carries the past tense for the whole sentence — think of it as using up the sentence\'s one allowed past-tense marker, so the main verb doesn\'t need to "double up".',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: 'She ___ (go) to the market yesterday.', options: ['go', 'goed', 'went', 'gone'], correctIndex: 2, explanation: '"Go" is irregular: go → went.' },
            { question: '___ you call your mother last night?', options: ['Do', 'Did', 'Were', 'Have'], correctIndex: 1, explanation: 'Past simple questions use "Did" + base verb.' },
            { question: 'I ___ (not/see) him at the party.', options: ["don't see", "didn't see", "didn't saw", "wasn't see"], correctIndex: 1, explanation: 'Negative past simple: didn\'t + base verb (never the past form).' },
            { question: 'Which spelling is correct for "study" in the past?', options: ['studyed', 'studied', 'studdied', 'studying'], correctIndex: 1, explanation: 'Consonant + y: change y to i, add -ed: "studied".' },
            { question: 'They ___ (live) in Kigali for ten years before moving.', options: ['live', 'lives', 'lived', 'living'], correctIndex: 2, explanation: 'A finished past situation → past simple: "lived".' },
          ],
        },
      ],
    },
  },
  {
    title: 'Past Simple Tense — Elementary',
    description: 'Telling a simple story — irregular verbs and the words that link events together.',
    duration: 20,
    content: {
      intro:
        "Now let's turn single sentences into a real story: the irregular verbs you'll use constantly, and the linking words that make a sequence of past events sound natural.",
      sections: [
        {
          type: 'rule',
          title: 'Telling a story in order',
          points: [
            'Sequencing words link events in the order they happened — "First I woke up, then I showered, after that I had breakfast, and finally I left."',
            '"was/were born in..." describes where or when your life began — "I was born in 1998." "She was born in Kigali."',
            'Most of the verbs you\'ll use most often are irregular — worth memorizing as whole pairs, not spelling rules.',
            '"Ago" counts backward from now; a specific date or year names a fixed point — both are common, but they aren\'t interchangeable in the same phrase.',
          ],
        },
        {
          type: 'table',
          title: 'Ten irregular verbs you\'ll use constantly',
          headers: ['Base form', 'Past simple', 'Example'],
          rows: [
            ['go', 'went', 'We went to the beach.'],
            ['see', 'saw', 'I saw an old friend.'],
            ['have', 'had', 'She had a great idea.'],
            ['do', 'did', 'He did his homework.'],
            ['make', 'made', 'They made dinner together.'],
            ['take', 'took', 'I took the bus.'],
            ['come', 'came', 'She came home late.'],
            ['eat', 'ate', 'We ate at a new restaurant.'],
            ['write', 'wrote', 'He wrote a letter.'],
            ['buy', 'bought', 'I bought some bread.'],
          ],
        },
        {
          type: 'phrases',
          title: 'Signal words',
          items: [
            phrase('first / then / after that / finally', 'Links a sequence of past events', ''),
            phrase('the day before yesterday', 'Two days back from today', ''),
            phrase('once', 'A single occasion in the past — "I once met him."', ''),
            phrase('last time', 'The most recent occasion something happened', ''),
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake',
          body:
            'Don\'t add "was/were" before a regular past-simple verb: "I was go to the store" ✗ is wrong. "Was/were" only pairs with an -ing form (was going) or works alone as a linking verb (I was tired). A plain past action just needs the verb itself: "I went to the store" ✓.',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Memory trick',
          body:
            'Learn irregular verbs in little "scenes" you can picture: go→went (a trip), see→saw (a film), ate→ate (a meal), bought→bought (shopping). A tiny mental image sticks better than a bare word pair.',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: 'I ___ (be) born in Rwanda in 1999.', options: ['am', 'was', 'were', 'be'], correctIndex: 1, explanation: '"Was" is the past of "am/is" — "I was born..."' },
            { question: 'First we packed our bags, ___ we drove to the airport.', options: ['finally', 'then', 'first', 'ago'], correctIndex: 1, explanation: '"Then" is the natural second link in a sequence.' },
            { question: 'She ___ (write) three postcards on her trip.', options: ['writed', 'wrote', 'written', 'write'], correctIndex: 1, explanation: '"Write" is irregular: write → wrote.' },
            { question: 'Which sentence is correct?', options: ['I was buy some bread.', 'I bought some bread.', 'I was bought some bread.', 'I buyed some bread.'], correctIndex: 1, explanation: '"Buy" is irregular (bought) and needs no "was" before it.' },
            { question: 'We ___ (eat) at a lovely restaurant last night.', options: ['eated', 'ate', 'eaten', 'eat'], correctIndex: 1, explanation: '"Eat" is irregular: eat → ate.' },
          ],
        },
      ],
    },
  },
  {
    title: 'Past Simple Tense — Intermediate',
    description: 'Pronunciation, "used to" vs "would", and time clauses.',
    duration: 20,
    content: {
      intro:
        "Time to sharpen the details: how -ed actually sounds, the real difference between \"used to\" and \"would\" for past habits, and joining two past events into one natural sentence.",
      sections: [
        {
          type: 'rule',
          title: 'Level up your past simple',
          points: [
            'The -ed ending has three different sounds, just like -s in the present simple — hearing this helps your own speech sound natural.',
            '"Used to" describes a past habit OR a past state that no longer holds — "I used to smoke." / "I used to hate coffee."',
            '"Would" also describes repeated past actions, but NEVER a state — "I would visit my grandma every summer" ✓, but never "I would have a car" ✗ (states need "used to").',
            'Time clauses join two past events naturally — "After I finished work, I went home." / "As soon as she arrived, we left."',
            'Subject questions (asking "who" as the subject) skip "did", exactly like in the present simple — "Who called you?" not "Who did call you?"',
          ],
        },
        {
          type: 'table',
          title: 'The three sounds of -ed',
          headers: ['Sound', 'After these endings', 'Examples'],
          rows: [
            ['/t/', 'voiceless sounds: p, k, s, ch, sh, f', 'walked, stopped, watched'],
            ['/d/', 'voiced sounds (most others)', 'played, lived, cleaned'],
            ['/ɪd/', 'the verb already ends in t or d', 'wanted, needed, started'],
          ],
        },
        {
          type: 'table',
          title: '"Used to" vs "would" for past habits',
          headers: ['Used to', 'Would'],
          rows: [
            ['Works for actions AND states — "I used to live in Paris." / "I used to hate coffee."', 'Only works for repeated actions — "I would visit my grandma every summer."'],
            ['Can start a paragraph about the past on its own', 'Usually needs "used to" first to set the past-time context, then switches to "would" for detail'],
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake',
          body:
            'Don\'t use "would" for a past state: "I would have a car when I was young" ✗ is wrong — states (have, be, like, know, live) need "used to": "I used to have a car" ✓. Save "would" for repeated actions only.',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Memory trick',
          body:
            'If you can replace it with "in the past, it was true that..." it\'s a state → use "used to". If you can replace it with "again and again, X did..." it\'s an action → either "used to" or "would" works.',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: 'Which ending sounds like /ɪd/?', options: ['played', 'watched', 'wanted', 'lived'], correctIndex: 2, explanation: '"Wanted" already ends in -t, so English inserts an extra vowel sound: /ɪd/.' },
            { question: 'I ___ (used to/would) hate vegetables when I was a kid.', options: ['would', 'used to', 'was', 'did'], correctIndex: 1, explanation: '"Hate" is a state verb — only "used to" works, never "would".' },
            { question: '___ called you this morning?', options: ['Who did', 'Who', 'Did who', 'Who was'], correctIndex: 1, explanation: 'Subject questions skip "did" entirely: "Who called you?"' },
            { question: 'As soon as the rain ___ (stop), we went outside.', options: ['stops', 'stopped', 'was stopping', 'has stopped'], correctIndex: 1, explanation: 'A time clause joining two past events uses past simple: "stopped".' },
            { question: 'Every summer, we ___ (would/used to) visit our cousins in the village.', options: ['would', 'use to', 'used to', 'was used to'], correctIndex: 0, explanation: 'A repeated past ACTION can use "would" (after the past-time context is already set).' },
          ],
        },
      ],
    },
  },
  {
    title: 'Past Simple Tense — Advanced',
    description: 'Reported speech, polite distancing, and choosing past simple over past perfect.',
    duration: 20,
    content: {
      intro:
        "At this level, past simple does real narrative and social work: reporting what someone said, softening a request, and — just as importantly — knowing when NOT to reach for the past perfect.",
      sections: [
        {
          type: 'rule',
          title: 'Where past simple gets sophisticated',
          points: [
            'Reported speech shifts a present-tense original one step into the past — "I am tired" becomes "She said she was tired."',
            'Past simple can soften a request or opinion, sounding more tentative and polite than the present — "I wondered if you could help." / "Did you want to see me now?"',
            'In narration, past simple drives the ACTION forward; past continuous paints the background — "The phone rang while she was cooking."',
            'Default to past simple for events told in the order they happened. Save the past perfect for when you deliberately step OUT of that order to reveal something earlier.',
          ],
        },
        {
          type: 'table',
          title: 'Reported speech: shifting one step into the past',
          headers: ['Direct speech', 'Reported speech'],
          rows: [
            ['"I am tired."', 'She said she was tired.'],
            ['"I work here."', 'He said he worked there.'],
            ['"I will call you."', 'She said she would call me.'],
            ['"I can help."', 'He said he could help.'],
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake at this level',
          body:
            'Over-using the past perfect is a classic advanced-learner overcorrection. If events are told in the order they happened, plain past simple is correct and preferred: "He arrived, took off his coat, and sat down" ✓ — not "He had arrived, had taken off his coat, had sat down" ✗. Save "had" for genuinely stepping back out of sequence.',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Politeness register',
          body:
            'A past-tense question often reads as more tentative and polite than its present equivalent: "Did you want to see me?" feels softer than "Do you want to see me?", even though both are grammatically about right now. This distancing effect is common in formal or careful spoken English.',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: '"I live in Paris," she said. → She said she ___ in Paris.', options: ['lives', 'lived', 'has lived', 'was living'], correctIndex: 1, explanation: 'Reported speech shifts present simple back to past simple: "lived".' },
            { question: 'Which sentence sounds more polite?', options: ['Do you want a coffee?', 'Did you want a coffee?', 'Will you want a coffee?', 'Are you wanting a coffee?'], correctIndex: 1, explanation: 'A past-tense question can sound softer/more tentative than the present equivalent.' },
            { question: 'He opened the door, ___ (walk) in, and sat down.', options: ['had walked', 'walked', 'was walking', 'has walked'], correctIndex: 1, explanation: 'Events told in order use plain past simple, not past perfect.' },
            { question: '"I can help," he said. → He said he ___ help.', options: ['can', 'could', 'was able', 'had been able'], correctIndex: 1, explanation: 'Reported speech shifts "can" back to "could".' },
            { question: 'While she was cooking, the phone ___ (ring).', options: ['was ringing', 'rang', 'had rung', 'rings'], correctIndex: 1, explanation: 'The interrupting action (the main event) uses past simple; the background action uses past continuous.' },
          ],
        },
      ],
    },
  },
];
