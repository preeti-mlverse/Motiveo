import React from 'react';

interface CalorieRingProps {
  current: number;
  target: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export const CalorieRing: React.FC<CalorieRingProps> = ({
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
  
  const isOverTarget = current > target;
  const remaining = Math.max(target - current, 0);

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
          stroke={isOverTarget ? "#F08A3E" : "#4BE0D1"}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
          style={{
            filter: isOverTarget ? 'drop-shadow(0 0 8px #F08A3E40)' : 'drop-shadow(0 0 8px #4BE0D140)'
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className={`text-2xl font-bold ${isOverTarget ? 'text-[#F08A3E]' : 'text-[#4BE0D1]'}`}>
          {current.toLocaleString()}
        </div>
        <div className="text-xs text-[#CBD5E1] mb-1">calories</div>
        <div className="text-xs text-[#CBD5E1]">
          {isOverTarget ? `+${current - target} over` : `${remaining} left`}
        </div>
      </div>
    </div>
  );
};