// Past Perfect Continuous, split across four CEFR-aligned levels — same
// pattern as prisma/lessons/pastSimple.js.
const phrase = (target, translation, pronunciation) => ({ target, translation, pronunciation });

module.exports = [
  {
    title: 'Past Perfect Continuous Tense — Beginner',
    description: 'How long something had been going on before another past moment.',
    duration: 20,
    content: {
      intro:
        "The past perfect continuous emphasizes the DURATION of an activity that was already going on before another past moment — or explains a past situation through what had been happening just before it.",
      sections: [
        {
          type: 'rule',
          title: 'When do we use it?',
          points: [
            'The duration of an activity up to a past point — "She had been working there for five years when the company closed."',
            'Explaining a past situation through a prior ongoing activity — "He was tired because he had been running."',
            '"How long had...?" asks about duration before a specific past moment.',
            'A recently-stopped activity, just before that past moment, with visible evidence at the time — "Her hands were shaking; she had been typing for hours."',
          ],
        },
        {
          type: 'structure',
          title: 'How to build it',
          structureItems: [
            { label: 'Affirmative', pattern: 'Subject + had been + verb-ing', example: 'They had been waiting for an hour.' },
            { label: 'Negative', pattern: "Subject + hadn't been + verb-ing", example: "She hadn't been sleeping well." },
            { label: 'Question', pattern: 'Had + subject + been + verb-ing?', example: 'Had you been crying?' },
          ],
        },
        {
          type: 'phrases',
          title: 'Signal words',
          items: [
            phrase('for', 'A duration — "for two hours"', ''),
            phrase('since', 'A starting point — "since morning"', ''),
            phrase('how long', 'Asks about duration before a past moment', ''),
            phrase('before that', 'Refers to the time just before the past reference point', ''),
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake',
          body:
            'State verbs (know, believe, want, love, understand, own, belong) never take this continuous form. "I had been knowing him for years" ✗ is wrong — say "I had known him for years" ✓.',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Memory trick',
          body:
            'If you can answer "how long?" about something happening right up to a past moment, this tense almost always fits — it\'s the past version of "how long have you been...?"',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: 'She ___ (work) there for five years when the company closed.', options: ['worked', 'had worked', 'had been working', 'was working'], correctIndex: 2, explanation: 'Duration up to a past point → past perfect continuous.' },
            { question: 'He was exhausted because he ___ (run) all morning.', options: ['ran', 'had run', 'had been running', 'was running'], correctIndex: 2, explanation: 'A prior ongoing activity explains the past situation → past perfect continuous.' },
            { question: 'How long ___ you ___ (wait) when the bus finally came?', options: ['did / wait', 'had / been waiting', 'have / been waiting', 'were / waiting'], correctIndex: 1, explanation: '"How long" about duration before a past moment → had been + verb-ing.' },
            { question: 'I ___ (know) him for years — we were old friends.', options: ['had been knowing', 'had known', 'was knowing', 'have known'], correctIndex: 1, explanation: '"Know" is a state verb — never use the continuous form, even in the past perfect.' },
            { question: 'Her eyes were red; she ___ (cry).', options: ['cried', 'had cried', 'had been crying', 'was crying'], correctIndex: 2, explanation: 'A recently-stopped activity with visible evidence at a past moment → past perfect continuous.' },
          ],
        },
      ],
    },
  },
  {
    title: 'Past Perfect Continuous Tense — Elementary',
    description: '"How long had you been...?" — everyday scenes from the past.',
    duration: 20,
    content: {
      intro:
        "Let's ground this tense in scenes you already recognize from the present perfect continuous — just moved one step further back into the past.",
      sections: [
        {
          type: 'rule',
          title: 'Everyday past scenes',
          points: [
            'Explaining why someone looked or felt a certain way at a specific past moment — "She was out of breath because she had been running."',
            '"How long had you been...?" is the natural question to ask about a duration that ended at a specific past point.',
            'Weather, tiredness, and ongoing hobby scenes work exactly like the present perfect continuous, just shifted one step into the past.',
            '"For" and "since" work the same way as in the present perfect continuous — "for" with a duration, "since" with a starting point.',
          ],
        },
        {
          type: 'table',
          title: '"For" vs "since" with the past perfect continuous',
          headers: ['Rule', 'Example'],
          rows: [
            ['for + a duration', 'She had been studying for three hours.'],
            ['since + a starting point', 'He had been driving since sunrise.'],
          ],
        },
        {
          type: 'phrases',
          title: 'Everyday triggers for this tense',
          items: [
            phrase('That\'s why he had been...', 'Explains the reason behind a past visible result', ''),
            phrase('all morning / all week', 'Emphasizes a long, unbroken stretch before a past point', ''),
            phrase('How long had you been waiting?', 'A classic duration question about the past', ''),
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake',
          body:
            'Don\'t drop "been": "I had waiting for an hour" ✗ is missing a piece. The full form always needs all three parts: had + BEEN + verb-ing — "I had been waiting for an hour" ✓.',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Memory trick',
          body:
            'If you already know the present perfect continuous ("I have been waiting"), just shift "have" back to "had" — everything else stays exactly the same.',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: 'He was soaked because he ___ (walk) in the rain for an hour.', options: ['walked', 'had walked', 'had been walking', 'was walking'], correctIndex: 2, explanation: 'A prior ongoing activity with a visible past result → past perfect continuous.' },
            { question: '"How long ___ you been studying when the exam started?"', options: ['did', 'had', 'have', 'were'], correctIndex: 1, explanation: '"How long had you been...?" is the standard duration question about a past point.' },
            { question: 'She ___ (drive) since dawn by the time she stopped for breakfast.', options: ['drove', 'had been driving', 'was driving', 'has been driving'], correctIndex: 1, explanation: '"Since" + duration up to a past point → past perfect continuous.' },
            { question: 'They ___ (play) football all afternoon before it started to rain.', options: ['played', 'had been playing', 'were playing', 'have been playing'], correctIndex: 1, explanation: 'An extended activity right up to a past point → past perfect continuous.' },
            { question: 'Complete: I had ___ waiting for you since noon! (missing word)', options: ['be', 'been', 'being', 'was'], correctIndex: 1, explanation: 'The full form always needs "been": had + been + verb-ing.' },
          ],
        },
      ],
    },
  },
  {
    title: 'Past Perfect Continuous Tense — Intermediate',
    description: 'Past perfect vs past perfect continuous — result and count vs duration and process.',
    duration: 20,
    content: {
      intro:
        "Just like present perfect vs present perfect continuous, the past versions split the same way: one counts or confirms a result, the other emphasizes the ongoing activity itself.",
      sections: [
        {
          type: 'rule',
          title: 'Level up your past perfect continuous',
          points: [
            'Past perfect (simple) focuses on the result, or a count, of something completed before a past point — "She had written three reports by Friday."',
            'Past perfect continuous focuses on the ongoing ACTIVITY itself, with less concern for whether it was finished — "She had been writing reports all week."',
            'With verbs like live, work, study — both often work, with a subtle difference: the simple form sounds like a settled fact, the continuous sounds like an ordinary ongoing activity.',
            'State verbs stay off-limits for the continuous form here too, exactly as in every other continuous tense.',
          ],
        },
        {
          type: 'table',
          title: 'Past perfect vs past perfect continuous',
          headers: ['Past perfect', 'Past perfect continuous'],
          rows: [
            ['Focus on result or count — "He had read four books."', 'Focus on the ongoing process — "He had been reading all summer."'],
            ['Sounds like a settled fact — "She had lived there for ten years."', 'Sounds like an ordinary activity — "She had been living there for ten years."'],
            ['Works with state verbs — "They had known each other for years."', 'Never with state verbs — "They had been knowing" ✗ is always wrong.'],
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake',
          body:
            'Don\'t use the continuous form when the sentence is really about a COUNT: "I had been writing five letters" ✗ mixes a number with the process-focused continuous. Use past perfect instead: "I had written five letters" ✓.',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Memory trick',
          body:
            'Ask "how many/is it done?" → past perfect. Ask "how long/what was going on?" → past perfect continuous. The question you\'re really answering picks the tense.',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: 'By the time she left the company, she ___ (write) over fifty reports.', options: ['wrote', 'had written', 'had been writing', 'was writing'], correctIndex: 1, explanation: 'A count/achievement → past perfect, not continuous.' },
            { question: 'He ___ (write) his novel for two years when he finally finished it.', options: ['wrote', 'had written', 'had been writing', 'has written'], correctIndex: 2, explanation: 'Emphasis on the ongoing process/duration → past perfect continuous.' },
            { question: 'Which sentence is incorrect?', options: ['She had been reading for an hour.', 'She had read three chapters.', 'She had been reading three chapters.', 'She had been reading all night.'], correctIndex: 2, explanation: 'Mixing a specific count ("three chapters") with the process-focused continuous is a mismatch — use past perfect instead: "had read three chapters".' },
            { question: 'They ___ (know) each other for a decade before they got married.', options: ['had known', 'had been knowing', 'knew', 'have known'], correctIndex: 0, explanation: '"Know" is a state verb — always past perfect, never continuous.' },
            { question: 'He was out of breath — he ___ (run) for the bus.', options: ['ran', 'had run', 'had been running', 'was running'], correctIndex: 2, explanation: 'A prior ongoing activity explaining a past state → past perfect continuous.' },
          ],
        },
      ],
    },
  },
  {
    title: 'Past Perfect Continuous Tense — Advanced',
    description: 'Compound backstory narration, formal register, and where this tense stays simple.',
    duration: 20,
    content: {
      intro:
        "At this level, the past perfect continuous does careful narrative work — building tension before a climax, and combining with the plain past perfect for a layered backstory.",
      sections: [
        {
          type: 'rule',
          title: 'Where this tense gets sophisticated',
          points: [
            'Complex backstory narration often combines both past perfect forms in one passage — "By the time he arrived, she had already left; she had been waiting for over an hour and had simply given up."',
            'In tension-building narrative, this tense signals mounting frustration or fatigue just before a turning point — "He had been searching for hours when he finally spotted it."',
            'Unlike the plain past perfect, this tense doesn\'t use dramatic front-position inversion ("No sooner had..."); it keeps standard word order even in formal or literary writing.',
            'In concise formal or academic writing, the plain past perfect is often preferred over the continuous form, even where either would be grammatically correct — the continuous can read as unnecessarily descriptive.',
          ],
        },
        {
          type: 'table',
          title: 'Layering both past perfect forms',
          headers: ['Sentence', 'Job it does'],
          rows: [
            ['By the time he arrived, she had already left.', 'States the completed fact (past perfect).'],
            ['She had been waiting for over an hour.', 'Explains the duration/process behind it (past perfect continuous).'],
            ['She had simply given up.', 'States the resulting completed fact (past perfect).'],
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake at this level',
          body:
            'Don\'t force this tense into a dramatic inversion the way you would with the plain past perfect — "No sooner had I been waiting..." ✗ is not a standard structure. Inversion belongs to the plain past perfect ("No sooner had I arrived...") only.',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Register tip',
          body:
            'In tight, formal prose, ask whether the DURATION really matters to the reader. If not, the plain past perfect is usually the more polished choice: "He had researched the topic for months" reads cleaner than "He had been researching the topic for months" when the point is simply that the groundwork was done.',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: 'He ___ (search) for hours when he finally spotted the missing file.', options: ['searched', 'had searched', 'had been searching', 'was searching'], correctIndex: 2, explanation: 'Building tension through duration right before a turning point → past perfect continuous.' },
            { question: 'Which is the more polished, concise formal choice?', options: ['He had been researching the topic for months before the report.', 'He had researched the topic for months before the report.', 'He was researching the topic for months before the report.', 'He has been researching the topic for months before the report.'], correctIndex: 1, explanation: 'When duration isn\'t the point, formal writing often prefers the plain past perfect over the continuous form.' },
            { question: 'Which sentence is NOT a standard English structure?', options: ['No sooner had I arrived than it rained.', 'No sooner had I been arriving than it rained.', 'Hardly had she sat down when the phone rang.', 'By the time we left, they had already gone.'], correctIndex: 1, explanation: 'Dramatic inversion belongs to the plain past perfect, not the continuous form.' },
            { question: 'By the time the ambulance came, he ___ (already/lose) consciousness, having ___ (bleed) for several minutes.', options: ['had already lost / been bleeding', 'already lost / bled', 'had already been losing / bled', 'was already losing / had bled'], correctIndex: 0, explanation: 'The completed result (had lost) pairs naturally with the ongoing cause described in continuous form (had been bleeding).' },
            { question: 'She had been rehearsing her speech ___ she felt ready.', options: ['until', 'since', 'for', 'ago'], correctIndex: 0, explanation: '"Until" marks the endpoint of an ongoing past activity — "had been rehearsing until she felt ready."' },
          ],
        },
      ],
    },
  },
];
