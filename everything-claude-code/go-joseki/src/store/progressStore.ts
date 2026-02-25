import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MasteryLevel = 'not_started' | 'learning' | 'practiced' | 'mastered';

export interface JosekiProgress {
  josekiId: string;
  masteryLevel: MasteryLevel;
  practiceCount: number;
  quizCount: number;
  quizCorrectCount: number;
  lastStudied: string | null;
  accuracy: number;
}

export interface StudyStats {
  totalJoseki: number;
  masteredCount: number;
  learningCount: number;
  notStartedCount: number;
  totalPracticeSessions: number;
  totalQuizzes: number;
  averageAccuracy: number;
  streakDays: number;
  lastStudyDate: string | null;
}

interface ProgressStore {
  progress: Record<string, JosekiProgress>;

  // Actions
  updateProgress: (josekiId: string, updates: Partial<JosekiProgress>) => void;
  recordPractice: (josekiId: string, accuracy: number) => void;
  recordQuiz: (josekiId: string, correct: boolean) => void;
  getProgress: (josekiId: string) => JosekiProgress;
  getStats: (totalJoseki: number) => StudyStats;
  exportData: () => string;
  importData: (json: string) => boolean;
}

const defaultProgress = (josekiId: string): JosekiProgress => ({
  josekiId,
  masteryLevel: 'not_started',
  practiceCount: 0,
  quizCount: 0,
  quizCorrectCount: 0,
  lastStudied: null,
  accuracy: 0,
});

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      progress: {},

      updateProgress: (josekiId: string, updates: Partial<JosekiProgress>) => {
        set((state) => ({
          progress: {
            ...state.progress,
            [josekiId]: {
              ...(state.progress[josekiId] || defaultProgress(josekiId)),
              ...updates,
            },
          },
        }));
      },

      recordPractice: (josekiId: string, accuracy: number) => {
        const state = get();
        const current = state.progress[josekiId] || defaultProgress(josekiId);

        const newPracticeCount = current.practiceCount + 1;
        const newAccuracy = Math.round(
          (current.accuracy * current.practiceCount + accuracy) / newPracticeCount
        );

        // Update mastery level based on practice count and accuracy
        let masteryLevel: MasteryLevel = current.masteryLevel;
        if (newPracticeCount >= 5 && newAccuracy >= 80) {
          masteryLevel = 'mastered';
        } else if (newPracticeCount >= 3 && newAccuracy >= 60) {
          masteryLevel = 'practiced';
        } else if (newPracticeCount >= 1) {
          masteryLevel = 'learning';
        }

        state.updateProgress(josekiId, {
          practiceCount: newPracticeCount,
          accuracy: newAccuracy,
          masteryLevel,
          lastStudied: new Date().toISOString(),
        });
      },

      recordQuiz: (josekiId: string, correct: boolean) => {
        const state = get();
        const current = state.progress[josekiId] || defaultProgress(josekiId);

        state.updateProgress(josekiId, {
          quizCount: current.quizCount + 1,
          quizCorrectCount: current.quizCorrectCount + (correct ? 1 : 0),
          lastStudied: new Date().toISOString(),
        });
      },

      getProgress: (josekiId: string) => {
        return get().progress[josekiId] || defaultProgress(josekiId);
      },

      getStats: (totalJoseki: number): StudyStats => {
        const { progress } = get();
        const progresses = Object.values(progress);

        const masteredCount = progresses.filter(
          (p) => p.masteryLevel === 'mastered'
        ).length;
        const learningCount = progresses.filter(
          (p) => p.masteryLevel === 'learning' || p.masteryLevel === 'practiced'
        ).length;
        const notStartedCount = totalJoseki - masteredCount - learningCount;

        const totalPracticeSessions = progresses.reduce(
          (sum, p) => sum + p.practiceCount,
          0
        );
        const totalQuizzes = progresses.reduce((sum, p) => sum + p.quizCount, 0);

        const averageAccuracy =
          progresses.length > 0
            ? Math.round(
                progresses.reduce((sum, p) => sum + p.accuracy, 0) /
                  progresses.length
              )
            : 0;

        return {
          totalJoseki,
          masteredCount,
          learningCount,
          notStartedCount,
          totalPracticeSessions,
          totalQuizzes,
          averageAccuracy,
          streakDays: 0, // TODO: Implement streak calculation
          lastStudyDate:
            progresses.length > 0
              ? progresses
                  .map((p) => p.lastStudied)
                  .filter(Boolean)
                  .sort()
                  .pop() || null
              : null,
        };
      },

      exportData: () => {
        return JSON.stringify(get().progress, null, 2);
      },

      importData: (json: string) => {
        try {
          const data = JSON.parse(json);
          set({ progress: data });
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: 'go-joseki-progress',
    }
  )
);
