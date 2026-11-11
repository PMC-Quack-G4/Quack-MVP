import * as React from "react";
import { mockExamProblems, mockFeynmanTopics } from "@/mocks/quackData";
import {
  CAMPUS_COURSES,
  INDIVIDUAL_STARTER_COURSES,
  STUDENT_CAMPUS_BASE_HISTORY,
  STUDENT_INDIVIDUAL_BASE_HISTORY,
  TAUGHT_COURSES,
} from "@/mocks/appData";
import type { GeneratedMaterialBundle } from "@/services/materialGeneratorService";
import type {
  AuthSessionSnapshot,
  Course,
  CourseAccentTone,
  ErrorBreakdownCounts,
  ExamProblem,
  FeynmanTopic,
  InstitutionScope,
  PracticeAttempt,
  QuackUser,
  StudentPersonalStats,
  TopicProgressStatus,
  UserRole,
} from "@/types";

const STORAGE_KEY = "quack_mvp_auth_session_v1";

export interface LoginPayload {
  name: string;
  email: string;
  role: UserRole;
  institutionName?: string;
  defaultInstitutionScope?: InstitutionScope;
}

export interface AddMaterialTarget {
  mode: "new_course" | "existing_course";
  existingCourseId?: string;
  courseTitle: string;
  discipline: string;
  accentTone?: CourseAccentTone;
  bundle: GeneratedMaterialBundle;
}

