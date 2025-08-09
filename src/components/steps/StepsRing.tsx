import React from 'react';

interface StepsRingProps {
  current: number;
  target: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export const StepsRing: React.FC<StepsRingProps> = ({
  current,
  target,
  size = 120,
  strokeWidth = 8,
  className = ""
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((current / target) * 100, 100);
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
  
  const isGoalMet = current >= target;
  const remaining = Math.max(target - current, 0);

  const getStepColor = () => {
    if (percentage >= 100) return '#10B981'; // Green when goal met
    if (percentage >= 75) return '#6BD0D2'; // Teal when close
    if (percentage >= 50) return '#F59E0B'; // Orange when halfway
    return '#EF4444'; // Red when far from goal
  };

  const stepColor = getStepColor();

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
          stroke={stepColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
          style={{
            filter: `drop-shadow(0 0 8px ${stepColor}40)`
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl font-bold" style={{ color: stepColor }}>
          {current.toLocaleString()}
        </div>
        <div className="text-xs text-[#CBD5E1] mb-1">steps</div>
        <div className="text-xs text-[#CBD5E1]">
          {isGoalMet ? `+${current - target} extra!` : `${remaining.toLocaleString()} to go`}
        </div>
        {isGoalMet && (
          <div className="text-xs text-[#10B981] font-medium mt-1">🎉 Goal achieved!</div>
        )}
      </div>
    </div>
  );
};