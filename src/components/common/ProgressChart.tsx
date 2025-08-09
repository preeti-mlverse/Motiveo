import React from 'react';
import { LogEntry, GoalType } from '../../types';

interface ProgressChartProps {
  logs: LogEntry[];
  goalType: GoalType;
  target?: number;
  className?: string;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({
  logs,
  goalType,
  target,
  className = ""
}) => {
  // Get last 7 days of data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const chartData = last7Days.map(date => {
    const dayLogs = logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate.toDateString() === date.toDateString();
    });
    
    const dayValue = dayLogs.reduce((sum, log) => sum + log.value, 0);
    const avgValue = dayLogs.length > 0 ? dayValue / dayLogs.length : dayValue;
    
    return {
      date,
      value: goalType === 'weight_loss' ? avgValue : dayValue,
      logs: dayLogs.length
    };
  });

  const maxValue = Math.max(...chartData.map(d => d.value), target || 0);
  const minValue = Math.min(...chartData.map(d => d.value), 0);
  const range = maxValue - minValue || 1;

  const getBarHeight = (value: number) => {
    return ((value - minValue) / range) * 100;
  };

  const formatValue = (value: number) => {
    switch (goalType) {
      case 'weight_loss':
        return `${value.toFixed(1)}`;
      case 'daily_steps':
        return `${Math.round(value / 1000)}k`;
      case 'cardio_endurance':
        return `${value.toFixed(1)}`;
      case 'strength_building':
        return `${Math.round(value)}`;
      case 'workout_consistency':
        return value > 0 ? '✓' : '○';
      case 'sleep_tracking':
        return `${value.toFixed(1)}h`;
      default:
        return `${Math.round(value)}`;
    }
  };

  return (
    <div className={`progress-chart ${className}`}>
      <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[#F3F4F6]">7-Day Progress</h3>
          {target && (
            <span className="text-sm text-[#CBD5E1]">Target: {formatValue(target)}</span>
          )}
        </div>

        <div className="relative h-40 flex items-end justify-between space-x-2">
          {chartData.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="relative w-full h-32 bg-[#2B3440] rounded-t-lg overflow-hidden">
                {/* Target line */}
                {target && (
                  <div 
                    className="absolute w-full border-t-2 border-dashed border-[#F08A3E] opacity-60"
                    style={{ bottom: `${getBarHeight(target)}%` }}
                  />
                )}
                
                {/* Progress bar */}
                <div
                  className={`
                    absolute bottom-0 w-full rounded-t-lg transition-all duration-700 ease-out
                    ${data.value > 0 
                      ? 'bg-gradient-to-t from-[#6BD0D2] to-[#4BE0D1] shadow-lg shadow-teal-500/30' 
                      : 'bg-[#2B3440]'
                    }
                  `}
                  style={{ height: `${Math.max(getBarHeight(data.value), 2)}%` }}
                />
                
                {/* Value label */}
                {data.value > 0 && (
                  <div className="absolute top-1 left-0 right-0 text-center">
                    <span className="text-xs font-medium text-white">
                      {formatValue(data.value)}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Day label */}
              <span className="text-xs text-[#CBD5E1] mt-2">
                {data.date.toLocaleDateString('en', { weekday: 'short' })}
              </span>
              
              {/* Log count indicator */}
              {data.logs > 0 && (
                <div className="w-1.5 h-1.5 bg-[#F8B84E] rounded-full mt-1" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};