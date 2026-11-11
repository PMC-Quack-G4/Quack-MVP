/**
 * Tipos de dominio para autenticación simulada, roles, materias y progreso en Quack MVP.
 */

import type { ExamProblem } from "./exam";
import type { FeynmanTopic } from "./feynman";

export type UserRole = "student_campus" | "student_individual" | "institution";

export type InstitutionScope = "docente" | "directivo";

export type CourseOrigin = "campus" | "individual" | "taught";

export type TopicProgressStatus = "pending" | "in_progress" | "mastered";

export type CourseAccentTone = "amber" | "emerald" | "sky" | "caramel" | "violet";

export interface QuackUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  institutionName?: string;
  department?: string;
  planLabel: string;
  defaultInstitutionScope?: InstitutionScope;
}

export interface UploadedMaterial {
  id: string;
  fileName: string;
  fileType: "pdf" | "code" | "notes" | "slides";
  sizeLabel: string;
  uploadedAt: string;
  extractedTopicsCount: number;
  summary: string;
}

export interface CourseTopicItem {
  id: string;
  title: string;
  unitLabel: string;
  summary: string;
  estimatedMinutes: number;
  feynmanTopicId?: string;
  examProblemId?: string;
  masteryPercent: number;
  status: TopicProgressStatus;
  /** Métricas opcionales visibles para el docente dentro de su curso */
  cohortMasteryPercent?: number;
  bottleneckAlert?: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  description: string;
  discipline: string;
  origin: CourseOrigin;
  semester: string;
  professorName?: string;
  accentTone: CourseAccentTone;
  topics: CourseTopicItem[];
  materials?: UploadedMaterial[];
  enrolledStudentsCount?: number;
  cohortAvgMastery?: number;
}

export interface ErrorBreakdownCounts {
  correct: number;
  conceptual: number;
  algebraic: number;
  propagated: number;
}

export interface PracticeAttempt {
  id: string;
  createdAt: string;
  dateLabel: string;
  courseId: string;
  courseTitle: string;
  topicId: string;
  topicTitle: string;
  mode: "feynman" | "ocr";
  masteryPercent: number;
  examScoreOutOf5?: number;
  durationSeconds: number;
  errorCounts?: ErrorBreakdownCounts;
}

export interface AuthSessionSnapshot {
  version: 1;
  user: QuackUser;
  institutionScope: InstitutionScope;
  selectedCourseId: string | null;
  individualCourses: Course[];
  customTopics: FeynmanTopic[];
  customProblems: ExamProblem[];
  practiceHistory: PracticeAttempt[];
}
