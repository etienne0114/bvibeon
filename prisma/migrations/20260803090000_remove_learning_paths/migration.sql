-- Remove the Learning Paths feature — duplicated Courses with no distinct
-- value, and had no real coupling from Courses' side (verified: Course's own
-- service/controller never queried these tables).
DROP TABLE IF EXISTS "PathEnrollment";
DROP TABLE IF EXISTS "PathStep";
DROP TABLE IF EXISTS "LearningPath";
