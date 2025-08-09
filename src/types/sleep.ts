export interface SleepProfile {
  id: string;
  goalId: string;
  userId: string;
  targetSleepHours: number;
  targetBedtime: string; // HH:MM format
  targetWakeTime: string; // HH:MM format
  trackingMethod: 'smartwatch' | 'phone_placement' | 'manual' | 'none';
  deviceSettings: SleepDeviceSettings;
  preferences: SleepPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface SleepDeviceSettings {
  connectedDevices: ConnectedSleepDevice[];
  primaryDevice?: string;
  autoDetectionEnabled: boolean;
  smartAlarmEnabled: boolean;
  bedtimeRemindersEnabled: boolean;
  reminderTime: number; // minutes before bedtime
}

export interface ConnectedSleepDevice {
  id: string;
  name: string;
  type: 'smartwatch' | 'phone' | 'sleep_tracker' | 'smart_mattress';
  status: 'connected' | 'disconnected' | 'syncing';
  batteryLevel?: number;
  lastSync?: Date;
}

export interface SleepPreferences {
  roomTemperature: number; // Fahrenheit
  noiseLevel: 'silent' | 'white_noise' | 'nature_sounds';
  lightLevel: 'complete_darkness' | 'dim_light' | 'night_light';
  caffeinecutoffTime: string; // HH:MM format
  screenTimeLimit: number; // hours before bed
  exerciseTimeLimit: number; // hours before bed
}

export interface SleepEntry {
  id: string;
  goalId: string;
  date: Date;
  bedtime: Date;
  sleepTime?: Date; // when actually fell asleep
  wakeTime: Date;
  totalTimeInBed: number; // minutes
  totalSleepTime: number; // minutes
  sleepEfficiency: number; // percentage
  sleepScore: number; // 0-100
  stages: SleepStages;
  wakeUps: number;
  notes?: string;
  mood: 'excellent' | 'good' | 'fair' | 'poor';
  trackingMethod: 'automatic' | 'manual' | 'voice';
  createdAt: Date;
}

export interface SleepStages {
  light: number; // minutes
  deep: number; // minutes
  rem: number; // minutes
  awake: number; // minutes
}

export interface SleepInsights {
  weeklyAverage: number;
  consistencyScore: number; // 0-100
  qualityTrend: 'improving' | 'stable' | 'declining';
  recommendations: string[];
  achievements: SleepAchievement[];
}

export interface SleepAchievement {
  id: string;
  type: 'consistency' | 'duration' | 'quality' | 'improvement';
  title: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
  unlockedAt?: Date;
}

export interface SleepReminder {
  id: string;
  type: 'bedtime' | 'caffeine_cutoff' | 'screen_time' | 'wind_down';
  time: string; // HH:MM format
  message: string;
  enabled: boolean;
}