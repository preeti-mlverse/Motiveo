export type GoalType = 'weight_loss' | 'cardio_endurance' | 'strength_building' | 'daily_steps' | 'sleep_tracking';

export interface UserProfile {
  id: string;
  phone?: string;
  weight?: number;
  weightUnit: 'kg' | 'pounds';
  height?: number;
  heightUnit: 'cm' | 'feet';
  age?: number;
  gender?: 'male' | 'female' | 'other';
  selectedGoals: GoalType[];
  createdAt: Date;
}

export interface Goal {
  id: string;
  type: GoalType;
  title: string;
  description: string;
  icon: string;
  targetValue?: number;
  targetTimeframe?: number; // in weeks
  currentValue?: number;
  isActive: boolean;
  createdAt: Date;
}

export interface LogEntry {
  id: string;
  goalType: GoalType;
  value: number;
  unit: string;
  notes?: string;
  timestamp: Date;
  loggedVia: 'voice' | 'manual';
}

export interface Achievement {
  id: string;
  goalType: GoalType;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress: number; // 0-100
}

export interface AIRecommendation {
  id: string;
  goalType: GoalType;
  title: string;
  description: string;
  actionItems: string[];
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
}

export type AppScreen = 'welcome' | 'phone' | 'profile' | 'goals' | 'goal-setup' | 'main';
export type MainTab = 'today' | 'progress' | 'plan' | 'profile';