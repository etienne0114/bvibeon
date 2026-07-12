-- CreateIndex
CREATE INDEX "Achievement_userId_unlockedAt_idx" ON "Achievement"("userId", "unlockedAt" DESC);

-- CreateIndex
CREATE INDEX "Certificate_userId_idx" ON "Certificate"("userId");

-- CreateIndex
CREATE INDEX "Course_status_category_level_idx" ON "Course"("status", "category", "level");

-- CreateIndex
CREATE INDEX "CourseEnrollment_userId_enrolledAt_idx" ON "CourseEnrollment"("userId", "enrolledAt" DESC);

-- CreateIndex
CREATE INDEX "CourseEnrollment_courseId_idx" ON "CourseEnrollment"("courseId");

-- CreateIndex
CREATE INDEX "LearningGoal_userId_idx" ON "LearningGoal"("userId");

-- CreateIndex
CREATE INDEX "LearningInteraction_sessionId_idx" ON "LearningInteraction"("sessionId");

-- CreateIndex
CREATE INDEX "LearningInteraction_userId_createdAt_idx" ON "LearningInteraction"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "LearningSession_userId_startedAt_idx" ON "LearningSession"("userId", "startedAt" DESC);

-- CreateIndex
CREATE INDEX "Lesson_courseId_status_order_idx" ON "Lesson"("courseId", "status", "order");

-- CreateIndex
CREATE INDEX "LessonProgress_userId_lastAccessedAt_idx" ON "LessonProgress"("userId", "lastAccessedAt" DESC);

-- CreateIndex
CREATE INDEX "LessonProgress_lessonId_idx" ON "LessonProgress"("lessonId");

-- CreateIndex
CREATE INDEX "Question_quizId_idx" ON "Question"("quizId");

-- CreateIndex
CREATE INDEX "Quiz_lessonId_idx" ON "Quiz"("lessonId");

-- CreateIndex
CREATE INDEX "QuizAttempt_userId_completedAt_idx" ON "QuizAttempt"("userId", "completedAt" DESC);

-- CreateIndex
CREATE INDEX "QuizAttempt_quizId_idx" ON "QuizAttempt"("quizId");

-- CreateIndex
CREATE INDEX "SpeechSession_userId_createdAt_idx" ON "SpeechSession"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "VocabularyItem_language_difficulty_idx" ON "VocabularyItem"("language", "difficulty");

-- CreateIndex
CREATE INDEX "VocabularyProgress_userId_nextReviewAt_idx" ON "VocabularyProgress"("userId", "nextReviewAt");

