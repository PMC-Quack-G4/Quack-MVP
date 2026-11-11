/**
 * Tipos estrictos para el módulo de Estadísticas por Rol (Estudiante, Docente y Directivo).
 */

import type { ErrorBreakdownCounts } from "./app";

export interface StudentWeeklyPoint {
  label: string;
  feynmanPercent: number;
  ocrPercent: number;
}

export interface StudentPersonalStats {
  globalMasteryPercent: number;
  avgExamScoreOutOf5: number;
  totalSessions: number;
  activeMinutes: number;
  streakDays: number;
  unlockedSubconcepts: number;
  weeklySeries: StudentWeeklyPoint[];
  errorTaxonomy: ErrorBreakdownCounts;
  recommendedAction: {
    courseId: string;
    courseTitle: string;
    topicId: string;
    topicTitle: string;
    mode: "feynman" | "ocr";
    reason: string;
  } | null;
}

export type StudentRiskLevel = "optimal" | "watch" | "at_risk";

export type DominantErrorType = "none" | "conceptual" | "algebraic" | "propagated";

export interface StudentTopicPerformance {
  topicTitle: string;
  feynmanScore: number;
  ocrScoreOutOf5: number;
  attempts: number;
  bottleneckSubtopic?: string;
}

export interface StudentSessionEntry {
  id: string;
  dateLabel: string;
  mode: "Feynman Oral" | "Parcial OCR";
  topicTitle: string;
  scoreLabel: string;
  diagnosisNote: string;
}

export interface StudentCourseRecord {
  id: string;
  name: string;
  studentCode: string;
  initials: string;
  feynmanAvg: number;
  ocrAvgOutOf5: number;
  sessionsCount: number;
  activeMinutes: number;
  lastActivityLabel: string;
  riskLevel: StudentRiskLevel;
  dominantError: DominantErrorType;
  topicBreakdown: StudentTopicPerformance[];
  recentSessions: StudentSessionEntry[];
  recommendedIntervention: string;
}

export interface ConceptBottleneck {
  id: string;
  topicTitle: string;
  subconceptName: string;
  masteryPercent: number;
  blockedStudentsCount: number;
  totalStudentsCount: number;
  dominantFailure: "conceptual" | "algebraic" | "propagated";
  suggestedAction: string;
}

export interface DocenteCourseStats {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  semester: string;
  sectionLabel: string;
  enrolledCount: number;
  activeThisWeekCount: number;
  avgFeynmanMastery: number;
  avgOcrScoreOutOf5: number;
  atRiskCount: number;
  weeklyMasteryTrend: {
    week: string;
    feynmanMastery: number;
    ocrScorePercent: number;
  }[];
  errorDistribution: ErrorBreakdownCounts;
  bottlenecks: ConceptBottleneck[];
  students: StudentCourseRecord[];
}

export interface CohortComparisonPoint {
  weekLabel: string;
  milestone?: string;
  withQuackScore: number;
  withoutQuackScore: number;
}

export interface DepartmentImpactRow {
  id: string;
  faculty: "Ingeniería de Sistemas" | "Matemáticas" | "Física" | "Química y Biología";
  courseCode: string;
  courseTitle: string;
  studentsCount: number;
  baselinePassRate: number;
  quackPassRate: number;
  avgMasteryPercent: number;
  illusionGapReductionPercent: number;
}

export interface EarlyWarningAlert {
  id: string;
  faculty: string;
  courseTitle: string;
  examWindowLabel: string;
  blockedConcept: string;
  affectedPercent: number;
  affectedStudents: number;
  recommendedAction: string;
}

export interface UsageIntensityTier {
  tierLabel: string;
  description: string;
  studentsSharePercent: number;
  passRatePercent: number;
  avgFinalGradeOutOf5: number;
}

export interface InstitutionalImpactStats {
  institutionName: string;
  academicPeriod: string;
  activeStudents: number;
  licensedSeats: number;
  quackPassRatePercent: number;
  baselinePassRatePercent: number;
  stemRetentionPercent: number;
  retentionDeltaPoints: number;
  illusionGapReductionPercent: number;
  cohortTimeline: CohortComparisonPoint[];
  departmentImpact: DepartmentImpactRow[];
  earlyWarnings: EarlyWarningAlert[];
  usageIntensityTiers: UsageIntensityTier[];
}
