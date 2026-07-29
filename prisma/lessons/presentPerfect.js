// Present Perfect, split across three levels — same pattern as
// prisma/lessons/presentSimple.js.
const phrase = (target, translation, pronunciation) => ({ target, translation, pronunciation });

module.exports = [
  {
    title: 'Present Perfect Tense — Beginner',
    description: 'Connecting the past to now — experiences, unfinished time periods, and recent results.',
    duration: 20,
    content: {
      intro:
        "The present perfect connects the past to now — it's for experiences, unfinished time periods, and recent events that still matter. It's often the hardest tense for learners, because many languages don't have an exact equivalent.",
      sections: [
        {
          type: 'rule',
          title: 'When do we use it?',
          points: [
            'Life experiences, with no specific time given — "I have visited Paris."',
            'Actions that started in the past and continue now — "I have lived here for five years."',
            'Recently completed actions with a present result — "I have lost my keys" (so I can\'t get in now).',
            'News and recent announcements — "The president has resigned."',
          ],
        },
        {
          type: 'structure',
          title: 'How to build it',
          structureItems: [
            { label: 'Affirmative', pattern: 'Subject + have/has + past participle', example: 'They have finished the project.' },
            { label: 'Negative', pattern: "Subject + have/has + not + past participle", example: "She hasn't called yet." },
            { label: 'Question', pattern: 'Have/Has + subject + past participle?', example: 'Have you eaten?' },
          ],
        },
        {
          type: 'table',
          title: '"For" vs "since", and tricky participles',
          headers: ['Rule', 'Example'],
          rows: [
            ['for + a duration', 'for 5 years, for a long time, for two weeks'],
            ['since + a starting point', 'since 2020, since Monday, since I was born'],
            ['go → gone / been', 'He has gone to Paris (still there) vs He has been to Paris (visited, back now)'],
            ['Irregular participles worth memorizing', 'see → seen, eat → eaten, write → written'],
          ],
        },
        {
          type: 'table',
          title: 'Present perfect vs. past simple',
          headers: ['Present perfect', 'Past simple'],
          rows: [
            ['Unspecified time — "I have visited Paris."', 'A specific finished time — "I visited Paris in 2019."'],
            ['Still connects to now — "I have lost my keys" (can\'t get in right now)', 'Just a past fact — "I lost my keys yesterday" (found them already)'],
            ['Signal words: already, yet, just, ever, never, since, for', 'Signal words: yesterday, last week, in 2020, ago, when I was young'],
          ],
        },
        {
          type: 'phrases',
          title: 'Signal words',
          items: [
            phrase('already', 'Something happened before now, often sooner than expected', ''),
            phrase('yet', 'In negatives/questions, for something expected but not done', ''),
            phrase('just', 'Very recently', ''),
            phrase('ever', 'At any time — used in experience questions', ''),
            phrase('never', 'At no time', ''),
            phrase('since / for', 'Marks the start point or duration of a continuing action', ''),
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake',
          body:
            'Never use the present perfect with a specific finished time (yesterday, last week, in 2019, at 3pm). "I have visited Paris in 2019" ✗ — once you give a specific past date, switch to the past simple: "I visited Paris in 2019" ✓.',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Memory trick',
          body:
            '"Have/has + participle" means the result is still relevant NOW. Compare: "I lost my keys" (just a past fact) vs "I have lost my keys" (and that\'s why I\'m stuck outside right now).',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: 'I ___ (see) that film three times.', options: ['saw', 'have seen', 'seeing', 'see'], correctIndex: 1, explanation: 'Life experience, no specific time → present perfect.' },
            { question: 'She ___ in London since 2018.', options: ['lives', 'lived', 'has lived', 'is living'], correctIndex: 2, explanation: '"Since" + an ongoing situation starting in the past → present perfect.' },
            { question: 'Which sentence is correct?', options: ['I have visited Rome in 2020.', 'I visited Rome in 2020.', 'I have visit Rome in 2020.', 'I am visiting Rome in 2020.'], correctIndex: 1, explanation: 'A specific past time ("in 2020") needs the past simple, not present perfect.' },
            { question: '___ you ever tried sushi?', options: ['Did', 'Do', 'Have', 'Are'], correctIndex: 2, explanation: '"Ever" about experience → present perfect: "Have you ever...?"' },
            { question: "He has ___ (go) to the shop — he'll be back in 10 minutes.", options: ['went', 'gone', 'been', 'going'], correctIndex: 1, explanation: '"has gone" = he is still there/on the way; "has been" would mean he already returned.' },
          ],
        },
      ],
    },
  },
  {
    title: 'Present Perfect Tense — Elementary',
    description: 'Have you ever...? — talking about life experiences with confidence.',
    duration: 20,
    content: {
      intro:
        '"Have you ever...?" is one of the most useful questions in English — a great way to start conversations and get to know someone. Let\'s build a real toolkit of irregular participles and practise using it naturally.',
      sections: [
        {
          type: 'rule',
          title: 'Talking about experiences',
          points: [
            '"Have you ever...?" asks about experience at any point in your life — "Have you ever been to Japan?"',
            'Answer with "Yes, I have" / "No, I haven\'t/never have" — not the full sentence repeated.',
            '"This is the first/second/third time..." + present perfect highlights how many times something has happened — "This is the first time I\'ve tried sushi."',
            'You don\'t need "ever" in the affirmative — only in questions and with "never" — "I have been to Rome" (no "ever" needed).',
          ],
        },
        {
          type: 'table',
          title: 'The irregular participles you\'ll use most',
          headers: ['Base form', 'Past participle', 'Example'],
          rows: [
            ['go', 'been / gone', 'I have been to Kenya.'],
            ['see', 'seen', 'Have you seen this film?'],
            ['eat', 'eaten', "I've never eaten octopus."],
            ['do', 'done', "She's done this exercise before."],
            ['make', 'made', "We've made this mistake before."],
            ['write', 'written', "He's written three books."],
            ['read', 'read', "I've read that one already."],
            ['buy', 'bought', "I've just bought a new phone."],
            ['break', 'broken', "I've broken my arm before."],
            ['take', 'taken', "She's taken this route many times."],
          ],
        },
        {
          type: 'phrases',
          title: 'Short answers and follow-ups',
          items: [
            phrase('Yes, I have.', 'Confirms you have this experience', ''),
            phrase("No, I haven't.", 'You don\'t have this experience', ''),
            phrase('No, never!', 'A stronger, more emphatic "no"', ''),
            phrase('How many times?', 'A natural follow-up question', ''),
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake',
          body:
            'Don\'t add "ever" to a positive statement: "I have ever visited London" ✗ is wrong. "Ever" belongs in questions ("Have you ever...?") and negatives with "never" ("I have never visited London"). A simple positive statement just says "I have visited London."',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Memory trick',
          body:
            'Learn irregular participles in pairs you can picture: go→been/gone (a trip), see→seen (a film), eat→eaten (a meal), make→made (a mistake). Attaching a mini scene to each one makes them stick.',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: 'Have you ever ___ (eat) snails?', options: ['ate', 'eat', 'eaten', 'eating'], correctIndex: 2, explanation: 'Present perfect uses the past participle: "eaten".' },
            { question: '"Have you been to Paris?" — "___"', options: ['Yes, I do.', 'Yes, I have.', 'Yes, I am.', 'Yes, I was.'], correctIndex: 1, explanation: 'The short answer to a present perfect question repeats "have": "Yes, I have."' },
            { question: 'This is the ___ time I\'ve visited this museum.', options: ['one', 'first', 'once', 'firstly'], correctIndex: 1, explanation: '"This is the first time..." is the standard pattern with present perfect.' },
            { question: 'I ___ (never/break) a bone.', options: ['have never broken', 'never have broken', 'have ever broken', 'never broke'], correctIndex: 0, explanation: '"Never" goes between "have" and the past participle: "have never broken".' },
            { question: 'She ___ (write) three novels so far.', options: ['wrote', 'writes', 'has written', 'is writing'], correctIndex: 2, explanation: '"So far" signals present perfect for an ongoing count of achievements: "has written".' },
            { type: 'fill', question: 'Complete: Have you ever ___ to Italy? (one word — past participle of "go")', answer: 'been', explanation: '"Have you been to...?" is the standard experience question.' },
          ],
        },
      ],
    },
  },
  {
    title: 'Present Perfect Tense — Intermediate',
    description: 'Superlatives, "How many times", passive form, and where already/yet/still go.',
    duration: 20,
    content: {
      intro:
        "You've got the basics — now the patterns that come up constantly in real speech: talking about superlatives, counting experiences, and placing already/yet/still correctly.",
      sections: [
        {
          type: 'rule',
          title: 'Level up your present perfect',
          points: [
            'Superlatives almost always pair with present perfect — "This is the best meal I have ever had."',
            '"How many times...?" asks about repeated experiences up to now — "How many times have you been to London?"',
            'A passive form exists too — "The window has been broken."',
            '"Been to" (visited, and back) is different from "gone to" (went, and still there) — worth reinforcing beyond just knowing the words.',
          ],
        },
        {
          type: 'structure',
          title: 'Patterns worth memorizing',
          structureItems: [
            { label: 'Superlative pattern', pattern: 'This/It is the + superlative + noun + (that) + subject + have/has ever + participle', example: 'This is the funniest film I have ever seen.' },
            { label: 'Passive form', pattern: 'Subject + have/has + been + past participle', example: 'The window has been broken.' },
          ],
        },
        {
          type: 'table',
          title: 'Where already, yet, and still go',
          headers: ['Word', 'Position', 'Example'],
          rows: [
            ['already', 'Mid-sentence, between have/has and the participle, in affirmatives', 'I have already finished.'],
            ['yet', 'End of the sentence, in negatives and questions', "Have you finished yet? / I haven't finished yet."],
            ['still', 'Mid-sentence, usually negative, emphasizing something incomplete', "I still haven't finished."],
          ],
        },
        {
          type: 'phrases',
          title: 'Signal words',
          items: [
            phrase('how many times', 'Asks about the count of a repeated experience', ''),
            phrase('the first / second time', 'Marks an experience as new or repeated', ''),
            phrase('so far', 'Up to this point', ''),
            phrase('up to now', 'Counting everything until this moment', ''),
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake',
          body:
            'Don\'t stack "already" and "yet" in the same clause, or put "yet" in an affirmative sentence: "I have finished already yet" ✗. Use one or the other: "I have already finished." ✓ or "Have you finished yet?" ✓.',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Memory trick',
          body:
            'The superlative pattern is everywhere in real speech: "the best/worst/most [adjective] + noun + I\'ve ever + verb." Once it\'s automatic, you\'ll use present perfect naturally without translating in your head.',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: 'This is ___ book I have ever read.', options: ['the more boring', 'the most boring', 'more boring', 'boring'], correctIndex: 1, explanation: 'The superlative pattern needs the superlative form: "the most boring".' },
            { question: '___ have you been to Japan?', options: ['How much times', 'How many time', 'How many times', 'How long times'], correctIndex: 2, explanation: '"How many times" asks about a count of repeated experiences.' },
            { question: 'The email ___ (already/send) — you don\'t need to send it again.', options: ['already has been sent', 'has already been sent', 'has been already sent', 'has sent already'], correctIndex: 1, explanation: '"Already" sits between have/has and the participle: "has already been sent".' },
            { question: 'I ___ (not/finish) yet — give me five more minutes.', options: ["haven't finished", "don't finish", "didn't finish", "am not finishing"], correctIndex: 0, explanation: '"Yet" pairs with the present perfect negative: "haven\'t finished... yet".' },
            { question: 'He went to Kigali last week; he ___ (go) to Rwanda before, so this isn\'t his first time.', options: ['has been', 'has gone', 'went', 'is going'], correctIndex: 0, explanation: '"has been to" = visited before (and is not necessarily there now) — the experience sense.' },
          ],
        },
      ],
    },
  },
  {
    title: 'Present Perfect Tense — Advanced',
    description: 'News-style writing, formal register, and the British vs. American difference.',
    duration: 20,
    content: {
      intro:
        "At this level, present perfect becomes a writing and register tool — how journalists open a story, how formal English describes change over time, and one real difference between British and American usage.",
      sections: [
        {
          type: 'rule',
          title: 'Where present perfect gets sophisticated',
          points: [
            'News writing often opens with present perfect, then switches to past simple for the details — "Scientists have discovered a new species. The team found it while surveying the reef last month."',
            'Formal/academic register uses present perfect to describe accumulated change over an unspecified period — "Attitudes have changed significantly." / "The situation has deteriorated."',
            'Very recent statements can be reported with present perfect for continuing relevance — "She has said that the plan will go ahead."',
            'British and American English differ slightly: standard British English keeps present perfect with just/already/yet, while American English often allows past simple too — "I already ate" (American, informal) vs "I\'ve already eaten" (British, and the safe choice in formal writing or exams).',
          ],
        },
        {
          type: 'table',
          title: 'Present perfect in real writing: headline, then detail',
          headers: ['Opens with present perfect', 'Continues in past simple'],
          rows: [
            ['Scientists have discovered a new species of frog.', 'They found it deep in the Amazon rainforest last month.'],
            ['The company has announced record profits.', 'It reported a 40% increase in the last quarter.'],
          ],
        },
        {
          type: 'tip',
          variant: 'warning',
          title: 'Common mistake at this level',
          body:
            'Hearing "I already ate" or "Did you eat yet?" from an American speaker isn\'t wrong in their dialect — but in standard British English, in formal writing, and on exams like IELTS or Cambridge, stick with the present perfect: "I\'ve already eaten" / "Have you eaten yet?"',
        },
        {
          type: 'tip',
          variant: 'info',
          title: 'Writing technique',
          body:
            'State the headline fact in present perfect, then zoom into the past-simple detail. This "perfect → simple" shift is one of the most reliable ways to make writing sound professional and well-structured, in reports as well as news.',
        },
        {
          type: 'practice',
          title: 'Quick check',
          questions: [
            { question: 'Which opening line reads like a professional news report?', options: ['The team found new evidence yesterday.', 'The team has found new evidence.', 'The team was finding new evidence.', 'The team finds new evidence.'], correctIndex: 1, explanation: 'News writing typically opens with present perfect for the headline fact.' },
            { question: 'Formal register: "Public opinion ___ considerably over the last decade."', options: ['changed', 'has changed', 'is changing', 'change'], correctIndex: 1, explanation: 'Accumulated change over an unspecified period → present perfect.' },
            { question: 'The safest choice for a formal exam answer is:', options: ["I already ate lunch.", "I've already eaten lunch.", "I am already eating lunch.", "I already have eat lunch."], correctIndex: 1, explanation: 'Standard British English and formal/exam register keep present perfect with "already".' },
            { question: '"Scientists ___ a cure. They tested it on 500 patients last year."', options: ['have announced', 'announce', 'were announcing', 'announcing'], correctIndex: 0, explanation: 'Present perfect for the headline claim, then past simple for the narrated detail.' },
            { question: 'Which sentence best expresses an ongoing formal trend?', options: ['The economy improved.', 'The economy has been improving.', 'The economy improves.', 'The economy was improving.'], correctIndex: 1, explanation: 'An ongoing trend up to now, in formal register, fits present perfect (continuous).' },
          ],
        },
      ],
    },
  },
];
