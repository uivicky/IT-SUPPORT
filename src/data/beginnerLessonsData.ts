import { BeginnerLesson, BEGINNER_LESSONS_PART_1 } from './beginnerLessonsPart1';
import { BEGINNER_LESSONS_PART_2 } from './beginnerLessonsPart2';

export type { BeginnerLesson, LessonFlowNode, MiniQuizQuestion } from './beginnerLessonsPart1';

export const BEGINNER_LESSONS: BeginnerLesson[] = [
  ...BEGINNER_LESSONS_PART_1,
  ...BEGINNER_LESSONS_PART_2,
];

export const BEGINNER_CHAPTERS = [
  'Computer Basics',
  'Inside a PC',
  'Networking & Internet',
  'Enterprise & Security',
] as const;
