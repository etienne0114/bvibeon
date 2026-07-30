// Future Perfect, split across four CEFR-aligned levels — same pattern as
// prisma/lessons/pastSimple.js.
const phrase = (target, translation, pronunciation) => ({ target, translation, pronunciation });

module.exports = [
  {
    title: 'Future Perfect Tense — Beginner',
    description: 'What will be finished by a specific future point.',
    duration: 20,
    content: {
      intro:
        "The future perfect looks ahead to a specific future point and confirms something will already be finished by then — like checking a milestone off a calendar in advance.",
      sections: [
        {
          type: 'rule',
          title: 'When do we use it?',
          points: [
            'An action that will be completed before a specific future time — "By next year, I will have graduated."',
            'A milestone or achievement measured against a future deadline — "By 2030, she will have worked here for 20 years."',
            'It always needs a stated or implied future reference point — "by [time]", "by the time", or similar.',
          ],
        },
        {
          type: 'structure',
          title: 'How to build it',
          structureItems: [
            { label: 'Affirmative', pattern: 'Subject + will have + past participle', example: 'They will have finished by 5pm.' },
            { label: 'Negative', pattern: "Subject + won't have + past participle", example: "She won't have arrived yet." },
            { label: 'Question', pattern: 'Will + subject + have + past participle?', example: 'Will you have finished by then?' },
          ],
        },
        {
          type: 'phrases',
          title: 'Signal words',
          items: [
            phrase('by [time]', 'A future deadline — "by 6pm", "by next year"', ''),
            phrase('by the time', 'Introduces the future reference point', ''),
            phrase('in [duration] from now', 'Counts forward to a future point — "in a year from now"', ''),
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake',
          body:
            'Don\'t drop "have": "I will graduated by then" ✗ is wrong — the full form always needs it: will + HAVE + past participle — "I will have graduated by then" ✓.',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Memory trick',
          body:
            'Picture standing at that future date, looking back — from there, the action is already finished. That backward glance from a future point is exactly what the future perfect describes.',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: 'By next month, I ___ (finish) this course.', options: ['finish', 'will finish', 'will have finished', 'have finished'], correctIndex: 2, explanation: 'Completed before a stated future point → future perfect.' },
            { question: 'By the time you arrive, we ___ (already/eat).', options: ['already eat', 'will already eat', 'will have already eaten', 'have already eaten'], correctIndex: 2, explanation: '"By the time" + a future action completed before it → future perfect.' },
            { question: '___ she have completed the project by Friday?', options: ['Does', 'Did', 'Will', 'Has'], correctIndex: 2, explanation: 'Future perfect questions begin with "Will".' },
            { question: 'By 2030, they ___ (not/pay off) the loan.', options: ["don't pay off", "won't pay off", "won't have paid off", "haven't paid off"], correctIndex: 2, explanation: 'A negative prediction about completion by a future point → future perfect.' },
            { question: 'In ten years, she ___ (become) a doctor.', options: ['becomes', 'will become', 'will have become', 'has become'], correctIndex: 2, explanation: 'An achievement measured against a future deadline → future perfect.' },
          ],
        },
      ],
    },
  },
  {
    title: 'Future Perfect Tense — Elementary',
    description: 'Combining "by the time" with everyday milestones.',
    duration: 20,
    content: {
      intro:
        "Let's practice the pattern you'll use constantly: \"by the time\" plus a future perfect result, and a handy reference table of irregular participles.",
      sections: [
        {
          type: 'rule',
          title: 'Linking a future point to a result',
          points: [
            '"By the time + present simple, + subject + will have + past participle" links a future moment to something already done — "By the time you wake up, I will have left for work."',
            'Birthdays, anniversaries, and deadlines are the most natural everyday contexts for this tense.',
            'Most of the participles you need are the same irregular forms you already know from the present and past perfect.',
          ],
        },
        {
          type: 'table',
          title: 'Ten irregular participles you\'ll use constantly',
          headers: ['Base form', 'Past participle', 'Example'],
          rows: [
            ['finish', 'finished', 'I will have finished by 6.'],
            ['write', 'written', 'She will have written the report by Friday.'],
            ['build', 'built', 'They will have built the bridge by next spring.'],
            ['read', 'read', 'He will have read the whole book by tonight.'],
            ['learn', 'learned', 'You will have learned this by the end of the course.'],
            ['leave', 'left', 'We will have left before you arrive.'],
            ['grow', 'grown', 'The plant will have grown a lot by summer.'],
            ['save', 'saved', 'I will have saved enough money by December.'],
            ['move', 'moved', 'They will have moved house by then.'],
            ['sell', 'sold', 'The shop will have sold out by noon.'],
          ],
        },
        {
          type: 'phrases',
          title: 'Signal phrases',
          items: [
            phrase('by my birthday', 'A common personal deadline', ''),
            phrase('by the end of the year', 'A common yearly milestone', ''),
            phrase('by then', 'Refers back to a future point already mentioned', ''),
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake',
          body:
            'Don\'t use "will" inside the "by the time" clause: "By the time I will arrive, they will have left" ✗. The time clause itself stays in the present simple: "By the time I arrive, they will have left" ✓.',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Memory trick',
          body:
            'Think of a countdown to a real date on your calendar — your birthday, New Year\'s, a deadline — and practice one future perfect sentence for each.',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: 'By the time she ___ (arrive), we will have left.', options: ['will arrive', 'arrives', 'arrived', 'has arrived'], correctIndex: 1, explanation: 'The "by the time" clause stays in the present simple, not "will".' },
            { question: 'By my birthday, I ___ (save) enough for a new phone.', options: ['save', 'will save', 'will have saved', 'have saved'], correctIndex: 2, explanation: 'Completed by a personal future deadline → future perfect.' },
            { question: 'They ___ (build) the new school by next spring.', options: ['build', 'will build', 'will have built', 'have built'], correctIndex: 2, explanation: '"Build" → "built"; completed by a future point → future perfect.' },
            { question: 'By the end of the year, he ___ (read) fifty books.', options: ['reads', 'will read', 'will have read', 'has read'], correctIndex: 2, explanation: 'A milestone measured against a yearly deadline → future perfect.' },
            { question: 'By the time you get home, I ___ (leave) already.', options: ['will leave', 'will have left', 'leave', 'left'], correctIndex: 1, explanation: '"Leave" → "left"; completed before another future point → future perfect.' },
          ],
        },
      ],
    },
  },
  {
    title: 'Future Perfect Tense — Intermediate',
    description: 'Future perfect vs future continuous, and confident assumptions about now.',
    duration: 20,
    content: {
      intro:
        "Let's sharpen the contrast between future perfect and the other future forms, and pick up a surprisingly common everyday use: guessing what's already true right now.",
      sections: [
        {
          type: 'rule',
          title: 'Level up your future perfect',
          points: [
            'Future perfect confirms completion by a future point; future continuous describes something still in progress at that point — very different meanings.',
            'Future perfect can express a confident assumption about the PRESENT, not just the future — "She\'ll have finished dinner by now" (a guess about right now, based on the clock).',
            'This "assumption about now" use pairs naturally with "by now" specifically, rather than a genuinely future "by [time]".',
            'It also works for negative assumptions — "He won\'t have seen the email yet" (a guess that he probably hasn\'t, based on timing).',
          ],
        },
        {
          type: 'table',
          title: 'Future perfect vs future continuous',
          headers: ['Future perfect', 'Future continuous'],
          rows: [
            ['Confirms completion by a future point — "By 6pm, I will have finished."', 'Describes something still in progress at that point — "At 6pm, I will be finishing."'],
            ['Can guess about the present — "She\'ll have arrived by now."', 'Can guess about the present too, but framed as ongoing — "She\'ll be arriving about now."'],
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake',
          body:
            'Don\'t use future perfect when the action is still ongoing at the reference point — "By 6pm, I will have cooked dinner" (implies finished) is wrong if you actually mean you\'ll still be cooking then; that needs future continuous instead.',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Memory trick',
          body:
            '"By now" + future perfect is a handy way to make a confident guess about the present — "They\'ll have landed by now" sounds natural even though you\'re really talking about right now, not the future.',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: 'It\'s almost midnight — they ___ (land) by now.', options: ['land', 'will land', "will have landed", 'are landing'], correctIndex: 2, explanation: 'A confident assumption about the present, using "by now" → future perfect.' },
            { question: 'By 6pm, I ___ (still/cook) dinner — don\'t expect it ready.', options: ['will still have cooked', 'will still be cooking', 'still cook', 'am still cooking'], correctIndex: 1, explanation: 'Still in progress at that future point → future continuous, not future perfect.' },
            { question: 'He ___ (not/see) the message yet — it\'s only been five minutes.', options: ["doesn't see", "won't see", "won't have seen", "isn't seeing"], correctIndex: 2, explanation: 'A negative assumption about the present based on timing → future perfect.' },
            { question: 'By December, she ___ (complete) her degree.', options: ['completes', 'will complete', 'will have completed', 'is completing'], correctIndex: 2, explanation: 'Completion confirmed by a future deadline → future perfect.' },
            { question: 'Which best expresses "still going on" at 8pm tomorrow?', options: ['I will have left by 8pm.', 'I will be leaving at 8pm.', 'I will leave at 8pm.', 'I have left by 8pm.'], correctIndex: 1, explanation: 'Future continuous describes something in progress at that specific moment.' },
          ],
        },
      ],
    },
  },
  {
    title: 'Future Perfect Tense — Advanced',
    description: 'Formal projections, and pairing with the future perfect continuous.',
    duration: 20,
    content: {
      intro:
        "At this level, the future perfect is a genuine business and academic tool — for milestone projections — and it's worth knowing exactly when its continuous cousin does the job better.",
      sections: [
        {
          type: 'rule',
          title: 'Where future perfect gets sophisticated',
          points: [
            'Business and academic writing uses future perfect for long-term projections — "By 2030, the company will have doubled its revenue."',
            'When the DURATION of the run-up matters more than the finished result, the future perfect continuous is the better choice (its own topic, coming next) — "By 2030, the company will have been operating for a decade" emphasizes the span, not just the milestone.',
            'The time clause after "by the time" always stays in the present simple, even in the most formal registers — this rule never relaxes.',
            'Future perfect can combine with other future perfects in one sentence to build a layered projection — "By the time the plan is approved, costs will have risen and the budget will have been revised twice."',
          ],
        },
        {
          type: 'table',
          title: 'Result-focused vs duration-focused projection',
          headers: ['Future perfect (result)', 'Future perfect continuous (duration)'],
          rows: [
            ['By 2030, sales will have doubled.', 'By 2030, the company will have been growing steadily for a decade.'],
            ['By June, she will have published her thesis.', 'By June, she will have been researching this topic for three years.'],
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake at this level',
          body:
            'Don\'t break the time-clause rule even in formal writing: "By the time the merger will be finalized, costs will have risen" ✗. The time clause always stays present simple: "By the time the merger is finalized, costs will have risen" ✓.',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Writing tip',
          body:
            'When drafting a projection, ask: is the READER more interested in the finished milestone, or in how long the effort took to get there? That answer picks future perfect or future perfect continuous for you.',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: 'By the time the report ___ (submit), the figures will have changed.', options: ['will be submitted', 'is submitted', 'submits', 'has been submitted'], correctIndex: 1, explanation: 'The time clause after "by the time" always stays in the present simple.' },
            { question: 'Which sentence emphasizes DURATION rather than a finished milestone?', options: ['By 2030, sales will have doubled.', 'By 2030, the firm will have been trading for 50 years.', 'By 2030, we will have launched three products.', 'By 2030, the team will have completed the project.'], correctIndex: 1, explanation: 'The continuous form ("will have been trading") foregrounds the span of time, not just a finished result.' },
            { question: 'By next quarter, the team ___ (finish) phase one and ___ (start) phase two.', options: ['will have finished / will have started', 'will finish / will start', 'finishes / starts', 'will have finished / starts'], correctIndex: 0, explanation: 'A layered projection can chain two future perfects together.' },
            { question: 'Correct the formal-register error: "By the time the policy will take effect, prices will have risen."', options: ['By the time the policy takes effect, prices will have risen.', 'By the time the policy will have taken effect, prices rise.', 'By the time the policy takes effect, prices rise.', 'By the time the policy took effect, prices will rise.'], correctIndex: 0, explanation: 'The time clause must stay in the present simple, even in formal writing.' },
            { question: 'By the end of the meeting, the board ___ (approve) the new budget.', options: ['approves', 'will approve', 'will have approved', 'will be approving'], correctIndex: 2, explanation: 'A finished result confirmed by a future point → future perfect.' },
          ],
        },
      ],
    },
  },
];
