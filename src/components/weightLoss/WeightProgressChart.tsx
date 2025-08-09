import React from 'react';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { WeightEntry } from '../../types/weightLoss';

interface WeightProgressChartProps {
  weightEntries: WeightEntry[];
  targetWeight: number;
  currentWeight: number;
  className?: string;
}

export const WeightProgressChart: React.FC<WeightProgressChartProps> = ({
  weightEntries,
  targetWeight,
  currentWeight,
  className = ""
}) => {
  // Get last 30 days of data
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date;
  });

  const chartData = last30Days.map(date => {
    const dayEntry = weightEntries.find(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.toDateString() === date.toDateString();
    });
    
    return {
      date,
      weight: dayEntry?.weight || null,
      hasEntry: !!dayEntry
    };
  });

  // Fill gaps with interpolated values for smoother chart
  const filledData = chartData.map((point, index) => {
    if (point.weight !== null) return point;
    
    // Find previous and next actual weights
    let prevWeight = null;
    let nextWeight = null;
    
    for (let i = index - 1; i >= 0; i--) {
      if (chartData[i].weight !== null) {
        prevWeight = chartData[i].weight;
        break;
      }
    }
    
    for (let i = index + 1; i < chartData.length; i++) {
      if (chartData[i].weight !== null) {
        nextWeight = chartData[i].weight;
        break;
      }
    }
    
    // Interpolate if we have both prev and next
    if (prevWeight !== null && nextWeight !== null) {
      const ratio = 0.5; // Simple midpoint interpolation
      return {
        ...point,
        weight: prevWeight + (nextWeight - prevWeight) * ratio,
        interpolated: true
      };
    }
    
    return point;
  });

  const weights = filledData.map(d => d.weight).filter(w => w !== null) as number[];
  const minWeight = Math.min(...weights, targetWeight) - 2;
  const maxWeight = Math.max(...weights, currentWeight) + 2;
  const range = maxWeight - minWeight || 1;

  const getYPosition = (weight: number) => {
    return ((maxWeight - weight) / range) * 100;
  };

  // Calculate trend
  const recentWeights = weightEntries.slice(-7).map(e => e.weight);
  const trend = recentWeights.length >= 2 
    ? recentWeights[recentWeights.length - 1] - recentWeights[0]
    : 0;

  const getTrendIcon = () => {
    if (trend < -0.5) return <TrendingDown className="w-4 h-4 text-[#4BE0D1]" />;
    if (trend > 0.5) return <TrendingUp className="w-4 h-4 text-[#F08A3E]" />;
    return <Minus className="w-4 h-4 text-[#CBD5E1]" />;
  };

  const getTrendText = () => {
    if (trend < -0.5) return `Down ${Math.abs(trend).toFixed(1)}kg this week`;
    if (trend > 0.5) return `Up ${trend.toFixed(1)}kg this week`;
    return 'Weight stable this week';
  };

  // Create SVG path for the weight line
  const createPath = () => {
    const points = filledData
      .map((point, index) => {
        if (point.weight === null) return null;
        const x = (index / (filledData.length - 1)) * 100;
        const y = getYPosition(point.weight);
        return `${x},${y}`;
      })
      .filter(p => p !== null);
    
    if (points.length < 2) return '';
    return `M ${points.join(' L ')}`;
  };

  return (
    <div className={`weight-progress-chart ${className}`}>
      <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-[#F3F4F6]">Weight Progress</h3>
            <div className="flex items-center space-x-2 mt-1">
              {getTrendIcon()}
              <span className="text-sm text-[#CBD5E1]">{getTrendText()}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-[#F3F4F6]">
              {currentWeight.toFixed(1)}kg
            </div>
            <div className="text-sm text-[#CBD5E1]">
              Target: {targetWeight.toFixed(1)}kg
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="relative h-48 bg-[#0D1117] rounded-xl p-4 overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Target weight line */}
            <line
              x1="0"
              y1={getYPosition(targetWeight)}
              x2="100"
              y2={getYPosition(targetWeight)}
              stroke="#F8B84E"
              strokeWidth="0.5"
              strokeDasharray="2,2"
              opacity="0.7"
            />
            
            {/* Weight progress line */}
            {weights.length >= 2 && (
              <path
                d={createPath()}
                fill="none"
                stroke="#4BE0D1"
                strokeWidth="1"
                className="drop-shadow-sm"
              />
            )}
            
            {/* Data points */}
            {filledData.map((point, index) => {
              if (point.weight === null || point.interpolated) return null;
              
              const x = (index / (filledData.length - 1)) * 100;
              const y = getYPosition(point.weight);
              
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="1"
                  fill={point.hasEntry ? "#4BE0D1" : "#2B3440"}
                  className="drop-shadow-sm"
                />
              );
            })}
          </svg>

          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-[#CBD5E1] py-2">
            <span>{maxWeight.toFixed(0)}kg</span>
            <span>{((maxWeight + minWeight) / 2).toFixed(0)}kg</span>
            <span>{minWeight.toFixed(0)}kg</span>
          </div>

          {/* Target weight label */}
          <div 
            className="absolute right-2 text-xs text-[#F8B84E] bg-[#161B22] px-2 py-1 rounded"
            style={{ top: `${getYPosition(targetWeight)}%`, transform: 'translateY(-50%)' }}
          >
            Target
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-3 bg-[#0D1117] rounded-xl">
            <div className="text-lg font-bold text-[#4BE0D1]">
              {(currentWeight - targetWeight).toFixed(1)}
            </div>
            <div className="text-xs text-[#CBD5E1]">kg to go</div>
          </div>
          <div className="text-center p-3 bg-[#0D1117] rounded-xl">
            <div className="text-lg font-bold text-[#F8B84E]">
              {weightEntries.length}
            </div>
            <div className="text-xs text-[#CBD5E1]">weigh-ins</div>
          </div>
          <div className="text-center p-3 bg-[#0D1117] rounded-xl">
            <div className="text-lg font-bold text-[#6BD0D2]">
              {trend < 0 ? Math.abs(trend * 4).toFixed(1) : '0.0'}
            </div>
            <div className="text-xs text-[#CBD5E1]">kg/month</div>
          </div>
        </div>
      </div>
    </div>
  );
};