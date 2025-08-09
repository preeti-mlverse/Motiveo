import React, { useState } from 'react';
import { Dumbbell, Clock, Target, X, Play, Users } from 'lucide-react';
import { StrengthProfile, WorkoutTemplate, EquipmentType } from '../../types/strength';

interface WorkoutTemplateModalProps {
  profile: StrengthProfile;
  onSelectTemplate: (templateName: string) => void;
  onClose: () => void;
}

export const WorkoutTemplateModal: React.FC<WorkoutTemplateModalProps> = ({
  profile,
  onSelectTemplate,
  onClose
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'recommended' | 'beginner' | 'intermediate' | 'advanced'>('recommended');

  const getWorkoutTemplates = (): WorkoutTemplate[] => {
    const baseTemplates: WorkoutTemplate[] = [
      // Full Body Templates
      {
        id: 'full-body-beginner',
        name: 'Full Body Beginner',
        description: 'Perfect starter workout hitting all major muscle groups',
        duration: 45,
        difficulty: 'beginner',
        muscleGroups: ['chest', 'back', 'legs', 'arms'],
        exercises: [
          { exerciseId: 'push-ups', sets: 3, reps: '8-12', restTime: 60 },
          { exerciseId: 'bodyweight-squats', sets: 3, reps: '12-15', restTime: 60 },
          { exerciseId: 'plank', sets: 3, reps: '30-60s', duration: 45, restTime: 60 },
          { exerciseId: 'lunges', sets: 2, reps: '10 each leg', restTime: 60 }
        ],
        restBetweenSets: 60,
        restBetweenExercises: 90
      },
      {
        id: 'upper-body-strength',
        name: 'Upper Body Strength',
        description: 'Focus on chest, back, shoulders, and arms',
        duration: 60,
        difficulty: 'intermediate',
        muscleGroups: ['chest', 'back', 'shoulders', 'arms'],
        exercises: [
          { exerciseId: 'bench-press', sets: 4, reps: '6-8', weight: 60, restTime: 120 },
          { exerciseId: 'bent-over-rows', sets: 4, reps: '8-10', weight: 50, restTime: 120 },
          { exerciseId: 'shoulder-press', sets: 3, reps: '8-12', weight: 30, restTime: 90 },
          { exerciseId: 'pull-ups', sets: 3, reps: '5-10', restTime: 90 }
        ],
        restBetweenSets: 120,
        restBetweenExercises: 180
      },
      {
        id: 'lower-body-power',
        name: 'Lower Body Power',
        description: 'Build leg strength and glute power',
        duration: 50,
        difficulty: 'intermediate',
        muscleGroups: ['legs', 'glutes'],
        exercises: [
          { exerciseId: 'squats', sets: 4, reps: '6-8', weight: 80, restTime: 150 },
          { exerciseId: 'deadlifts', sets: 3, reps: '5-6', weight: 100, restTime: 180 },
          { exerciseId: 'lunges', sets: 3, reps: '10 each leg', restTime: 90 },
          { exerciseId: 'calf-raises', sets: 3, reps: '15-20', restTime: 60 }
        ],
        restBetweenSets: 150,
        restBetweenExercises: 180
      }
    ];

    // Filter based on available equipment and fitness level
    return baseTemplates.filter(template => {
      if (selectedCategory === 'recommended') {
        return template.difficulty === profile.fitnessLevel;
      }
      return template.difficulty === selectedCategory;
    });
  };

  const templates = getWorkoutTemplates();

  const getEquipmentNeeded = (template: WorkoutTemplate): EquipmentType[] => {
    // Simplified equipment mapping
    const exerciseEquipment: { [key: string]: EquipmentType[] } = {
      'push-ups': ['bodyweight_only'],
      'bodyweight-squats': ['bodyweight_only'],
      'plank': ['bodyweight_only'],
      'lunges': ['bodyweight_only'],
      'bench-press': ['barbell', 'dumbbells'],
      'bent-over-rows': ['barbell', 'dumbbells'],
      'shoulder-press': ['dumbbells', 'barbell'],
      'pull-ups': ['pull_up_bar'],
      'squats': ['barbell', 'dumbbells'],
      'deadlifts': ['barbell', 'dumbbells'],
      'calf-raises': ['bodyweight_only', 'dumbbells']
    };

    const needed = new Set<EquipmentType>();
    template.exercises.forEach(exercise => {
      const equipment = exerciseEquipment[exercise.exerciseId] || ['bodyweight_only'];
      equipment.forEach(eq => needed.add(eq));
    });

    return Array.from(needed);
  };

  const canPerformWorkout = (template: WorkoutTemplate): boolean => {
    const needed = getEquipmentNeeded(template);
    return needed.some(equipment => profile.availableEquipment.includes(equipment));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#161B22] rounded-2xl border border-[#2B3440] w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#2B3440]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#EF4444] rounded-xl flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#F3F4F6]">Workout Templates</h2>
                <p className="text-sm text-[#CBD5E1]">Choose your training session</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-[#2B3440] hover:bg-[#0D1117] rounded-lg flex items-center justify-center text-[#CBD5E1] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex space-x-2">
            {[
              { value: 'recommended', label: 'For You' },
              { value: 'beginner', label: 'Beginner' },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'advanced', label: 'Advanced' }
            ].map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value as any)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.value
                    ? 'bg-[#EF4444] text-white'
                    : 'bg-[#0D1117] text-[#CBD5E1] hover:bg-[#2B3440]'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Templates List */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          <div className="space-y-4">
            {templates.map((template) => {
              const canPerform = canPerformWorkout(template);
              const equipmentNeeded = getEquipmentNeeded(template);
              
              return (
                <div
                  key={template.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    canPerform
                      ? 'border-[#2B3440] bg-[#161B22] hover:border-[#EF4444]/50 cursor-pointer'
                      : 'border-[#2B3440] bg-[#161B22] opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => canPerform && onSelectTemplate(template.name)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#F3F4F6] mb-1">{template.name}</h3>
                      <p className="text-sm text-[#CBD5E1] mb-2">{template.description}</p>
                      
                      <div className="flex items-center space-x-4 text-xs text-[#CBD5E1]">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{template.duration} min</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Dumbbell className="w-3 h-3" />
                          <span>{template.exercises.length} exercises</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span className="capitalize">{template.difficulty}</span>
                        </div>
                      </div>
                    </div>
                    
                    {canPerform && (
                      <button className="w-10 h-10 bg-[#EF4444] hover:bg-[#DC2626] rounded-lg flex items-center justify-center text-white transition-colors">
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Equipment Required */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {equipmentNeeded.map((equipment) => (
                      <span
                        key={equipment}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          profile.availableEquipment.includes(equipment)
                            ? 'bg-[#10B981]/20 text-[#10B981]'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {equipment.replace('_', ' ')}
                      </span>
                    ))}
                  </div>

                  {/* Muscle Groups */}
                  <div className="flex flex-wrap gap-1">
                    {template.muscleGroups.map((group) => (
                      <span
                        key={group}
                        className="px-2 py-1 bg-[#6BD0D2]/20 text-[#6BD0D2] rounded-full text-xs font-medium capitalize"
                      >
                        {group}
                      </span>
                    ))}
                  </div>

                  {!canPerform && (
                    <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-xs text-red-400">
                        Missing required equipment for this workout
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {templates.length === 0 && (
            <div className="text-center py-8">
              <Dumbbell className="w-12 h-12 text-[#2B3440] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#CBD5E1] mb-2">No Templates Available</h3>
              <p className="text-[#CBD5E1]">Try a different difficulty level</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};