interface AuthContextValue {
  user: QuackUser | null;
  institutionScope: InstitutionScope;
  selectedCourseId: string | null;
  courses: Course[];
  practiceHistory: PracticeAttempt[];
  login: (payload: LoginPayload) => void;
  logout: () => void;
  switchRoleForDemo: (role: UserRole, scope?: InstitutionScope) => void;
  setInstitutionScope: (scope: InstitutionScope) => void;
  setSelectedCourseId: (courseId: string | null) => void;
  addMaterialToWorkspace: (target: AddMaterialTarget) => string;
  recordPracticeAttempt: (attempt: Omit<PracticeAttempt, "id" | "createdAt" | "dateLabel">) => void;
  getCourseById: (courseId: string | undefined) => Course | undefined;
  getTopicsForCourse: (courseId?: string | null) => FeynmanTopic[];
  getProblemsForCourse: (courseId?: string | null) => ExamProblem[];
  getCourseForFeynmanTopic: (topicId: string) => Course | undefined;
  getCourseForExamProblem: (problemId: string) => Course | undefined;
  getStudentPersonalStats: () => StudentPersonalStats;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

function buildPlanLabel(role: UserRole): string {
  switch (role) {
    case "student_campus":
      return "Quack Campus · LTI";
    case "student_individual":
      return "Quack Pro Individual";
    case "institution":
      return "Quack Campus · Institución";
  }
}

function getDefaultHistoryForRole(role: UserRole): PracticeAttempt[] {
  if (role === "student_campus") return STUDENT_CAMPUS_BASE_HISTORY;
  if (role === "student_individual") return STUDENT_INDIVIDUAL_BASE_HISTORY;
  return [];
}

function deriveStatus(mastery: number): TopicProgressStatus {
  if (mastery >= 80) return "mastered";
  if (mastery > 0) return "in_progress";
  return "pending";
}

function applyHistoryToCourses(baseCourses: Course[], history: PracticeAttempt[]): Course[] {
  return baseCourses.map((course) => {
    const updatedTopics = course.topics.map((topic) => {
      const relevantAttempts = history.filter(
        (h) =>
          h.courseId === course.id &&
          (h.topicId === topic.feynmanTopicId || h.topicId === topic.examProblemId || h.topicId === topic.id)
      );

      if (relevantAttempts.length === 0) return topic;

      const latest = relevantAttempts[relevantAttempts.length - 1];
      const bestMastery = Math.max(topic.masteryPercent, latest.masteryPercent);
      return {
        ...topic,
        masteryPercent: bestMastery,
        status: deriveStatus(bestMastery),
      };
    });

    return {
      ...course,
      topics: updatedTopics,
    };
  });
}

function loadInitialSnapshot(): AuthSessionSnapshot | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSessionSnapshot;
    if (parsed && parsed.version === 1 && parsed.user && parsed.user.name) {
      return parsed;
    }
  } catch {
    // Ignorar errores de almacenamiento o esquema antiguo
  }
  return null;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = React.useMemo(() => loadInitialSnapshot(), []);

  const [user, setUser] = React.useState<QuackUser | null>(initial?.user ?? null);
  const [institutionScope, setInstitutionScopeState] = React.useState<InstitutionScope>(
    initial?.institutionScope ?? "docente"
  );
  const [selectedCourseId, setSelectedCourseIdState] = React.useState<string | null>(
    initial?.selectedCourseId ?? null
  );
  const [individualCourses, setIndividualCourses] = React.useState<Course[]>(
    initial?.individualCourses ?? INDIVIDUAL_STARTER_COURSES
  );
  const [customTopics, setCustomTopics] = React.useState<FeynmanTopic[]>(
    initial?.customTopics ?? []
  );
  const [customProblems, setCustomProblems] = React.useState<ExamProblem[]>(
    initial?.customProblems ?? []
  );
  const [practiceHistory, setPracticeHistory] = React.useState<PracticeAttempt[]>(
    initial?.practiceHistory ?? []
  );

  // Persistir sesión simulada en localStorage
  React.useEffect(() => {
    try {
      if (!user) {
        window.localStorage.removeItem(STORAGE_KEY);
        return;
      }
      const snapshot: AuthSessionSnapshot = {
        version: 1,
        user,
        institutionScope,
        selectedCourseId,
        individualCourses,
        customTopics,
        customProblems,
        practiceHistory,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // No bloquear si localStorage no está disponible
    }
  }, [user, institutionScope, selectedCourseId, individualCourses, customTopics, customProblems, practiceHistory]);

  const courses = React.useMemo<Course[]>(() => {
    if (!user) return [];
    if (user.role === "student_campus") {
      return applyHistoryToCourses(CAMPUS_COURSES, practiceHistory);
    }
    if (user.role === "student_individual") {
      return applyHistoryToCourses(individualCourses, practiceHistory);
    }
    return TAUGHT_COURSES;
  }, [user, individualCourses, practiceHistory]);

  const allTopicsCatalog = React.useMemo<FeynmanTopic[]>(
    () => [...mockFeynmanTopics, ...customTopics],
    [customTopics]
  );

  const allProblemsCatalog = React.useMemo<ExamProblem[]>(
    () => [...mockExamProblems, ...customProblems],
    [customProblems]
  );

  const login = React.useCallback((payload: LoginPayload) => {
    const cleanName = payload.name.trim() || "Usuario Quack";
    const cleanEmail =
      payload.email.trim() ||
      `${cleanName.toLowerCase().replace(/\s+/g, ".")}@uniandes.edu.co`;
    const scope = payload.defaultInstitutionScope ?? "docente";

    const nextUser: QuackUser = {
      id: `user-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      role: payload.role,
      institutionName:
        payload.role === "student_individual"
          ? undefined
          : payload.institutionName?.trim() || "Universidad de los Andes",
      department:
        payload.role === "institution" ? "Facultad de Ingeniería y Ciencias" : undefined,
      planLabel: buildPlanLabel(payload.role),
      defaultInstitutionScope: scope,
    };

    setUser(nextUser);
    setInstitutionScopeState(scope);
    setSelectedCourseIdState(null);
    setPracticeHistory(getDefaultHistoryForRole(payload.role));
  }, []);

  const logout = React.useCallback(() => {
    setUser(null);
    setSelectedCourseIdState(null);
    setPracticeHistory([]);
  }, []);

  const switchRoleForDemo = React.useCallback(
    (role: UserRole, scope?: InstitutionScope) => {
      if (!user) return;
      const nextScope = scope ?? (role === "institution" ? "docente" : institutionScope);
      setUser({
        ...user,
        role,
        institutionName:
          role === "student_individual" ? undefined : user.institutionName || "Universidad de los Andes",
        department: role === "institution" ? "Facultad de Ingeniería y Ciencias" : undefined,
        planLabel: buildPlanLabel(role),
        defaultInstitutionScope: nextScope,
      });
      setInstitutionScopeState(nextScope);
      setSelectedCourseIdState(null);
      setPracticeHistory(getDefaultHistoryForRole(role));
    },
    [user, institutionScope]
  );

  const setInstitutionScope = React.useCallback((scope: InstitutionScope) => {
    setInstitutionScopeState(scope);
  }, []);

  const setSelectedCourseId = React.useCallback((courseId: string | null) => {
    setSelectedCourseIdState(courseId);
  }, []);

  const addMaterialToWorkspace = React.useCallback(
    (target: AddMaterialTarget): string => {
      const { bundle } = target;
      setCustomTopics((prev) => [...prev, bundle.feynmanTopic]);
      setCustomProblems((prev) => [...prev, bundle.examProblem]);

      if (target.mode === "existing_course" && target.existingCourseId) {
        const targetId = target.existingCourseId;
        setIndividualCourses((prev) =>
          prev.map((c) => {
            if (c.id !== targetId) return c;
            return {
              ...c,
              materials: [bundle.material, ...(c.materials ?? [])],
              topics: [...c.topics, bundle.courseTopic],
            };
          })
        );
        return targetId;
      }

      const newCourseId = `ind-custom-${Date.now().toString(36)}`;
      const newCourse: Course = {
        id: newCourseId,
        code: `PROPIO-0${individualCourses.length + 1}`,
        title: target.courseTitle.trim() || bundle.courseTopic.title,
        description: `Materia creada desde tus apuntes (${bundle.material.fileName}) en ${target.discipline}.`,
        discipline: target.discipline,
        origin: "individual",
        semester: "Espacio Personal · Quack Pro",
        accentTone: target.accentTone ?? "sky",
        materials: [bundle.material],
        topics: [bundle.courseTopic],
      };

      setIndividualCourses((prev) => [newCourse, ...prev]);
      return newCourseId;
    },
    [individualCourses.length]
  );

  const recordPracticeAttempt = React.useCallback(
    (attempt: Omit<PracticeAttempt, "id" | "createdAt" | "dateLabel">) => {
      const nextAttempt: PracticeAttempt = {
        ...attempt,
        id: `att-live-${Date.now()}`,
        createdAt: new Date().toISOString(),
        dateLabel: "Hoy (En vivo)",
      };
      setPracticeHistory((prev) => [...prev, nextAttempt]);
    },
    []
  );

  const getCourseById = React.useCallback(
    (courseId: string | undefined) => {
      if (!courseId) return undefined;
      return courses.find((c) => c.id === courseId);
    },
    [courses]
  );

  const getTopicsForCourse = React.useCallback(
    (courseId?: string | null): FeynmanTopic[] => {
      const scopeCourses = courseId
        ? courses.filter((c) => c.id === courseId)
        : courses;
      const allowedIds = new Set<string>();
      for (const c of scopeCourses) {
        for (const t of c.topics) {
          if (t.feynmanTopicId) allowedIds.add(t.feynmanTopicId);
        }
      }
      return allTopicsCatalog.filter((t) => allowedIds.has(t.id));
    },
    [courses, allTopicsCatalog]
  );

  const getProblemsForCourse = React.useCallback(
    (courseId?: string | null): ExamProblem[] => {
      const scopeCourses = courseId
        ? courses.filter((c) => c.id === courseId)
        : courses;
      const allowedIds = new Set<string>();
      for (const c of scopeCourses) {
        for (const t of c.topics) {
          if (t.examProblemId) allowedIds.add(t.examProblemId);
        }
      }
      return allProblemsCatalog.filter((p) => allowedIds.has(p.id));
    },
    [courses, allProblemsCatalog]
  );

  const getCourseForFeynmanTopic = React.useCallback(
    (topicId: string) => {
      return courses.find((c) => c.topics.some((t) => t.feynmanTopicId === topicId));
    },
    [courses]
  );

  const getCourseForExamProblem = React.useCallback(
    (problemId: string) => {
      return courses.find((c) => c.topics.some((t) => t.examProblemId === problemId));
    },
    [courses]
  );

  const getStudentPersonalStats = React.useCallback((): StudentPersonalStats => {
    const allTopicItems = courses.flatMap((c) => c.topics);
    const globalMasteryPercent =
      allTopicItems.length > 0
        ? Math.round(
            allTopicItems.reduce((sum, item) => sum + item.masteryPercent, 0) /
              allTopicItems.length
          )
        : 0;

    const ocrAttempts = practiceHistory.filter(
      (h) => h.mode === "ocr" && typeof h.examScoreOutOf5 === "number"
    );
    const avgExamScoreOutOf5 =
      ocrAttempts.length > 0
        ? Number(
            (
              ocrAttempts.reduce((sum, h) => sum + (h.examScoreOutOf5 ?? 0), 0) /
              ocrAttempts.length
            ).toFixed(1)
          )
        : 0;

    const activeMinutes = Math.max(
      15,
      Math.round(practiceHistory.reduce((sum, h) => sum + h.durationSeconds, 0) / 60)
    );

    const errorTaxonomy: ErrorBreakdownCounts = practiceHistory.reduce(
      (acc, h) => {
        if (!h.errorCounts) return acc;
        return {
          correct: acc.correct + h.errorCounts.correct,
          conceptual: acc.conceptual + h.errorCounts.conceptual,
          algebraic: acc.algebraic + h.errorCounts.algebraic,
          propagated: acc.propagated + h.errorCounts.propagated,
        };
      },
      { correct: 0, conceptual: 0, algebraic: 0, propagated: 0 }
    );

    // Serie semanal cronológica agrupada por período único (sin duplicar etiquetas en el eje X)
    interface WeekBucket {
      label: string;
      feynman?: number;
      ocr?: number;
    }

    const buckets: WeekBucket[] = [];
    const bucketIndexByLabel = new Map<string, number>();

    for (const item of practiceHistory) {
      const existingIdx = bucketIndexByLabel.get(item.dateLabel);
      let bucket: WeekBucket;
      if (existingIdx !== undefined) {
        bucket = buckets[existingIdx];
      } else {
        bucket = { label: item.dateLabel };
        bucketIndexByLabel.set(item.dateLabel, buckets.length);
        buckets.push(bucket);
      }

      if (item.mode === "feynman") {
        bucket.feynman = item.masteryPercent;
      } else {
        bucket.ocr = item.masteryPercent;
      }
    }

    const resolveSeriesValues = (
      getter: (bucket: WeekBucket) => number | undefined,
      fallback: number
    ): number[] => {
      const observedIndices = buckets
        .map((bucket, idx) => (getter(bucket) !== undefined ? idx : -1))
        .filter((idx) => idx >= 0);

      if (observedIndices.length === 0) {
        return buckets.map(() => fallback);
      }

      return buckets.map((bucket, idx) => {
        const direct = getter(bucket);
        if (direct !== undefined) return direct;

        const prevIdx = [...observedIndices].reverse().find((i) => i < idx);
        const nextIdx = observedIndices.find((i) => i > idx);

        if (prevIdx !== undefined && nextIdx !== undefined) {
          const prevVal = getter(buckets[prevIdx]) ?? fallback;
          const nextVal = getter(buckets[nextIdx]) ?? fallback;
          const ratio = (idx - prevIdx) / (nextIdx - prevIdx);
          return Math.round(prevVal + (nextVal - prevVal) * ratio);
        }
        if (prevIdx !== undefined) {
          return getter(buckets[prevIdx]) ?? fallback;
        }
        if (nextIdx !== undefined) {
          return getter(buckets[nextIdx]) ?? fallback;
        }
        return fallback;
      });
    };

    const defaultOcrPercent = Math.round((avgExamScoreOutOf5 / 5) * 100);
    const weeklySeries =
      buckets.length === 0
        ? [
            {
              label: "Inicio",
              feynmanPercent: globalMasteryPercent,
              ocrPercent: defaultOcrPercent,
            },
          ]
        : (() => {
            const feynmanVals = resolveSeriesValues((b) => b.feynman, globalMasteryPercent);
            const ocrVals = resolveSeriesValues((b) => b.ocr, defaultOcrPercent);
            return buckets.map((bucket, idx) => ({
              label: bucket.label,
              feynmanPercent: feynmanVals[idx],
              ocrPercent: ocrVals[idx],
            }));
          })();

    // Siguiente tema recomendado (el de menor dominio dentro de sus materias)
    let lowestTopic: {
      course: Course;
      topic: Course["topics"][number];
    } | null = null;
    for (const course of courses) {
      for (const topic of course.topics) {
        if (!lowestTopic || topic.masteryPercent < lowestTopic.topic.masteryPercent) {
          lowestTopic = { course, topic };
        }
      }
    }

    const unlockedSubconcepts =
      user?.role === "student_campus"
        ? 11 + Math.max(0, practiceHistory.length - STUDENT_CAMPUS_BASE_HISTORY.length) * 3
        : 6 + Math.max(0, practiceHistory.length - STUDENT_INDIVIDUAL_BASE_HISTORY.length) * 3;

    return {
      globalMasteryPercent,
      avgExamScoreOutOf5,
      totalSessions: practiceHistory.length,
      activeMinutes,
      streakDays: user?.role === "student_campus" ? 6 : 4,
      unlockedSubconcepts,
      weeklySeries,
      errorTaxonomy,
      recommendedAction: lowestTopic
        ? {
            courseId: lowestTopic.course.id,
            courseTitle: lowestTopic.course.title,
            topicId:
              lowestTopic.topic.feynmanTopicId ??
              lowestTopic.topic.examProblemId ??
              lowestTopic.topic.id,
            topicTitle: lowestTopic.topic.title,
            mode: lowestTopic.topic.masteryPercent < 60 ? "feynman" : "ocr",
            reason:
              lowestTopic.topic.masteryPercent < 60
                ? `Tu dominio actual en este tema es ${lowestTopic.topic.masteryPercent}%. Refuérzalo explicándolo en voz alta.`
                : `Tienes ${lowestTopic.topic.masteryPercent}% de comprensión conceptual; valídalo a papel y lápiz.`,
          }
        : null,
    };
  }, [courses, practiceHistory, user?.role]);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      institutionScope,
      selectedCourseId,
      courses,
      practiceHistory,
      login,
      logout,
      switchRoleForDemo,
      setInstitutionScope,
      setSelectedCourseId,
      addMaterialToWorkspace,
      recordPracticeAttempt,
      getCourseById,
      getTopicsForCourse,
      getProblemsForCourse,
      getCourseForFeynmanTopic,
      getCourseForExamProblem,
      getStudentPersonalStats,
    }),
    [
      user,
      institutionScope,
      selectedCourseId,
      courses,
      practiceHistory,
      login,
      logout,
      switchRoleForDemo,
      setInstitutionScope,
      setSelectedCourseId,
      addMaterialToWorkspace,
      recordPracticeAttempt,
      getCourseById,
      getTopicsForCourse,
      getProblemsForCourse,
      getCourseForFeynmanTopic,
      getCourseForExamProblem,
      getStudentPersonalStats,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe utilizarse dentro de un AuthProvider");
  }
  return ctx;
}
