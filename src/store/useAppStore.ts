import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, Goal, LogEntry, Achievement, AIRecommendation, AppScreen, MainTab, GoalType } from '../types';

interface AppState {
  // Navigation
  currentScreen: AppScreen;
  currentTab: MainTab;
  
  // User data
  userProfile: UserProfile | null;
  goals: Goal[];
  logEntries: LogEntry[];
  achievements: Achievement[];
  aiRecommendations: AIRecommendation[];
  
  // Voice recording
  isRecording: boolean;
  
  // Actions
  setCurrentScreen: (screen: AppScreen) => void;
  setCurrentTab: (tab: MainTab) => void;
  setUserProfile: (profile: UserProfile) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (goalId: string, updates: Partial<Goal>) => void;
  addLogEntry: (entry: LogEntry) => void;
  unlockAchievement: (achievementId: string) => void;
  addAIRecommendation: (recommendation: AIRecommendation) => void;
  setIsRecording: (recording: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentScreen: 'welcome',
      currentTab: 'today',
      userProfile: null,
      goals: [],
      logEntries: [],
      achievements: [],
      aiRecommendations: [],
      isRecording: false,
      
      setCurrentScreen: (screen) => set({ currentScreen: screen }),
      setCurrentTab: (tab) => set({ currentTab: tab }),
      setUserProfile: (profile) => set({ userProfile: profile }),
      
      addGoal: (goal) => set((state) => ({
        goals: [...state.goals, goal]
      })),
      
      updateGoal: (goalId, updates) => set((state) => ({
        goals: state.goals.map(goal => 
          goal.id === goalId ? { ...goal, ...updates } : goal
        )
      })),
      
      addLogEntry: (entry) => set((state) => ({
        logEntries: [...state.logEntries, entry]
      })),
      
      unlockAchievement: (achievementId) => set((state) => ({
        achievements: state.achievements.map(achievement =>
          achievement.id === achievementId 
            ? { ...achievement, unlockedAt: new Date(), progress: 100 }
            : achievement
        )
      })),
      
      addAIRecommendation: (recommendation) => set((state) => ({
        aiRecommendations: [...state.aiRecommendations, recommendation]
      })),
      
      setIsRecording: (recording) => set({ isRecording: recording })
    }),
    {
      name: 'fitness-tracker-storage',
    }
  )
);