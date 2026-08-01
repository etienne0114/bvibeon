const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Lesson content is structured JSON the frontend renders directly:
// { intro, sections: [{ type: 'phrases'|'tip', ... }] }
const phrase = (target, translation, pronunciation) => ({ target, translation, pronunciation });

// Deep, multi-level tense content lives in its own file per topic (e.g.
// beginner/intermediate/advanced Present Simple) so this file doesn't keep
// growing without bound as more tenses get the same treatment.
const presentSimpleLessons = require('./lessons/presentSimple');
const presentContinuousLessons = require('./lessons/presentContinuous');
const presentPerfectLessons = require('./lessons/presentPerfect');
const presentPerfectContinuousLessons = require('./lessons/presentPerfectContinuous');
const pastSimpleLessons = require('./lessons/pastSimple');
const pastContinuousLessons = require('./lessons/pastContinuous');
const pastPerfectLessons = require('./lessons/pastPerfect');
const pastPerfectContinuousLessons = require('./lessons/pastPerfectContinuous');
const futureSimpleLessons = require('./lessons/futureSimple');
const futureContinuousLessons = require('./lessons/futureContinuous');
const futurePerfectLessons = require('./lessons/futurePerfect');
const futurePerfectContinuousLessons = require('./lessons/futurePerfectContinuous');

