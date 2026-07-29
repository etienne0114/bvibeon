// Present Simple, split across three levels so the course can go deep
// without one giant lesson — imported into seed.js's course definition.
const phrase = (target, translation, pronunciation) => ({ target, translation, pronunciation });

module.exports = [
  {
    title: 'Present Simple Tense — Beginner',
    description: "Habits, facts, and routines — the tense you'll use the most, once you remember the -s.",
    duration: 20,
    content: {
      intro:
        "The present simple is the tense you'll use most as a beginner — for habits, facts, and things that are generally true. Master its one tricky rule (that extra -s) and the rest is straightforward.",
      sections: [
        {
          type: 'rule',
          title: 'When do we use it?',
          points: [
            'Habits and routines — "I go to the gym every morning."',
            'Facts and general truths — "Water boils at 100°C."',
            'Permanent situations — "She lives in Kigali."',
            'Schedules and timetables — "The bus leaves at 6pm."',
            'Feelings, senses and opinions (state verbs) — "I like coffee." / "He knows the answer."',
            'Instructions and directions — "You turn left, then you cross the bridge."',
            'Future events on a timetable, or after "when/if" about the future — "The film starts at 8." / "When she arrives, call me."',
          ],
        },
        {
          type: 'structure',
          title: 'How to build it',
          structureItems: [
            { label: 'Affirmative', pattern: 'Subject + verb (add -s for he/she/it)', example: 'They work in Kigali. She works in Kigali.' },
            { label: 'Negative', pattern: "Subject + don't/doesn't + base verb", example: "I don't like tea. He doesn't like tea." },
            { label: 'Question', pattern: 'Do/Does + subject + base verb?', example: 'Do you speak English? Does she speak English?' },
          ],
        },
        {
          type: 'table',
          title: 'Spelling rules for he/she/it',
          headers: ['Rule', 'Example'],
          rows: [
            ['Most verbs: add -s', 'work → works, play → plays'],
            ['Ends in -s, -ss, -sh, -ch, -x, -o: add -es', 'watch → watches, go → goes, fix → fixes'],
            ['Consonant + y: change y → ies', 'study → studies, try → tries'],
            ['Vowel + y: just add -s', 'play → plays, say → says'],
          ],
        },
        {
          type: 'table',
          title: 'Short answers',
          headers: ['Question', 'Short answer (yes)', 'Short answer (no)'],
          rows: [
            ['Do you like coffee?', 'Yes, I do.', "No, I don't."],
            ['Does she work here?', 'Yes, she does.', "No, she doesn't."],
            ['Do they live nearby?', 'Yes, they do.', "No, they don't."],
          ],
        },
        {
          type: 'phrases',
          title: 'Signal words',
          items: [
            phrase('always', '100% of the time — a permanent habit', ''),
            phrase('usually', 'Very often, as a general habit', ''),
            phrase('often', 'Frequently', ''),
            phrase('sometimes', 'Occasionally', ''),
            phrase('rarely', 'Almost never', ''),
            phrase('never', '0% of the time', ''),
            phrase('every day / every week', 'A recurring routine', ''),
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake',
          body:
            'Don\'t forget the -s! "She work here" is wrong — it must be "She works here." The -s only appears with he/she/it, and it never appears after "does": "Does she works?" is wrong; say "Does she work?"',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Memory trick',
          body:
            'Think of he/she/it as the "-s club": third-person singular subjects take the -s in affirmative sentences, and that\'s the ONLY place -s appears in this tense.',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: 'She ___ (work) at a hospital.', options: ['work', 'works', 'working', 'is work'], correctIndex: 1, explanation: 'He/she/it takes -s in the present simple: "She works."' },
            { question: '___ you speak French?', options: ['Do', 'Does', 'Are', 'Is'], correctIndex: 0, explanation: '"You" uses "Do" — "Does" is only for he/she/it.' },
            { question: 'He ___ like spicy food.', options: ["don't", "doesn't", "isn't", 'not'], correctIndex: 1, explanation: 'Negative with he/she/it: doesn\'t + base verb (no extra -s).' },
            { question: 'Which sentence is correct?', options: ['She go to school by bus.', 'She goes to school by bus.', 'She going to school by bus.', 'She is go to school by bus.'], correctIndex: 1, explanation: '"go" ends in -o, so add -es: goes.' },
            { question: 'The train ___ at 9am every day.', options: ['leave', 'leaves', 'is leaving', 'left'], correctIndex: 1, explanation: 'Fixed schedules use the present simple: "leaves."' },
            { question: '"Does he speak German?" — "No, ___."', options: ['he not', "he doesn't", "he don't", 'not he'], correctIndex: 1, explanation: 'Short answers repeat "do/does": "No, he doesn\'t."' },
          ],
        },
      ],
    },
  },
  {
    title: 'Present Simple Tense — Elementary',
    description: 'Putting it to work — daily routines, opinions, and asking real questions.',
    duration: 20,
    content: {
      intro:
        "You know the rules — now let's put them to work in real conversation: describing your day in order, giving opinions naturally, and asking the questions people actually ask.",
      sections: [
        {
          type: 'rule',
          title: 'Making it sound natural',
          points: [
            'Sequencing words link a routine into a story — "First I wake up, then I have breakfast, after that I go to work, and finally I relax."',
            'Opinion verbs (like, love, enjoy, hate, dislike, don\'t mind) are followed by a verb-ing form, not "to + verb" — "I enjoy cooking," not "I enjoy to cook."',
            'Adjective + preposition patterns describe habits and traits — "good at", "interested in", "afraid of", "keen on", "tired of" + verb-ing.',
            'Every question word (What/Where/When/Why/Who/How often) still needs do/does in front of the subject — the question word doesn\'t replace that rule.',
          ],
        },
        {
          type: 'structure',
          title: 'Asking real questions',
          structureItems: [
            { label: 'What', pattern: 'What + do/does + subject + verb?', example: 'What do you do at the weekend?' },
            { label: 'Where', pattern: 'Where + do/does + subject + verb?', example: 'Where does she work?' },
            { label: 'How often', pattern: 'How often + do/does + subject + verb?', example: 'How often do you exercise?' },
          ],
        },
        {
          type: 'table',
          title: 'Verb + -ing after opinion verbs',
          headers: ['Pattern', 'Example'],
          rows: [
            ['like/love/enjoy + verb-ing', 'I love reading before bed.'],
            ['hate/dislike + verb-ing', 'He hates waiting in queues.'],
            ["don't mind + verb-ing", "I don't mind sharing a room."],
          ],
        },
        {
          type: 'phrases',
          title: 'Everyday collocations',
          items: [
            phrase('good at', 'Skilled or talented in something', ''),
            phrase('interested in', 'Curious about, wants to know more', ''),
            phrase('afraid of', 'Scared of', ''),
            phrase('keen on', 'Enthusiastic about (British English)', ''),
            phrase('tired of', 'Bored or fed up with something repeated', ''),
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake',
          body:
            'Don\'t follow opinion verbs with "to + infinitive": "I enjoy to swim" ✗ is wrong — "enjoy", "like", "love", "hate", "dislike" and "don\'t mind" all take verb-ing: "I enjoy swimming" ✓.',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Memory trick',
          body:
            'Build routines like a chain: FIRST → THEN → AFTER THAT → FINALLY. Practise describing your own morning out loud using all four links before moving on.',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: 'I ___ (enjoy) ___ (cook) for my family.', options: ['enjoy / to cook', 'enjoy / cooking', 'enjoy / cook', 'enjoying / cooking'], correctIndex: 1, explanation: '"Enjoy" is followed by verb-ing: "enjoy cooking".' },
            { question: 'She is ___ languages — she speaks four!', options: ['good in', 'good at', 'good for', 'good on'], correctIndex: 1, explanation: 'The fixed collocation is "good at" + noun/verb-ing.' },
            { question: '___ do you visit your grandparents?', options: ['What', 'How often', 'Why', 'Who'], correctIndex: 1, explanation: '"How often" asks about frequency — a very common present simple question.' },
            { question: 'First I get up, ___ I shower, and then I get dressed.', options: ['finally', 'after that', 'then', 'first'], correctIndex: 2, explanation: '"Then" is the natural second link in a routine sequence.' },
            { question: 'He ___ (be) afraid ___ (fly).', options: ["is / to fly", 'is / of flying', 'is / fly', 'be / of flying'], correctIndex: 1, explanation: '"Afraid of" is followed by verb-ing: "afraid of flying".' },
            { type: 'fill', question: 'Complete the collocation: She is very good ___ languages. (one word)', answer: 'at', explanation: 'The fixed collocation is "good at" + noun/verb-ing.' },
          ],
        },
      ],
    },
  },
  {
    title: 'Present Simple Tense — Intermediate',
    description: 'Pronunciation, word order, and the sentence patterns native speakers actually use.',
    duration: 20,
    content: {
      intro:
        "You know the basics — now let's sharpen pronunciation, word order, and the sentence patterns native speakers use every day.",
      sections: [
        {
          type: 'rule',
          title: 'Level up your present simple',
          points: [
            'The -s/-es ending has three different sounds — hearing this helps your own speech sound natural.',
            'Frequency adverbs (always, usually, often, sometimes, rarely, never) sit in the MIDDLE of the sentence — before the main verb, but after "to be".',
            'Zero conditional: if/when + present simple, present simple result — for things that are always true. "If you heat ice, it melts."',
            'Time clauses about the future use the present simple, never "will" — "I\'ll call you when I arrive" (not "will arrive").',
            'Subject questions (asking "who/what" AS the subject) skip do/does entirely — "Who lives here?" not "Who does live here?"',
            'A passive form exists too, for facts about processes and general truths where WHO does the action barely matters — "English is spoken here." "These cars are made in Japan."',
          ],
        },
        {
          type: 'structure',
          title: 'Word order that trips learners up',
          structureItems: [
            { label: 'Before the main verb', pattern: 'Subject + frequency adverb + verb', example: 'She usually walks to work.' },
            { label: 'After "to be"', pattern: 'Subject + am/is/are + frequency adverb', example: 'He is often late.' },
            { label: 'Subject questions (no do/does)', pattern: 'Who/What + verb(+s)...?', example: 'Who knows the answer? What happens next?' },
            { label: 'Passive', pattern: 'Subject + am/is/are + past participle', example: 'The shop opens at 9. → The shop is opened at 9 (by the manager).' },
          ],
        },
        {
          type: 'table',
          title: 'The three sounds of -s/-es',
          headers: ['Sound', 'After these endings', 'Examples'],
          rows: [
            ['/s/', 'voiceless sounds: p, t, k, f', 'stops, works, laughs'],
            ['/z/', 'voiced sounds (most others)', 'plays, runs, goes'],
            ['/ɪz/', 's, z, sh, ch, x, ge sounds', 'watches, fixes, changes'],
          ],
        },
        {
          type: 'phrases',
          title: 'More frequency expressions',
          items: [
            phrase('hardly ever', 'Almost never — a bit stronger than rarely', ''),
            phrase('seldom', 'A more formal way to say rarely', ''),
            phrase('once a week / twice a month', 'A specific recurring frequency', ''),
            phrase('every other day', 'Every second day, alternating', ''),
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake',
          body:
            'Don\'t add "do/does" to a subject question. "Who does live here?" ✗ is wrong — do/does only appears when asking about the OBJECT or action, not the subject: "Who lives here?" ✓ / "What happens if I press this?" ✓ (no do/does needed).',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Memory trick',
          body:
            "Say the ending sound out loud: if your throat is still \"buzzing\" it's voiced → /z/; if it's a sharp puff of air, it's voiceless → /s/; if you'd need an extra vowel to say it smoothly, it's /ɪz/.",
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: 'Which ending sounds like /z/?', options: ['stops', 'laughs', 'plays', 'watches'], correctIndex: 2, explanation: '"plays" ends in a voiced sound → /z/.' },
            { question: '___ lives next door to you?', options: ['Who do', 'Who does', 'Who', 'Does who'], correctIndex: 2, explanation: 'Subject questions skip do/does entirely: "Who lives...?"' },
            { question: 'She ___ (be) usually the first to arrive.', options: ['usually is', 'is usually', 'is being usually', 'usually be'], correctIndex: 1, explanation: 'Frequency adverbs go AFTER "to be": "is usually".' },
            { question: 'If you mix blue and yellow, it ___ (make) green.', options: ['will make', 'made', 'makes', 'is making'], correctIndex: 2, explanation: 'Zero conditional: if + present simple, present simple result.' },
            { question: "I'll text you when I ___ (arrive).", options: ['will arrive', 'arrive', 'am arriving', 'arrived'], correctIndex: 1, explanation: 'Time clauses about the future use present simple, not "will".' },
            { question: 'Which sentence is passive?', options: ['The bakery makes fresh bread every day.', 'Fresh bread is made every day.', 'The bakery is making fresh bread.', 'The bakery has made fresh bread.'], correctIndex: 1, explanation: 'Passive present simple: subject + am/is/are + past participle, with no need to say who does it.' },
          ],
        },
      ],
    },
  },
  {
    title: 'Present Simple Tense — Advanced',
    description: "Performative verbs, the literary present, and academic reporting — where present simple gets its real power.",
    duration: 20,
    content: {
      intro:
        "At this level, present simple isn't just about habits — it performs actions, narrates literature, and reports facts in academic and professional English.",
      sections: [
        {
          type: 'rule',
          title: 'Where present simple gets powerful',
          points: [
            'Performative verbs: the sentence IS the action — "I promise to help." / "I apologize." / "I now declare this meeting open."',
            'The literary/historical present: describing books, films or historical events as if happening now — "In the novel, the hero discovers a secret." / "Shakespeare explores jealousy in Othello."',
            'Reporting research and general findings in academic writing — "The study shows a clear correlation." / "Researchers argue that the effect is temporary."',
            'Headlines and live commentary use their own present-simple register — "Storm hits coast" (headline); "He shoots... he scores!" (commentary).',
            'A small set of verbs shift meaning between simple and continuous ("dual-nature" verbs) — the form you choose changes what you mean.',
            'Negative questions aren\'t really asking — they express surprise, or invite agreement — "Don\'t you love this song?" (I\'m sure you do) / "Doesn\'t she look happy today?"',
          ],
        },
        {
          type: 'table',
          title: 'Dual-nature verbs — state vs. action meaning',
          headers: ['Verb', 'Present simple (state)', 'Present continuous (action)'],
          rows: [
            ['think', "I think it's a good idea. (opinion)", "I'm thinking about it. (process)"],
            ['have', 'She has three sisters. (possession)', "She's having dinner. (activity)"],
            ['see', 'I see what you mean. (understand)', "I'm seeing the doctor at 3pm. (appointment)"],
            ['taste', 'This soup tastes amazing. (quality)', 'The chef is tasting the soup. (action)'],
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake at this level',
          body:
            'Don\'t overuse the historical present in ordinary conversation about your own life ("Yesterday I go to the shop..." ✗). It\'s a specific literary/narrative convention, not a substitute for the past simple in everyday storytelling.',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Register tip',
          body:
            'Performative verbs (promise, apologize, agree, declare, resign, name) are almost always present simple, first person: the moment you say the sentence, the action is done.',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: 'In the film, the detective ___ (discover) the truth in the final scene.', options: ['discovered', 'discovers', 'has discovered', 'is discovering'], correctIndex: 1, explanation: 'The literary/narrative present describes fictional plots as if happening now.' },
            { question: 'I ___ (promise) to finish the report by Friday.', options: ['am promising', 'promised', 'promise', 'will promise'], correctIndex: 2, explanation: 'A performative verb — saying it IS the act of promising.' },
            { question: "Which sentence uses 'have' correctly for possession?", options: ["I'm having two brothers.", 'I have two brothers.', 'I have having two brothers.', 'I am have two brothers.'], correctIndex: 1, explanation: 'Possession is a state → present simple: "I have two brothers."' },
            { question: 'The report ___ (show) a 20% increase in sales.', options: ['is showing', 'shows', 'showed', 'has been showing'], correctIndex: 1, explanation: 'Reporting research findings uses the present simple: "shows".' },
            { question: "I'm sorry, I ___ (not/see) what you mean.", options: ['am not seeing', "don't see", "didn't see", "haven't seen"], correctIndex: 1, explanation: '"See" meaning "understand" is a state verb → present simple, not continuous.' },
            { question: 'Which negative question expresses genuine surprise, not just a yes/no question?', options: ['Do you like pizza?', "Don't you love this song? I thought everyone did!", 'Does he work here?', 'Do they live nearby?'], correctIndex: 1, explanation: 'Negative questions like this invite agreement or express surprise, rather than asking for new information.' },
          ],
        },
      ],
    },
  },
];
