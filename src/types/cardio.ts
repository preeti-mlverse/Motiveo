export interface CardioProfile {
  id: string;
  goalId: string;
  userId: string;
  age: number;
  restingHeartRate: number;
  maxHeartRate: number;
  zones: HeartRateZones;
  activityProfiles: ActivityProfile[];
  deviceSettings: DeviceSettings;
  fitnessObjective: 'fat_burn' | 'endurance' | 'performance' | 'recovery';
  createdAt: Date;
  updatedAt: Date;
}

export interface HeartRateZones {
  zone1: { min: number; max: number; name: 'Recovery'; color: '#10B981' };
  zone2: { min: number; max: number; name: 'Fat Burn'; color: '#3B82F6' };
  zone3: { min: number; max: number; name: 'Aerobic'; color: '#F59E0B' };
  zone4: { min: number; max: number; name: 'Threshold'; color: '#EF4444' };
  zone5: { min: number; max: number; name: 'Max'; color: '#7C2D12' };
}

export interface ActivityProfile {
  id: string;
  name: string;
  type: 'running' | 'cycling' | 'strength' | 'swimming' | 'walking';
  targetZones: number[];
  duration: number;
  intensity: 'low' | 'moderate' | 'high';
}

export interface DeviceSettings {
  connectedDevices: ConnectedDevice[];
  primaryDevice?: string;
  syncEnabled: boolean;
  alertsEnabled: boolean;
}

export interface ConnectedDevice {
  id: string;
  name: string;
  type: 'heart_rate_monitor' | 'smartwatch' | 'phone_camera' | 'glucose_monitor' | 'smart_scale';
  status: 'connected' | 'disconnected' | 'syncing';
  batteryLevel?: number;
  lastSync?: Date;
}

export interface WorkoutSession {
  id: string;
  goalId: string;
  activityType: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  averageHeartRate: number;
  maxHeartRate: number;
  minHeartRate: number;
  zoneDistribution: ZoneDistribution;
  caloriesBurned: number;
  recoveryTime: number;
  hrv?: number;
  notes?: string;
  aiInsights?: string[];
}

export interface ZoneDistribution {
  zone1: number; // percentage of time
  zone2: number;
  zone3: number;
  zone4: number;
  zone5: number;
}

export interface HeartRateReading {
  timestamp: Date;
  bpm: number;
  zone: number;
  activity?: string;
}

export interface RecoveryMetrics {
  restingHR: number;
  hrv: number;
  recoveryScore: number; // 0-100
  recommendedAction: 'rest' | 'light' | 'moderate' | 'intense';
  sleepQuality?: number;
}

export interface CardioAchievement {
  id: string;
  type: 'zone_time' | 'consistency' | 'improvement' | 'milestone';
  title: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
  unlockedAt?: Date;
}