const COURSES = [
  {
    title: 'Kinyarwanda for Beginners',
    description: 'Greetings, family, market talk and daily life — build a real Kinyarwanda foundation with audio-first lessons.',
    level: 'BEGINNER',
    category: 'LANGUAGE',
    estimatedDuration: 240,
    imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
    tags: JSON.stringify(['kinyarwanda', 'beginner', 'speaking']),
    lessons: [
      {
        title: 'Greetings & introductions',
        description: 'Say hello, introduce yourself, and ask how someone is doing.',
        duration: 12,
        content: {
          intro: 'Kinyarwanda greetings change with the time of day and how well you know someone. Master these and every conversation opens up.',
          sections: [
            {
              type: 'phrases',
              title: 'Key phrases',
              items: [
                phrase('Muraho', 'Hello', 'moo-RAH-ho'),
                phrase('Mwaramutse', 'Good morning', 'mwah-rah-MOO-tseh'),
                phrase('Mwiriwe', 'Good afternoon/evening', 'mwee-REE-weh'),
                phrase('Nitwa...', 'My name is...', 'NEE-twah'),
                phrase('Amakuru?', 'How are you?', 'ah-mah-KOO-roo'),
                phrase('Ni meza', 'I am fine', 'nee MEH-zah'),
              ],
            },
            {
              type: 'rule',
              title: 'Which greeting, and when?',
              points: [
                '"Muraho" works at any time of day — the safest default if you\'re unsure.',
                '"Mwaramutse" is specifically a morning greeting — don\'t use it after lunch.',
                '"Mwiriwe" covers the afternoon and evening.',
                '"Amakuru?" ("How are you? / What\'s the news?") is the natural follow-up after any greeting.',
              ],
            },
            { type: 'tip', title: 'Culture tip', body: 'A handshake with the right hand, sometimes holding your own right forearm with the left hand, shows extra respect.' },
            {
              type: 'practice',
              title: 'Quick check',
              questions: [
                { question: 'Which greeting is safe to use at any time of day?', options: ['Mwaramutse', 'Mwiriwe', 'Muraho', 'Murakoze'], correctIndex: 2, explanation: '"Muraho" works at any time — the other two are time-specific.' },
                { question: 'How do you say "My name is..."?', options: ['Amakuru?', 'Ni meza', 'Nitwa...', 'Muraho'], correctIndex: 2, explanation: '"Nitwa..." introduces your name.' },
                { question: 'Someone asks "Amakuru?" — what\'s a natural reply?', options: ['Nitwa...', 'Ni meza', 'Mwaramutse', 'Muraho'], correctIndex: 1, explanation: '"Ni meza" ("I am fine") is the standard reply to "Amakuru?"' },
                { question: 'Which greeting should you avoid using after lunch?', options: ['Muraho', 'Mwiriwe', 'Mwaramutse', 'Amakuru'], correctIndex: 2, explanation: '"Mwaramutse" is a morning-only greeting.' },
                { type: 'fill', question: 'Complete: "___, amakuru?" (a greeting that works any time of day, one word)', answer: 'Muraho', explanation: '"Muraho" is the safe, all-purpose greeting to pair with "amakuru?"' },
              ],
            },
          ],
        },
      },
      {
        title: 'Numbers & counting',
        description: 'Count from 1 to 100 and use numbers in daily situations.',
        duration: 10,
        content: {
          intro: 'Numbers unlock prices, time, and quantities. Kinyarwanda numbers follow a consistent pattern once you know 1–10.',
          sections: [
            {
              type: 'phrases',
              title: 'Numbers 1–10',
              items: [
                phrase('Rimwe', 'One', 'REEM-weh'),
                phrase('Kabiri', 'Two', 'kah-BEE-ree'),
                phrase('Gatatu', 'Three', 'gah-TAH-too'),
                phrase('Kane', 'Four', 'KAH-neh'),
                phrase('Gatanu', 'Five', 'gah-TAH-noo'),
                phrase('Icumi', 'Ten', 'ee-CHOO-mee'),
              ],
            },
            {
              type: 'table',
              title: 'Building numbers past ten',
              headers: ['Pattern', 'Example'],
              rows: [
                ['icumi na + number', 'icumi na rimwe = 11 ("ten and one")'],
                ['icumi na kabiri', '12 ("ten and two")'],
                ['makumyabiri', '20 (its own word, not built from icumi)'],
              ],
            },
            { type: 'tip', title: 'Practice idea', body: 'Count objects around you out loud — plates, chairs, steps as you climb them.' },
            {
              type: 'practice',
              title: 'Quick check',
              questions: [
                { question: 'Which number is "gatatu"?', options: ['One', 'Two', 'Three', 'Four'], correctIndex: 2, explanation: '"Gatatu" means three.' },
                { question: 'How do you say "ten"?', options: ['Kane', 'Gatanu', 'Icumi', 'Kabiri'], correctIndex: 2, explanation: '"Icumi" means ten.' },
                { question: '"Icumi na rimwe" means...', options: ['Nine', 'Ten', 'Eleven', 'Twelve'], correctIndex: 2, explanation: '"Icumi na rimwe" = "ten and one" = eleven.' },
                { type: 'fill', question: 'Complete: "___ na kabiri" means twelve. (one word)', answer: 'icumi', explanation: '"Icumi na kabiri" = "ten and two" = twelve.' },
              ],
            },
          ],
        },
      },
      {
        title: 'Family & people',
        description: 'Talk about your family and describe the people around you.',
        duration: 14,
        content: {
          intro: 'Family sits at the heart of Rwandan life — these words come up in nearly every conversation.',
          sections: [
            {
              type: 'phrases',
              title: 'Family words',
              items: [
                phrase('Umuryango', 'Family', 'oo-moo-RYAHN-go'),
                phrase('Mama', 'Mother', 'MAH-mah'),
                phrase('Papa', 'Father', 'PAH-pah'),
                phrase('Umuvandimwe', 'Sibling', 'oo-moo-vahn-DEEM-weh'),
                phrase('Umukobwa', 'Girl/daughter', 'oo-moo-KOH-bwah'),
                phrase('Umuhungu', 'Boy/son', 'oo-moo-HOON-goo'),
              ],
            },
            {
              type: 'tip',
              variant: 'info',
              title: 'Saying "my"',
              body: 'Add "wanjye" after the word to say "my" — "umuryango wanjye" (my family), "mama wanjye" (my mother). You\'ll hear this pattern constantly.',
            },
            {
              type: 'practice',
              title: 'Quick check',
              questions: [
                { question: 'How do you say "mother"?', options: ['Papa', 'Mama', 'Umukobwa', 'Umuhungu'], correctIndex: 1, explanation: '"Mama" means mother.' },
                { question: 'Which word means "family"?', options: ['Umuvandimwe', 'Umuryango', 'Umuhungu', 'Papa'], correctIndex: 1, explanation: '"Umuryango" means family.' },
                { question: 'How would you say "my family"?', options: ['Umuryango wanjye', 'Wanjye umuryango', 'Umuryango mama', 'Mama wanjye umuryango'], correctIndex: 0, explanation: '"Wanjye" ("my") comes right after the noun: "umuryango wanjye".' },
                { type: 'fill', question: 'Complete: "Umuhungu" means... (one English word)', answer: 'boy', acceptableAnswers: ['son'], explanation: '"Umuhungu" means boy or son.' },
              ],
            },
          ],
        },
      },
      {
        title: 'At the market',
        description: 'Ask prices, bargain politely, and buy what you need.',
        duration: 15,
        content: {
          intro: 'Markets are where language comes alive. Learn to ask, bargain, and thank with confidence.',
          sections: [
            {
              type: 'phrases',
              title: 'Market phrases',
              items: [
                phrase('Ni angahe?', 'How much is it?', 'nee ahn-GAH-heh'),
                phrase('Birahenze', 'It is expensive', 'bee-rah-HEHN-zeh'),
                phrase('Gabanya gato', 'Lower the price a little', 'gah-BAH-nyah GAH-toh'),
                phrase('Ndashaka...', 'I want...', 'ndah-SHAH-kah'),
                phrase('Murakoze', 'Thank you', 'moo-rah-KOH-zeh'),
              ],
            },
            { type: 'tip', title: 'Culture tip', body: 'Bargaining is normal and friendly — smile, stay warm, and agree on a fair price.' },
            {
              type: 'practice',
              title: 'Quick check',
              questions: [
                { question: 'How do you ask "How much is it?"', options: ['Birahenze', 'Ni angahe?', 'Ndashaka...', 'Murakoze'], correctIndex: 1, explanation: '"Ni angahe?" asks the price.' },
                { question: 'A seller quotes a high price. How do you say "It is expensive"?', options: ['Gabanya gato', 'Birahenze', 'Ndashaka...', 'Ni angahe?'], correctIndex: 1, explanation: '"Birahenze" means "it is expensive".' },
                { question: 'How do you politely ask the seller to lower the price a little?', options: ['Ni angahe?', 'Murakoze', 'Gabanya gato', 'Ndashaka...'], correctIndex: 2, explanation: '"Gabanya gato" asks for a small price reduction.' },
                { type: 'fill', question: 'Complete: after agreeing on a price, you say "___" to thank the seller. (one word)', answer: 'Murakoze', explanation: '"Murakoze" means thank you.' },
              ],
            },
          ],
        },
      },
      {
        title: 'Food & drinks',
        description: 'Order food, express preferences, and enjoy Rwandan cuisine.',
        duration: 12,
        content: {
          intro: 'From brochettes to isombe — order like a local and never go hungry.',
          sections: [
            {
              type: 'phrases',
              title: 'Food words',
              items: [
                phrase('Ibiryo', 'Food', 'ee-BEE-ryoh'),
                phrase('Amazi', 'Water', 'ah-MAH-zee'),
                phrase('Umuceri', 'Rice', 'oo-moo-CHEH-ree'),
                phrase('Inyama', 'Meat', 'ee-NYAH-mah'),
                phrase('Ndashonje', 'I am hungry', 'ndah-SHOHN-jeh'),
                phrase('Biraryoshye!', 'It is delicious!', 'bee-rah-RYOH-shyeh'),
              ],
            },
            {
              type: 'tip',
              variant: 'info',
              title: 'A genuine compliment',
              body: 'Saying "Biraryoshye!" after a meal is always appreciated — it\'s the natural way to compliment someone\'s cooking or a restaurant\'s food.',
            },
            {
              type: 'practice',
              title: 'Quick check',
              questions: [
                { question: 'How do you say "I am hungry"?', options: ['Biraryoshye!', 'Ndashonje', 'Amazi', 'Inyama'], correctIndex: 1, explanation: '"Ndashonje" means "I am hungry".' },
                { question: 'Which word means "rice"?', options: ['Umuceri', 'Inyama', 'Ibiryo', 'Amazi'], correctIndex: 0, explanation: '"Umuceri" means rice.' },
                { question: 'How do you compliment a delicious meal?', options: ['Ndashonje', 'Ibiryo', 'Biraryoshye!', 'Amazi'], correctIndex: 2, explanation: '"Biraryoshye!" means "It is delicious!"' },
                { type: 'fill', question: 'Complete: "Inyama" means... (one English word)', answer: 'meat', explanation: '"Inyama" means meat.' },
              ],
            },
          ],
        },
      },
      {
        title: 'Getting around',
        description: 'Directions, transport, and moving around town.',
        duration: 13,
        content: {
          intro: 'Moto, bus, or on foot — ask for directions and get where you are going.',
          sections: [
            {
              type: 'phrases',
              title: 'Directions',
              items: [
                phrase('He?', 'Where?', 'heh'),
                phrase('Iburyo', 'Right', 'ee-BOO-ryoh'),
                phrase('Ibumoso', 'Left', 'ee-boo-MOH-soh'),
                phrase('Imbere', 'Straight ahead', 'eem-BEH-reh'),
                phrase('Ndagiye i...', 'I am going to...', 'ndah-GEE-yeh ee'),
              ],
            },
            { type: 'tip', title: 'Safety tip', body: 'Always agree the moto fare before hopping on: "Ni angahe kugera i...?"' },
            {
              type: 'practice',
              title: 'Quick check',
              questions: [
                { question: 'How do you ask "Where?"', options: ['Imbere', 'He?', 'Iburyo', 'Ibumoso'], correctIndex: 1, explanation: '"He?" means "Where?"' },
                { question: 'Which word means "left"?', options: ['Iburyo', 'Ibumoso', 'Imbere', 'He?'], correctIndex: 1, explanation: '"Ibumoso" means left.' },
                { question: 'How do you say "I am going to..."?', options: ['He?', 'Imbere', 'Ndagiye i...', 'Iburyo'], correctIndex: 2, explanation: '"Ndagiye i..." means "I am going to..."' },
                { type: 'fill', question: 'Complete: "Iburyo" means... (one English word)', answer: 'right', explanation: '"Iburyo" means right (direction).' },
              ],
            },
          ],
        },
      },
    ],
    quiz: {
      title: 'Kinyarwanda basics check',
      lessonIndex: 5,
      questions: [
        { text: 'How do you say "Hello" in Kinyarwanda?', options: ['Murakoze', 'Muraho', 'Mwiriwe', 'Amakuru'], correctAnswer: 'Muraho', explanation: '"Muraho" is the general greeting; "Mwiriwe" is for the afternoon.' },
        { text: '"Ni angahe?" means...', options: ['Where is it?', 'What is your name?', 'How much is it?', 'How are you?'], correctAnswer: 'How much is it?', explanation: 'Essential at any market!' },
        { text: 'Which word means "water"?', options: ['Inyama', 'Amazi', 'Umuceri', 'Ibiryo'], correctAnswer: 'Amazi', explanation: '"Amazi" is water; "inyama" is meat.' },
        { text: '"Murakoze" means...', options: ['Goodbye', 'Please', 'Thank you', 'Excuse me'], correctAnswer: 'Thank you', explanation: 'You will use this constantly.' },
      ],
    },
    vocabulary: [
      ['Muraho', 'Hello'], ['Murakoze', 'Thank you'], ['Amazi', 'Water'], ['Ibiryo', 'Food'],
      ['Umuryango', 'Family'], ['Amakuru', 'How are you / news'], ['Icumi', 'Ten'], ['Iburyo', 'Right (direction)'],
    ].map(([word, definition]) => ({ word, definition, language: 'rw' })),
  },
  {
    title: 'Everyday English',
    description: 'Practical English for work, travel and conversation — grammar that sticks through real situations.',
    level: 'BEGINNER',
    category: 'LANGUAGE',
    estimatedDuration: 240,
    imageUrl: 'https://images.unsplash.com/photo-1543109740-4bdb38fda756?w=800',
    tags: JSON.stringify(['english', 'beginner', 'conversation']),
    lessons: [
      {
        title: 'Introducing yourself',
        description: 'Name, origin, work — handle any first meeting.',
        duration: 12,
        content: {
          intro: 'First impressions run on a handful of sentences. Make them automatic.',
          sections: [
            {
              type: 'phrases',
              title: 'Key sentences',
              items: [
                phrase("Hi, I'm Ange.", 'Greeting + name', ''),
                phrase("I'm from Kigali.", 'Origin', ''),
                phrase('I work as a nurse.', 'Occupation', ''),
                phrase('Nice to meet you!', 'Polite closing', ''),
              ],
            },
            {
              type: 'structure',
              title: '"I\'m" covers most of it',
              structureItems: [
                { label: 'Name', pattern: "I'm + name", example: "I'm Ange." },
                { label: 'Origin', pattern: "I'm from + place", example: "I'm from Kigali." },
                { label: 'Feeling', pattern: "I'm + adjective", example: "I'm happy to be here." },
              ],
            },
            { type: 'tip', title: 'Grammar note', body: 'Use "I\'m" (I am) for name, origin and feelings: I\'m Ange, I\'m from Kigali, I\'m happy.' },
            {
              type: 'practice',
              title: 'Quick check',
              questions: [
                { question: '"___ from Kigali." (complete with the contraction)', options: ["I'm", 'I is', 'I be', 'Am'], correctIndex: 0, explanation: '"I\'m" (I am) + from + place states your origin.' },
                { question: 'Which is the polite way to end a first meeting?', options: ["I'm from Kigali.", 'Nice to meet you!', 'I work as a nurse.', "Hi, I'm Ange."], correctIndex: 1, explanation: '"Nice to meet you!" is the standard polite closing.' },
                { question: 'How do you state your job?', options: ["I'm from Kigali.", 'I work as a nurse.', 'Nice to meet you!', "Hi, I'm Ange."], correctIndex: 1, explanation: '"I work as a..." states your occupation.' },
                { type: 'fill', question: 'Complete: "I\'m ___ to meet you." (one word, a polite adjective)', answer: 'happy', acceptableAnswers: ['glad', 'pleased'], explanation: '"I\'m happy/glad/pleased to meet you" are all natural polite options.' },
              ],
            },
          ],
        },
      },
      {
        title: 'Present simple in daily life',
        description: 'Talk about routines and habits correctly.',
        duration: 14,
        content: {
          intro: 'The present simple carries most daily conversation. The only trap: the third-person -s.',
          sections: [
            {
              type: 'phrases',
              title: 'Patterns',
              items: [
                phrase('I wake up at 6.', 'Routine', ''),
                phrase('She works in Huye.', 'Third person adds -s', ''),
                phrase("He doesn't eat meat.", 'Negative with does', ''),
                phrase('Do you speak French?', 'Question with do', ''),
              ],
            },
            {
              type: 'structure',
              title: 'The three shapes of present simple',
              structureItems: [
                { label: 'Affirmative', pattern: 'Subject + verb (+s for he/she/it)', example: 'She works in Huye.' },
                { label: 'Negative', pattern: "Subject + don't/doesn't + verb", example: "He doesn't eat meat." },
                { label: 'Question', pattern: 'Do/Does + subject + verb?', example: 'Do you speak French?' },
              ],
            },
            { type: 'tip', title: 'Common mistake', body: '"She work here" → "She workS here". The -s only appears with he/she/it.' },
            {
              type: 'practice',
              title: 'Quick check',
              questions: [
                { question: 'She ___ (work) in Huye.', options: ['work', 'works', 'working', 'is work'], correctIndex: 1, explanation: 'He/she/it takes -s: "works".' },
                { question: '___ you speak French?', options: ['Do', 'Does', 'Are', 'Is'], correctIndex: 0, explanation: '"You" uses "Do", not "Does".' },
                { question: 'He ___ (not/eat) meat.', options: ["don't eat", "doesn't eat", "isn't eat", 'not eats'], correctIndex: 1, explanation: 'Negative with he/she/it: "doesn\'t" + base verb.' },
                { type: 'fill', question: 'Complete: "I ___ up at 6 every day." (base form of "wake")', answer: 'wake', explanation: 'No -s needed for "I" — the base form is correct.' },
              ],
            },
          ],
        },
      },
      {
        title: 'Past tense stories',
        description: 'Regular and irregular past — tell what happened.',
        duration: 15,
        content: {
          intro: 'Yesterday I goed... went! Irregular verbs are the heart of English storytelling.',
          sections: [
            {
              type: 'phrases',
              title: 'Irregular verbs',
              items: [
                phrase('go → went', 'Yesterday I went to the market.', ''),
                phrase('buy → bought', 'I bought some fruits.', ''),
                phrase('eat → ate', 'We ate together.', ''),
                phrase('see → saw', 'I saw my friend.', ''),
                phrase('have → had', 'I had a great day.', ''),
              ],
            },
            {
              type: 'table',
              title: 'Regular verbs: just add -ed',
              headers: ['Verb', 'Past'],
              rows: [
                ['work', 'worked'],
                ['play', 'played'],
                ['study', 'studied (y → ied)'],
              ],
            },
            {
              type: 'tip',
              variant: 'warning',
              title: 'Common mistake',
              body: 'Irregular verbs never take -ed: "goed" ✗, "buyed" ✗ are both wrong. Learn them as pairs: go → went, buy → bought.',
            },
            {
              type: 'practice',
              title: 'Quick check',
              questions: [
                { question: 'Yesterday I ___ (go) to the market.', options: ['go', 'goed', 'went', 'gone'], correctIndex: 2, explanation: '"Go" is irregular: go → went.' },
                { question: 'She ___ (study) hard for the exam.', options: ['studyed', 'studied', 'studies', 'study'], correctIndex: 1, explanation: 'Consonant + y → ied: "studied".' },
                { question: 'We ___ (eat) together last night.', options: ['eated', 'ate', 'eaten', 'eat'], correctIndex: 1, explanation: '"Eat" is irregular: eat → ate.' },
                { type: 'fill', question: 'Complete: "I ___ some fruits at the market." (past of "buy")', answer: 'bought', explanation: '"Buy" is irregular: buy → bought.' },
              ],
            },
          ],
        },
      },
      {
        title: 'Asking for help & directions',
        description: 'Polite questions that get you unstuck anywhere.',
        duration: 11,
        content: {
          intro: 'A polite question opens every door. Learn the shapes that always work.',
          sections: [
            {
              type: 'phrases',
              title: 'Useful questions',
              items: [
                phrase('Excuse me, where is the bank?', 'Location', ''),
                phrase('Could you help me, please?', 'Help', ''),
                phrase('How do I get to the airport?', 'Directions', ''),
                phrase('Could you say that again?', 'Clarification', ''),
              ],
            },
            {
              type: 'structure',
              title: 'Polite question starters',
              structureItems: [
                { label: 'Getting attention', pattern: 'Excuse me, ...?', example: 'Excuse me, where is the bank?' },
                { label: 'Asking a favour', pattern: 'Could you + verb + please?', example: 'Could you help me, please?' },
              ],
            },
            {
              type: 'tip',
              variant: 'info',
              title: 'Why "could" instead of "can"',
              body: '"Could you...?" sounds softer and more polite than "Can you...?" — a small word swap that makes any request friendlier.',
            },
            {
              type: 'practice',
              title: 'Quick check',
              questions: [
                { question: 'What\'s the polite way to get someone\'s attention before a question?', options: ['Hey you,', 'Excuse me,', 'Listen,', 'You there,'], correctIndex: 1, explanation: '"Excuse me," is the standard polite opener.' },
                { question: 'Which sounds more polite?', options: ['Can you help me?', 'Could you help me, please?', 'Help me.', 'You must help me.'], correctIndex: 1, explanation: '"Could you... please?" is the most polite option.' },
                { question: 'You didn\'t hear someone clearly. What do you say?', options: ['Could you say that again?', 'Where is the bank?', 'Excuse me, where...', 'Could you help me?'], correctIndex: 0, explanation: '"Could you say that again?" politely asks for repetition.' },
                { type: 'fill', question: 'Complete: "___ you help me, please?" (one word)', answer: 'Could', explanation: '"Could you help me, please?" is the polite standard.' },
              ],
            },
          ],
        },
      },
      {
        title: 'At work: emails & meetings',
        description: 'Professional English fundamentals.',
        duration: 16,
        content: {
          intro: 'A few fixed phrases cover 80% of workplace communication.',
          sections: [
            {
              type: 'phrases',
              title: 'Work phrases',
              items: [
                phrase('I hope this email finds you well.', 'Email opener', ''),
                phrase('Please find attached...', 'Attachments', ''),
                phrase("Let's schedule a meeting.", 'Planning', ''),
                phrase('I will follow up by Friday.', 'Commitment', ''),
              ],
            },
            {
              type: 'table',
              title: 'Casual vs professional register',
              headers: ['Casual', 'Professional'],
              rows: [
                ['Hey, quick question...', "I hope this email finds you well. I have a quick question..."],
                ["I'll get back to you.", 'I will follow up by Friday.'],
                ['Here it is.', 'Please find attached...'],
              ],
            },
            {
              type: 'practice',
              title: 'Quick check',
              questions: [
                { question: 'Which is a professional email opener?', options: ['Hey!', 'I hope this email finds you well.', "What's up?", 'Yo,'], correctIndex: 1, explanation: 'This is the standard professional greeting for emails.' },
                { question: 'How do you professionally mention an attached file?', options: ['Here it is.', 'Please find attached...', "It's attached, look.", 'Check the file.'], correctIndex: 1, explanation: '"Please find attached..." is the standard professional phrase.' },
                { question: 'How do you commit to a deadline professionally?', options: ["I'll get to it.", 'I will follow up by Friday.', 'Maybe soon.', "I'll try."], correctIndex: 1, explanation: 'A specific day makes the commitment clear and professional.' },
                { type: 'fill', question: 'Complete: "Let\'s ___ a meeting." (one word)', answer: 'schedule', explanation: '"Let\'s schedule a meeting" is the standard planning phrase.' },
              ],
            },
          ],
        },
      },
      {
        title: 'Future plans',
        description: 'Will, going to, and the present continuous for plans.',
        duration: 12,
        content: {
          intro: 'English has three futures — each with its own flavour of certainty.',
          sections: [
            {
              type: 'phrases',
              title: 'Three futures',
              items: [
                phrase("I'll call you tonight.", 'Spontaneous decision (will)', ''),
                phrase("I'm going to study medicine.", 'Intention (going to)', ''),
                phrase("I'm meeting Ange tomorrow.", 'Arrangement (present continuous)', ''),
              ],
            },
            {
              type: 'table',
              title: 'Which future to use',
              headers: ['Form', 'Job'],
              rows: [
                ['will', 'A decision made right now, or a prediction'],
                ['going to', 'A plan or intention already decided'],
                ['present continuous', 'A fixed arrangement (time and place set)'],
              ],
            },
            {
              type: 'practice',
              title: 'Quick check',
              questions: [
                { question: 'The phone is ringing. "I ___ (get) it!"', options: ['will get', 'am going to get', 'get', 'got'], correctIndex: 0, explanation: 'A spontaneous decision made right now → "will".' },
                { question: 'I already decided last week: "I ___ (study) medicine."', options: ['will study', 'am going to study', 'study', 'studied'], correctIndex: 1, explanation: 'A plan decided before now → "going to".' },
                { question: '"I\'m meeting Ange tomorrow" expresses...', options: ['A habit', 'An arrangement', 'A spontaneous decision', 'The past'], correctIndex: 1, explanation: 'Present continuous is used for fixed plans/arrangements.' },
                { type: 'fill', question: 'Complete: "I think it ___ rain tomorrow." (opinion-based prediction, one word)', answer: 'will', explanation: 'An opinion-based prediction with no hard evidence uses "will".' },
              ],
            },
          ],
        },
      },
    ],
    quiz: {
      title: 'Everyday English check',
      lessonIndex: 5,
      questions: [
        { text: 'Choose the correct sentence:', options: ['She work here.', 'She works here.', 'She working here.', 'She is work here.'], correctAnswer: 'She works here.', explanation: 'Third person singular adds -s in present simple.' },
        { text: 'The past tense of "buy" is...', options: ['buyed', 'bought', 'buys', 'buying'], correctAnswer: 'bought', explanation: '"Buy" is irregular: buy → bought.' },
        { text: 'Which is a polite request?', options: ['Give me that.', 'I want that now.', 'Could you help me, please?', 'You must help me.'], correctAnswer: 'Could you help me, please?', explanation: '"Could you... please?" is the standard polite form.' },
        { text: '"I\'m meeting Ange tomorrow" expresses...', options: ['A habit', 'An arrangement', 'A spontaneous decision', 'The past'], correctAnswer: 'An arrangement', explanation: 'Present continuous is used for fixed plans.' },
      ],
    },
    vocabulary: [
      ['schedule', 'A plan of times for events or tasks'], ['attach', 'To include a file with an email'],
      ['follow up', 'To check progress after an earlier action'], ['directions', 'Instructions for how to get somewhere'],
      ['routine', 'Things you do regularly'], ['arrangement', 'A fixed plan with someone'],
      ['polite', 'Showing good manners'], ['irregular', 'Not following the usual pattern'],
    ].map(([word, definition]) => ({ word, definition, language: 'en' })),
  },
  {
    title: 'English Grammar: Present Tenses',
    description: 'Present simple, continuous, perfect, and perfect continuous — each one taught at beginner, intermediate, and advanced level, with an interactive check throughout, and a side-by-side comparison to lock it all in.',
    level: 'BEGINNER',
    category: 'LANGUAGE',
    estimatedDuration: 255,
    imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
    tags: JSON.stringify(['grammar', 'tenses', 'english']),
    lessons: [
      ...presentSimpleLessons,
      ...presentContinuousLessons,
      ...presentPerfectLessons,
      ...presentPerfectContinuousLessons,
      {
        title: 'Present Tenses Compared',
        description: 'All four present tenses, side by side — the fastest way to stop confusing them.',
        duration: 15,
        content: {
          intro: "You've learned all four present tenses individually — now let's put them side by side. Seeing the contrast directly, with the same verb across all four, is the fastest way to make the differences stick.",
          sections: [
            {
              type: 'table',
              title: 'The four present tenses at a glance',
              headers: ['Tense', 'Focus', 'Example'],
              rows: [
                ['Present simple', 'Habits, facts, permanent truths', 'She works in Kigali.'],
                ['Present continuous', 'Happening now, temporary, fixed future plans', 'She is working right now.'],
                ['Present perfect', 'Result or experience, unspecified time', 'She has worked here for years.'],
                ['Present perfect continuous', 'Duration and ongoing process, may still continue', 'She has been working here since 2019.'],
              ],
            },
            {
              type: 'table',
              title: 'Same verb, four meanings',
              headers: ['Tense', 'Sentence', 'Meaning'],
              rows: [
                ['Present simple', 'He writes novels.', "His job or habit — he's a novelist."],
                ['Present continuous', 'He is writing a novel.', 'Right now, in progress, temporary.'],
                ['Present perfect', 'He has written three novels.', 'Achievement so far — a count, unspecified time.'],
                ['Present perfect continuous', 'He has been writing this novel for two years.', 'The ongoing process, emphasizing duration — maybe unfinished.'],
              ],
            },
            {
              type: 'table',
              title: 'Bonus: tag questions across the tenses',
              headers: ['Tense', 'Statement', 'Tag question'],
              rows: [
                ['Present simple', 'She works here,', "doesn't she?"],
                ['Present continuous', "You're coming,", "aren't you?"],
                ['Present perfect', "He's finished,", "hasn't he?"],
                ['Present perfect continuous', "They've been waiting,", "haven't they?"],
              ],
            },
            {
              type: 'tip',
              variant: 'info',
              title: 'How tag questions work',
              body: 'A positive statement gets a negative tag; a negative statement gets a positive tag. The tag always borrows the SAME auxiliary as the main verb — do/does, am/is/are, or have/has — which is exactly why it\'s worth knowing all four tenses well.',
            },
            {
              type: 'tip',
              variant: 'info',
              title: 'Quick decision guide',
              body: "Ask yourself: Is it a HABIT or FACT? → present simple. Is it happening RIGHT NOW or temporary? → present continuous. Is it a RESULT or an experience with no specific time? → present perfect. Is it about ongoing DURATION or a process? → present perfect continuous.",
            },
            {
              type: 'tip',
              variant: 'warning',
              title: 'For French speakers: two traps to watch for',
              body: 'French "passé composé" (j\'ai vu) looks just like the present perfect (I have seen), but French uses it for finished past time too — "I have seen him yesterday" ✗ is a classic slip; English needs the past simple once a specific time is named: "I saw him yesterday" ✓. Second: French says "depuis" with the present tense ("je travaille ici depuis 2020"), which produces "I work here since 2020" ✗ — English needs the present perfect for this: "I have worked here since 2020" ✓.',
            },
            {
              type: 'practice',
              title: 'Mixed review',
              questions: [
                { question: 'Every morning, she ___ (drink) coffee before work.', options: ['drinks', 'is drinking', 'has drunk', 'has been drinking'], correctIndex: 0, explanation: 'A daily habit → present simple.' },
                { question: 'Look! It ___ (rain).', options: ['rains', 'is raining', 'has rained', 'has been raining'], correctIndex: 1, explanation: 'Happening right now → present continuous.' },
                { question: "I ___ (finish) my homework — I'm free now!", options: ['finish', 'am finishing', 'have finished', 'have been finishing'], correctIndex: 2, explanation: 'A completed action with a present result → present perfect.' },
                { question: 'We ___ (wait) for the bus for 20 minutes already.', options: ['wait', 'are waiting', 'have waited', 'have been waiting'], correctIndex: 3, explanation: 'Duration up to now, still ongoing → present perfect continuous.' },
                { question: 'The Earth ___ (orbit) the sun.', options: ['orbits', 'is orbiting', 'has orbited', 'has been orbiting'], correctIndex: 0, explanation: 'A permanent scientific fact → present simple.' },
                { question: 'She ___ (live) in Paris since 2015.', options: ['lives', 'is living', 'has lived', 'is live'], correctIndex: 2, explanation: '"Since" + an unspecified ongoing fact → present perfect.' },
                { question: 'She works here, ___?', options: ["doesn't she", "isn't she", "does she", "hasn't she"], correctIndex: 0, explanation: 'Present simple affirmative → negative tag with "doesn\'t".' },
                { type: 'fill', question: 'Correct the French-speaker slip: "I have seen him yesterday." → "I ___ him yesterday." (past simple)', answer: 'saw', explanation: 'A specific past time ("yesterday") needs the past simple, not the present perfect.' },
              ],
            },
          ],
        },
      },
    ],
    vocabulary: [
      ['always', 'Present simple signal word: 100% of the time, a permanent habit'],
      ['usually', 'Present simple signal word: very often, as a general habit'],
      ['currently', 'Present continuous signal word: happening at this time'],
      ['already', 'Present perfect signal word: before now, often sooner than expected'],
      ['yet', 'Present perfect signal word: used in questions/negatives for something expected but not done'],
      ['since', 'Present perfect signal word: marks the starting point of a continuing action (since 2020)'],
      ['recently', 'Present perfect continuous signal word: not long ago, often still relevant'],
      ['still', 'Present perfect continuous signal word: the activity has not stopped'],
    ].map(([word, definition]) => ({ word, definition, language: 'en' })),
  },
  {
    title: 'English Grammar: Past Tenses',
    description: 'Past simple, continuous, perfect, and perfect continuous — each one taught at beginner, elementary, intermediate, and advanced level, with an interactive check throughout, and a side-by-side comparison to lock it all in.',
    level: 'BEGINNER',
    category: 'LANGUAGE',
    estimatedDuration: 340,
    imageUrl: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800',
    tags: JSON.stringify(['grammar', 'tenses', 'english', 'past']),
    lessons: [
      ...pastSimpleLessons,
      ...pastContinuousLessons,
      ...pastPerfectLessons,
      ...pastPerfectContinuousLessons,
      {
        title: 'Past Tenses Compared',
        description: 'All four past tenses, side by side — the fastest way to stop confusing them.',
        duration: 15,
        content: {
          intro: "You've learned all four past tenses individually — now let's put them side by side. Seeing the contrast directly, with the same verb across all four, is the fastest way to make the differences stick.",
          sections: [
            {
              type: 'table',
              title: 'The four past tenses at a glance',
              headers: ['Tense', 'Focus', 'Example'],
              rows: [
                ['Past simple', 'Completed actions, sequences, facts no longer true', 'She worked in Kigali.'],
                ['Past continuous', 'In progress at a specific past moment, background/scene-setting', 'She was working at 8pm.'],
                ['Past perfect', 'Completed before another past point — the "past before the past"', 'She had worked there for years before she left.'],
                ['Past perfect continuous', 'Duration or process before another past point', 'She had been working there since 2015 when it closed.'],
              ],
            },
            {
              type: 'table',
              title: 'Same verb, four meanings',
              headers: ['Tense', 'Sentence', 'Meaning'],
              rows: [
                ['Past simple', 'He wrote a novel.', 'A single finished achievement.'],
                ['Past continuous', 'He was writing a novel when I called.', 'In progress at that moment — background.'],
                ['Past perfect', 'He had written a novel before he turned 20.', 'Completed before another past point.'],
                ['Past perfect continuous', 'He had been writing the novel for two years when he gave up.', 'The ongoing process/duration before that point.'],
              ],
            },
            {
              type: 'table',
              title: 'Bonus: tag questions across the tenses',
              headers: ['Tense', 'Statement', 'Tag question'],
              rows: [
                ['Past simple', 'She worked here,', "didn't she?"],
                ['Past continuous', 'You were watching,', "weren't you?"],
                ['Past perfect', "He'd finished,", "hadn't he?"],
                ['Past perfect continuous', "They'd been waiting,", "hadn't they?"],
              ],
            },
            {
              type: 'tip',
              variant: 'info',
              title: 'Quick decision guide',
              body: "Ask yourself: Is it a finished action or sequence? → past simple. Was it in progress at a specific moment, or setting the scene? → past continuous. Did it happen before another past event (a result)? → past perfect. Was it an ongoing duration or process before that other past point? → past perfect continuous.",
            },
            {
              type: 'tip',
              variant: 'warning',
              title: 'The universal trap: over-using "had"',
              body: 'Once "had" starts to feel natural, it\'s tempting to use it for every past sentence out of caution. "I had woken up and had eaten breakfast before school" ✗ over-marks two ordinary sequential actions. Plain past simple is correct here: "I woke up and ate breakfast before school" ✓. Save "had" for when the ORDER of two past events genuinely needs clarifying.',
            },
            {
              type: 'practice',
              title: 'Mixed review',
              questions: [
                { question: 'While I ___ (study), my phone ___ (ring).', options: ['was studying / rang', 'studied / was ringing', 'was studying / was ringing', 'studied / rang'], correctIndex: 0, explanation: 'Background action in progress (continuous) interrupted by a shorter event (simple).' },
                { question: 'By the time we arrived, the film ___ (already/start).', options: ['already started', 'had already started', 'has already started', 'was already starting'], correctIndex: 1, explanation: 'Completed before another past point → past perfect.' },
                { question: 'She ___ (live) in Nairobi for six years before she moved to Kigali.', options: ['lived', 'was living', 'had been living', 'has lived'], correctIndex: 2, explanation: 'Duration/process before another past event (moving) → past perfect continuous.' },
                { question: 'He ___ (finish) his homework, so he went out to play.', options: ['finished', 'had finished', 'has finished', 'was finishing'], correctIndex: 1, explanation: 'Completed before the next past action (going out) → past perfect.' },
                { question: 'Last night at 9pm, I ___ (watch) my favorite show.', options: ['watched', 'was watching', 'had watched', 'have watched'], correctIndex: 1, explanation: 'A specific past moment, action in progress → past continuous.' },
                { question: 'They ___ (already/leave) when we ___ (get) there.', options: ['already left / got', 'had already left / got', 'already left / had gotten', 'had already left / had got'], correctIndex: 1, explanation: 'The earlier event (leaving) takes past perfect; the later one (getting there) takes plain past simple.' },
                { question: 'He finished the race, ___?', options: ["doesn't he", "didn't he", "hasn't he", "wasn't he"], correctIndex: 1, explanation: 'The tag question borrows the same auxiliary as a past simple statement: "didn\'t he?"' },
                { type: 'fill', question: "Correct the overcorrection: \"I had woken up and had eaten breakfast before school.\" → The natural version is: \"I ___ up and ate breakfast before school.\" (one word)", answer: 'woke', explanation: 'A simple past sequence with no second reference point just needs plain past simple: "woke up and ate breakfast".' },
              ],
            },
          ],
        },
      },
    ],
    vocabulary: [
      ['ago', 'Past simple signal word: counts backward from now (two days ago)'],
      ['already', 'Past perfect signal word: before the other past event, often sooner than expected'],
      ['while', 'Past continuous signal word: marks a background action alongside another'],
      ['by the time', 'Past perfect signal word: introduces the later reference point'],
      ['used to', 'Describes a past habit or state that no longer holds'],
      ['how long', 'Past perfect continuous signal word: asks about duration before a past point'],
    ].map(([word, definition]) => ({ word, definition, language: 'en' })),
  },
  {
    title: 'English Grammar: Future Tenses',
    description: 'Future simple, continuous, perfect, and perfect continuous — each one taught at beginner, elementary, intermediate, and advanced level, with an interactive check throughout, and a side-by-side comparison to lock it all in.',
    level: 'BEGINNER',
    category: 'LANGUAGE',
    estimatedDuration: 340,
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
    tags: JSON.stringify(['grammar', 'tenses', 'english', 'future']),
    lessons: [
      ...futureSimpleLessons,
      ...futureContinuousLessons,
      ...futurePerfectLessons,
      ...futurePerfectContinuousLessons,
      {
        title: 'Future Tenses Compared',
        description: 'All four future tenses, side by side — the fastest way to stop confusing them.',
        duration: 15,
        content: {
          intro: "You've learned all four future tenses individually — now let's put them side by side. Seeing the contrast directly, with the same verb across all four, is the fastest way to make the differences stick.",
          sections: [
            {
              type: 'table',
              title: 'The four future tenses at a glance',
              headers: ['Tense', 'Focus', 'Example'],
              rows: [
                ['Future simple', 'Decisions, predictions, promises, plain facts', 'She will call you.'],
                ['Future continuous', 'In progress at a specific future moment', 'She will be calling clients at 3pm.'],
                ['Future perfect', 'Completed by a specific future point', 'She will have called everyone by 5pm.'],
                ['Future perfect continuous', 'Duration or process up to a future point', 'She will have been calling clients for two hours by 5pm.'],
              ],
            },
            {
              type: 'table',
              title: 'Same verb, four meanings',
              headers: ['Tense', 'Sentence', 'Meaning'],
              rows: [
                ['Future simple', 'He will write a report.', 'A plain future action or decision.'],
                ['Future continuous', 'He will be writing the report at 3pm.', 'In progress at that specific moment.'],
                ['Future perfect', 'He will have written the report by Friday.', 'Completed by a future deadline.'],
                ['Future perfect continuous', 'He will have been writing the report for a week by Friday.', 'The ongoing process/duration before that point.'],
              ],
            },
            {
              type: 'table',
              title: 'Bonus: tag questions across the tenses',
              headers: ['Tense', 'Statement', 'Tag question'],
              rows: [
                ["Future simple", "She'll call you,", "won't she?"],
                ['Future continuous', "You'll be staying,", "won't you?"],
                ['Future perfect', "He'll have finished,", "won't he?"],
                ['Future perfect continuous', "They'll have been waiting,", "won't they?"],
              ],
            },
            {
              type: 'tip',
              variant: 'info',
              title: 'Quick decision guide',
              body: "Ask yourself: Is it a decision, prediction, or promise? → future simple. Will it be in progress at a specific future moment? → future continuous. Will it be finished BY a future point? → future perfect. Will it be an ongoing duration or process reaching that point? → future perfect continuous.",
            },
            {
              type: 'tip',
              variant: 'warning',
              title: 'The universal trap: "will" in time clauses',
              body: 'Every single future tense shares the same rule, and it\'s the most common future-tense mistake in English: a time clause after when/after/before/as soon as/until always stays in the PRESENT simple, never "will" — "I\'ll text you when I will arrive" ✗ is wrong no matter which future tense the main clause uses. "I\'ll text you when I arrive" ✓.',
            },
            {
              type: 'practice',
              title: 'Mixed review',
              questions: [
                { question: "The phone's ringing — I ___ (answer) it.", options: ['will answer', 'will be answering', 'will have answered', 'will have been answering'], correctIndex: 0, explanation: 'A spontaneous decision made right now → future simple.' },
                { question: 'This time next week, I ___ (relax) on a beach.', options: ['will relax', 'will be relaxing', 'will have relaxed', 'will have been relaxing'], correctIndex: 1, explanation: 'In progress at a specific future moment → future continuous.' },
                { question: 'By 2030, scientists ___ (discover) a cure.', options: ['will discover', 'will be discovering', 'will have discovered', 'will have been discovering'], correctIndex: 2, explanation: 'A confirmed result by a future point → future perfect.' },
                { question: 'By then, I ___ (study) medicine for six years.', options: ['will study', 'will be studying', 'will have studied', 'will have been studying'], correctIndex: 3, explanation: 'Duration reaching a future point, emphasized by "for six years" → future perfect continuous.' },
                { question: "You'll be coming to the wedding, ___?", options: ["won't you", "don't you", "aren't you", "haven't you"], correctIndex: 0, explanation: 'The tag question borrows the same auxiliary as the statement: "won\'t you?"' },
                { question: "I'll call you when I ___ (arrive).", options: ['will arrive', 'arrive', 'am arriving', 'arrived'], correctIndex: 1, explanation: 'Future time clauses always use the present simple, never "will".' },
                { question: 'By the time she retires, she ___ (work) here for 25 years.', options: ['will work', 'will be working', 'will have worked', 'will have been working'], correctIndex: 3, explanation: 'A long duration reaching a future milestone → future perfect continuous.' },
                { type: 'fill', question: "Correct the classic mistake: \"I'll text you when I will arrive.\" → The natural version is: \"I'll text you when I ___.\" (one word)", answer: 'arrive', explanation: 'Future time clauses always stay in the present simple, no matter which future tense the main clause uses.' },
              ],
            },
          ],
        },
      },
    ],
    vocabulary: [
      ['tomorrow', 'Future simple signal word: the day after today'],
      ['soon', 'Future simple signal word: in the near future'],
      ['by the time', 'Future perfect signal word: introduces the future reference point'],
      ['this time next week', 'Future continuous signal word: the same future moment, one week ahead'],
      ['going to', 'Signals a plan already decided, or a prediction from present evidence'],
      ['how long', 'Future perfect continuous signal word: asks about duration up to a future point'],
    ].map(([word, definition]) => ({ word, definition, language: 'en' })),
  },
  {
    title: 'Français pratique',
    description: 'Le français utile de tous les jours : salutations, courses, voyages et conversations réelles.',
    level: 'BEGINNER',
    category: 'LANGUAGE',
    estimatedDuration: 240,
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
    tags: JSON.stringify(['french', 'français', 'beginner']),
    lessons: [
      {
        title: 'Salutations et présentations',
        description: 'Se présenter et saluer avec naturel.',
        duration: 12,
        content: {
          intro: 'Bonjour, bonsoir, salut — chaque salutation a son moment. Commençons.',
          sections: [
            {
              type: 'phrases',
              title: 'Phrases clés',
              items: [
                phrase('Bonjour !', 'Hello / Good morning', 'bohn-ZHOOR'),
                phrase("Je m'appelle...", 'My name is...', 'zhuh mah-PELL'),
                phrase('Enchanté(e) !', 'Nice to meet you!', 'ahn-shahn-TAY'),
                phrase('Comment ça va ?', 'How are you?', 'koh-mahn sah VAH'),
                phrase('Ça va bien, merci.', 'I am fine, thank you.', 'sah vah byan mehr-SEE'),
              ],
            },
            { type: 'tip', title: 'Astuce', body: '"Salut" is informal — use "Bonjour" with strangers and in shops.' },
            {
              type: 'structure',
              title: 'Tu ou vous ?',
              structureItems: [
                { label: 'Tu', pattern: 'Friends, family, children', example: 'Tu vas bien ? (informal)' },
                { label: 'Vous', pattern: 'Strangers, elders, formal/professional contexts', example: 'Comment allez-vous ? (formal)' },
              ],
            },
            {
              type: 'practice',
              title: 'Vérification rapide',
              questions: [
                { question: 'You meet a shopkeeper for the first time. Which greeting?', options: ['Salut !', 'Bonjour !', 'Ça va ?', 'À bientôt'], correctIndex: 1, explanation: '"Bonjour" is the safe, polite default with strangers.' },
                { question: 'How do you introduce your name?', options: ['Ça va bien.', "Je m'appelle...", 'Enchanté(e) !', 'Comment ça va ?'], correctIndex: 1, explanation: '"Je m\'appelle..." means "My name is...".' },
                { question: 'Talking to your teacher, you should use...', options: ['tu', 'vous', 'salut', 'toi'], correctIndex: 1, explanation: '"Vous" is the respectful/formal form used with people you don\'t know well or who are in authority.' },
                { type: 'fill', question: 'Complete: "Enchanté(e) !" means "Nice to ___ you!" (one word)', answer: 'meet', explanation: '"Enchanté(e) !" is said right after being introduced to someone.' },
              ],
            },
          ],
        },
      },
      {
        title: "Les nombres et l'heure",
        description: "Compter et dire l'heure.",
        duration: 11,
        content: {
          intro: 'Les nombres français ont quelques surprises (soixante-dix !). On les apprivoise pas à pas.',
          sections: [
            {
              type: 'phrases',
              title: 'Nombres',
              items: [
                phrase('un, deux, trois', '1, 2, 3', 'uh, duh, twah'),
                phrase('dix', '10', 'dees'),
                phrase('vingt', '20', 'van'),
                phrase('soixante-dix', '70', 'swah-sahnt-DEES'),
                phrase('Quelle heure est-il ?', 'What time is it?', 'kell uhr eh-TEEL'),
              ],
            },
            {
              type: 'table',
              title: 'Le piège des dizaines',
              headers: ['Nombre', 'Literally'],
              rows: [
                ['soixante-dix (70)', 'sixty-ten'],
                ['quatre-vingts (80)', 'four-twenties'],
                ['quatre-vingt-dix (90)', 'four-twenty-ten'],
              ],
            },
            {
              type: 'tip',
              variant: 'info',
              title: 'Pourquoi c\'est ainsi',
              body: 'French counting switches to a base-20 pattern from 70–99 — a historical quirk. Practice these three out loud; they trip up every learner at first.',
            },
            {
              type: 'practice',
              title: 'Vérification rapide',
              questions: [
                { question: 'Comment dit-on "70" ?', options: ['soixante', 'soixante-dix', 'quatre-vingts', 'dix-sept'], correctIndex: 1, explanation: '70 = "soixante-dix" (sixty-ten).' },
                { question: 'Comment dit-on "80" ?', options: ['quatre-vingts', 'huitante', 'soixante-dix', 'quatre-dix'], correctIndex: 0, explanation: '80 = "quatre-vingts" (four-twenties).' },
                { question: '"Quelle heure est-il ?" demande...', options: ['Where is it?', 'What time is it?', 'How much?', 'Who is it?'], correctIndex: 1, explanation: 'This phrase asks for the current time.' },
                { type: 'fill', question: 'Complete: "quatre-vingt-___" = 90 (one word for the last part)', answer: 'dix', explanation: '90 = "quatre-vingt-dix" (four-twenty-ten).' },
              ],
            },
          ],
        },
      },
      {
        title: 'Au café et au restaurant',
        description: 'Commander à manger et à boire.',
        duration: 14,
        content: {
          intro: 'Commander en français est un plaisir — et un excellent exercice.',
          sections: [
            {
              type: 'phrases',
              title: 'Au restaurant',
              items: [
                phrase("Je voudrais un café, s'il vous plaît.", 'I would like a coffee, please.', ''),
                phrase("L'addition, s'il vous plaît.", 'The bill, please.', ''),
                phrase("C'est délicieux !", 'It is delicious!', ''),
                phrase("Qu'est-ce que vous recommandez ?", 'What do you recommend?', ''),
              ],
            },
            { type: 'tip', title: 'Astuce', body: '"Je voudrais" (I would like) is far more polite than "je veux" (I want).' },
            {
              type: 'structure',
              title: 'La formule de la politesse',
              structureItems: [
                { label: 'Order', pattern: "Je voudrais + item, s'il vous plaît.", example: "Je voudrais un café, s'il vous plaît." },
                { label: 'Ask for the bill', pattern: "L'addition, s'il vous plaît.", example: "L'addition, s'il vous plaît." },
              ],
            },
            {
              type: 'practice',
              title: 'Vérification rapide',
              questions: [
                { question: 'The most polite way to order is...', options: ['Je veux un café.', "Je voudrais un café, s'il vous plaît.", 'Café !', "Donnez-moi un café."], correctIndex: 1, explanation: '"Je voudrais... s\'il vous plaît" is the polite standard.' },
                { question: 'How do you ask for the bill?', options: ["C'est délicieux !", "L'addition, s'il vous plaît.", 'Je cherche...', "Qu'est-ce que vous recommandez ?"], correctIndex: 1, explanation: '"L\'addition, s\'il vous plaît" is the standard phrase to ask for the bill.' },
                { question: 'How do you ask for a recommendation?', options: ["C'est délicieux !", "Qu'est-ce que vous recommandez ?", "L'addition, s'il vous plaît.", 'Je voudrais...'], correctIndex: 1, explanation: '"Qu\'est-ce que vous recommandez ?" asks what the server suggests.' },
                { type: 'fill', question: 'Complete: "Je ___ un café, s\'il vous plaît." (polite form of "want")', answer: 'voudrais', explanation: '"Voudrais" (would like) is more polite than "veux" (want).' },
              ],
            },
          ],
        },
      },
      {
        title: 'Faire les courses',
        description: 'Acheter, demander les prix, comparer.',
        duration: 13,
        content: {
          intro: 'Au marché ou au supermarché, les mêmes phrases reviennent toujours.',
          sections: [
            {
              type: 'phrases',
              title: 'Les courses',
              items: [
                phrase('Combien ça coûte ?', 'How much does it cost?', ''),
                phrase("C'est trop cher.", 'It is too expensive.', ''),
                phrase('Je cherche...', 'I am looking for...', ''),
                phrase('Je prends celui-ci.', 'I will take this one.', ''),
              ],
            },
            {
              type: 'table',
              title: '"Ce/cet/cette" — this/that',
              headers: ['Form', 'Used with'],
              rows: [
                ['ce', 'masculine noun (ce pain)'],
                ['cet', 'masculine noun starting with a vowel sound (cet ananas)'],
                ['cette', 'feminine noun (cette pomme)'],
              ],
            },
            {
              type: 'practice',
              title: 'Vérification rapide',
              questions: [
                { question: 'Comment demander le prix ?', options: ["C'est trop cher.", 'Combien ça coûte ?', 'Je cherche...', 'Je prends celui-ci.'], correctIndex: 1, explanation: '"Combien ça coûte ?" asks for the price.' },
                { question: '"Ce pain" — pourquoi "ce" et pas "cette" ?', options: ['pain is feminine', 'pain is masculine', 'pain starts with a vowel', 'no reason'], correctIndex: 1, explanation: '"Pain" is masculine, so it takes "ce".' },
                { question: 'How do you say "I am looking for..."?', options: ['Je prends...', 'Je cherche...', "C'est trop cher.", 'Combien ?'], correctIndex: 1, explanation: '"Je cherche..." means "I am looking for...".' },
                { type: 'fill', question: 'Complete: "___ pomme est délicieuse." (feminine form of "this")', answer: 'Cette', explanation: '"Pomme" (apple) is feminine, so it takes "cette".' },
              ],
            },
          ],
        },
      },
      {
        title: 'Demander son chemin',
        description: 'Directions et transports.',
        duration: 12,
        content: {
          intro: 'Perdu ? Trois questions suffisent pour retrouver votre chemin.',
          sections: [
            {
              type: 'phrases',
              title: 'Directions',
              items: [
                phrase('Où est la gare ?', 'Where is the station?', ''),
                phrase('À droite / à gauche', 'To the right / left', ''),
                phrase('Tout droit', 'Straight ahead', ''),
                phrase("C'est loin d'ici ?", 'Is it far from here?', ''),
              ],
            },
            {
              type: 'structure',
              title: 'Poser une question de lieu',
              structureItems: [
                { label: 'Location', pattern: 'Où est + place ?', example: 'Où est la gare ?' },
                { label: 'Distance', pattern: "C'est loin d'ici ?", example: "C'est loin d'ici ?" },
              ],
            },
            {
              type: 'practice',
              title: 'Vérification rapide',
              questions: [
                { question: 'Comment demander où se trouve la gare ?', options: ['Tout droit', 'Où est la gare ?', 'À droite', "C'est loin d'ici ?"], correctIndex: 1, explanation: '"Où est...?" asks where something is located.' },
                { question: '"Tout droit" veut dire...', options: ['To the right', 'To the left', 'Straight ahead', 'Far away'], correctIndex: 2, explanation: '"Tout droit" means "straight ahead".' },
                { question: 'How do you ask if a place is far?', options: ['Où est la gare ?', "C'est loin d'ici ?", 'À droite', 'Tout droit'], correctIndex: 1, explanation: '"C\'est loin d\'ici ?" asks about distance.' },
                { type: 'fill', question: 'Complete: "À ___" = "to the left" (one word)', answer: 'gauche', explanation: '"À gauche" means "to the left"; "à droite" means "to the right".' },
              ],
            },
          ],
        },
      },
      {
        title: 'Parler de soi au passé',
        description: 'Le passé composé pour raconter sa journée.',
        duration: 15,
        content: {
          intro: "Le passé composé : avoir ou être + participe passé. C'est la clé du récit.",
          sections: [
            {
              type: 'phrases',
              title: 'Passé composé',
              items: [
                phrase("J'ai mangé", 'I ate (avoir + mangé)', ''),
                phrase('Je suis allé(e)', 'I went (être + allé)', ''),
                phrase("J'ai vu mes amis", 'I saw my friends', ''),
                phrase('Nous avons voyagé', 'We travelled', ''),
              ],
            },
            { type: 'tip', title: 'Règle', body: 'Movement verbs (aller, venir, partir...) take "être"; most others take "avoir".' },
            {
              type: 'table',
              title: 'Avoir ou être ?',
              headers: ['Auxiliaire', 'Verbes'],
              rows: [
                ['avoir', 'la plupart des verbes : manger → mangé, voir → vu, voyager → voyagé'],
                ['être', 'verbes de mouvement : aller → allé, venir → venu, partir → parti'],
              ],
            },
            {
              type: 'tip',
              variant: 'warning',
              title: "L'accord avec être",
              body: 'With "être" verbs, the past participle agrees with the subject\'s gender/number: "Je suis allé" (masculine) vs "Je suis allée" (feminine).',
            },
            {
              type: 'practice',
              title: 'Vérification rapide',
              questions: [
                { question: '"Manger" prend quel auxiliaire ?', options: ['avoir', 'être', 'les deux', 'aucun'], correctIndex: 0, explanation: '"Manger" is a regular verb, so it takes "avoir": "J\'ai mangé".' },
                { question: '"Aller" prend quel auxiliaire ?', options: ['avoir', 'être', 'les deux', 'aucun'], correctIndex: 1, explanation: '"Aller" is a movement verb, so it takes "être": "Je suis allé(e)".' },
                { question: 'A woman says "I went" — which is correct?', options: ['Je suis allé', 'Je suis allée', "J'ai allé", "J'ai allée"], correctIndex: 1, explanation: 'With "être", the participle agrees with a feminine subject: "allée".' },
                { type: 'fill', question: 'Complete: "Nous ___ voyagé." (auxiliary "avoir", nous form)', answer: 'avons', explanation: '"Voyager" takes "avoir": "Nous avons voyagé".' },
              ],
            },
          ],
        },
      },
    ],
    quiz: {
      title: 'Français pratique — contrôle',
      lessonIndex: 5,
      questions: [
        { text: 'Comment dit-on "My name is..." ?', options: ['Je voudrais...', "Je m'appelle...", 'Je cherche...', 'Je prends...'], correctAnswer: "Je m'appelle...", explanation: '"Je m\'appelle" introduces your name.' },
        { text: '"Combien ça coûte ?" veut dire...', options: ['Where is it?', 'What time is it?', 'How much does it cost?', 'Is it far?'], correctAnswer: 'How much does it cost?', explanation: 'Essential for shopping.' },
        { text: 'Quel est le plus poli ?', options: ['Je veux un café.', 'Un café !', "Je voudrais un café, s'il vous plaît.", 'Café, vite.'], correctAnswer: "Je voudrais un café, s'il vous plaît.", explanation: '"Je voudrais... s\'il vous plaît" is the polite standard.' },
        { text: '"Je suis allé au marché" utilise...', options: ['avoir', 'être', 'faire', 'aller seul'], correctAnswer: 'être', explanation: 'Aller is a movement verb — passé composé with être.' },
      ],
    },
    vocabulary: [
      ['bonjour', 'Hello / good day'], ['merci', 'Thank you'], ['la gare', 'Train station'],
      ["l'addition", 'The bill'], ['cher', 'Expensive'], ['à gauche', 'To the left'],
      ['je voudrais', 'I would like'], ['délicieux', 'Delicious'],
    ].map(([word, definition]) => ({ word, definition, language: 'fr' })),
  },
];

