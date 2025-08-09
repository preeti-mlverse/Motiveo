import React from 'react';
import { TrendingUp, Award, Dumbbell } from 'lucide-react';
import { StrengthProfile } from '../../types/strength';

interface StrengthProgressChartProps {
  profile: StrengthProfile;
  className?: string;
}

export const StrengthProgressChart: React.FC<StrengthProgressChartProps> = ({
  profile,
  className = ""
}) => {
  // Mock progress data
  const progressData = Array.from({ length: 8 }, (_, i) => ({
    week: i + 1,
    benchPress: 50 + (i * 2.5),
    squat: 70 + (i * 3),
    deadlift: 80 + (i * 4),
    totalVolume: 2000 + (i * 200)
  }));

  const exercises = [
    { name: 'Bench Press', key: 'benchPress', color: '#EF4444' },
    { name: 'Squat', key: 'squat', color: '#10B981' },
    { name: 'Deadlift', key: 'deadlift', color: '#3B82F6' }
  ];

  const maxValues = {
    benchPress: Math.max(...progressData.map(d => d.benchPress)),
    squat: Math.max(...progressData.map(d => d.squat)),
    deadlift: Math.max(...progressData.map(d => d.deadlift))
  };

  return (
    <div className={`strength-progress-chart ${className}`}>
      <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-[#F3F4F6]">Strength Progress</h3>
            <p className="text-sm text-[#CBD5E1]">8-week progression tracking</p>
          </div>
          <TrendingUp className="w-6 h-6 text-[#6BD0D2]" />
        </div>

        {/* Progress Chart */}
        <div className="relative h-48 bg-[#0D1117] rounded-xl p-4 mb-6">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {exercises.map((exercise) => {
              const points = progressData.map((data, index) => {
                const x = (index / (progressData.length - 1)) * 100;
                const y = 100 - ((data[exercise.key as keyof typeof data] as number / maxValues[exercise.key as keyof typeof maxValues]) * 80);
                return `${x},${y}`;
              }).join(' ');

              return (
                <polyline
                  key={exercise.key}
                  points={points}
                  fill="none"
                  stroke={exercise.color}
                  strokeWidth="1.5"
                  className="drop-shadow-sm"
                />
              );
            })}
          </svg>

          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-[#CBD5E1] py-2">
            <span>Max</span>
            <span>Mid</span>
            <span>Start</span>
          </div>
        </div>

        {/* Exercise Legend */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {exercises.map((exercise) => {
            const currentValue = progressData[progressData.length - 1][exercise.key as keyof typeof progressData[0]] as number;
            const startValue = progressData[0][exercise.key as keyof typeof progressData[0]] as number;
            const improvement = ((currentValue - startValue) / startValue) * 100;
            
            return (
              <div key={exercise.key} className="text-center p-3 bg-[#0D1117] rounded-xl">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: exercise.color }}
                  />
                  <span className="text-xs text-[#CBD5E1]">{exercise.name}</span>
                </div>
                <div className="text-lg font-bold text-[#F3F4F6]">{currentValue}kg</div>
                <div className="text-xs text-[#10B981]">+{improvement.toFixed(0)}%</div>
              </div>
            );
          })}
        </div>

        {/* Personal Records */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-[#F3F4F6] flex items-center space-x-2">
            <Award className="w-4 h-4 text-[#F8B84E]" />
            <span>Recent Personal Records</span>
          </h4>
          
          <div className="space-y-2">
            {[
              { exercise: 'Bench Press', weight: 72.5, improvement: '+2.5kg', date: '2 days ago' },
              { exercise: 'Squat', weight: 95, improvement: '+5kg', date: '1 week ago' }
            ].map((pr, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-[#F8B84E]/10 border border-[#F8B84E]/30 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Award className="w-5 h-5 text-[#F8B84E]" />
                  <div>
                    <div className="font-medium text-[#F3F4F6]">{pr.exercise}</div>
                    <div className="text-sm text-[#CBD5E1]">{pr.date}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[#F8B84E]">{pr.weight}kg</div>
                  <div className="text-xs text-[#10B981]">{pr.improvement}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};