import React from 'react';

interface SleepScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export const SleepScoreRing: React.FC<SleepScoreRingProps> = ({
  score,
  size = 120,
  strokeWidth = 8,
  className = ""
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min(score, 100);
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981'; // Green
    if (score >= 60) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const scoreColor = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);

  return (
    <div className={`relative ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#2B3440"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={scoreColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
          style={{
            filter: `drop-shadow(0 0 8px ${scoreColor}40)`
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold" style={{ color: scoreColor }}>
          {score}
        </div>
        <div className="text-xs text-[#CBD5E1] mb-1">sleep score</div>
        <div className="text-xs font-medium" style={{ color: scoreColor }}>
          {scoreLabel}
        </div>
      </div>
    </div>
  );
};