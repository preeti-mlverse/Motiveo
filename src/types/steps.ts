export interface StepsProfile {
  id: string;
  goalId: string;
  userId: string;
  dailyStepTarget: number;
  baselineAverage: number;
  strideLength: number; // in cm
  weight: number; // for calorie calculation
  trackingMethod: 'smartphone' | 'fitness_tracker' | 'smartwatch' | 'manual';
  deviceSettings: StepsDeviceSettings;
  preferences: StepsPreferences;
  adaptiveGoals: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StepsDeviceSettings {
  connectedDevices: ConnectedStepsDevice[];
  primaryDevice?: string;
  autoDetectionEnabled: boolean;
  backgroundTrackingEnabled: boolean;
  hourlyRemindersEnabled: boolean;
  goalNotificationsEnabled: boolean;
  locationTrackingEnabled: boolean;
}

export interface ConnectedStepsDevice {
  id: string;
  name: string;
  type: 'smartphone' | 'fitness_tracker' | 'smartwatch' | 'pedometer';
  status: 'connected' | 'disconnected' | 'syncing';
  batteryLevel?: number;
  lastSync?: Date;
  accuracy: 'high' | 'medium' | 'low';
}

export interface StepsPreferences {
  preferredWalkingTimes: string[]; // HH:MM format
  indoorAlternatives: boolean;
  weatherAdaptive: boolean;
  routeDiscovery: boolean;
  socialFeatures: boolean;
  challengesEnabled: boolean;
}

export interface StepsEntry {
  id: string;
  goalId: string;
  date: Date;
  totalSteps: number;
  distance: number; // in km
  caloriesBurned: number;
  activeMinutes: number;
  hourlyBreakdown: HourlySteps[];
  routes?: WalkingRoute[];
  challenges?: CompletedChallenge[];
  trackingMethod: 'automatic' | 'manual' | 'voice';
  createdAt: Date;
}

export interface HourlySteps {
  hour: number; // 0-23
  steps: number;
  distance: number;
  calories: number;
}

export interface WalkingRoute {
  id: string;
  name: string;
  startTime: Date;
  endTime: Date;
  steps: number;
  distance: number;
  averagePace: number; // steps per minute
  locations?: { lat: number; lng: number; timestamp: Date }[];
}

export interface StepsChallenge {
  id: string;
  type: 'daily' | 'weekly' | 'habit';
  title: string;
  description: string;
  target: number;
  reward: string;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
  expiresAt?: Date;
}

export interface CompletedChallenge {
  challengeId: string;
  completedAt: Date;
  stepsContributed: number;
  bonusPoints: number;
}

export interface StepsInsights {
  weeklyAverage: number;
  bestDay: { date: Date; steps: number };
  consistencyScore: number; // 0-100
  peakHours: number[]; // hours when most active
  weatherImpact: number; // percentage difference on rainy days
  recommendations: string[];
  achievements: StepsAchievement[];
}

export interface StepsAchievement {
  id: string;
  type: 'daily_goal' | 'streak' | 'distance' | 'consistency' | 'challenge';
  title: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
  unlockedAt?: Date;
}

export interface StepsReminder {
  id: string;
  type: 'hourly' | 'goal_reminder' | 'challenge' | 'weather_alert';
  time: string; // HH:MM format
  message: string;
  enabled: boolean;
  conditions?: {
    minStepsDeficit?: number;
    weatherConditions?: string[];
    timeOfDay?: string;
  };
}

export interface StepsSuggestion {
  id: string;
  type: 'route' | 'timing' | 'habit' | 'indoor' | 'social';
  title: string;
  description: string;
  estimatedSteps: number;
  estimatedTime: number; // minutes
  difficulty: 'easy' | 'medium' | 'hard';
  weatherDependent: boolean;
  icon: string;
}