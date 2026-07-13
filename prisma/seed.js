const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Lesson content is structured JSON the frontend renders directly:
// { intro, sections: [{ type: 'phrases'|'tip', ... }] }
const phrase = (target, translation, pronunciation) => ({ target, translation, pronunciation });

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
            { type: 'tip', title: 'Culture tip', body: 'A handshake with the right hand, sometimes holding your own right forearm with the left hand, shows extra respect.' },
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
            { type: 'tip', title: 'Practice idea', body: 'Count objects around you out loud — plates, chairs, steps as you climb them.' },
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
            { type: 'tip', title: 'Grammar note', body: 'Use "I\'m" (I am) for name, origin and feelings: I\'m Ange, I\'m from Kigali, I\'m happy.' },
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
            { type: 'tip', title: 'Common mistake', body: '"She work here" → "She workS here". The -s only appears with he/she/it.' },
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

    const lessonRecords = [];
    for (let i = 0; i < lessons.length; i += 1) {
      const l = lessons[i];
      const existing = await prisma.lesson.findFirst({ where: { courseId: course.id, order: i + 1 } });
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
