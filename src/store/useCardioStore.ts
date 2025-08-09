import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CardioProfile, WorkoutSession, HeartRateReading, ConnectedDevice, RecoveryMetrics } from '../types/cardio';

interface CardioState {
  // Profile
  profile: CardioProfile | null;
  
  // Sessions and data
  workoutSessions: WorkoutSession[];
  heartRateHistory: HeartRateReading[];
  connectedDevices: ConnectedDevice[];
  
  // Recovery and metrics
  recoveryMetrics: RecoveryMetrics | null;
  
  // Actions
  setProfile: (profile: CardioProfile) => void;
  addWorkoutSession: (session: WorkoutSession) => void;
  addHeartRateReading: (reading: HeartRateReading) => void;
  updateConnectedDevices: (devices: ConnectedDevice[]) => void;
  setRecoveryMetrics: (metrics: RecoveryMetrics) => void;
  
  // Getters
  getTodaySessions: () => WorkoutSession[];
  getWeeklyStats: () => {
    totalDuration: number;
    totalCalories: number;
    avgHeartRate: number;
    sessionsCount: number;
  };
  getRestingHeartRateTrend: () => { date: Date; rhr: number }[];
}

export const useCardioStore = create<CardioState>()(
  persist(
    (set, get) => ({
      profile: null,
      workoutSessions: [],
      heartRateHistory: [],
      connectedDevices: [],
      recoveryMetrics: null,
      
      setProfile: (profile) => set({ profile }),
      
      addWorkoutSession: (session) => set((state) => ({
        workoutSessions: [...state.workoutSessions, session]
      })),
      
      addHeartRateReading: (reading) => set((state) => ({
        heartRateHistory: [...state.heartRateHistory.slice(-999), reading] // Keep last 1000 readings
      })),
      
      updateConnectedDevices: (devices) => set({ connectedDevices: devices }),
      
      setRecoveryMetrics: (metrics) => set({ recoveryMetrics: metrics }),
      
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
        
        const { workoutSessions } = get();
        const weekSessions = workoutSessions.filter(session => 
          new Date(session.startTime) >= weekAgo
        );
        
        return {
          totalDuration: weekSessions.reduce((sum, session) => sum + session.duration, 0),
          totalCalories: weekSessions.reduce((sum, session) => sum + session.caloriesBurned, 0),
          avgHeartRate: weekSessions.length > 0 
            ? Math.round(weekSessions.reduce((sum, session) => sum + session.averageHeartRate, 0) / weekSessions.length)
            : 0,
          sessionsCount: weekSessions.length
        };
      },
      
      getRestingHeartRateTrend: () => {
        const days = Array.from({ length: 30 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (29 - i));
          return date;
        });
        
        const { heartRateHistory, profile } = get();
        
        return days.map(date => {
          const dayString = date.toDateString();
          
          // Get morning readings (6-10 AM) for resting HR
          const morningReadings = heartRateHistory.filter(reading => {
            const readingDate = new Date(reading.timestamp);
            const hour = readingDate.getHours();
            return readingDate.toDateString() === dayString && 
                   hour >= 6 && hour <= 10 && 
                   !reading.activity; // Only non-activity readings
          });
          
          const rhr = morningReadings.length > 0
            ? Math.min(...morningReadings.map(r => r.bpm))
            : profile?.restingHeartRate || 60;
          
          return { date, rhr };
        });
      }
    }),
    {
      name: 'cardio-storage',
    }
  )
);