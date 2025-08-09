export interface StrengthProfile {
  id: string;
  goalId: string;
  userId: string;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  primaryGoal: 'muscle_gain' | 'strength_increase' | 'endurance' | 'toning';
  workoutFrequency: number; // days per week
  preferredWorkoutDuration: number; // minutes
  availableEquipment: EquipmentType[];
  bodyweightPreference: boolean;
  targetMuscleGroups: MuscleGroup[];
  workoutSplit: WorkoutSplit;
  progressionMethod: 'weight' | 'reps' | 'time' | 'difficulty';
  createdAt: Date;
  updatedAt: Date;
}

export type EquipmentType = 
  | 'dumbbells' 
  | 'barbell' 
  | 'resistance_bands' 
  | 'kettlebells' 
  | 'pull_up_bar' 
  | 'gym_access' 
  | 'bodyweight_only';

export type MuscleGroup = 
  | 'chest' 
  | 'back' 
  | 'shoulders' 
  | 'arms' 
  | 'legs' 
  | 'core' 
  | 'glutes';

export type WorkoutSplit = 
  | 'full_body' 
  | 'upper_lower' 
  | 'push_pull_legs' 
  | 'body_part_split';

export interface Exercise {
  id: string;
  name: string;
  muscleGroups: MuscleGroup[];
  equipment: EquipmentType[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
  tips: string[];
  videoUrl?: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  muscleGroups: MuscleGroup[];
  exercises: WorkoutExercise[];
  restBetweenSets: number; // seconds
  restBetweenExercises: number; // seconds
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: number;
  reps: number | string; // can be "8-12" for ranges
  weight?: number;
  duration?: number; // for time-based exercises
  restTime: number; // seconds
  notes?: string;
}

export interface StrengthWorkoutSession {
  id: string;
  goalId: string;
  templateId?: string;
  workoutName: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // minutes
  exercises: CompletedExercise[];
  totalVolume: number; // total weight lifted
  personalRecords: PersonalRecord[];
  notes?: string;
  difficulty: number; // 1-10 perceived exertion
  createdAt: Date;
}

export interface CompletedExercise {
  exerciseId: string;
  exerciseName: string;
  sets: CompletedSet[];
  personalRecord?: boolean;
  notes?: string;
}

export interface CompletedSet {
  setNumber: number;
  reps: number;
  weight?: number;
  duration?: number; // for time-based exercises
  restTime: number;
  completed: boolean;
  rpe?: number; // Rate of Perceived Exertion 1-10
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  type: 'max_weight' | 'max_reps' | 'max_volume' | 'best_time';
  value: number;
  previousBest?: number;
  achievedAt: Date;
}

export interface StrengthProgress {
  exerciseId: string;
  exerciseName: string;
  progressionHistory: ProgressionPoint[];
  currentMax: number;
  startingMax: number;
  improvementPercentage: number;
}

export interface ProgressionPoint {
  date: Date;
  weight: number;
  reps: number;
  volume: number; // weight * reps * sets
  oneRepMax: number; // calculated
}

export interface StrengthAchievement {
  id: string;
  type: 'first_workout' | 'consistency' | 'personal_record' | 'volume_milestone' | 'strength_gain';
  title: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
  unlockedAt?: Date;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  duration: number; // weeks
  workoutsPerWeek: number;
  split: WorkoutSplit;
  templates: WorkoutTemplate[];
  progressionRules: ProgressionRule[];
}

export interface ProgressionRule {
  exerciseId: string;
  condition: 'complete_all_sets' | 'rpe_below_8' | 'time_based';
  action: 'increase_weight' | 'increase_reps' | 'increase_sets' | 'decrease_rest';
  amount: number;
}