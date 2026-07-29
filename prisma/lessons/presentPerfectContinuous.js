// Present Perfect Continuous, split across three levels — same pattern as
// prisma/lessons/presentSimple.js.
const phrase = (target, translation, pronunciation) => ({ target, translation, pronunciation });

module.exports = [
  {
    title: 'Present Perfect Continuous Tense — Beginner',
    description: 'The missing piece — for ongoing duration and activity, not just results.',
    duration: 20,
    content: {
      intro:
        "The present perfect continuous is the least-taught present tense, but it fills a real gap: it's for ongoing ACTIVITY and DURATION, where the present perfect alone only gives you the result or the count.",
      sections: [
        {
          type: 'rule',
          title: 'When do we use it?',
          points: [
            'An activity that started in the past and is still going, with the focus on duration — "I have been studying English for three years."',
            'A recently stopped action with a visible present result — "I\'m tired because I\'ve been running." / "Her eyes are red — she\'s been crying."',
            'A repeated action building up to now — "I\'ve been calling him all day, but he doesn\'t answer."',
            '"How long" questions about something still happening — "How long have you been waiting?"',
            'Emphasizing that something may be unfinished — "I\'ve been reading that book" (still going) vs "I\'ve read that book" (done).',
          ],
        },
        {
          type: 'structure',
          title: 'How to build it',
          structureItems: [
            { label: 'Affirmative', pattern: 'Subject + have/has + been + verb-ing', example: 'She has been working here for two years.' },
            { label: 'Negative', pattern: "Subject + have/has + not + been + verb-ing", example: "They haven't been listening." },
            { label: 'Question', pattern: 'Have/Has + subject + been + verb-ing?', example: 'Have you been waiting long?' },
          ],
        },
        {
          type: 'table',
          title: 'Present perfect vs. present perfect continuous',
          headers: ['Present perfect', 'Present perfect continuous'],
          rows: [
            ['Focus on result, completion, or a count — "I have written three emails."', 'Focus on the ongoing activity or process — "I have been writing emails all morning."'],
            ['Sounds like a permanent, settled fact — "I have lived here for 10 years."', 'Sounds like an ordinary, ongoing activity — "I have been living here for 10 years."'],
            ['State verbs only — "I have known him for years."', 'Never with state verbs — "I have been knowing him" ✗ is always wrong.'],
          ],
        },
        {
          type: 'phrases',
          title: 'Signal words',
          items: [
            phrase('how long', 'Asks about the duration of something ongoing', ''),
            phrase('lately', 'In recent times, up to now', ''),
            phrase('recently', 'Not long ago, often still relevant', ''),
            phrase('all day / all week', 'Emphasizes continuous duration', ''),
            phrase('still', 'The activity has not stopped', ''),
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake',
          body:
            'State verbs (know, believe, like, love, want, understand, belong, own) never take the continuous form — not even here. "I\'ve been knowing him for years" ✗ is always wrong; say "I\'ve known him for years" ✓.',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Memory trick',
          body:
            'If you could answer the question "how long?", it\'s probably present perfect continuous. If you\'re more interested in "how many?" or "is it done?", reach for the plain present perfect instead.',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: 'I ___ (wait) for you for an hour!', options: ['waited', 'have waited', 'have been waiting', 'am waiting'], correctIndex: 2, explanation: 'Duration up to now, ongoing activity → present perfect continuous.' },
            { question: "She's out of breath. She ___ (run).", options: ['ran', 'has run', 'has been running', 'runs'], correctIndex: 2, explanation: 'Recently stopped activity with a visible present result → present perfect continuous.' },
            { question: 'How long have you ___ (learn) English?', options: ['learned', 'been learning', 'learning', 'learn'], correctIndex: 1, explanation: '"How long" + an ongoing activity → have/has + been + verb-ing.' },
            { question: "I've ___ (know) him since childhood.", options: ['been knowing', 'known', 'knowing', 'know'], correctIndex: 1, explanation: '"Know" is a state verb — never use the continuous form, even with "since": "I\'ve known him", not "I\'ve been knowing him."' },
            { question: "They ___ (build) that bridge for two years — it's still not finished.", options: ['built', 'have built', 'have been building', 'are building'], correctIndex: 2, explanation: 'An unfinished, ongoing project emphasized by duration → present perfect continuous.' },
          ],
        },
      ],
    },
  },
  {
    title: 'Present Perfect Continuous Tense — Elementary',
    description: '"How long...?" — everyday scenes where this tense feels natural.',
    duration: 20,
    content: {
      intro:
        "This tense can feel abstract at first, so let's ground it in scenes you already recognize: small talk about the weather, being tired after exercise, and answering \"how long\" questions about things you're still doing.",
      sections: [
        {
          type: 'rule',
          title: 'Everyday scenes for this tense',
          points: [
            'Small talk about ongoing weather — "It\'s been raining all morning."',
            'Explaining why you look a certain way right now — "I\'ve been exercising, that\'s why I\'m out of breath."',
            'Talking about a hobby or study project you\'re in the middle of — "I\'ve been learning Spanish for six months."',
            '"How long...?" is the question this tense was built to answer — "How long have you been waiting?"',
          ],
        },
        {
          type: 'structure',
          title: 'Answering "how long"',
          structureItems: [
            { label: 'The question', pattern: 'How long + have/has + subject + been + verb-ing?', example: 'How long have you been learning English?' },
            { label: 'With "for"', pattern: 'Subject + have/has + been + verb-ing + for + duration', example: "I've been learning English for two years." },
            { label: 'With "since"', pattern: 'Subject + have/has + been + verb-ing + since + point in time', example: "I've been learning English since 2024." },
          ],
        },
        {
          type: 'phrases',
          title: 'Everyday triggers for this tense',
          items: [
            phrase("I've been meaning to...", 'You intended to do something but haven\'t yet', ''),
            phrase("That's why I've been...", 'Explains the reason behind a visible result', ''),
            phrase('all morning / all day / all week', 'Emphasizes a long, unbroken stretch of time', ''),
            phrase("How's it going?", 'A casual way to ask about an ongoing project', ''),
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake',
          body:
            'Don\'t drop "been": "I have exercising" ✗ is missing a piece. The full form always needs all three parts: have/has + BEEN + verb-ing — "I have been exercising" ✓.',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Memory trick',
          body:
            'If you can picture the activity still happening as you speak, or its effects are visible right now (sweat, tiredness, a half-finished project), this tense almost always fits.',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: "It ___ (rain) all morning — look how wet the streets are.", options: ['rains', 'has rained', 'has been raining', 'is raining'], correctIndex: 2, explanation: 'An ongoing weather situation with a visible result → "has been raining".' },
            { question: '"___ have you been learning the guitar?" — "For about a year."', options: ['How long', 'How much', 'How many', 'How often'], correctIndex: 0, explanation: '"How long" asks about duration — the classic present perfect continuous question.' },
            { question: "I'm exhausted — I ___ (study) since 6am.", options: ['study', 'studied', 'have been studying', 'am studying'], correctIndex: 2, explanation: 'A visible present result (exhaustion) from an ongoing activity → present perfect continuous.' },
            { question: "I've ___ (mean) to call you all week!", options: ['mean', 'meant', 'been meaning', 'meaning'], correctIndex: 2, explanation: '"I\'ve been meaning to..." is a fixed everyday expression using this tense.' },
            { question: 'She ___ (learn) Spanish for six months now.', options: ['learns', 'learned', 'has been learning', 'is learning'], correctIndex: 2, explanation: 'An ongoing hobby/project measured by duration ("for six months") → present perfect continuous.' },
            { type: 'fill', question: 'Complete: I have ___ waiting for an hour! (the missing word)', answer: 'been', explanation: 'The full form always needs all three parts: have + been + verb-ing.' },
          ],
        },
      ],
    },
  },
  {
    title: 'Present Perfect Continuous Tense — Intermediate',
    description: '"How long" as your main tool, negative form nuance, and reinforcing for vs. since.',
    duration: 20,
    content: {
      intro:
        "You know the shape of this tense — now let's make 'How long...?' automatic, sort out what the negative form really means, and lock in for vs since.",
      sections: [
        {
          type: 'rule',
          title: 'Level up your present perfect continuous',
          points: [
            '"How long...?" is the single most useful question pattern for this tense — make it automatic.',
            'Repeated actions building up to now can carry the same irritation as present continuous, but over a longer stretch — "I\'ve been telling you for weeks to fix this."',
            'The negative form has a specific meaning: "hasn\'t/haven\'t been + verb-ing" says an activity STOPPED or never started during a period — different from a simple negative fact.',
            'For and since work exactly as they do elsewhere, but continuous adds the sense of an unbroken activity running through that whole stretch of time.',
          ],
        },
        {
          type: 'table',
          title: '"For" vs "since" with the perfect continuous',
          headers: ['Marker', 'Meaning', 'Example'],
          rows: [
            ['for + duration', 'the length of time', "I've been waiting for 20 minutes."],
            ['since + a point in time', 'the starting moment', "I've been waiting since 3 o'clock."],
          ],
        },
        {
          type: 'phrases',
          title: 'Signal words',
          items: [
            phrase('for ages', 'For a very long time (informal)', ''),
            phrase('all this time', 'Throughout the whole period being discussed', ''),
            phrase('non-stop', 'Without any break', ''),
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake',
          body:
            'Don\'t confuse "I haven\'t been working" (the activity stopped, or wasn\'t happening, during that period) with "I haven\'t worked" (a simple fact — maybe I\'ve never worked there at all). The continuous negative is about a gap in an ongoing activity.',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Memory trick',
          body:
            'Build the question in order, out loud: "How long" + "have/has" + subject + "been" + verb-ing. Once the word order is automatic, the content just slots in.',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: '___ have you been living in Kigali?', options: ['How long', 'How many', 'How much', 'How often'], correctIndex: 0, explanation: '"How long" is the standard question word for ongoing duration.' },
            { question: 'The machine ___ (not/work) properly since Monday.', options: ["hasn't worked", "hasn't been working", "doesn't work", "wasn't working"], correctIndex: 1, explanation: 'An ongoing malfunction over a period → present perfect continuous negative.' },
            { question: 'We\'ve been friends ___ we were children.', options: ['for', 'since', 'during', 'from'], correctIndex: 1, explanation: '"Since" marks the starting point of a continuing relationship.' },
            { question: 'I\'ve been studying ___ three hours without a break.', options: ['since', 'for', 'from', 'ago'], correctIndex: 1, explanation: '"For" marks a duration/length of time.' },
            { question: 'He\'s been calling me ___ — it\'s getting a bit much.', options: ['non-stop', 'since Monday', 'for three years', 'already'], correctIndex: 0, explanation: '"Non-stop" fits naturally with the ongoing, repeated, slightly irritating sense of the continuous.' },
          ],
        },
      ],
    },
  },
  {
    title: 'Present Perfect Continuous Tense — Advanced',
    description: 'The decision framework: when continuous wins over simple, and the one hard rule about numbers.',
    duration: 20,
    content: {
      intro:
        "This is the tense pair (perfect vs. perfect continuous) that trips up even advanced learners. Here's the actual decision framework, plus the one rule that settles almost every disputed case.",
      sections: [
        {
          type: 'rule',
          title: 'The real distinction',
          points: [
            'Use continuous when the ACTIVITY itself is the point — the process, the effort, the time spent — even if it\'s not finished.',
            'Use plain perfect when the RESULT, the COUNT, or the fact of COMPLETION is the point, even after a long duration.',
            'Verbs that don\'t naturally "continue" can still take this form for a repeated pattern seen as one ongoing habit — "I\'ve been going to that gym for years."',
            'With verbs like live/work/study, both forms are often fine — plain perfect sounds slightly more permanent and settled; continuous sounds more like an ongoing, possibly temporary situation.',
            'The one hard rule: never use the continuous with a specific NUMBER of completed instances — "I\'ve been visiting Paris three times" ✗ is always wrong; a count means the events are discrete and finished, so it must be "I\'ve visited Paris three times" ✓.',
          ],
        },
        {
          type: 'table',
          title: 'Choosing between present perfect and present perfect continuous',
          headers: ['Ask yourself...', 'Perfect (simple)', 'Perfect continuous'],
          rows: [
            ['Is there a NUMBER or count?', 'Yes → "I have visited Paris three times."', 'Never — no number is allowed with continuous.'],
            ['Is completion or the RESULT the point?', 'Yes → "I have finished the report."', 'No — an ongoing process → "I have been writing the report."'],
            ['Is DURATION or EFFORT the point?', 'Less natural focus here', 'Yes → "I have been studying for 6 hours."'],
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake at this level',
          body:
            'The "no number with continuous" rule is the single most testable point at this level: "I\'ve been reading this book five times" ✗ is always wrong — a count forces the plain perfect: "I\'ve read this book five times" ✓.',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Nuance worth noticing',
          body:
            '"I\'ve lived here for 10 years" and "I\'ve been living here for 10 years" are both correct with a verb like "live" — but the plain perfect leans permanent and settled, while the continuous leans ongoing and slightly more temporary-feeling, even over the same 10 years.',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: 'Which is correct?', options: ["I've been reading that book three times.", "I've read that book three times.", "I've been read that book three times.", "I read that book three times ago."], correctIndex: 1, explanation: 'A specific count of completed instances forbids the continuous — plain perfect only.' },
            { question: 'She\'s exhausted — she ___ (work) on this project non-stop for a week.', options: ['works', 'has worked', 'has been working', 'is working'], correctIndex: 2, explanation: 'The effort and duration are the point, and it\'s framed as ongoing/exhausting → perfect continuous.' },
            { question: 'The team ___ (complete) the final report — it\'s ready to send.', options: ['has completed', 'has been completing', 'completes', 'is completing'], correctIndex: 0, explanation: 'The RESULT (it\'s ready) is the point, not the process → plain present perfect.' },
            { question: 'Which pair means roughly the same thing, with only a subtle difference?', options: ["I've been to Rome. / I've gone to Rome.", "I've lived here for years. / I've been living here for years.", "I've visited twice. / I've been visiting twice.", "I've finished. / I've been finishing."], correctIndex: 1, explanation: 'With "live", both forms work; plain perfect sounds more settled, continuous more ongoing.' },
            { question: 'He ___ (go) to that same gym for over a decade now.', options: ['has gone', 'has been going', 'goes', 'went'], correctIndex: 1, explanation: 'A repeated pattern seen as one long ongoing habit fits perfect continuous, even though each visit is a discrete event.' },
          ],
        },
      ],
    },
  },
];