// Curated dictionary cache entries so vocabulary practice has real, instant
// content on a fresh install instead of depending on third-party dictionary
// APIs (dictionaryapi.dev, datamuse, wiktionary...) being fast/reachable.
const DICTIONARY_SEED = [
  { word: 'muraho', language: 'rw', definition: 'Hello / a general greeting', pronunciation: 'moo-RAH-ho', partOfSpeech: 'interjection', examples: ['Muraho, amakuru?'], synonyms: [] },
  { word: 'murakoze', language: 'rw', definition: 'Thank you', pronunciation: 'moo-rah-KOH-zeh', partOfSpeech: 'interjection', examples: ['Murakoze cyane!'], synonyms: [] },
  { word: 'amakuru', language: 'rw', definition: 'News / how are you', pronunciation: 'ah-mah-KOO-roo', partOfSpeech: 'noun', examples: ['Amakuru yawe?'], synonyms: [] },
  { word: 'tugende', language: 'rw', definition: "Let's go", pronunciation: 'too-GEHN-deh', partOfSpeech: 'verb phrase', examples: ['Tugende ku isoko.'], synonyms: [] },
  { word: 'ubuzima', language: 'rw', definition: 'Health / life', pronunciation: 'oo-boo-ZEE-mah', partOfSpeech: 'noun', examples: ['Ubuzima bwiza!'], synonyms: [] },
  { word: 'amazi', language: 'rw', definition: 'Water', pronunciation: 'ah-MAH-zee', partOfSpeech: 'noun', examples: ['Ndashaka amazi.'], synonyms: [] },
  { word: 'umuryango', language: 'rw', definition: 'Family', pronunciation: 'oo-moo-RYAHN-go', partOfSpeech: 'noun', examples: ['Umuryango wanjye ni munini.'], synonyms: [] },
  { word: 'komera', language: 'rw', definition: 'Be strong / stay strong', pronunciation: 'koh-MEH-rah', partOfSpeech: 'interjection', examples: ['Komera, byose bizagenda neza.'], synonyms: [] },
  { word: 'serendipity', language: 'en', definition: 'The occurrence of fortunate events by chance', pronunciation: '/ˌser.ənˈdɪp.ə.ti/', partOfSpeech: 'noun', examples: ['Meeting her was pure serendipity.'], synonyms: ['fluke', 'chance'] },
  { word: 'ephemeral', language: 'en', definition: 'Lasting for a very short time', pronunciation: '/ɪˈfem.ər.əl/', partOfSpeech: 'adjective', examples: ['Fame can be ephemeral.'], synonyms: ['fleeting', 'transient'] },
  { word: 'resilience', language: 'en', definition: 'The ability to recover quickly from difficulties', pronunciation: '/rɪˈzɪl.i.əns/', partOfSpeech: 'noun', examples: ['She showed great resilience after the setback.'], synonyms: ['toughness'] },
  { word: 'eloquent', language: 'en', definition: 'Fluent and persuasive in speaking or writing', pronunciation: '/ˈel.ə.kwənt/', partOfSpeech: 'adjective', examples: ['He gave an eloquent speech.'], synonyms: ['articulate'] },
  { word: 'pragmatic', language: 'en', definition: 'Dealing with things practically rather than theoretically', pronunciation: '/præɡˈmæt.ɪk/', partOfSpeech: 'adjective', examples: ['We need a pragmatic solution.'], synonyms: ['practical'] },
  { word: 'diligent', language: 'en', definition: 'Showing care and effort in work or duties', pronunciation: '/ˈdɪl.ɪ.dʒənt/', partOfSpeech: 'adjective', examples: ['A diligent student never skips homework.'], synonyms: ['hardworking'] },
  { word: 'ambiguous', language: 'en', definition: 'Open to more than one interpretation', pronunciation: '/æmˈbɪɡ.ju.əs/', partOfSpeech: 'adjective', examples: ['The instructions were ambiguous.'], synonyms: ['unclear'] },
  { word: 'meticulous', language: 'en', definition: 'Showing great attention to detail', pronunciation: '/məˈtɪk.jə.ləs/', partOfSpeech: 'adjective', examples: ['She is meticulous about her work.'], synonyms: ['thorough'] },
  { word: 'bonjour', language: 'fr', definition: 'Hello / good day', pronunciation: 'bohn-ZHOOR', partOfSpeech: 'interjection', examples: ['Bonjour, comment ça va ?'], synonyms: [] },
  { word: 'merci', language: 'fr', definition: 'Thank you', pronunciation: 'mehr-SEE', partOfSpeech: 'interjection', examples: ['Merci beaucoup !'], synonyms: [] },
  { word: 'délicieux', language: 'fr', definition: 'Delicious', pronunciation: 'day-lee-SYUH', partOfSpeech: 'adjective', examples: ["C'est délicieux !"], synonyms: ['savoureux'] },
  { word: 'cher', language: 'fr', definition: 'Expensive / dear', pronunciation: 'shehr', partOfSpeech: 'adjective', examples: ["C'est trop cher."], synonyms: ['coûteux'] },
  { word: "l'addition", language: 'fr', definition: 'The bill / check', pronunciation: 'lah-dee-SYOHN', partOfSpeech: 'noun', examples: ["L'addition, s'il vous plaît."], synonyms: [] },
  { word: 'je voudrais', language: 'fr', definition: 'I would like', pronunciation: 'zhuh voo-DREH', partOfSpeech: 'verb phrase', examples: ['Je voudrais un café.'], synonyms: [] },
  { word: 'la gare', language: 'fr', definition: 'Train station', pronunciation: 'lah gahr', partOfSpeech: 'noun', examples: ['Où est la gare ?'], synonyms: [] },
  { word: 'à gauche', language: 'fr', definition: 'To the left', pronunciation: 'ah gohsh', partOfSpeech: 'adverb', examples: ["Tournez à gauche."], synonyms: [] },
];

