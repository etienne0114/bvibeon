const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');
  
  const password = await bcrypt.hash('Etienne2025', 10);
  
  // Create primary user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vibeon.com' },
    update: {},
    create: {
      username: 'etienne.vibeon',
      email: 'admin@vibeon.com',
      password,
      firstName: 'Etienne',
      lastName: 'Vibeon',
      preferredLanguage: 'en',
      isPremium: true,
    },
  });

  console.log(`👤 Created user: ${admin.username}`);

  // Languages to Seed
  const techCourses = [
    {
      title: 'AI Language Technology',
      description: 'Master the fundamentals of NLP, translation engines, and large language models in a modern context.',
      level: 'INTERMEDIATE',
      category: 'ARTIFICIAL_INTELLIGENCE',
      estimatedDuration: 120,
      imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995',
      lessons: [
        { title: 'Introduction to Transformers', duration: 30, order: 1 },
        { title: 'Fine-tuning Translation Models', duration: 45, order: 2 },
        { title: 'Deploying Real-time APIs', duration: 45, order: 3 },
      ]
    },
    {
      title: 'Full-stack Translation Apps',
      description: 'Build end-to-end applications using React, Node.js, and specialized translation backends.',
      level: 'ADVANCED',
      category: 'SOFTWARE_ENGINEERING',
      estimatedDuration: 180,
      imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c',
      lessons: [
        { title: 'Architecture of a Studio Workspace', duration: 40, order: 1 },
        { title: 'Integrating WebSocket for Streams', duration: 60, order: 2 },
        { title: 'Performance Optimization at Scale', duration: 80, order: 3 },
      ]
    }
  ];

  for (const courseData of techCourses) {
    const { lessons, ...courseInfo } = courseData;
    const course = await prisma.course.upsert({
      where: { title: courseInfo.title },
      update: {
        description: courseInfo.description,
        level: courseInfo.level,
        category: courseInfo.category,
        estimatedDuration: courseInfo.estimatedDuration,
        imageUrl: courseInfo.imageUrl,
      },
      create: {
        ...courseInfo,
        tags: JSON.stringify(['ai', 'translation', 'engineering']),
        instructorId: admin.id
      }
    });

    console.log(`📚 Processed course: ${course.title}`);

    for (const l of lessons) {
      await prisma.lesson.upsert({
        where: { id: `lesson-${course.id}-${l.order}` }, // Using a pseudo-id for deterministic seed
        update: {
            title: l.title,
            duration: l.duration,
            order: l.order,
        },
        create: {
          id: `lesson-${course.id}-${l.order}`,
          ...l,
          courseId: course.id,
          description: `Deep dive into ${l.title}`,
        }
      });
    }

    // Enroll user
    await prisma.courseEnrollment.upsert({
      where: { userId_courseId: { userId: admin.id, courseId: course.id } },
      update: { progress: 15 },
      create: {
        userId: admin.id,
        courseId: course.id,
        progress: 15,
      }
    });
  }

  // Pre-populate some Practice Scenarios
  const scenarios = [
    { id: 'pronunciation_default', title: 'Pronunciation lab', category: 'PRACTICE', difficulty: 2 },
    { id: 'listening_quick', title: 'Listening drills', category: 'PRACTICE', difficulty: 1 },
    { id: 'roleplay_default', title: 'Roleplay challenges', category: 'ROLEPLAY', difficulty: 3 },
    { id: 'vocab_streak', title: 'Vocabulary quests', category: 'PRACTICE', difficulty: 1 },
  ];

  for (const s of scenarios) {
    await prisma.rolePlayScenario.upsert({
      where: { id: s.id },
      update: {},
      create: {
        ...s,
        description: `Improve your ${s.title.toLowerCase()} skills.`,
        tags: '[]'
      }
    });
  }

  // Dictionary Items
  const words = [
    { word: 'Antigravity', language: 'en', definition: 'A hypothetical force or technology that opposes or neutralizes gravity.', pronunciation: '/ˌæn.tiˈɡræv.ɪ.ti/', partOfSpeech: 'noun' },
    { word: 'Kinyarwanda', language: 'en', definition: 'The official language of Rwanda and a dialect of the Rwanda-Rundi language.', pronunciation: '/ˌkiːn.jəˈrwæn.də/', partOfSpeech: 'noun' }
  ];

  for (const w of words) {
    await prisma.dictionaryLookup.upsert({
      where: { word_language: { word: w.word, language: w.language } },
      update: {},
      create: w
    });
  }

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
