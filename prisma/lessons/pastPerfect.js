// Past Perfect, split across four CEFR-aligned levels — same pattern as
// prisma/lessons/pastSimple.js.
const phrase = (target, translation, pronunciation) => ({ target, translation, pronunciation });

module.exports = [
  {
    title: 'Past Perfect Tense — Beginner',
    description: 'The "past before the past" — for when the order of two past events matters.',
    duration: 20,
    content: {
      intro:
        "The past perfect is the \"past before the past\" — you only need it when you're talking about two past events and it matters which one happened first.",
      sections: [
        {
          type: 'rule',
          title: 'When do we use it?',
          points: [
            'An action completed before another past action — "She had already left when I arrived."',
            'An action completed before a stated past time — "By 6pm, he had finished his homework."',
            'Explaining the cause of a past situation — "I was tired because I had worked all night."',
            'It only makes sense alongside another past moment — it\'s always relative to something else that already happened.',
          ],
        },
        {
          type: 'structure',
          title: 'How to build it',
          structureItems: [
            { label: 'Affirmative', pattern: 'Subject + had + past participle', example: 'They had eaten before we came.' },
            { label: 'Negative', pattern: "Subject + hadn't + past participle", example: "She hadn't finished." },
            { label: 'Question', pattern: 'Had + subject + past participle?', example: 'Had you met him before?' },
          ],
        },
        {
          type: 'phrases',
          title: 'Signal words',
          items: [
            phrase('already', 'Before the other past event, often sooner than expected', ''),
            phrase('just', 'A very short time before the other past event', ''),
            phrase('before', 'Marks the earlier of two past events', ''),
            phrase('by the time', 'Introduces the later reference point', ''),
            phrase('never (before then)', 'No experience up to that past point', ''),
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake',
          body:
            'Don\'t use the past perfect for a single past event with no second past reference point. "I had gone to the store" ✗ sounds incomplete on its own — it needs a companion past-simple event or a stated time: "I had gone to the store before you called" ✓.',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Memory trick',
          body:
            'Think of the past perfect as a "flashback" tense — like a film cutting back to something that happened earlier. It only works alongside the "present" of the story, which in this case is another past moment.',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: 'When I arrived at the station, the train ___ (already/leave).', options: ['already left', 'had already left', 'has already left', 'was already leaving'], correctIndex: 1, explanation: 'The train leaving happened BEFORE my arrival → past perfect.' },
            { question: 'She was upset because she ___ (lose) her phone.', options: ['lost', 'had lost', 'has lost', 'was losing'], correctIndex: 1, explanation: 'The losing happened before the being-upset (both past) → past perfect explains the cause.' },
            { question: '___ you ever ___ (see) snow before you moved here?', options: ['Did / see', 'Had / seen', 'Have / seen', 'Were / seeing'], correctIndex: 1, explanation: 'An experience before another past point (moving) → past perfect.' },
            { question: 'By the time we got to the cinema, the film ___ (start).', options: ['started', 'had started', 'starts', 'was starting'], correctIndex: 1, explanation: '"By the time" + past simple signals the past perfect for the earlier event.' },
            { question: 'Which sentence needs NO past perfect?', options: ['He was tired because he had run a marathon.', 'She had already eaten when we arrived.', 'I went to school yesterday.', 'By 5pm, they had finished the project.'], correctIndex: 2, explanation: 'A single past event with no second past reference point just needs the plain past simple.' },
          ],
        },
      ],
    },
  },
  {
    title: 'Past Perfect Tense — Elementary',
    description: '"By the time..." — combining two past events into one clear sentence.',
    duration: 20,
    content: {
      intro:
        "\"By the time...\" is the most natural everyday pattern for the past perfect. Let's build a real toolkit of irregular participles and practise linking two past events smoothly.",
      sections: [
        {
          type: 'rule',
          title: 'Linking two past events',
          points: [
            '"By the time + past simple, + subject + had + past participle" links the two events in one sentence — "By the time she called, I had already gone to bed."',
            '"Already" usually sits between "had" and the past participle — "I had already seen that film."',
            '"Just" works the same way — "We had just sat down when the waiter came."',
            'Most of the participles you\'ll need are the same irregular forms from the present perfect — worth learning as pairs.',
          ],
        },
        {
          type: 'table',
          title: 'Ten irregular participles you\'ll use constantly',
          headers: ['Base form', 'Past participle', 'Example'],
          rows: [
            ['go', 'gone', 'He had gone home by then.'],
            ['see', 'seen', "I hadn't seen that before."],
            ['eat', 'eaten', 'They had already eaten.'],
            ['do', 'done', 'She had done her homework.'],
            ['make', 'made', 'He had made a decision.'],
            ['take', 'taken', 'They had taken the last bus.'],
            ['write', 'written', "I had written the email."],
            ['break', 'broken', 'The machine had broken down.'],
            ['speak', 'spoken', "We hadn't spoken in years."],
            ['forget', 'forgotten', 'She had forgotten her keys.'],
          ],
        },
        {
          type: 'phrases',
          title: 'Signal phrases',
          items: [
            phrase('by the time', 'Introduces the later reference point', ''),
            phrase('already', 'Sooner than expected, before the other event', ''),
            phrase('just', 'A moment before the other event', ''),
            phrase('before that', 'Refers back to an earlier point already mentioned', ''),
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake',
          body:
            'Don\'t place "already"/"just" at the end of the sentence out of habit from the present perfect — in past perfect they usually sit right before the participle: "I had already left" ✓, not "I had left already, when..." (this can sound awkward mid-story, though it isn\'t always wrong).',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Memory trick',
          body:
            'Learn these participles in the same little "scenes" as the present perfect ones: go→gone (a trip), broken→broken (something snapped), forgotten→forgotten (a memory slipped away). Reusing the same mental images saves double the work.',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: 'By the time I woke up, everyone ___ (leave) for work.', options: ['left', 'had left', 'has left', 'was leaving'], correctIndex: 1, explanation: '"By the time" + past simple signals past perfect for the earlier event: "had left".' },
            { question: 'We had just ___ (sit) down when the waiter arrived.', options: ['sit', 'sat', 'sitting', 'have sat'], correctIndex: 1, explanation: 'The past participle of "sit" is "sat": "had just sat down".' },
            { question: 'She had already ___ (see) the film, so she stayed home.', options: ['see', 'saw', 'seen', 'seeing'], correctIndex: 2, explanation: 'Past perfect always uses the past participle: "seen".' },
            { question: 'He ___ (forget) his umbrella, so he got wet.', options: ['forgot', 'had forgotten', 'has forgotten', 'was forgetting'], correctIndex: 1, explanation: 'The forgetting happened before getting wet (both past) → past perfect explains the cause.' },
            { question: 'By 2020, they ___ (make) three films together.', options: ['made', 'had made', 'have made', 'were making'], correctIndex: 1, explanation: '"By [a past date]" + past perfect for something completed before that point.' },
          ],
        },
      ],
    },
  },
  {
    title: 'Past Perfect Tense — Intermediate',
    description: 'Reported speech, the third conditional link, and avoiding overuse.',
    duration: 20,
    content: {
      intro:
        "Let's connect the past perfect to two things you'll meet constantly: reporting what someone said about an earlier event, and the classic \"if only I had known\" conditional pattern.",
      sections: [
        {
          type: 'rule',
          title: 'Level up your past perfect',
          points: [
            'Reported speech backshifts a past simple OR present perfect original into the past perfect — "I saw him yesterday" becomes "She said she had seen him the day before."',
            'The third conditional imagines a different past — "If I had known, I would have helped." (You\'ll study this fully as its own topic, but the past perfect half is exactly what you\'ve already learned.)',
            'A very common learner habit is over-using "had" for every past sentence out of caution — it\'s only needed when sequencing relative to ANOTHER past reference point, not for ordinary past narration.',
          ],
        },
        {
          type: 'table',
          title: 'Reported speech: shifting further into the past',
          headers: ['Direct speech', 'Reported speech'],
          rows: [
            ['"I saw him yesterday."', 'She said she had seen him the day before.'],
            ['"I have finished."', 'He said he had finished.'],
            ['"I already left."', 'She said she had already left.'],
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake',
          body:
            'Don\'t reach for "had" out of caution when a single past event has no second reference point: "Yesterday, I had gone to the market and had bought vegetables" ✗ is overcorrected. Plain past simple is correct here: "Yesterday, I went to the market and bought vegetables" ✓.',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Looking ahead',
          body:
            'The third conditional ("If I had known, I would have helped") is really just the past perfect paired with "would have + participle" — once past perfect feels natural, that structure is much less intimidating.',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: '"I finished the report," he said. → He said he ___ the report.', options: ['finished', 'had finished', 'has finished', 'was finishing'], correctIndex: 1, explanation: 'Reported speech shifts past simple back to past perfect: "had finished".' },
            { question: 'If I ___ (know) about the meeting, I would have come.', options: ['knew', 'had known', 'have known', 'know'], correctIndex: 1, explanation: 'The third conditional\'s "if" clause uses the past perfect.' },
            { question: 'Which sentence is overcorrected (doesn\'t need past perfect)?', options: ['She had left before I arrived.', 'Yesterday, I had woken up early and had gone for a run.', 'By noon, he had already called three times.', 'They had finished eating when the show started.'], correctIndex: 1, explanation: 'A simple past sequence with no earlier reference point just needs plain past simple throughout.' },
            { question: '"I have never been there," she said. → She said she ___ never ___ there.', options: ['has / been', 'had / been', 'was / being', 'has / gone'], correctIndex: 1, explanation: 'Reported speech shifts present perfect back to past perfect.' },
            { question: 'By the time the ambulance arrived, the situation ___ (already/change).', options: ['already changed', 'had already changed', 'has already changed', 'was already changing'], correctIndex: 1, explanation: '"By the time" + past simple signals past perfect for what happened before it.' },
          ],
        },
      ],
    },
  },
  {
    title: 'Past Perfect Tense — Advanced',
    description: 'Dramatic inversion, backstory technique, and "had done" vs "would have done".',
    duration: 20,
    content: {
      intro:
        "At this level, the past perfect can open a sentence dramatically, unlock a story's backstory out of order, and needs to be kept clearly apart from its hypothetical cousin, \"would have done\".",
      sections: [
        {
          type: 'rule',
          title: 'Where past perfect gets sophisticated',
          points: [
            'Inversion structures move "had" to the front for dramatic emphasis, common in formal or literary writing — "No sooner had I arrived than it started raining." / "Hardly had she sat down when the phone rang."',
            'In fiction, past perfect lets a writer reveal backstory out of chronological order — flashing back to explain how a character got somewhere.',
            'Formal and journalistic writing often opens with the most recent event, then uses past perfect to fill in what led up to it.',
            '"Had done" (past perfect — a real past-before-past fact) is easy to confuse with "would have done" (a hypothetical result in the third conditional) — they answer different questions.',
          ],
        },
        {
          type: 'table',
          title: 'Dramatic inversion structures',
          headers: ['Pattern', 'Example'],
          rows: [
            ['No sooner had + subject + past participle... than...', 'No sooner had I arrived than it started raining.'],
            ['Hardly had + subject + past participle... when...', 'Hardly had she sat down when the phone rang.'],
            ['Barely had + subject + past participle... when...', 'Barely had he finished speaking when the crowd erupted.'],
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake at this level',
          body:
            'Don\'t confuse "had done" with "would have done": "If I had known, I would have helped" — "had known" states what was (or wasn\'t) true in the past; "would have helped" states the hypothetical RESULT that never happened. Swapping them ("If I would have known, I had helped" ✗) is a frequent, serious error at this level.',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Writer\'s technique',
          body:
            'Try opening a short paragraph with an inversion structure ("No sooner had the meeting ended than...") — it\'s a reliable way to add a formal, slightly dramatic register to writing without needing new vocabulary.',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: 'No sooner ___ I arrived than the lights went out.', options: ['did', 'had', 'have', 'was'], correctIndex: 1, explanation: '"No sooner had + subject + past participle" is the fixed inversion pattern.' },
            { question: 'Which sentence correctly uses the third conditional?', options: ['If I would have known, I had told you.', 'If I had known, I would have told you.', 'If I have known, I would tell you.', 'If I knew, I would have told you.'], correctIndex: 1, explanation: '"If + had + participle, would have + participle" is the correct third conditional pattern.' },
            { question: 'Hardly ___ she sat down when her phone rang.', options: ['did', 'was', 'had', 'has'], correctIndex: 2, explanation: '"Hardly had + subject + past participle" is the fixed inversion pattern.' },
            { question: 'The article opened with the crash, then explained the pilot ___ (report) engine trouble minutes earlier.', options: ['reported', 'had reported', 'has reported', 'was reporting'], correctIndex: 1, explanation: 'Journalistic writing often reveals an earlier past event with the past perfect after the main event.' },
            { question: 'Which correctly separates fact from hypothesis?', options: ["She hadn't studied, so she would have failed.", "She hadn't studied, so she failed.", 'If she had studied, she failed.', 'If she studied, she would have passed.'], correctIndex: 1, explanation: '"Hadn\'t studied... failed" states two real past facts — no hypothetical "would have" is needed here.' },
          ],
        },
      ],
    },
  },
];