// Curated multi-course sequences on top of the courses above — the
// LearningPath/PathStep/PathEnrollment backend already existed fully built
// (learningPathService.js) but had no real published paths and no route
// ever called it. Steps reference courses by title; resolved to real
// courseIds during seeding once every course above has been upserted.
const LEARNING_PATHS = [
  {
    title: 'English Grammar Mastery',
    description: 'The complete route through English tenses: everyday phrases first, then present, past, and future — in the order that makes each one click.',
    difficulty: 'BEGINNER',
    status: 'PUBLISHED',
    tags: ['english', 'grammar', 'tenses'],
    estimatedDuration: 1360,
    steps: [
      { courseTitle: 'Everyday English', title: 'Start with everyday English', description: 'Real conversational phrases and the present-simple basics you\'ll lean on in every tense that follows.' },
      { courseTitle: 'English Grammar: Present Tenses', title: 'Master the present', description: 'All four present tenses, beginner to advanced.' },
      { courseTitle: 'English Grammar: Past Tenses', title: 'Master the past', description: 'All four past tenses, beginner to advanced.' },
      { courseTitle: 'English Grammar: Future Tenses', title: 'Master the future', description: 'All four future tenses, beginner to advanced — completes the full tense trilogy.' },
    ],
  },
  {
    title: 'Kinyarwanda & English Starter',
    description: 'A two-language starting point for absolute beginners: everyday Kinyarwanda alongside everyday English.',
    difficulty: 'BEGINNER',
    status: 'PUBLISHED',
    tags: ['kinyarwanda', 'english', 'beginner'],
    estimatedDuration: 314,
    steps: [
      { courseTitle: 'Kinyarwanda for Beginners', title: 'Everyday Kinyarwanda', description: 'Greetings, numbers, family, market talk, food, and directions.' },
      { courseTitle: 'Everyday English', title: 'Everyday English', description: 'Introductions, routines, past stories, directions, work, and future plans.' },
    ],
  },
];

