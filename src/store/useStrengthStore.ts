import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StrengthProfile, StrengthWorkoutSession, StrengthProgress, PersonalRecord } from '../types/strength';

interface StrengthState {
  // Profile
  profile: StrengthProfile | null;
  
  // Workout data
  workoutSessions: StrengthWorkoutSession[];
  personalRecords: PersonalRecord[];
  
  // Progress tracking
  strengthProgress: StrengthProgress[];
  
  // Actions
  setProfile: (profile: StrengthProfile) => void;
  addWorkoutSession: (session: StrengthWorkoutSession) => void;
  addPersonalRecord: (record: PersonalRecord) => void;
  updateStrengthProgress: (progress: StrengthProgress) => void;
  
  // Getters
  getTodaySessions: () => StrengthWorkoutSession[];
  getWeeklyStats: () => {
    totalWorkouts: number;
    totalVolume: number;
    totalDuration: number;
    personalRecords: number;
  };
  getExerciseProgress: (exerciseId: string) => StrengthProgress | null;
}

export const useStrengthStore = create<StrengthState>()(
  persist(
    (set, get) => ({
      profile: null,
      workoutSessions: [],
      personalRecords: [],
      strengthProgress: [],
      
      setProfile: (profile) => set({ profile }),
      
      addWorkoutSession: (session) => set((state) => ({
        workoutSessions: [...state.workoutSessions, session]
      })),
      
      addPersonalRecord: (record) => set((state) => ({
        personalRecords: [...state.personalRecords, record]
      })),
      
      updateStrengthProgress: (progress) => set((state) => ({
        strengthProgress: state.strengthProgress.map(p =>
          p.exerciseId === progress.exerciseId ? progress : p
        ).concat(
          state.strengthProgress.find(p => p.exerciseId === progress.exerciseId) ? [] : [progress]
        )
      })),
      
      getTodaySessions: () => {
        const today = new Date().toDateString();
        const { workoutSessions } = get();
        return workoutSessions.filter(session => {
          const sessionDate = new Date(session.startTime).toDateString();
          return sessionDate === today;
        });
      },
      
      getWeeklyStats: () => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const { workoutSessions, personalRecords } = get();
        const weekSessions = workoutSessions.filter(session => 
          new Date(session.startTime) >= weekAgo
        );
        
        const weekPRs = personalRecords.filter(pr =>
          new Date(pr.achievedAt) >= weekAgo
        );
        
        return {
          totalWorkouts: weekSessions.length,
          totalVolume: weekSessions.reduce((sum, session) => sum + session.totalVolume, 0),
          totalDuration: weekSessions.reduce((sum, session) => sum + session.duration, 0),
          personalRecords: weekPRs.length
        };
      },
      
      getExerciseProgress: (exerciseId) => {
        const { strengthProgress } = get();
        return strengthProgress.find(p => p.exerciseId === exerciseId) || null;
      }
    }),
    {
      name: 'strength-storage',
    }
  )
);