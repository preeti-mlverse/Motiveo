import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SleepProfile, SleepEntry, ConnectedSleepDevice, SleepInsights } from '../types/sleep';

interface SleepState {
  // Profile
  profile: SleepProfile | null;
  
  // Sleep data
  sleepEntries: SleepEntry[];
  connectedDevices: ConnectedSleepDevice[];
  
  // Insights and analytics
  insights: SleepInsights | null;
  
  // Actions
  setProfile: (profile: SleepProfile) => void;
  addSleepEntry: (entry: SleepEntry) => void;
  updateConnectedDevices: (devices: ConnectedSleepDevice[]) => void;
  setInsights: (insights: SleepInsights) => void;
  
  // Getters
  getLastNightSleep: () => SleepEntry | null;
  getWeeklyAverage: () => number;
  getSleepStreak: () => number;
  getWeeklyProgress: () => { date: Date; sleepHours: number; score: number }[];
}

export const useSleepStore = create<SleepState>()(
  persist(
    (set, get) => ({
      profile: null,
      sleepEntries: [],
      connectedDevices: [],
      insights: null,
      
      setProfile: (profile) => set({ profile }),
      
      addSleepEntry: (entry) => set((state) => ({
        sleepEntries: [...state.sleepEntries, entry]
      })),
      
      updateConnectedDevices: (devices) => set({ connectedDevices: devices }),
      
      setInsights: (insights) => set({ insights }),
      
      getLastNightSleep: () => {
        const { sleepEntries } = get();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        return sleepEntries
          .filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate.toDateString() === yesterday.toDateString();
          })
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] || null;
      },
      
      getWeeklyAverage: () => {
        const { sleepEntries } = get();
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const weekEntries = sleepEntries.filter(entry => 
          new Date(entry.date) >= weekAgo
        );
        
        if (weekEntries.length === 0) return 0;
        
        const totalSleep = weekEntries.reduce((sum, entry) => sum + entry.totalSleepTime, 0);
        return Math.round((totalSleep / weekEntries.length / 60) * 10) / 10; // Hours with 1 decimal
      },
      
      getSleepStreak: () => {
        const { sleepEntries, profile } = get();
        if (!profile) return 0;
        
        const sortedEntries = sleepEntries
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        let streak = 0;
        const targetMinutes = profile.targetSleepHours * 60;
        
        for (const entry of sortedEntries) {
          if (entry.totalSleepTime >= targetMinutes * 0.9) { // 90% of target
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
        
        const { sleepEntries } = get();
        
        return days.map(date => {
          const dayString = date.toDateString();
          
          const dayEntry = sleepEntries.find(entry =>
            new Date(entry.date).toDateString() === dayString
          );
          
          return {
            date,
            sleepHours: dayEntry ? dayEntry.totalSleepTime / 60 : 0,
            score: dayEntry ? dayEntry.sleepScore : 0
          };
        });
      }
    }),
    {
      name: 'sleep-storage',
    }
  )
);