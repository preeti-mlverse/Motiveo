import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StepsProfile, StepsEntry, ConnectedStepsDevice, StepsInsights, StepsChallenge } from '../types/steps';

interface StepsState {
  // Profile
  profile: StepsProfile | null;
  
  // Steps data
  stepsEntries: StepsEntry[];
  connectedDevices: ConnectedStepsDevice[];
  
  // Challenges and insights
  activeChallenges: StepsChallenge[];
  insights: StepsInsights | null;
  
  // Actions
  setProfile: (profile: StepsProfile) => void;
  addStepsEntry: (entry: StepsEntry) => void;
  updateConnectedDevices: (devices: ConnectedStepsDevice[]) => void;
  setInsights: (insights: StepsInsights) => void;
  addChallenge: (challenge: StepsChallenge) => void;
  
  // Getters
  getTodaySteps: () => number;
  getWeeklyAverage: () => number;
  getStepStreak: () => number;
  getWeeklyProgress: () => { date: Date; steps: number; goalMet: boolean }[];
}

export const useStepsStore = create<StepsState>()(
  persist(
    (set, get) => ({
      profile: null,
      stepsEntries: [],
      connectedDevices: [],
      activeChallenges: [],
      insights: null,
      
      setProfile: (profile) => set({ profile }),
      
      addStepsEntry: (entry) => set((state) => ({
        stepsEntries: [...state.stepsEntries, entry]
      })),
      
      updateConnectedDevices: (devices) => set({ connectedDevices: devices }),
      
      setInsights: (insights) => set({ insights }),
      
      addChallenge: (challenge) => set((state) => ({
        activeChallenges: [...state.activeChallenges, challenge]
      })),
      
      getTodaySteps: () => {
        const today = new Date().toDateString();
        const { stepsEntries } = get();
        
        const todayEntries = stepsEntries.filter(entry => 
          new Date(entry.date).toDateString() === today
        );
        
        return todayEntries.reduce((sum, entry) => sum + entry.totalSteps, 0);
      },
      
      getWeeklyAverage: () => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const { stepsEntries } = get();
        const weekEntries = stepsEntries.filter(entry => 
          new Date(entry.date) >= weekAgo
        );
        
        if (weekEntries.length === 0) return 0;
        
        const totalSteps = weekEntries.reduce((sum, entry) => sum + entry.totalSteps, 0);
        return Math.round(totalSteps / weekEntries.length);
      },
      
      getStepStreak: () => {
        const { stepsEntries, profile } = get();
        if (!profile) return 0;
        
        const sortedEntries = stepsEntries
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        let streak = 0;
        const targetSteps = profile.dailyStepTarget;
        
        for (const entry of sortedEntries) {
          if (entry.totalSteps >= targetSteps) {
            streak++;
          } else {
            break;
          }
        }
        
        return streak;
      },
      
      getWeeklyProgress: () => {
        const days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return date;
        });
        
        const { stepsEntries, profile } = get();
        
        return days.map(date => {
          const dayString = date.toDateString();
          
          const dayEntries = stepsEntries.filter(entry =>
            new Date(entry.date).toDateString() === dayString
          );
          
          const totalSteps = dayEntries.reduce((sum, entry) => sum + entry.totalSteps, 0);
          const goalMet = profile ? totalSteps >= profile.dailyStepTarget : false;
          
          return {
            date,
            steps: totalSteps,
            goalMet
          };
        });
      }
    }),
    {
      name: 'steps-storage',
    }
  )
);