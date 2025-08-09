import React from 'react';
import { Clock, TrendingUp } from 'lucide-react';

interface StepsHourlyChartProps {
  hourlySteps: number[];
  className?: string;
}

export const StepsHourlyChart: React.FC<StepsHourlyChartProps> = ({
  hourlySteps,
  className = ""
}) => {
  const currentHour = new Date().getHours();
  const maxSteps = Math.max(...hourlySteps, 1000);
  
  const getBarHeight = (steps: number) => {
    return (steps / maxSteps) * 100;
  };

  const getPeakHours = () => {
    const sortedHours = hourlySteps
      .map((steps, hour) => ({ hour, steps }))
      .filter(h => h.steps > 0)
      .sort((a, b) => b.steps - a.steps)
      .slice(0, 3);
    
    return sortedHours.map(h => h.hour);
  };

  const peakHours = getPeakHours();

  return (
    <div className={`steps-hourly-chart ${className}`}>
      <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-[#F3F4F6]">Hourly Activity</h3>
            <p className="text-sm text-[#CBD5E1]">Steps throughout the day</p>
          </div>
          <Clock className="w-6 h-6 text-[#6BD0D2]" />
        </div>

        {/* Hourly Chart */}
        <div className="relative h-32 flex items-end justify-between space-x-1 mb-4">
          {hourlySteps.map((steps, hour) => (
            <div key={hour} className="flex-1 flex flex-col items-center">
              <div className="relative w-full h-24 bg-[#2B3440] rounded-t-sm overflow-hidden">
                {/* Bar */}
                <div
                  className={`
                    absolute bottom-0 w-full rounded-t-sm transition-all duration-700 ease-out
                    ${hour === currentHour 
                      ? 'bg-gradient-to-t from-[#F08A3E] to-[#F8B84E] shadow-lg shadow-orange-500/30' 
                      : hour < currentHour
                        ? 'bg-gradient-to-t from-[#10B981] to-[#6BD0D2] shadow-lg shadow-teal-500/20'
                        : 'bg-[#2B3440]'
                    }
                    ${peakHours.includes(hour) ? 'ring-2 ring-[#F8B84E]/50' : ''}
                  `}
                  style={{ height: `${Math.max(getBarHeight(steps), 2)}%` }}
                />
                
                {/* Step count label */}
                {steps > 0 && steps > maxSteps * 0.3 && (
                  <div className="absolute top-1 left-0 right-0 text-center">
                    <span className="text-xs font-medium text-white">
                      {steps > 1000 ? `${(steps / 1000).toFixed(1)}k` : steps}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Hour label */}
              <span className={`text-xs mt-1 ${
                hour === currentHour ? 'text-[#F08A3E] font-bold' : 'text-[#CBD5E1]'
              }`}>
                {hour.toString().padStart(2, '0')}
              </span>
            </div>
          ))}
        </div>

        {/* Peak Hours Insight */}
        {peakHours.length > 0 && (
          <div className="bg-[#F8B84E]/10 border border-[#F8B84E]/30 rounded-xl p-3">
            <div className="flex items-center space-x-2 mb-1">
              <TrendingUp className="w-4 h-4 text-[#F8B84E]" />
              <span className="text-sm font-medium text-[#F8B84E]">Peak Activity Hours</span>
            </div>
            <p className="text-sm text-[#F3F4F6]">
              You're most active around {peakHours.map(h => `${h}:00`).join(', ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};