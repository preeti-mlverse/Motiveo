import React from 'react';
import { SleepStages } from '../../types/sleep';

interface SleepStageChartProps {
  stages: SleepStages;
  className?: string;
}

export const SleepStageChart: React.FC<SleepStageChartProps> = ({
  stages,
  className = ""
}) => {
  const totalSleep = stages.light + stages.deep + stages.rem + stages.awake;
  
  const stageData = [
    { name: 'Light', minutes: stages.light, color: '#3B82F6', percentage: (stages.light / totalSleep) * 100 },
    { name: 'Deep', minutes: stages.deep, color: '#1E40AF', percentage: (stages.deep / totalSleep) * 100 },
    { name: 'REM', minutes: stages.rem, color: '#8B5CF6', percentage: (stages.rem / totalSleep) * 100 },
    { name: 'Awake', minutes: stages.awake, color: '#6B7280', percentage: (stages.awake / totalSleep) * 100 }
  ];

  return (
    <div className={`sleep-stage-chart ${className}`}>
      <h4 className="text-sm font-medium text-[#F3F4F6] mb-3">Sleep Stages</h4>
      
      {/* Stage bars */}
      <div className="space-y-3">
        {stageData.map((stage) => (
          <div key={stage.name} className="flex items-center space-x-3">
            <div className="w-12 text-xs text-[#CBD5E1]">{stage.name}</div>
            <div className="flex-1 bg-[#2B3440] rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ 
                  width: `${stage.percentage}%`,
                  backgroundColor: stage.color
                }}
              />
            </div>
            <div className="w-16 text-xs text-[#CBD5E1] text-right">
              {Math.floor(stage.minutes / 60)}h {stage.minutes % 60}m
            </div>
          </div>
        ))}
      </div>

      {/* Stage distribution pie chart */}
      <div className="mt-4 flex justify-center">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {stageData.reduce((acc, stage, index) => {
              const startAngle = acc.currentAngle;
              const angle = (stage.percentage / 100) * 360;
              const endAngle = startAngle + angle;
              
              const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
              const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
              
              const largeArcFlag = angle > 180 ? 1 : 0;
              
              const pathData = [
                `M 50 50`,
                `L ${x1} ${y1}`,
                `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');

              acc.elements.push(
                <path
                  key={stage.name}
                  d={pathData}
                  fill={stage.color}
                  opacity="0.8"
                  className="hover:opacity-100 transition-opacity"
                />
              );
              
              acc.currentAngle = endAngle;
              return acc;
            }, { elements: [] as React.ReactElement[], currentAngle: 0 }).elements}
            
            {/* Center circle */}
            <circle cx="50" cy="50" r="20" fill="#0D1117" />
            <text x="50" y="50" textAnchor="middle" dy="0.3em" className="text-xs fill-[#F3F4F6]">
              {Math.floor(totalSleep / 60)}h
            </text>
            <text x="50" y="50" textAnchor="middle" dy="1.5em" className="text-xs fill-[#CBD5E1]">
              total
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
};