async function main() {
  console.log('🌱 Seeding Vibeon Learn starter content...');

  const password = await bcrypt.hash('Etienne2025', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vibeon.com' },
    update: { emailVerified: true },
    create: {
      username: 'etienne.vibeon',
      email: 'admin@vibeon.com',
      password,
      firstName: 'Etienne',
      lastName: 'Vibeon',
      preferredLanguage: 'en',
      isPremium: true,
      emailVerified: true,
    },
  });
  console.log(`👤 Instructor user ready: ${admin.username}`);

  for (const courseData of COURSES) {
    const { lessons, quiz, vocabulary, ...courseFields } = courseData;
    const course = await prisma.course.upsert({
      where: { title: courseFields.title },
      update: { ...courseFields, instructorId: admin.id },
      create: { ...courseFields, instructorId: admin.id },
    });

    // Identify each lesson by (courseId, title), not by array position —
    // inserting a lesson earlier in the array (e.g. splitting one lesson
    // into three leveled ones) shifts every later lesson's position index,
    // and a position-keyed upsert would silently overwrite an unrelated
    // existing row's content while keeping its old id/progress attached.
    const lessonRecords = [];
    for (let i = 0; i < lessons.length; i += 1) {
      const l = lessons[i];
      const existing = await prisma.lesson.findFirst({ where: { courseId: course.id, title: l.title } });
      const data = {
        courseId: course.id,
        title: l.title,
        description: l.description,
        order: i + 1,
        duration: l.duration,
        type: 'INTERACTIVE',
        content: l.content,
        status: 'PUBLISHED',
      };
      const lesson = existing
        ? await prisma.lesson.update({ where: { id: existing.id }, data })
        : await prisma.lesson.create({ data });
      lessonRecords.push(lesson);
    }

    // Clean up lessons whose title no longer appears in the source (renamed
    // or removed) so re-seeding doesn't leave stale rows behind. Skipped
    // quietly if a learner's progress references one (FK restrict) — a
    // leftover row is far safer than losing that progress.
    const currentTitles = lessons.map((l) => l.title);
    const staleLessons = await prisma.lesson.findMany({ where: { courseId: course.id, title: { notIn: currentTitles } } });
    for (const stale of staleLessons) {
      await prisma.lesson.delete({ where: { id: stale.id } }).catch(() => {
        console.log(`  ⚠️  Kept stale lesson "${stale.title}" (has learner progress attached)`);
      });
    }

    if (quiz) {
      const quizLesson = lessonRecords[quiz.lessonIndex];
      const existingQuiz = await prisma.quiz.findFirst({ where: { lessonId: quizLesson.id } });
      const quizRecord = existingQuiz
        ? await prisma.quiz.update({ where: { id: existingQuiz.id }, data: { title: quiz.title } })
        : await prisma.quiz.create({ data: { lessonId: quizLesson.id, title: quiz.title, passingScore: 70 } });
      await prisma.question.deleteMany({ where: { quizId: quizRecord.id } });
      await prisma.question.createMany({
        data: quiz.questions.map((q) => ({
          quizId: quizRecord.id,
          text: q.text,
          type: 'MULTIPLE_CHOICE',
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          points: 1,
        })),
      });
    }

    for (const v of vocabulary) {
      const existing = await prisma.vocabularyItem.findFirst({ where: { word: v.word, language: v.language } });
      if (!existing) {
        await prisma.vocabularyItem.create({ data: { ...v, partOfSpeech: null, difficulty: 1, tags: 'starter' } });
      }
    }

    console.log(`📚 Course ready: ${course.title} (${lessonRecords.length} lessons)`);
  }

  for (const pathData of LEARNING_PATHS) {
    const { steps, tags, ...pathFields } = pathData;
    const existingPath = await prisma.learningPath.findFirst({ where: { title: pathFields.title } });
    const path = existingPath
      ? await prisma.learningPath.update({ where: { id: existingPath.id }, data: { ...pathFields, tags: JSON.stringify(tags), creatorId: admin.id } })
      : await prisma.learningPath.create({ data: { ...pathFields, tags: JSON.stringify(tags), creatorId: admin.id } });

    // Steps carry no learner progress of their own (that lives on
    // PathEnrollment + the underlying CourseEnrollments) — safe to fully
    // replace on every reseed rather than title-matching like lessons.
    await prisma.pathStep.deleteMany({ where: { pathId: path.id } });
    for (let i = 0; i < steps.length; i += 1) {
      const step = steps[i];
      const course = await prisma.course.findFirst({ where: { title: step.courseTitle } });
      if (!course) {
        console.log(`  ⚠️  Skipped path step "${step.title}" — course "${step.courseTitle}" not found`);
        continue;
      }
      await prisma.pathStep.create({
        data: {
          pathId: path.id,
          courseId: course.id,
          title: step.title,
          description: step.description,
          order: i + 1,
          isRequired: true,
        },
      });
    }
    console.log(`🧭 Learning path ready: ${path.title} (${steps.length} steps)`);
  }

  for (const d of DICTIONARY_SEED) {
    await prisma.dictionaryLookup.upsert({
      where: { word_language: { word: d.word, language: d.language } },
      update: {},
      create: {
        word: d.word,
        language: d.language,
        definition: d.definition,
        pronunciation: d.pronunciation,
        partOfSpeech: d.partOfSpeech,
        examples: JSON.stringify(d.examples),
        synonyms: JSON.stringify(d.synonyms),
        antonyms: '[]',
        source: 'curated_seed',
      },
    });
  }
  console.log(`📖 Dictionary cache ready: ${DICTIONARY_SEED.length} curated entries`);

  console.log('✅ Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
