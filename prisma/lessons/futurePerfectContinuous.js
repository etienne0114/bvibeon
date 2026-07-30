// Future Perfect Continuous, split across four CEFR-aligned levels — same
// pattern as prisma/lessons/pastSimple.js.
const phrase = (target, translation, pronunciation) => ({ target, translation, pronunciation });

module.exports = [
  {
    title: 'Future Perfect Continuous Tense — Beginner',
    description: 'How long something will have been going on by a future point.',
    duration: 20,
    content: {
      intro:
        "The future perfect continuous emphasizes the DURATION of an activity that will still be running, right up to a specific future point — the future version of \"how long have you been...?\"",
      sections: [
        {
          type: 'rule',
          title: 'When do we use it?',
          points: [
            'The duration of an activity continuing up to a future point — "By June, I will have been living here for 10 years."',
            'It answers "how long?", not "how many?" or "is it done?" — that job belongs to the future perfect.',
            'It usually needs both a duration marker ("for...") and a future reference point ("by...") in the same sentence.',
          ],
        },
        {
          type: 'structure',
          title: 'How to build it',
          structureItems: [
            { label: 'Affirmative', pattern: 'Subject + will have been + verb-ing', example: 'By May, she will have been studying for a year.' },
            { label: 'Negative', pattern: "Subject + won't have been + verb-ing", example: "He won't have been working here long." },
            { label: 'Question', pattern: 'Will + subject + have been + verb-ing?', example: 'Will you have been living here a year by then?' },
          ],
        },
        {
          type: 'phrases',
          title: 'Signal words',
          items: [
            phrase('by [time]', 'The future point the duration runs up to', ''),
            phrase('for [duration]', 'The length of the ongoing activity — "for five years"', ''),
            phrase('how long', 'Asks about that future duration', ''),
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake',
          body:
            'State verbs (know, believe, want, love, understand, own, belong) never take this continuous form — "I will have been knowing him for years" ✗ is wrong. Say "I will have known him for years" ✓ instead.',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Memory trick',
          body:
            'This is the "how long, by then?" tense — if the question in your head is about duration reaching all the way to a future point, this tense fits.',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: 'By June, she ___ (study) English for two years.', options: ['studies', 'will study', 'will have been studying', 'was studying'], correctIndex: 2, explanation: 'Duration continuing up to a future point → future perfect continuous.' },
            { question: 'By the time he retires, he ___ (work) here for 40 years.', options: ['works', 'will work', 'will have been working', 'worked'], correctIndex: 2, explanation: 'A long duration reaching a future milestone → future perfect continuous.' },
            { question: 'How long ___ you ___ (live) here by next year?', options: ['do / live', 'will / have been living', 'have / been living', 'were / living'], correctIndex: 1, explanation: '"How long" about a duration up to a future point → will have been + verb-ing.' },
            { question: 'I ___ (know) her for ten years next month.', options: ['will have been knowing', 'will have known', 'am knowing', 'have known'], correctIndex: 1, explanation: '"Know" is a state verb — never the continuous form, even here.' },
            { question: 'By midnight, they ___ (drive) for twelve straight hours.', options: ['drive', 'will drive', 'will have been driving', 'drove'], correctIndex: 2, explanation: 'An ongoing duration reaching a future point → future perfect continuous.' },
          ],
        },
      ],
    },
  },
  {
    title: 'Future Perfect Continuous Tense — Elementary',
    description: 'Anniversaries and milestones — "how long will you have been...?"',
    duration: 20,
    content: {
      intro:
        "Anniversaries and milestones are the perfect everyday context for this tense — let's practice with dates and durations you can picture concretely.",
      sections: [
        {
          type: 'rule',
          title: 'Everyday milestone scenes',
          points: [
            'Work anniversaries — "By March, I will have been working here for five years."',
            'Relationship anniversaries — "By our anniversary, we will have been married for a decade."',
            'Long personal projects — "By the end of the month, I will have been writing this book for a whole year."',
            '"For" tells you the duration; the "by" phrase tells you the future finish line.',
          ],
        },
        {
          type: 'table',
          title: 'Duration + future point, together',
          headers: ['Duration ("for")', 'Future point ("by")', 'Full sentence'],
          rows: [
            ['for ten years', 'by 2030', 'By 2030, I will have been living here for ten years.'],
            ['for six months', 'by the summer', 'By the summer, she will have been training for six months.'],
          ],
        },
        {
          type: 'phrases',
          title: 'Signal phrases',
          items: [
            phrase('our anniversary', 'A common personal milestone date', ''),
            phrase('this time next year', 'A common future reference point', ''),
            phrase('non-stop', 'Emphasizes an unbroken duration', ''),
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake',
          body:
            'Don\'t drop "been": "I will have working here for five years" ✗ is missing a piece — the full form always needs all three parts: will + have + BEEN + verb-ing.',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Memory trick',
          body:
            'Pick a real milestone from your own life — a birthday, an anniversary, a work start date — and build one sentence with it. A real date makes the structure much easier to remember.',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: 'By our anniversary, we ___ (be) married for ten years.', options: ['are', 'will be', 'will have been', 'were'], correctIndex: 2, explanation: '"Be married" is a state — future perfect (not continuous) is the natural fit here: "will have been married".' },
            { question: 'By March, I ___ (work) at this company for five years.', options: ['work', 'will work', 'will have been working', 'worked'], correctIndex: 2, explanation: 'Duration continuing up to a future milestone → future perfect continuous.' },
            { question: 'This time next year, she ___ (train) for the marathon for eight months.', options: ['trains', 'will train', 'will have been training', 'trained'], correctIndex: 2, explanation: 'An ongoing training duration reaching a future point → future perfect continuous.' },
            { question: 'Complete: By December, we will have ___ living here for a year. (missing word)', options: ['be', 'been', 'being', 'was'], correctIndex: 1, explanation: 'The full form always needs "been": will + have + been + verb-ing.' },
            { question: 'By the end of the month, he ___ (write) this novel for exactly one year.', options: ['writes', 'will write', 'will have been writing', 'wrote'], correctIndex: 2, explanation: 'A long personal project measured by duration to a future point → future perfect continuous.' },
          ],
        },
      ],
    },
  },
  {
    title: 'Future Perfect Continuous Tense — Intermediate',
    description: 'Future perfect vs future perfect continuous — result and count vs duration and process.',
    duration: 20,
    content: {
      intro:
        "Just like every other perfect/perfect-continuous pair you've studied, these two split the same way: one confirms a result or count, the other foregrounds the ongoing process.",
      sections: [
        {
          type: 'rule',
          title: 'Level up your future perfect continuous',
          points: [
            'Future perfect focuses on the finished result or a count by a future point — "By Friday, she will have written the whole report."',
            'Future perfect continuous focuses on the ongoing PROCESS — "By Friday, she will have been writing the report all week."',
            'With verbs like live, work, study, both often work, with a subtle shift: the plain form sounds like a settled fact, the continuous sounds like an ordinary ongoing activity.',
            'The same state-verb restriction applies here as in every other continuous tense.',
          ],
        },
        {
          type: 'table',
          title: 'Future perfect vs future perfect continuous',
          headers: ['Future perfect', 'Future perfect continuous'],
          rows: [
            ['Focus on result or count — "He will have written four reports."', 'Focus on the ongoing process — "He will have been writing reports all week."'],
            ['Sounds like a settled fact — "She will have lived here for ten years."', 'Sounds like an ordinary activity — "She will have been living here for ten years."'],
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake',
          body:
            'Don\'t use the continuous form when the sentence is really about a COUNT: "By Friday, I will have been writing five reports" ✗ mixes a number with the process-focused continuous. Use future perfect instead: "I will have written five reports" ✓.',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Memory trick',
          body:
            'Ask "how many/is it done?" → future perfect. Ask "how long/what will have been going on?" → future perfect continuous.',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: 'By the deadline, she ___ (write) the entire thesis.', options: ['writes', 'will have written', 'will have been writing', 'was writing'], correctIndex: 1, explanation: 'A finished result/count → future perfect, not continuous.' },
            { question: 'By the deadline, she ___ (write) for six months straight.', options: ['writes', 'will have written', 'will have been writing', 'was writing'], correctIndex: 2, explanation: 'Emphasis on the ongoing process/duration → future perfect continuous.' },
            { question: 'Which sentence is a mismatch?', options: ['He will have been reading all afternoon.', 'He will have read three books.', 'He will have been reading three books.', 'He will have been reading for hours.'], correctIndex: 2, explanation: 'Mixing a specific count ("three books") with the process-focused continuous is a mismatch.' },
            { question: 'By retirement, she ___ (teach) at the same school for three decades.', options: ['teaches', 'will have taught', 'will have been teaching', 'taught'], correctIndex: 2, explanation: 'Emphasis on the long ongoing career/duration → future perfect continuous.' },
            { question: 'By 9pm, they ___ (finish) dinner.', options: ['finish', 'will have finished', 'will have been finishing', 'were finishing'], correctIndex: 1, explanation: 'A simple confirmed result by a future point → future perfect, not continuous.' },
          ],
        },
      ],
    },
  },
  {
    title: 'Future Perfect Continuous Tense — Advanced',
    description: 'The rarest tense in English — and exactly when it earns its place.',
    duration: 20,
    content: {
      intro:
        "This is the least common of all twelve major English tenses — genuinely rare even in native speech. At this level, the real skill is knowing exactly when it adds value, and when a simpler tense says the same thing better.",
      sections: [
        {
          type: 'rule',
          title: 'Where this tense actually earns its place',
          points: [
            'Because it\'s rare, native speakers often simplify to the future perfect or future continuous unless the DURATION genuinely matters to the point being made.',
            'It works best in formal projections that specifically highlight a long build-up — "By the product launch, the team will have been developing this feature for two years."',
            'It almost never appears in casual spoken English — "I\'ll have been living here a year" is more natural spoken as "I\'ll have lived here a year" unless the speaker is deliberately stressing the duration.',
            'Like its past and present perfect continuous cousins, it never combines with state verbs, and it never uses dramatic front-position inversion.',
          ],
        },
        {
          type: 'table',
          title: 'When to reach for it — and when not to',
          headers: ['Use it when...', 'Simplify instead when...'],
          rows: [
            ['The duration itself is the main point of the sentence.', 'The finished result matters more than how long it took.'],
            ['Formal writing wants to stress ongoing effort or investment.', 'Casual speech just needs a quick, simple fact.'],
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake at this level',
          body:
            'Don\'t over-use this tense just because it\'s grammatically available — "By 5pm, I will have been finishing the email" ✗ doesn\'t even make sense (finishing isn\'t a duration-activity); reach for the simple future perfect instead: "I will have finished the email" ✓.',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Writer\'s judgment',
          body:
            'Before using this tense in formal writing, ask: "Would a reader actually care how long this took, or just that it\'ll be done?" If it\'s the latter, simplify — precision that nobody needs isn\'t precision, it\'s clutter.',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: 'By the launch date, the team ___ (develop) this feature for two full years.', options: ['develops', 'will have developed', 'will have been developing', 'developed'], correctIndex: 2, explanation: 'The long build-up/duration is the whole point of this formal projection → future perfect continuous.' },
            { question: 'Which sentence is an unnecessary/awkward use of this tense?', options: ['By 5pm, I will have been finishing the email.', 'By retirement, she will have been teaching for 30 years.', 'By June, we will have been renovating the house for a year.', 'By then, he will have been coaching this team for a decade.'], correctIndex: 0, explanation: '"Finishing" isn\'t a duration-style activity — the plain future perfect ("will have finished") fits better.' },
            { question: 'In casual speech, "I\'ll have lived here a year by June" is preferred over "I\'ll have been living here a year by June" because...', options: ['The continuous form is grammatically wrong', 'Casual speech usually simplifies unless duration is the specific point', 'Only formal writing allows perfect tenses', "It's a completely different meaning"], correctIndex: 1, explanation: 'Native speakers often simplify to future perfect in casual speech unless duration is the deliberate focus.' },
            { question: 'Which correctly avoids a state verb in this tense?', options: ['I will have been knowing her for a decade.', 'I will have known her for a decade.', 'I will have been believing this for years.', 'I will have been owning this house for years.'], correctIndex: 1, explanation: '"Know" is a state verb — always future perfect, never the continuous form.' },
            { question: 'A formal report best uses this tense when...', options: ['Any future fact is mentioned', 'The finished result is the only thing that matters', 'The ongoing effort or duration is specifically worth highlighting', 'The writer wants to sound more complex'], correctIndex: 2, explanation: 'This tense earns its place only when duration itself is genuinely relevant to the reader.' },
          ],
        },
      ],
    },
  },
];
